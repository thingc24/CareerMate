package vn.careermate.service;

import lombok.RequiredArgsConstructor;
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

    public StudentProfile getCurrentStudentProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return studentProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
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
        StudentProfile student = getCurrentStudentProfile();
        return cvRepository.findByStudentId(student.getId());
    }

    public Page<Job> searchJobs(String keyword, String location, Pageable pageable) {
        return jobRepository.searchJobs(keyword, location, pageable);
    }

    public Job getJob(UUID jobId) {
        return jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
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
        aiService.calculateJobMatchAsync(application);

        // Update job applications count
        job.setApplicationsCount(job.getApplicationsCount() + 1);
        jobRepository.save(job);

        return application;
    }

    public Page<Application> getApplications(Pageable pageable) {
        StudentProfile student = getCurrentStudentProfile();
        return applicationRepository.findByStudentId(student.getId(), pageable);
    }
}

