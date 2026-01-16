package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.jobservice.model.Application;
import vn.careermate.jobservice.model.Job;
import vn.careermate.jobservice.service.ApplicationService;
import vn.careermate.jobservice.service.JobService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/recruiters")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class RecruiterController {

    private final JobService jobService;
    private final ApplicationService applicationService;

    @PostMapping("/jobs")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<?> createJob(
            @RequestBody Job job,
            @RequestParam(required = false) List<String> requiredSkills,
            @RequestParam(required = false) List<String> optionalSkills
    ) {
        try {
            return ResponseEntity.ok(jobService.createJob(job, requiredSkills, optionalSkills));
        } catch (RuntimeException e) {
            log.error("Error creating job: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage(), "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating job: {}", e.getMessage(), e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error creating job: " + e.getMessage()));
        }
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<Job>> getMyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(jobService.getMyJobs(pageable));
    }

    @GetMapping("/jobs/{jobId}/applicants")
    public ResponseEntity<Page<Application>> getJobApplicants(
            @PathVariable UUID jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            log.info("GET /recruiters/jobs/{}/applicants - page={}, size={}", jobId, page, size);
            Pageable pageable = PageRequest.of(page, size);
            Page<Application> applications = applicationService.getJobApplicants(jobId, pageable);
            
            log.info("Found {} applicants (total: {})", 
                applications.getContent().size(), applications.getTotalElements());
            
            // Detach lazy-loaded relations
            if (applications != null && applications.getContent() != null) {
                applications.getContent().forEach(app -> {
                    try {
                        if (app != null) {
                            app.getId();
                            app.getStatus();
                            if (app.getJob() != null) {
                                app.getJob().getId();
                                app.getJob().setRecruiter(null);
                            }
                            if (app.getStudent() != null) {
                                app.getStudent().getId();
                                app.getStudent().setUser(null);
                            }
                            if (app.getCv() != null) {
                                app.getCv().getId();
                                app.getCv().setStudent(null);
                            }
                        }
                    } catch (Exception e) {
                        log.warn("Error processing application: {}", e.getMessage());
                    }
                });
            }
            
            return ResponseEntity.ok(applications);
        } catch (Exception e) {
            log.error("Error getting job applicants", e);
            e.printStackTrace();
            return ResponseEntity.status(400).body(Page.empty());
        }
    }

    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable UUID applicationId,
            @RequestParam Application.ApplicationStatus status,
            @RequestParam(required = false) String notes
    ) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(applicationId, status, notes));
    }

    @PostMapping("/applications/{applicationId}/interview")
    public ResponseEntity<Application> scheduleInterview(
            @PathVariable UUID applicationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime interviewTime
    ) {
        return ResponseEntity.ok(applicationService.scheduleInterview(applicationId, interviewTime));
    }

}

