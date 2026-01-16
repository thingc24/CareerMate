package vn.careermate.userservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.careermate.jobservice.model.Application;
import vn.careermate.jobservice.model.Job;
import vn.careermate.jobservice.model.SavedJob;
import vn.careermate.jobservice.service.ApplicationService;
import vn.careermate.jobservice.service.JobService;
import vn.careermate.userservice.service.StudentService;
import vn.careermate.aiservice.model.AIChatConversation;
import vn.careermate.aiservice.model.AIChatMessage;
import vn.careermate.aiservice.model.JobRecommendation;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
// Tạm thời bỏ kiểm tra role để dễ test trong môi trường phát triển
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;
    private final JobService jobService;
    private final ApplicationService applicationService;

    // CV endpoints are now handled by CVController in userservice
    // Access via: /students/cv/*

    @GetMapping("/jobs")
    public ResponseEntity<Page<Job>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Job> jobs = jobService.searchJobs(keyword, location, pageable);
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
            Job job = jobService.getJob(jobId);
            // Detach lazy-loaded relations
            // KHÔNG set null cho collections có cascade="all-delete-orphan" (skills, applications)
            // @JsonIgnore sẽ đảm bảo chúng không được serialize
            if (job != null) {
                job.setRecruiter(null);
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
            Application application = applicationService.applyForJob(jobId, cvId, coverLetter);
            // Detach lazy-loaded relations
            if (application != null) {
                if (application.getJob() != null) {
                    application.getJob().setRecruiter(null);
                    // KHÔNG set null cho collections có cascade="all-delete-orphan"
                    // @JsonIgnore sẽ đảm bảo chúng không được serialize
                }
                if (application.getStudent() != null) {
                    application.getStudent().setUser(null);
                    // KHÔNG set null cho collections có cascade="all-delete-orphan"
                    // @JsonIgnore sẽ đảm bảo chúng không được serialize
                }
                if (application.getCv() != null) {
                    application.getCv().setStudent(null);
                }
            }
            return ResponseEntity.ok(application);
        } catch (RuntimeException e) {
            log.error("Runtime error applying for job: {}", e.getMessage());
            int statusCode = e.getMessage().contains("Already applied") ? 409 : 400;
            return ResponseEntity.status(statusCode)
                .body(Map.of("error", e.getMessage(), "message", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error applying for job", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error applying for job: " + e.getMessage()));
        }
    }

    @GetMapping("/applications/check/{jobId}")
    public ResponseEntity<Map<String, Object>> checkApplication(@PathVariable UUID jobId) {
        try {
            Optional<Application> application = applicationService.checkApplication(jobId);
            if (application.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "applied", true,
                    "applicationId", application.get().getId(),
                    "status", application.get().getStatus().name(),
                    "appliedAt", application.get().getAppliedAt()
                ));
            }
            return ResponseEntity.ok(Map.of("applied", false));
        } catch (Exception e) {
            log.error("Error checking application", e);
            return ResponseEntity.ok(Map.of("applied", false));
        }
    }

    @GetMapping("/applications")
    public ResponseEntity<Page<Application>> getApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            log.info("GET /students/applications - page={}, size={}", page, size);
            Pageable pageable = PageRequest.of(page, size);
            Page<Application> applications = applicationService.getApplications(pageable);
            
            log.info("Applications retrieved: {} total, {} in page", 
                applications.getTotalElements(), applications.getContent().size());
            
            // Detach lazy-loaded relations and ensure all fields are loaded
            if (applications != null && applications.getContent() != null) {
                applications.getContent().forEach(app -> {
                    try {
                        if (app != null) {
                            // Force access all fields to ensure they're loaded
                            app.getId();
                            app.getStatus();
                            app.getAppliedAt();
                            
                            if (app.getJob() != null) {
                                app.getJob().getId();
                                app.getJob().getTitle();
                                app.getJob().setRecruiter(null);
                            }
                            if (app.getStudent() != null) {
                                app.getStudent().getId();
                                app.getStudent().setUser(null);
                            }
                            if (app.getCv() != null) {
                                app.getCv().getId();
                                app.getCv().getFileName();
                                app.getCv().setStudent(null);
                            }
                        }
                    } catch (Exception e) {
                        log.warn("Error processing application: {}", e.getMessage());
                    }
                });
            }
            
            log.info("Returning applications successfully");
            return ResponseEntity.ok(applications);
        } catch (RuntimeException e) {
            log.error("Runtime error getting applications: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                .body(Page.empty());
        } catch (Exception e) {
            log.error("Unexpected error getting applications", e);
            e.printStackTrace();
            return ResponseEntity.status(500)
                .body(Page.empty());
        }
    }

    // ========== SAVED JOBS ==========
    @PostMapping("/saved-jobs")
    public ResponseEntity<?> saveJob(@RequestParam UUID jobId, @RequestParam(required = false) String notes) {
        try {
            SavedJob savedJob = applicationService.saveJob(jobId, notes);
            // Detach lazy-loaded relations
            if (savedJob.getJob() != null) {
                savedJob.getJob().setRecruiter(null);
            }
            return ResponseEntity.ok(savedJob);
        } catch (RuntimeException e) {
            log.error("Error saving job: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error saving job", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error saving job: " + e.getMessage()));
        }
    }

    @GetMapping("/saved-jobs")
    public ResponseEntity<Page<SavedJob>> getSavedJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<SavedJob> savedJobs = applicationService.getSavedJobs(pageable);
            // Detach lazy-loaded relations
            savedJobs.getContent().forEach(savedJob -> {
                if (savedJob.getJob() != null) {
                    savedJob.getJob().setRecruiter(null);
                }
            });
            return ResponseEntity.ok(savedJobs);
        } catch (Exception e) {
            log.error("Error getting saved jobs", e);
            return ResponseEntity.status(500)
                .body(Page.empty());
        }
    }

    @DeleteMapping("/saved-jobs/{jobId}")
    public ResponseEntity<?> deleteSavedJob(@PathVariable UUID jobId) {
        try {
            applicationService.deleteSavedJob(jobId);
            return ResponseEntity.ok(Map.of("message", "Job removed from saved list"));
        } catch (Exception e) {
            log.error("Error deleting saved job", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error deleting saved job: " + e.getMessage()));
        }
    }

    @GetMapping("/saved-jobs/check/{jobId}")
    public ResponseEntity<Map<String, Boolean>> checkJobSaved(@PathVariable UUID jobId) {
        try {
            boolean isSaved = applicationService.isJobSaved(jobId);
            return ResponseEntity.ok(Map.of("isSaved", isSaved));
        } catch (Exception e) {
            log.error("Error checking saved job", e);
            return ResponseEntity.status(500)
                .body(Map.of("isSaved", false));
        }
    }

    // ========== AI CHAT CONVERSATIONS ==========
    @GetMapping("/chat/conversations")
    public ResponseEntity<Page<AIChatConversation>> getChatConversations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AIChatConversation> conversations = studentService.getChatConversations(pageable);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            log.error("Error getting chat conversations", e);
            return ResponseEntity.status(500)
                .body(Page.empty());
        }
    }

    @GetMapping("/chat/conversations/{conversationId}/messages")
    public ResponseEntity<List<AIChatMessage>> getChatMessages(@PathVariable UUID conversationId) {
        try {
            List<AIChatMessage> messages = studentService.getChatMessages(conversationId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            log.error("Error getting chat messages", e);
            return ResponseEntity.status(500)
                .body(List.of());
        }
    }

    // ========== JOB RECOMMENDATIONS ==========
    @GetMapping("/recommendations")
    public ResponseEntity<Page<JobRecommendation>> getJobRecommendations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<JobRecommendation> recommendations = studentService.getJobRecommendations(pageable);
            // Detach lazy-loaded relations
            recommendations.getContent().forEach(rec -> {
                if (rec.getJob() != null) {
                    rec.getJob().setRecruiter(null);
                }
            });
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            log.error("Error getting job recommendations", e);
            return ResponseEntity.status(500)
                .body(Page.empty());
        }
    }

    @GetMapping("/recommendations/unviewed")
    public ResponseEntity<List<JobRecommendation>> getUnviewedRecommendations() {
        try {
            List<JobRecommendation> recommendations = studentService.getUnviewedRecommendations();
            // Detach lazy-loaded relations
            recommendations.forEach(rec -> {
                if (rec.getJob() != null) {
                    rec.getJob().setRecruiter(null);
                }
            });
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            log.error("Error getting unviewed recommendations", e);
            return ResponseEntity.status(500)
                .body(List.of());
        }
    }

    @PutMapping("/recommendations/{recommendationId}/viewed")
    public ResponseEntity<?> markRecommendationAsViewed(@PathVariable UUID recommendationId) {
        try {
            studentService.markRecommendationAsViewed(recommendationId);
            return ResponseEntity.ok(Map.of("message", "Recommendation marked as viewed"));
        } catch (RuntimeException e) {
            log.error("Error marking recommendation as viewed: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error marking recommendation as viewed", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error marking recommendation as viewed: " + e.getMessage()));
        }
    }

    @PutMapping("/recommendations/{recommendationId}/applied")
    public ResponseEntity<?> markRecommendationAsApplied(@PathVariable UUID recommendationId) {
        try {
            studentService.markRecommendationAsApplied(recommendationId);
            return ResponseEntity.ok(Map.of("message", "Recommendation marked as applied"));
        } catch (RuntimeException e) {
            log.error("Error marking recommendation as applied: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error marking recommendation as applied", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error marking recommendation as applied: " + e.getMessage()));
        }
    }
}

