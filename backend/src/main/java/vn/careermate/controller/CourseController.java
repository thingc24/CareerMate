package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.model.Course;
import vn.careermate.model.CourseEnrollment;
import vn.careermate.service.CourseService;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/courses")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses(
            @RequestParam(required = false) String category
    ) {
        log.info("GET /courses - category: {}", category);
        List<Course> courses = courseService.getAllCourses(category);
        log.info("GET /courses - Returning {} courses", courses.size());
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/free")
    public ResponseEntity<List<Course>> getFreeCourses() {
        log.info("GET /courses/free");
        List<Course> courses = courseService.getFreeCourses();
        log.info("GET /courses/free - Returning {} free courses", courses.size());
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<Course> getCourse(@PathVariable UUID courseId) {
        return ResponseEntity.ok(courseService.getCourseById(courseId));
    }

    @PostMapping("/{courseId}/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CourseEnrollment> enrollInCourse(@PathVariable UUID courseId) {
        return ResponseEntity.ok(courseService.enrollInCourse(courseId));
    }

    @GetMapping("/my-enrollments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CourseEnrollment>> getMyEnrollments() {
        log.info("GET /courses/my-enrollments");
        List<CourseEnrollment> enrollments = courseService.getMyEnrollments();
        log.info("GET /courses/my-enrollments - Returning {} enrollments", enrollments.size());
        return ResponseEntity.ok(enrollments);
    }

    @PutMapping("/enrollments/{enrollmentId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CourseEnrollment> updateProgress(
            @PathVariable UUID enrollmentId,
            @RequestParam BigDecimal progressPercentage
    ) {
        return ResponseEntity.ok(courseService.updateProgress(enrollmentId, progressPercentage));
    }

    @GetMapping("/enrollments/{enrollmentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CourseEnrollment> getEnrollment(@PathVariable UUID enrollmentId) {
        return ResponseEntity.ok(courseService.getEnrollmentById(enrollmentId));
    }
}

