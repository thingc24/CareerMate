package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
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
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses(
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(courseService.getAllCourses(category));
    }

    @GetMapping("/free")
    public ResponseEntity<List<Course>> getFreeCourses() {
        return ResponseEntity.ok(courseService.getFreeCourses());
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
        return ResponseEntity.ok(courseService.getMyEnrollments());
    }

    @PutMapping("/enrollments/{enrollmentId}/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CourseEnrollment> updateProgress(
            @PathVariable UUID enrollmentId,
            @RequestParam BigDecimal progressPercentage
    ) {
        return ResponseEntity.ok(courseService.updateProgress(enrollmentId, progressPercentage));
    }
}

