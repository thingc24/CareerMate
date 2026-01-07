package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.careermate.model.*;
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
            log.info("GET /students/profile - Request received");
            
            // Check authentication first
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                log.warn("GET /students/profile - No authentication found");
                return ResponseEntity.status(401)
                    .body(Map.of("error", "Authentication required. Please login first."));
            }
            
            log.info("GET /students/profile - Authenticated user: {}", auth.getName());
            
            StudentProfile profile = studentService.getCurrentStudentProfile();
            
            if (profile == null) {
                log.warn("GET /students/profile - Profile is null after service call");
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Profile not found"));
            }

            log.info("GET /students/profile - Profile found with ID: {}", profile.getId());
            log.info("GET /students/profile - Profile data - University: {}, Major: {}, City: {}, Address: {}, Gender: {}", 
                profile.getUniversity(), profile.getMajor(), profile.getCity(), profile.getAddress(), profile.getGender());
            
            // KHÔNG set null cho bất kỳ field nào vì có thể trigger cascade operations
            // @JsonIgnore trên entity sẽ đảm bảo user và collections không được serialize
            // Chỉ cần copy data vào DTO Map

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
            dto.put("avatarUrl", profile.getAvatarUrl());
            dto.put("currentStatus", profile.getCurrentStatus() != null ? profile.getCurrentStatus() : "STUDENT");

            log.info("GET /students/profile - DTO data - University: {}, Major: {}, City: {}, Address: {}, Gender: {}", 
                dto.get("university"), dto.get("major"), dto.get("city"), dto.get("address"), dto.get("gender"));
            log.info("GET /students/profile - Returning profile data successfully");
            return ResponseEntity.ok(dto);
        } catch (RuntimeException e) {
            log.error("GET /students/profile - RuntimeException: {}", e.getMessage(), e);
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("Authentication required")) {
                return ResponseEntity.status(401)
                    .body(Map.of("error", errorMsg));
            }
            return ResponseEntity.badRequest()
                .body(Map.of("error", errorMsg != null ? errorMsg : "Unknown error"));
        } catch (Exception e) {
            log.error("GET /students/profile - Unexpected error", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error loading profile: " + e.getMessage(), 
                    "type", e.getClass().getSimpleName()));
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> profileData) {
        try {
            log.info("PUT /students/profile - Request received");
            
            // Check authentication first
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                log.warn("PUT /students/profile - No authentication found");
                return ResponseEntity.status(401)
                    .body(Map.of("error", "Authentication required. Please login first."));
            }
            
            log.info("PUT /students/profile - Authenticated user: {}", auth.getName());
            log.info("PUT /students/profile - Profile data received: {}", profileData);
            log.info("PUT /students/profile - Profile data keys: {}", profileData.keySet());
            
            // Convert Map to StudentProfile object
            StudentProfile profile = new StudentProfile();
            
            if (profileData.containsKey("dateOfBirth") && profileData.get("dateOfBirth") != null) {
                try {
                    String dateStr = profileData.get("dateOfBirth").toString();
                    if (!dateStr.isEmpty()) {
                        profile.setDateOfBirth(java.time.LocalDate.parse(dateStr));
                    }
                } catch (Exception e) {
                    log.warn("Error parsing dateOfBirth: {}", e.getMessage());
                }
            }
            
            // Handle fields - allow null values to clear fields
            if (profileData.containsKey("gender")) {
                profile.setGender(profileData.get("gender") != null && !profileData.get("gender").toString().isEmpty() 
                    ? (String) profileData.get("gender") : null);
            }
            if (profileData.containsKey("address")) {
                profile.setAddress(profileData.get("address") != null && !profileData.get("address").toString().isEmpty() 
                    ? (String) profileData.get("address") : null);
            }
            if (profileData.containsKey("city")) {
                profile.setCity(profileData.get("city") != null && !profileData.get("city").toString().isEmpty() 
                    ? (String) profileData.get("city") : null);
            }
            
            // Handle country - accept both "Việt Nam" and "Vietnam"
            String country = (String) profileData.getOrDefault("country", "Vietnam");
            if (country != null && (country.equals("Việt Nam") || country.equals("Vietnam"))) {
                profile.setCountry("Vietnam");
            } else if (country != null && !country.isEmpty()) {
                profile.setCountry(country);
            } else {
                profile.setCountry("Vietnam");
            }
            if (profileData.containsKey("university")) {
                profile.setUniversity(profileData.get("university") != null && !profileData.get("university").toString().isEmpty() 
                    ? (String) profileData.get("university") : null);
            }
            if (profileData.containsKey("major")) {
                profile.setMajor(profileData.get("major") != null && !profileData.get("major").toString().isEmpty() 
                    ? (String) profileData.get("major") : null);
            }
            
            if (profileData.containsKey("graduationYear") && profileData.get("graduationYear") != null) {
                try {
                    Object gradYear = profileData.get("graduationYear");
                    if (gradYear instanceof Number) {
                        profile.setGraduationYear(((Number) gradYear).intValue());
                    } else if (gradYear instanceof String && !gradYear.toString().isEmpty()) {
                        profile.setGraduationYear(Integer.parseInt(gradYear.toString()));
                    }
                } catch (Exception e) {
                    log.warn("Error parsing graduationYear: {}", e.getMessage());
                }
            }
            
            if (profileData.containsKey("gpa") && profileData.get("gpa") != null) {
                try {
                    Object gpaObj = profileData.get("gpa");
                    if (gpaObj instanceof Number) {
                        profile.setGpa(java.math.BigDecimal.valueOf(((Number) gpaObj).doubleValue()));
                    } else if (gpaObj instanceof String && !gpaObj.toString().isEmpty()) {
                        profile.setGpa(new java.math.BigDecimal(gpaObj.toString()));
                    }
                } catch (Exception e) {
                    log.warn("Error parsing GPA: {}", e.getMessage());
                }
            }
            
            if (profileData.containsKey("bio")) {
                profile.setBio(profileData.get("bio") != null && !profileData.get("bio").toString().isEmpty() 
                    ? (String) profileData.get("bio") : null);
            }
            if (profileData.containsKey("linkedinUrl")) {
                profile.setLinkedinUrl(profileData.get("linkedinUrl") != null && !profileData.get("linkedinUrl").toString().isEmpty() 
                    ? (String) profileData.get("linkedinUrl") : null);
            }
            if (profileData.containsKey("githubUrl")) {
                profile.setGithubUrl(profileData.get("githubUrl") != null && !profileData.get("githubUrl").toString().isEmpty() 
                    ? (String) profileData.get("githubUrl") : null);
            }
            if (profileData.containsKey("portfolioUrl")) {
                profile.setPortfolioUrl(profileData.get("portfolioUrl") != null && !profileData.get("portfolioUrl").toString().isEmpty() 
                    ? (String) profileData.get("portfolioUrl") : null);
            }
            if (profileData.containsKey("avatarUrl")) {
                profile.setAvatarUrl(profileData.get("avatarUrl") != null && !profileData.get("avatarUrl").toString().isEmpty() 
                    ? (String) profileData.get("avatarUrl") : null);
            }
            if (profileData.containsKey("currentStatus")) {
                profile.setCurrentStatus(profileData.get("currentStatus") != null && !profileData.get("currentStatus").toString().isEmpty() 
                    ? (String) profileData.get("currentStatus") : "STUDENT");
            } else {
                profile.setCurrentStatus("STUDENT");
            }
            
            log.info("Updating profile with data: dateOfBirth={}, gender={}, university={}, major={}", 
                profile.getDateOfBirth(), profile.getGender(), profile.getUniversity(), profile.getMajor());
            
            StudentProfile updated = studentService.updateProfile(profile);
            
            log.info("PUT /students/profile - Profile updated successfully. ID: {}", updated.getId());
            log.info("PUT /students/profile - Updated data - University: {}, Major: {}, City: {}, Address: {}", 
                updated.getUniversity(), updated.getMajor(), updated.getCity(), updated.getAddress());
            
            // Detach lazy-loaded relations
            // KHÔNG set null cho collections có cascade="all-delete-orphan" (skills, cvs, applications)
            // Vì đã có @JsonIgnore trên các collections này, chúng sẽ không được serialize
            updated.setUser(null);
            
            // Return as Map to avoid serialization issues
            Map<String, Object> response = new HashMap<>();
            response.put("id", updated.getId() != null ? updated.getId().toString() : null);
            response.put("dateOfBirth", updated.getDateOfBirth());
            response.put("gender", updated.getGender());
            response.put("address", updated.getAddress());
            response.put("city", updated.getCity());
            response.put("country", updated.getCountry());
            response.put("university", updated.getUniversity());
            response.put("major", updated.getMajor());
            response.put("graduationYear", updated.getGraduationYear());
            response.put("gpa", updated.getGpa());
            response.put("bio", updated.getBio());
            response.put("linkedinUrl", updated.getLinkedinUrl());
            response.put("githubUrl", updated.getGithubUrl());
            response.put("portfolioUrl", updated.getPortfolioUrl());
            response.put("avatarUrl", updated.getAvatarUrl());
            response.put("currentStatus", updated.getCurrentStatus());
            response.put("message", "Profile updated successfully");
            
            log.info("PUT /students/profile - Response data - University: {}, Major: {}, City: {}, Address: {}", 
                response.get("university"), response.get("major"), response.get("city"), response.get("address"));
            log.info("PUT /students/profile - Returning success response with fresh data from database");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("PUT /students/profile - RuntimeException: {}", e.getMessage(), e);
            String errorMsg = e.getMessage();
            if (errorMsg != null && errorMsg.contains("Authentication required")) {
                return ResponseEntity.status(401)
                    .body(Map.of("error", errorMsg));
            }
            if (errorMsg != null && errorMsg.contains("User not found")) {
                return ResponseEntity.status(401)
                    .body(Map.of("error", errorMsg + ". Please login again."));
            }
            return ResponseEntity.badRequest()
                .body(Map.of("error", errorMsg != null ? errorMsg : "Unknown error", 
                    "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            log.error("PUT /students/profile - Unexpected error", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error updating profile: " + e.getMessage(), 
                    "type", e.getClass().getSimpleName(),
                    "details", e.toString()));
        }
    }

    @PostMapping("/profile/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            String avatarUrl = studentService.uploadAvatar(file);
            return ResponseEntity.ok(Map.of("avatarUrl", avatarUrl));
        } catch (RuntimeException e) {
            log.error("Runtime error uploading avatar: {}", e.getMessage());
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            log.error("IO error uploading avatar", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error uploading file: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error uploading avatar", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error uploading avatar: " + e.getMessage()));
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
            Application application = studentService.applyForJob(jobId, cvId, coverLetter);
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
                            // KHÔNG set null cho collections có cascade="all-delete-orphan"
                            // @JsonIgnore sẽ đảm bảo chúng không được serialize
                        }
                        if (app.getStudent() != null) {
                            app.getStudent().setUser(null);
                            // KHÔNG set null cho collections có cascade="all-delete-orphan"
                            // @JsonIgnore sẽ đảm bảo chúng không được serialize
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

    // ========== SAVED JOBS ==========
    @PostMapping("/saved-jobs")
    public ResponseEntity<?> saveJob(@RequestParam UUID jobId, @RequestParam(required = false) String notes) {
        try {
            SavedJob savedJob = studentService.saveJob(jobId, notes);
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
            Page<SavedJob> savedJobs = studentService.getSavedJobs(pageable);
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
            studentService.deleteSavedJob(jobId);
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
            boolean isSaved = studentService.isJobSaved(jobId);
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

