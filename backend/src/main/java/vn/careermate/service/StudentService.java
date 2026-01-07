package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.careermate.model.*;
import vn.careermate.repository.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final CVRepository cvRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final AIService aiService;
    private final FileStorageService fileStorageService;

    @Transactional
    public StudentProfile getCurrentStudentProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            log.warn("Authentication not found or anonymous user");
            throw new RuntimeException("Authentication required. Please login first.");
        }
        
        try {
            String email = auth.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));

            StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                    .orElse(null);

            // Tạo profile mới nếu chưa có
            if (profile == null) {
                log.info("Creating default profile for user: {}", email);
                profile = createDefaultProfile(user);
            }

            // Tránh lỗi lazy proxy khi serialize: bỏ reference tới các entity quan hệ
            if (profile != null) {
                profile.setUser(null);
                profile.setSkills(null);
                profile.setCvs(null);
                profile.setApplications(null);
            }

            return profile;
        } catch (RuntimeException e) {
            log.error("Error getting student profile: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error getting student profile", e);
            throw new RuntimeException("Error getting student profile: " + e.getMessage(), e);
        }
    }

    @Transactional
    private StudentProfile createDefaultProfile(User user) {
        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setCurrentStatus("STUDENT");
        return studentProfileRepository.save(profile);
    }

    @Transactional
    public StudentProfile updateProfile(StudentProfile profile) {
        StudentProfile existing = getCurrentStudentProfile();
        existing.setDateOfBirth(profile.getDateOfBirth());
        existing.setGender(profile.getGender());
        existing.setAddress(profile.getAddress());
        existing.setCity(profile.getCity());
        existing.setUniversity(profile.getUniversity());
        existing.setMajor(profile.getMajor());
        existing.setGraduationYear(profile.getGraduationYear());
        existing.setGpa(profile.getGpa());
        existing.setBio(profile.getBio());
        existing.setLinkedinUrl(profile.getLinkedinUrl());
        existing.setGithubUrl(profile.getGithubUrl());
        existing.setPortfolioUrl(profile.getPortfolioUrl());
        existing.setCurrentStatus(profile.getCurrentStatus());
        
        return studentProfileRepository.save(existing);
    }

    @Transactional
    public CV uploadCV(MultipartFile file) throws IOException {
        StudentProfile student = getCurrentStudentProfile();
        
        // Validate file type
        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();
        if (fileName == null || (!fileName.toLowerCase().endsWith(".pdf") && 
            !fileName.toLowerCase().endsWith(".docx") && 
            !fileName.toLowerCase().endsWith(".doc") &&
            !fileName.toLowerCase().endsWith(".txt"))) {
            throw new RuntimeException("Invalid file type. Only PDF, DOCX, DOC, and TXT are allowed.");
        }

        // Save file using FileStorageService
        String filePath = fileStorageService.storeFile(file, "cvs");

        // Create CV record
        CV cv = CV.builder()
                .student(student)
                .fileUrl(filePath)
                .fileName(fileName)
                .fileSize(file.getSize())
                .fileType(contentType)
                .isDefault(false)
                .build();

        cv = cvRepository.save(cv);

        // Analyze CV with AI (async)
        aiService.analyzeCVAsync(cv);

        return cv;
    }

    public List<CV> getCVs() {
        try {
            StudentProfile student = getCurrentStudentProfile();
            if (student == null || student.getId() == null) {
                log.warn("Student profile not found or ID is null");
                return List.of();
            }
            List<CV> cvs = cvRepository.findByStudentId(student.getId());
            // Detach lazy-loaded relations
            if (cvs != null) {
                cvs.forEach(cv -> {
                    if (cv != null && cv.getStudent() != null) {
                        cv.setStudent(null);
                    }
                });
            }
            return cvs != null ? cvs : List.of();
        } catch (RuntimeException e) {
            log.error("Runtime error getting CVs: {}", e.getMessage(), e);
            return List.of();
        } catch (Exception e) {
            log.error("Unexpected error getting CVs", e);
            return List.of();
        }
    }

    public Page<Job> searchJobs(String keyword, String location, Pageable pageable) {
        try {
            // Normalize null/empty strings
            String normalizedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
            String normalizedLocation = (location != null && !location.trim().isEmpty()) ? location.trim() : null;
            
            Page<Job> jobs = jobRepository.searchJobs(normalizedKeyword, normalizedLocation, pageable);
            return jobs != null ? jobs : Page.empty(pageable);
        } catch (RuntimeException e) {
            log.error("Runtime error searching jobs: keyword={}, location={}, error={}", keyword, location, e.getMessage());
            return Page.empty(pageable);
        } catch (Exception e) {
            log.error("Unexpected error searching jobs: keyword={}, location={}", keyword, location, e);
            return Page.empty(pageable);
        }
    }

    public Job getJob(UUID jobId) {
        try {
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
            // Detach lazy-loaded relations
            if (job != null) {
                job.setRecruiter(null);
                job.setSkills(null);
                job.setApplications(null);
            }
            return job;
        } catch (RuntimeException e) {
            log.error("Runtime error getting job: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error getting job", e);
            throw new RuntimeException("Error getting job: " + e.getMessage(), e);
        }
    }

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

        // Calculate match score with AI (async)
        // TODO: Implement job matching calculation
        // aiService.calculateJobMatchAsync(application);

        // Update job applications count
        job.setApplicationsCount(job.getApplicationsCount() + 1);
        jobRepository.save(job);

        return application;
    }

    public Page<Application> getApplications(Pageable pageable) {
        try {
            StudentProfile student = getCurrentStudentProfile();
            if (student == null || student.getId() == null) {
                log.warn("Student profile not found or ID is null");
                return Page.empty(pageable);
            }
            return applicationRepository.findByStudentId(student.getId(), pageable);
        } catch (RuntimeException e) {
            log.error("Runtime error getting applications: {}", e.getMessage());
            return Page.empty(pageable);
        } catch (Exception e) {
            log.error("Unexpected error getting applications", e);
            return Page.empty(pageable);
        }
    }
}

