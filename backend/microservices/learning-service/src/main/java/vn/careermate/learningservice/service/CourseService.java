package vn.careermate.learningservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.learningservice.model.Course;
import vn.careermate.learningservice.model.CourseEnrollment;
import vn.careermate.learningservice.repository.CourseEnrollmentRepository;
import vn.careermate.learningservice.repository.CourseRepository;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.StudentProfileDTO;
import vn.careermate.common.dto.UserDTO;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final UserServiceClient userServiceClient;

    @Transactional(readOnly = true)
    public List<Course> getAllCourses(String category) {
        log.info("CourseService.getAllCourses - category: {}", category);
        List<Course> courses;
        if (category != null && !category.isEmpty()) {
            courses = courseRepository.findByCategory(category);
        } else {
            courses = courseRepository.findAll();
        }
        // Detach entities to prevent lazy loading issues
        courses.forEach(course -> {
            // Force initialization of basic fields only
            course.getId();
            course.getTitle();
            course.getDescription();
        });
        log.info("CourseService.getAllCourses - Found {} courses", courses.size());
        return courses;
    }

    @Transactional(readOnly = true)
    public List<Course> getFreeCourses() {
        log.info("CourseService.getFreeCourses");
        List<Course> courses = courseRepository.findByIsPremium(false);
        // Detach entities to prevent lazy loading issues
        courses.forEach(course -> {
            // Force initialization of basic fields only
            course.getId();
            course.getTitle();
            course.getDescription();
        });
        log.info("CourseService.getFreeCourses - Found {} free courses", courses.size());
        return courses;
    }

    public Course getCourseById(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @Transactional
    public CourseEnrollment enrollInCourse(UUID courseId) {
        Course course = getCourseById(courseId);
        UUID studentId = getCurrentStudentId();
        
        // Verify student exists via Feign Client
        try {
            StudentProfileDTO student = userServiceClient.getStudentProfileById(studentId);
            if (student == null) {
                throw new RuntimeException("Student not found");
            }
        } catch (Exception e) {
            log.error("Error fetching student profile: {}", e.getMessage());
            throw new RuntimeException("Student not found");
        }

        // Check if already enrolled
        Optional<CourseEnrollment> existingEnrollment = enrollmentRepository.findByStudentId(studentId).stream()
                .filter(e -> e.getCourse().getId().equals(courseId))
                .findFirst();
        
        if (existingEnrollment.isPresent()) {
            log.info("Student {} already enrolled in course {}", studentId, courseId);
            return existingEnrollment.get(); // Return existing enrollment instead of throwing error
        }

        // Check if course is premium and student has subscription
        if (course.getIsPremium() != null && course.getIsPremium()) {
            // TODO: Check subscription status
            // For now, allow enrollment (subscription check should be done in controller)
            log.info("Enrolling in premium course {} for student {}", courseId, studentId);
        }

        CourseEnrollment enrollment = CourseEnrollment.builder()
                .studentId(studentId) // Use UUID instead of entity
                .course(course)
                .progressPercentage(BigDecimal.ZERO)
                .build();

        log.info("Created new enrollment for course {} and student {}", courseId, studentId);
        return enrollmentRepository.save(enrollment);
    }

    @Transactional(readOnly = true)
    public List<CourseEnrollment> getMyEnrollments() {
        UUID studentId = getCurrentStudentId();
        log.info("CourseService.getMyEnrollments - studentId: {}", studentId);
        List<CourseEnrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        
        // Force initialization of course to avoid lazy loading issues
        enrollments.forEach(enrollment -> {
            if (enrollment.getCourse() != null) {
                // Force load course basic fields
                enrollment.getCourse().getId();
                enrollment.getCourse().getTitle();
                enrollment.getCourse().getDescription();
            }
        });
        
        log.info("CourseService.getMyEnrollments - Found {} enrollments", enrollments.size());
        return enrollments;
    }

    public CourseEnrollment getEnrollmentById(UUID enrollmentId) {
        UUID studentId = getCurrentStudentId();
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        
        if (!enrollment.getStudentId().equals(studentId)) {
            throw new RuntimeException("Unauthorized access to enrollment");
        }
        
        return enrollment;
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
        
        try {
            UserDTO user = userServiceClient.getUserByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            
            StudentProfileDTO studentProfile = userServiceClient.getStudentProfileByUserId(user.getId());
            if (studentProfile == null) {
                throw new RuntimeException("Student profile not found");
            }
            
            return studentProfile.getId();
        } catch (Exception e) {
            log.error("Error getting current student ID: {}", e.getMessage());
            throw new RuntimeException("Student profile not found");
        }
    }
}
