package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.careermate.model.Application;
import vn.careermate.model.CV;
import vn.careermate.model.Job;
import vn.careermate.model.StudentProfile;
import vn.careermate.service.StudentService;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
// Tạm thời bỏ kiểm tra role để dễ test trong môi trường phát triển
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile() {
        try {
            StudentProfile profile = studentService.getCurrentStudentProfile();
            
            if (profile == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Profile not found"));
            }

            Map<String, Object> dto = new HashMap<>();
            dto.put("id", profile.getId() != null ? profile.getId().toString() : null);
            dto.put("dateOfBirth", profile.getDateOfBirth());
            dto.put("gender", profile.getGender());
            dto.put("address", profile.getAddress());
            dto.put("city", profile.getCity());
            dto.put("country", profile.getCountry() != null ? profile.getCountry() : "Vietnam");
            dto.put("university", profile.getUniversity());
            dto.put("major", profile.getMajor());
            dto.put("graduationYear", profile.getGraduationYear());
            dto.put("gpa", profile.getGpa());
            dto.put("bio", profile.getBio());
            dto.put("linkedinUrl", profile.getLinkedinUrl());
            dto.put("githubUrl", profile.getGithubUrl());
            dto.put("portfolioUrl", profile.getPortfolioUrl());
            dto.put("currentStatus", profile.getCurrentStatus() != null ? profile.getCurrentStatus() : "STUDENT");

            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error loading profile: " + e.getMessage(), "type", e.getClass().getSimpleName()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody StudentProfile profile) {
        try {
            StudentProfile updated = studentService.updateProfile(profile);
            // Detach lazy-loaded relations
            updated.setUser(null);
            updated.setSkills(null);
            updated.setCvs(null);
            updated.setApplications(null);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            log.error("Runtime error updating profile: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error updating profile", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error updating profile: " + e.getMessage()));
        }
    }

    @PostMapping("/cv/upload")
    public ResponseEntity<?> uploadCV(@RequestParam("file") MultipartFile file) {
        try {
            CV cv = studentService.uploadCV(file);
            // Detach lazy-loaded relations
            if (cv != null) {
                cv.setStudent(null);
            }
            return ResponseEntity.ok(cv);
        } catch (RuntimeException e) {
            log.error("Runtime error uploading CV: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            log.error("IO error uploading CV", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error uploading file: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error uploading CV", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error uploading CV: " + e.getMessage()));
        }
    }

    @GetMapping("/cv")
    public ResponseEntity<List<CV>> getCVs() {
        try {
            List<CV> cvs = studentService.getCVs();
            return ResponseEntity.ok(cvs);
        } catch (RuntimeException e) {
            log.error("Runtime error getting CVs: {}", e.getMessage());
            return ResponseEntity.status(401)
                .body(List.of());
        } catch (Exception e) {
            log.error("Unexpected error getting CVs", e);
            return ResponseEntity.status(500)
                .body(List.of());
        }
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<Job>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Job> jobs = studentService.searchJobs(keyword, location, pageable);
            return ResponseEntity.ok(jobs);
        } catch (RuntimeException e) {
            log.error("Runtime error searching jobs: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(Page.empty());
        } catch (Exception e) {
            log.error("Unexpected error searching jobs", e);
            return ResponseEntity.status(500)
                .body(Page.empty());
        }
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<Job> getJob(@PathVariable UUID jobId) {
        try {
            Job job = studentService.getJob(jobId);
            // Detach lazy-loaded relations
            if (job != null) {
                job.setRecruiter(null);
                job.setSkills(null);
                job.setApplications(null);
            }
            return ResponseEntity.ok(job);
        } catch (RuntimeException e) {
            log.error("Runtime error getting job: {}", e.getMessage());
            return ResponseEntity.status(404)
                .build();
        } catch (Exception e) {
            log.error("Unexpected error getting job", e);
            return ResponseEntity.status(500)
                .build();
        }
    }

    @PostMapping("/applications")
    public ResponseEntity<?> applyForJob(
            @RequestParam UUID jobId,
            @RequestParam(required = false) UUID cvId,
            @RequestParam(required = false) String coverLetter
    ) {
        try {
            Application application = studentService.applyForJob(jobId, cvId, coverLetter);
            // Detach lazy-loaded relations
            if (application != null) {
                if (application.getJob() != null) {
                    application.getJob().setRecruiter(null);
                    application.getJob().setSkills(null);
                    application.getJob().setApplications(null);
                }
                if (application.getStudent() != null) {
                    application.getStudent().setUser(null);
                    application.getStudent().setSkills(null);
                    application.getStudent().setCvs(null);
                    application.getStudent().setApplications(null);
                }
                if (application.getCv() != null) {
                    application.getCv().setStudent(null);
                }
            }
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            log.error("Runtime error applying for job: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error applying for job", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error applying for job: " + e.getMessage()));
        }
    }

    @GetMapping("/applications")
    public ResponseEntity<Page<Application>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Application> applications = studentService.getApplications(pageable);
            
            // Detach lazy-loaded relations
            if (applications != null && applications.getContent() != null) {
                applications.getContent().forEach(app -> {
                    if (app != null) {
                        if (app.getJob() != null) {
                            app.getJob().setRecruiter(null);
                            app.getJob().setSkills(null);
                            app.getJob().setApplications(null);
                        }
                        if (app.getStudent() != null) {
                            app.getStudent().setUser(null);
                            app.getStudent().setSkills(null);
                            app.getStudent().setCvs(null);
                            app.getStudent().setApplications(null);
                        }
                        if (app.getCv() != null) {
                            app.getCv().setStudent(null);
                        }
                    }
                });
            }
            
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            log.error("Runtime error getting applications: {}", e.getMessage());
            return ResponseEntity.status(401)
                .body(Page.empty());
        } catch (Exception e) {
            log.error("Unexpected error getting applications", e);
            return ResponseEntity.status(500)
                .body(Page.empty());
        }
    }
}

