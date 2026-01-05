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

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
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

    @Transactional
    public Job createJob(Job job, List<String> requiredSkills, List<String> optionalSkills) {
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        
        // Set recruiter and company
        job.setRecruiter(recruiter);
        if (job.getCompany() == null) {
            if (recruiter.getCompany() != null) {
                job.setCompany(recruiter.getCompany());
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

        Application.ApplicationStatus oldStatus = application.getStatus();
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
        
        Company existingCompany = recruiter.getCompany();
        
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
        }
        
        return company;
    }

    public Company getMyCompany() {
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        return recruiter.getCompany();
    }
}

