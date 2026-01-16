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
import vn.careermate.userservice.model.CV;
import vn.careermate.userservice.repository.CVRepository;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.StudentProfileRepository;
import vn.careermate.userservice.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
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
    private final CVRepository cvRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    @Transactional
    public Application applyForJob(UUID jobId, UUID cvId, String coverLetter) {
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
                .student(student)
                .cv(cv)
                .coverLetter(coverLetter)
                .status(Application.ApplicationStatus.PENDING)
                .appliedAt(LocalDateTime.now())
                .build();

        application = applicationRepository.save(application);

        // Update job applications count
        job.setApplicationsCount(job.getApplicationsCount() + 1);
        jobRepository.save(job);

        return application;
    }

    @Transactional(readOnly = true)
    public Optional<Application> checkApplication(UUID jobId) {
        try {
            StudentProfile student = getCurrentStudentProfile();
            if (student == null || student.getId() == null) {
                return Optional.empty();
            }
            
            // Force load student to ensure it's in the session
            UUID studentId = student.getId();
            StudentProfile loadedStudent = studentProfileRepository.findById(studentId)
                .orElse(null);
            if (loadedStudent == null) {
                return Optional.empty();
            }
            
            Optional<Application> applicationOpt = applicationRepository.findByJobIdAndStudentId(jobId, loadedStudent.getId());
            
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
            
            StudentProfile student = getCurrentStudentProfile();
            if (student == null || student.getId() == null) {
                log.warn("Student profile not found or ID is null");
                return Page.empty(pageable);
            }
            
            // Force load student to ensure it's in the session
            UUID studentId = student.getId();
            StudentProfile loadedStudent = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
            
            log.info("Found student profile: {}", loadedStudent.getId());
            
            Page<Application> applications = applicationRepository.findByStudentId(loadedStudent.getId(), pageable);
            
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
                            if (app.getJob().getCompany() != null) {
                                app.getJob().getCompany().getId(); // Force load company
                                app.getJob().getCompany().getName(); // Force load company name
                                app.getJob().getCompany().getLogoUrl(); // Force load logo
                            }
                        }
                        // Force load student to avoid lazy loading
                        if (app.getStudent() != null) {
                            app.getStudent().getId();
                        }
                        // Force load CV to avoid lazy loading
                        if (app.getCv() != null) {
                            app.getCv().getId();
                            app.getCv().getFileName();
                            app.getCv().getFileUrl();
                        }
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
                        if (app.getJob().getCompany() != null) {
                            app.getJob().getCompany().getId();
                            app.getJob().getCompany().getName();
                        }
                    }
                    if (app.getStudent() != null) {
                        app.getStudent().getId();
                    }
                    if (app.getCv() != null) {
                        app.getCv().getId();
                        app.getCv().getFileName();
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
                    .changedBy(getCurrentUser())
                    .build();
            applicationHistoryRepository.save(history);
        } catch (Exception e) {
            log.warn("Could not create application history: {}", e.getMessage());
        }

        return application;
    }

    @Transactional
    public Application scheduleInterview(UUID applicationId, LocalDateTime interviewTime) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));

        application.setStatus(Application.ApplicationStatus.INTERVIEW);
        application.setInterviewScheduledAt(interviewTime);
        application.setUpdatedAt(LocalDateTime.now());

        return applicationRepository.save(application);
    }

    // ========== SAVED JOBS ==========
    @Transactional
    public SavedJob saveJob(UUID jobId, String notes) {
        StudentProfile student = getCurrentStudentProfile();
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        // Check if already saved
        Optional<SavedJob> existing = savedJobRepository.findByStudentIdAndJobId(student.getId(), jobId);
        if (existing.isPresent()) {
            SavedJob saved = existing.get();
            if (notes != null) {
                saved.setNotes(notes);
            }
            return savedJobRepository.save(saved);
        }
        
        SavedJob savedJob = SavedJob.builder()
                .student(student)
                .job(job)
                .notes(notes)
                .build();
        
        return savedJobRepository.save(savedJob);
    }

    @Transactional(readOnly = true)
    public Page<SavedJob> getSavedJobs(Pageable pageable) {
        StudentProfile student = getCurrentStudentProfile();
        if (student == null || student.getId() == null) {
            return Page.empty(pageable);
        }
        return savedJobRepository.findByStudentIdOrderBySavedAtDesc(student.getId(), pageable);
    }

    @Transactional
    public void deleteSavedJob(UUID jobId) {
        StudentProfile student = getCurrentStudentProfile();
        savedJobRepository.deleteByStudentIdAndJobId(student.getId(), jobId);
    }

    @Transactional(readOnly = true)
    public boolean isJobSaved(UUID jobId) {
        StudentProfile student = getCurrentStudentProfile();
        if (student == null || student.getId() == null) {
            return false;
        }
        return savedJobRepository.existsByStudentIdAndJobId(student.getId(), jobId);
    }

    // ========== HELPER METHODS ==========
    private StudentProfile getCurrentStudentProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new RuntimeException("Authentication required. Please login first.");
        }
        
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email + ". Please register first."));

        return studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
