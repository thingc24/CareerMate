package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.careermate.model.Application;
import vn.careermate.model.CV;
import vn.careermate.model.Job;
import vn.careermate.model.StudentProfile;
import vn.careermate.service.StudentService;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/profile")
    public ResponseEntity<StudentProfile> getProfile() {
        return ResponseEntity.ok(studentService.getCurrentStudentProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<StudentProfile> updateProfile(@RequestBody StudentProfile profile) {
        return ResponseEntity.ok(studentService.updateProfile(profile));
    }

    @PostMapping("/cv/upload")
    public ResponseEntity<CV> uploadCV(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(studentService.uploadCV(file));
    }

    @GetMapping("/cv")
    public ResponseEntity<List<CV>> getCVs() {
        return ResponseEntity.ok(studentService.getCVs());
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<Job>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(studentService.searchJobs(keyword, location, pageable));
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<Job> getJob(@PathVariable UUID jobId) {
        return ResponseEntity.ok(studentService.getJob(jobId));
    }

    @PostMapping("/applications")
    public ResponseEntity<Application> applyForJob(
            @RequestParam UUID jobId,
            @RequestParam(required = false) UUID cvId,
            @RequestParam(required = false) String coverLetter
    ) {
        return ResponseEntity.ok(studentService.applyForJob(jobId, cvId, coverLetter));
    }

    @GetMapping("/applications")
    public ResponseEntity<Page<Application>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(studentService.getApplications(pageable));
    }
}

