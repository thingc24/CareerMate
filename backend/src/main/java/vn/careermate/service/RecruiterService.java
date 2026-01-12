package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.model.*;
import vn.careermate.repository.*;

import org.springframework.web.multipart.MultipartFile;
import vn.careermate.service.FileStorageService;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecruiterService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final CompanyRepository companyRepository;
    private final ApplicationRepository applicationRepository;
    private final JobSkillRepository jobSkillRepository;
    private final FileStorageService fileStorageService;

    public RecruiterProfile getCurrentRecruiterProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return recruiterProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    // Auto-create profile if it doesn't exist
                    RecruiterProfile profile = RecruiterProfile.builder()
                            .user(user)
                            .position("Nhà tuyển dụng")
                            .build();
                    return recruiterProfileRepository.save(profile);
                });
    }

    public RecruiterProfile getRecruiterByUserId(UUID userId) {
        return recruiterProfileRepository.findByUserId(userId).orElse(null);
    }

    @Transactional
    public Job createJob(Job job, List<String> requiredSkills, List<String> optionalSkills) {
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        
        // Force load company if it exists
        Company recruiterCompany = recruiter.getCompany();
        if (recruiterCompany != null) {
            // Force load by accessing ID to trigger fetch
            recruiterCompany.getId();
            recruiterCompany.getName();
        }
        
        // Set recruiter and company
        job.setRecruiter(recruiter);
        if (job.getCompany() == null) {
            if (recruiterCompany != null) {
                job.setCompany(recruiterCompany);
            } else {
                throw new RuntimeException("Recruiter must have a company to post jobs. Please create a company profile first.");
            }
        }
        
        // Ensure status is set
        if (job.getStatus() == null) {
            job.setStatus(Job.JobStatus.PENDING); // Needs admin approval
        }
        
        job = jobRepository.save(job);

        // Add required skills
        if (requiredSkills != null) {
            for (String skill : requiredSkills) {
                JobSkill jobSkill = JobSkill.builder()
                        .job(job)
                        .skillName(skill)
                        .isRequired(true)
                        .build();
                jobSkillRepository.save(jobSkill);
            }
        }

        // Add optional skills
        if (optionalSkills != null) {
            for (String skill : optionalSkills) {
                JobSkill jobSkill = JobSkill.builder()
                        .job(job)
                        .skillName(skill)
                        .isRequired(false)
                        .build();
                jobSkillRepository.save(jobSkill);
            }
        }

        return job;
    }

    public Page<Job> getMyJobs(Pageable pageable) {
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        return jobRepository.findByRecruiterId(recruiter.getId(), pageable);
    }

    public Page<Application> getJobApplicants(UUID jobId, Pageable pageable) {
        return applicationRepository.findByJobId(jobId, pageable);
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

        // Create history record (if repository exists)
        // Note: ApplicationHistoryRepository may not be available yet
        // ApplicationHistory history = ApplicationHistory.builder()
        //         .application(application)
        //         .status(status.name())
        //         .notes(notes)
        //         .changedBy(getCurrentUser())
        //         .build();
        // applicationHistoryRepository.save(history);

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

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public RecruiterProfile getMyProfile() {
        return getCurrentRecruiterProfile();
    }

    @Transactional
    public RecruiterProfile updateProfile(String position, String department, String phone, String bio) {
        RecruiterProfile profile = getCurrentRecruiterProfile();
        if (position != null) profile.setPosition(position);
        if (department != null) profile.setDepartment(department);
        if (phone != null) profile.setPhone(phone);
        if (bio != null) profile.setBio(bio);
        return recruiterProfileRepository.save(profile);
    }

    @Transactional
    public Company createOrUpdateCompany(Company company) {
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        
        // Force load company if it exists
        Company existingCompany = recruiter.getCompany();
        if (existingCompany != null) {
            // Force load by accessing ID
            existingCompany.getId();
        }
        
        if (existingCompany != null) {
            // Update existing company
            if (company.getName() != null) existingCompany.setName(company.getName());
            if (company.getWebsiteUrl() != null) existingCompany.setWebsiteUrl(company.getWebsiteUrl());
            if (company.getHeadquarters() != null) existingCompany.setHeadquarters(company.getHeadquarters());
            if (company.getDescription() != null) existingCompany.setDescription(company.getDescription());
            if (company.getCompanySize() != null) existingCompany.setCompanySize(company.getCompanySize());
            if (company.getIndustry() != null) existingCompany.setIndustry(company.getIndustry());
            if (company.getFoundedYear() != null) existingCompany.setFoundedYear(company.getFoundedYear());
            if (company.getLogoUrl() != null) existingCompany.setLogoUrl(company.getLogoUrl());
            company = companyRepository.save(existingCompany);
        } else {
            // Create new company
            company = companyRepository.save(company);
            // Link company to recruiter
            recruiter.setCompany(company);
            recruiterProfileRepository.save(recruiter);
            // Flush to ensure company_id is set
            recruiterProfileRepository.flush();
        }
        
        return company;
    }

    @Transactional(readOnly = true)
    public Company getMyCompany() {
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        Company company = recruiter.getCompany();
        if (company != null) {
            // Force load by accessing ID to trigger fetch
            company.getId();
            company.getName();
        }
        return company;
    }

    public Map<String, Object> getDashboardStats() {
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        UUID recruiterId = recruiter.getId();
        
        // Count active jobs
        long activeJobsCount = jobRepository.countByRecruiterIdAndStatus(recruiterId, Job.JobStatus.ACTIVE);
        
        // Count new applications (PENDING status)
        long newApplicationsCount = applicationRepository.countByJobRecruiterIdAndStatus(
            recruiterId, Application.ApplicationStatus.PENDING);
        
        // Count upcoming interviews (INTERVIEW status with scheduled time in future)
        long upcomingInterviewsCount = applicationRepository.countUpcomingInterviewsByRecruiter(
            recruiterId, LocalDateTime.now());
        
        // Count successful hires (OFFERED status)
        long successfulHiresCount = applicationRepository.countByJobRecruiterIdAndStatus(
            recruiterId, Application.ApplicationStatus.OFFERED);
        
        return Map.of(
            "activeJobs", activeJobsCount,
            "newApplications", newApplicationsCount,
            "upcomingInterviews", upcomingInterviewsCount,
            "successfulHires", successfulHiresCount
        );
    }

    @Transactional
    public String uploadCompanyLogo(MultipartFile file) throws IOException {
        // Validate file type
        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();
        if (fileName == null || (contentType != null && !contentType.startsWith("image/"))) {
            throw new RuntimeException("Invalid file type. Only image files are allowed.");
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size too large. Maximum size is 5MB.");
        }

        // Save file using FileStorageService
        String filePath = fileStorageService.storeFile(file, "company-logos");

        // Update company with logo URL
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        Company company = recruiter.getCompany();
        
        if (company == null) {
            throw new RuntimeException("Company not found. Please create company profile first.");
        }

        // Delete old logo if exists
        if (company.getLogoUrl() != null && !company.getLogoUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(company.getLogoUrl());
            } catch (Exception e) {
                // Log warning but continue
            }
        }
        
        company.setLogoUrl(filePath);
        companyRepository.save(company);

        return filePath;
    }
}

