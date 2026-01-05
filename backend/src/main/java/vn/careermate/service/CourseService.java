package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.model.Course;
import vn.careermate.model.CourseEnrollment;
import vn.careermate.model.StudentProfile;
import vn.careermate.repository.CourseEnrollmentRepository;
import vn.careermate.repository.CourseRepository;
import vn.careermate.repository.StudentProfileRepository;
import vn.careermate.repository.UserRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    public List<Course> getAllCourses(String category) {
        if (category != null && !category.isEmpty()) {
            return courseRepository.findByCategory(category);
        }
        return courseRepository.findAll();
    }

    public List<Course> getFreeCourses() {
        return courseRepository.findByIsPremium(false);
    }

    public Course getCourseById(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @Transactional
    public CourseEnrollment enrollInCourse(UUID courseId) {
        Course course = getCourseById(courseId);
        UUID studentId = getCurrentStudentId();
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if already enrolled
        enrollmentRepository.findByStudentId(studentId).stream()
                .filter(e -> e.getCourse().getId().equals(courseId))
                .findFirst()
                .ifPresent(e -> {
                    throw new RuntimeException("Already enrolled in this course");
                });

        CourseEnrollment enrollment = CourseEnrollment.builder()
                .student(student)
                .course(course)
                .progressPercentage(BigDecimal.ZERO)
                .build();

        return enrollmentRepository.save(enrollment);
    }

    public List<CourseEnrollment> getMyEnrollments() {
        UUID studentId = getCurrentStudentId();
        return enrollmentRepository.findByStudentId(studentId);
    }

    @Transactional
    public CourseEnrollment updateProgress(UUID enrollmentId, BigDecimal progressPercentage) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));

        enrollment.setProgressPercentage(progressPercentage);
        if (progressPercentage.compareTo(new BigDecimal("100")) >= 0) {
            enrollment.setCompletedAt(java.time.LocalDateTime.now());
        }

        return enrollmentRepository.save(enrollment);
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

