package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.learningservice.model.*;
import vn.careermate.learningservice.repository.*;
import vn.careermate.userservice.repository.StudentProfileRepository;
import vn.careermate.userservice.repository.UserRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseContentService {

    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository progressRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CourseModule> getCourseModulesWithLessons(UUID courseId) {
        // Use repository method that fetches modules with lessons
        List<CourseModule> modules = moduleRepository.findModulesWithLessonsByCourseId(courseId);
        // Ensure lessons are loaded
        modules.forEach(module -> {
            if (module.getLessons() == null || module.getLessons().isEmpty()) {
                List<Lesson> lessons = lessonRepository.findByModuleIdOrderByOrderIndexAsc(module.getId());
                module.setLessons(lessons);
            }
        });
        return modules;
    }

    public List<CourseModule> getCourseModules(UUID courseId) {
        return getCourseModulesWithLessons(courseId);
    }

    public List<Lesson> getModuleLessons(UUID moduleId) {
        return lessonRepository.findByModuleIdOrderByOrderIndexAsc(moduleId);
    }

    public Lesson getLessonById(UUID lessonId) {
        return lessonRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
    }

    @Transactional
    public LessonProgress updateLessonProgress(UUID enrollmentId, UUID lessonId, Integer currentTimeSeconds, Boolean completed) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        // Verify enrollment belongs to current user
        UUID currentStudentId = getCurrentStudentId();
        // Force initialize student to avoid lazy loading issues
        UUID enrollmentStudentId = enrollment.getStudent().getId();
        if (!enrollmentStudentId.equals(currentStudentId)) {
            throw new RuntimeException("Unauthorized access to enrollment");
        }

        Lesson lesson = getLessonById(lessonId);
        
        Optional<LessonProgress> existingProgress = progressRepository.findByEnrollmentIdAndLessonId(enrollmentId, lessonId);
        
        LessonProgress progress;
        if (existingProgress.isPresent()) {
            progress = existingProgress.get();
            if (currentTimeSeconds != null) {
                progress.setWatchTimeSeconds(currentTimeSeconds);
                progress.setLastPositionSeconds(currentTimeSeconds);
            }
            if (completed != null) {
                progress.setIsCompleted(completed);
                if (completed && progress.getCompletedAt() == null) {
                    progress.setCompletedAt(LocalDateTime.now());
                } else if (!completed) {
                    progress.setCompletedAt(null);
                }
            }
        } else {
            // If marking complete without existing progress, set watch time to lesson duration
            int watchTime = currentTimeSeconds != null ? currentTimeSeconds : 
                (lesson.getDurationMinutes() != null ? lesson.getDurationMinutes() * 60 : 0);
            
            progress = LessonProgress.builder()
                    .enrollment(enrollment)
                    .lesson(lesson)
                    .watchTimeSeconds(watchTime)
                    .lastPositionSeconds(watchTime)
                    .isCompleted(completed != null ? completed : false)
                    .build();
            if (completed != null && completed) {
                progress.setCompletedAt(LocalDateTime.now());
            }
        }

        progress = progressRepository.save(progress);
        
        // Update overall course progress
        updateCourseEnrollmentProgress(enrollmentId);
        
        // Force initialize basic fields before returning to avoid lazy loading issues
        progress.getId();
        progress.getIsCompleted();
        progress.getWatchTimeSeconds();
        progress.getLastPositionSeconds();
        progress.getCompletedAt();
        
        return progress;
    }

    @Transactional
    public LessonProgress markLessonComplete(UUID enrollmentId, UUID lessonId) {
        try {
            // Verify enrollment exists and belongs to current user
            CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                    .orElseThrow(() -> new RuntimeException("Enrollment not found"));
            
            UUID currentStudentId = getCurrentStudentId();
            UUID enrollmentStudentId = enrollment.getStudent().getId();
            if (!enrollmentStudentId.equals(currentStudentId)) {
                throw new RuntimeException("Unauthorized access to enrollment");
            }
            
            // Verify lesson exists (will throw exception if not found)
            getLessonById(lessonId);
            
            // Update progress
            LessonProgress progress = updateLessonProgress(enrollmentId, lessonId, null, true);
            
            // Verify it was marked complete
            if (progress == null) {
                throw new RuntimeException("Progress is null after update");
            }
            if (!progress.getIsCompleted()) {
                throw new RuntimeException("Failed to mark lesson as complete - isCompleted is still false");
            }
            
            return progress;
        } catch (RuntimeException e) {
            // Re-throw RuntimeException as-is
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Error marking lesson complete: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<LessonProgress> getEnrollmentProgress(UUID enrollmentId) {
        UUID currentStudentId = getCurrentStudentId();
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        if (!enrollment.getStudent().getId().equals(currentStudentId)) {
            throw new RuntimeException("Unauthorized access to enrollment");
        }
        
        List<LessonProgress> progressList = progressRepository.findByEnrollmentId(enrollmentId);
        
        // Force initialize basic fields to avoid lazy loading issues
        progressList.forEach(progress -> {
            progress.getId();
            progress.getIsCompleted();
            progress.getWatchTimeSeconds();
            progress.getLastPositionSeconds();
            progress.getCompletedAt();
            // Don't access enrollment or lesson to avoid lazy loading
        });
        
        return progressList;
    }

    public LessonProgress getLessonProgress(UUID enrollmentId, UUID lessonId) {
        return progressRepository.findByEnrollmentIdAndLessonId(enrollmentId, lessonId)
                .orElse(null);
    }

    @Transactional
    public LessonProgress getOrCreateLessonProgress(UUID enrollmentId, UUID lessonId) {
        Optional<LessonProgress> existing = progressRepository.findByEnrollmentIdAndLessonId(enrollmentId, lessonId);
        if (existing.isPresent()) {
            return existing.get();
        }
        
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        Lesson lesson = getLessonById(lessonId);
        
        UUID currentStudentId = getCurrentStudentId();
        if (!enrollment.getStudent().getId().equals(currentStudentId)) {
            throw new RuntimeException("Unauthorized access to enrollment");
        }
        
        LessonProgress progress = LessonProgress.builder()
                .enrollment(enrollment)
                .lesson(lesson)
                .watchTimeSeconds(0)
                .lastPositionSeconds(0)
                .isCompleted(false)
                .build();
        
        return progressRepository.save(progress);
    }

    @Transactional
    public void updateCourseEnrollmentProgress(UUID enrollmentId) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        Long completedLessons = progressRepository.countCompletedLessonsByEnrollmentId(enrollmentId);
        Long totalLessons = progressRepository.countTotalLessonsByEnrollmentId(enrollmentId);

        if (totalLessons > 0) {
            BigDecimal progress = new BigDecimal(completedLessons)
                    .divide(new BigDecimal(totalLessons), 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100))
                    .setScale(2, RoundingMode.HALF_UP);
            
            enrollment.setProgressPercentage(progress);
            
            if (progress.compareTo(new BigDecimal("100")) >= 0) {
                enrollment.setCompletedAt(LocalDateTime.now());
            } else {
                enrollment.setCompletedAt(null);
            }
            
            enrollmentRepository.save(enrollment);
        } else {
            enrollment.setProgressPercentage(BigDecimal.ZERO);
            enrollmentRepository.save(enrollment);
        }
    }

    private UUID getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UUID userId = userRepository.findByEmail(email)
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return studentProfileRepository.findByUserId(userId)
                .map(profile -> profile.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }
}
