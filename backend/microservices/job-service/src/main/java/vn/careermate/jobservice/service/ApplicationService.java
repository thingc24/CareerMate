package vn.careermate.jobservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.jobservice.model.Application;
import vn.careermate.jobservice.model.ApplicationHistory;
import vn.careermate.jobservice.model.Job;
import vn.careermate.jobservice.model.SavedJob;
import vn.careermate.jobservice.repository.ApplicationHistoryRepository;
import vn.careermate.jobservice.repository.ApplicationRepository;
import vn.careermate.jobservice.repository.JobRepository;
import vn.careermate.jobservice.repository.SavedJobRepository;
// import vn.careermate.userservice.model.CV; // Replaced with UUID
// import vn.careermate.userservice.repository.CVRepository; // Replaced with UserServiceClient
// import vn.careermate.userservice.model.StudentProfile; // Replaced with UUID
// import vn.careermate.userservice.model.User; // Replaced with UserServiceClient
// import vn.careermate.userservice.repository.StudentProfileRepository; // Replaced with UserServiceClient
// import vn.careermate.userservice.repository.UserRepository; // Replaced with UserServiceClient
// import vn.careermate.notificationservice.service.NotificationService; // Replaced with NotificationServiceClient
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.client.NotificationServiceClient;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.common.dto.StudentProfileDTO;
import vn.careermate.common.dto.NotificationRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ApplicationHistoryRepository applicationHistoryRepository;
    private final JobRepository jobRepository;
    private final SavedJobRepository savedJobRepository;
    // Feign Clients for inter-service communication
    private final UserServiceClient userServiceClient;
    private final NotificationServiceClient notificationServiceClient;
    
    // TODO: Remove these after refactoring
    // private final CVRepository cvRepository;
    // private final StudentProfileRepository studentProfileRepository;
    // private final UserRepository userRepository;
    // private final NotificationService notificationService;

    // TODO: Refactor to use UserServiceClient.getCurrentStudentProfile() and UserServiceClient.getCVById()
    @Transactional
    public Application applyForJob(UUID jobId, UUID cvId, String coverLetter) {
        // TODO: Get current user from SecurityContext and use UserServiceClient to get student profile
        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // String email = auth.getName();
        // UserDTO user = userServiceClient.getUserByEmail(email);
        // UUID studentId = ...; // Get from user or student profile
        
        // TODO: Get CV using UserServiceClient if cvId is provided
        
        // For now, throw exception - needs to be implemented with Feign Clients
        throw new RuntimeException("applyForJob() method needs to be refactored to use Feign Clients. " +
                "Please use UserServiceClient to get student profile and CV information.");
        
        /* OLD CODE - COMMENTED OUT - Will be refactored to use Feign Clients
        StudentProfile student = getCurrentStudentProfile();
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        // Check if already applied
        if (applicationRepository.findByJobIdAndStudentId(jobId, student.getId()).isPresent()) {
            throw new RuntimeException("Already applied for this job");
        }

        CV cv = null;
        if (cvId != null) {
            cv = cvRepository.findById(cvId)
                    .orElseThrow(() -> new RuntimeException("CV not found"));
        } else {
            // Use default CV
            cv = cvRepository.findByStudentIdAndIsDefaultTrue(student.getId())
                    .orElse(null);
        }

        Application application = Application.builder()
                .job(job)
                .studentId(student.getId())
                .cvId(cv != null ? cv.getId() : null)
                .coverLetter(coverLetter)
                .status(Application.ApplicationStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .build();

        application = applicationRepository.save(application);

        // Update job applications count
        job.setApplicationsCount(job.getApplicationsCount() + 1);
        jobRepository.save(job);

        // Send notification to recruiter using NotificationServiceClient
        try {
            // Get recruiter user ID from job
            RecruiterProfileDTO recruiter = userServiceClient.getRecruiterProfileById(job.getRecruiterId());
            if (recruiter != null) {
                UserDTO studentUser = userServiceClient.getUserById(student.getUserId());
                String studentName = studentUser != null && studentUser.getFullName() != null ? 
                    studentUser.getFullName() : (studentUser != null ? studentUser.getEmail() : "Ứng viên");
                
                NotificationRequest request = NotificationRequest.builder()
                        .userId(recruiter.getUserId())
                        .type("NEW_APPLICATION")
                        .title("Có đơn ứng tuyển mới")
                        .message("Ứng viên " + studentName + " đã ứng tuyển cho job: " + job.getTitle())
                        .relatedEntityId(application.getId())
                        .relatedEntityType("APPLICATION")
                        .build();
                notificationServiceClient.createNotification(request);
            }
        } catch (Exception e) {
            log.warn("Error sending notification for new application: {}", e.getMessage());
        }

        return application;
        */
    }

    @Transactional(readOnly = true)
    public Optional<Application> checkApplication(UUID jobId) {
        try {
            UUID studentId = getCurrentStudentProfileId();
            Optional<Application> applicationOpt = applicationRepository.findByJobIdAndStudentId(jobId, studentId);
            
            // Force load fields to avoid lazy loading issues
            if (applicationOpt.isPresent()) {
                Application app = applicationOpt.get();
                app.getId(); // Force load
                app.getStatus(); // Force load
                app.getAppliedAt(); // Force load
            }
            
            return applicationOpt;
        } catch (Exception e) {
            log.error("Error checking application for job: {}", jobId, e);
            return Optional.empty();
        }
    }

    @Transactional(readOnly = true)
    public Page<Application> getApplications(Pageable pageable) {
        try {
            log.info("Getting applications for current student - page={}, size={}", 
                pageable.getPageNumber(), pageable.getPageSize());
            
            UUID studentId = getCurrentStudentProfileId();
            log.info("Found student profile ID: {}", studentId);
            
            Page<Application> applications = applicationRepository.findByStudentId(studentId, pageable);
            
            log.info("Found {} applications (total: {})", 
                applications.getContent().size(), applications.getTotalElements());
            
            // Force load job, company, CV, and student for each application to avoid lazy loading issues
            if (applications != null && applications.getContent() != null) {
                applications.getContent().forEach(app -> {
                    try {
                        // Force load all fields to ensure they're initialized
                        app.getId();
                        app.getStatus();
                        app.getAppliedAt();
                        app.getCoverLetter();
                        
                        if (app.getJob() != null) {
                            app.getJob().getId(); // Force load job
                            app.getJob().getTitle(); // Force load job title
                            app.getJob().getLocation(); // Force load job location
                            app.getJob().getJobType(); // Force load job type
                            app.getJob().getExperienceLevel(); // Force load experience level
                            app.getJob().getDescription(); // Force load description
                            // Company is now UUID (companyId), no need to force load entity
                            app.getJob().getCompanyId(); // Force load company ID
                        }
                        // Student and CV are now UUIDs (studentId, cvId), no need to force load entities
                        app.getStudentId(); // Force load student ID
                        app.getCvId(); // Force load CV ID
                    } catch (Exception e) {
                        log.error("Error force loading application fields for app {}: {}", 
                            app != null ? app.getId() : "null", e.getMessage(), e);
                    }
                });
            }
            
            log.info("Successfully loaded {} applications", applications.getContent().size());
            return applications;
        } catch (RuntimeException e) {
            log.error("Runtime error getting applications: {}", e.getMessage(), e);
            e.printStackTrace();
            return Page.empty(pageable);
        } catch (Exception e) {
            log.error("Unexpected error getting applications", e);
            e.printStackTrace();
            return Page.empty(pageable);
        }
    }

    @Transactional(readOnly = true)
    public Page<Application> getJobApplicants(UUID jobId, Pageable pageable) {
        Page<Application> applications = applicationRepository.findByJobId(jobId, pageable);
        
        // Force load all fields to avoid lazy loading issues
        if (applications != null && applications.getContent() != null) {
            applications.getContent().forEach(app -> {
                try {
                    app.getId();
                    app.getStatus();
                    app.getAppliedAt();
                    
                    if (app.getJob() != null) {
                        app.getJob().getId();
                        app.getJob().getTitle();
                        app.getJob().getLocation();
                        // Company is now UUID (companyId), no need to force load entity
                        app.getJob().getCompanyId();
                    }
                    // Student and CV are now UUIDs, no need to force load entities
                    app.getStudentId();
                    if (app.getCvId() != null) {
                        app.getCvId(); // Force load CV ID
                    }
                } catch (Exception e) {
                    // Log but continue
                }
            });
        }
        
        return applications;
    }

    @Transactional
    public Application updateApplicationStatus(UUID applicationId, Application.ApplicationStatus status, String notes) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(status);
        application.setUpdatedAt(LocalDateTime.now());

        if (status == Application.ApplicationStatus.VIEWED && application.getViewedAt() == null) {
            application.setViewedAt(LocalDateTime.now());
        }

        application = applicationRepository.save(application);

        // Create history record
        try {
            ApplicationHistory history = ApplicationHistory.builder()
                    .application(application)
                    .status(status.name())
                    .notes(notes)
                    .changedById(getCurrentUserId())
                    .build();
            applicationHistoryRepository.save(history);
        } catch (Exception e) {
            log.warn("Could not create application history: {}", e.getMessage());
        }

        // Send notification to student
        try {
            if (application.getStudentId() != null) {
                // Get user ID via UserServiceClient
                StudentProfileDTO studentProfile = userServiceClient.getStudentProfileById(application.getStudentId());
                if (studentProfile != null && studentProfile.getUserId() != null) {
                    UUID studentUserId = studentProfile.getUserId();
                    String statusText = getStatusText(status);
                    notificationServiceClient.createNotification(NotificationRequest.builder()
                        .userId(studentUserId)
                        .type("APPLICATION_STATUS_CHANGED")
                        .title("Application Status Updated")
                        .message(String.format("Your application for %s has been %s", application.getJob().getTitle(), statusText))
                        .relatedEntityId(application.getId())
                        .relatedEntityType("APPLICATION")
                        .build());
                }
            }
        } catch (Exception e) {
            log.warn("Error sending notification for application status change: {}", e.getMessage());
        }

        return application;
    }

    private String getStatusText(Application.ApplicationStatus status) {
        switch (status) {
            case PENDING: return "Đang chờ";
            case VIEWED: return "Đã xem";
            case SHORTLISTED: return "Đã chọn";
            case INTERVIEW: return "Phỏng vấn";
            case OFFERED: return "Đã đề xuất";
            case REJECTED: return "Đã từ chối";
            case WITHDRAWN: return "Đã rút";
            default: return status.name();
        }
    }

    @Transactional
    public Application scheduleInterview(UUID applicationId, LocalDateTime interviewTime) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(Application.ApplicationStatus.INTERVIEW);
        application.setInterviewScheduledAt(interviewTime);
        application.setUpdatedAt(LocalDateTime.now());

        application = applicationRepository.save(application);

        // Send notification to student
        try {
            if (application.getStudentId() != null) {
                // Get user ID via UserServiceClient
                StudentProfileDTO studentProfile = userServiceClient.getStudentProfileById(application.getStudentId());
                UUID studentUserId = studentProfile != null ? studentProfile.getUserId() : null;
                if (studentUserId == null) {
                    log.warn("Could not find user for student {}", application.getStudentId());
                    return application;
                }
                String interviewTimeStr = interviewTime.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
                notificationServiceClient.createNotification(NotificationRequest.builder()
                    .userId(studentUserId)
                    .type("INTERVIEW_SCHEDULED")
                    .title("Interview Scheduled")
                    .message(String.format("Interview scheduled for %s at %s", application.getJob().getTitle(), interviewTimeStr))
                    .relatedEntityId(application.getId())
                    .relatedEntityType("APPLICATION")
                    .build());
            }
        } catch (Exception e) {
            log.warn("Error sending notification for interview scheduled: {}", e.getMessage());
        }

        return application;
    }

    // ========== SAVED JOBS ==========
    @Transactional
    public SavedJob saveJob(UUID jobId, String notes) {
        UUID studentId = getCurrentStudentProfileId();
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        // Check if already saved
        Optional<SavedJob> existing = savedJobRepository.findByStudentIdAndJobId(studentId, jobId);
        if (existing.isPresent()) {
            SavedJob saved = existing.get();
            if (notes != null) {
                saved.setNotes(notes);
            }
            return savedJobRepository.save(saved);
        }
        
        SavedJob savedJob = SavedJob.builder()
                .studentId(studentId)
                .jobId(jobId)
                .notes(notes)
                .build();
        
        return savedJobRepository.save(savedJob);
    }

    @Transactional(readOnly = true)
    public Page<SavedJob> getSavedJobs(Pageable pageable) {
        UUID studentId = getCurrentStudentProfileId();
        if (studentId == null) {
            return Page.empty(pageable);
        }
        return savedJobRepository.findByStudentIdOrderBySavedAtDesc(studentId, pageable);
    }

    @Transactional
    public void deleteSavedJob(UUID jobId) {
        UUID studentId = getCurrentStudentProfileId();
        savedJobRepository.deleteByStudentIdAndJobId(studentId, jobId);
    }

    @Transactional(readOnly = true)
    public boolean isJobSaved(UUID jobId) {
        UUID studentId = getCurrentStudentProfileId();
        if (studentId == null) {
            return false;
        }
        return savedJobRepository.existsByStudentIdAndJobId(studentId, jobId);
    }

    // ========== HELPER METHODS ==========
    // TODO: Refactor to use UserServiceClient.getCurrentStudentProfile()
    private UUID getCurrentStudentProfileId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Authentication required. Please login first.");
        }
        
        String email = auth.getName();
        UserDTO user = userServiceClient.getUserByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found: " + email + ". Please register first.");
        }
        
        // Get student profile ID from UserServiceClient
        try {
            StudentProfileDTO studentProfile = userServiceClient.getStudentProfileByUserId(user.getId());
            if (studentProfile == null) {
                throw new RuntimeException("Student profile not found for user: " + user.getId());
            }
            return studentProfile.getId();
        } catch (Exception e) {
            log.error("Error getting student profile: {}", e.getMessage());
            throw new RuntimeException("Failed to get student profile: " + e.getMessage());
        }
        
        /* OLD CODE - COMMENTED OUT
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email + ". Please register first."));

        StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
        return profile.getId();
        */
    }
    
    // Get current user ID using UserServiceClient
    private UUID getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            UserDTO user = userServiceClient.getUserByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found: " + email);
            }
            return user.getId();
        } catch (Exception e) {
            log.error("Error getting current user ID: {}", e.getMessage());
            throw new RuntimeException("Failed to get current user: " + e.getMessage());
        }
    }
}
