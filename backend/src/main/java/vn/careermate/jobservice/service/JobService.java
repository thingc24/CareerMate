package vn.careermate.jobservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.jobservice.model.Job;
import vn.careermate.jobservice.model.JobSkill;
import vn.careermate.jobservice.repository.JobRepository;
import vn.careermate.jobservice.repository.JobSkillRepository;
import vn.careermate.contentservice.model.Company;
import vn.careermate.userservice.model.RecruiterProfile;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.UserRepository;
import vn.careermate.userservice.service.RecruiterProfileService;
import vn.careermate.notificationservice.service.NotificationService;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final RecruiterProfileService recruiterProfileService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Transactional
    public Job createJob(Job job, List<String> requiredSkills, List<String> optionalSkills) {
        log.info("Starting job creation process...");
        
        RecruiterProfile recruiter = recruiterProfileService.getCurrentRecruiterProfile();
        log.info("Found recruiter profile: id={}", recruiter.getId());
        
        // Get company using the service method which properly loads it
        Company recruiterCompany = recruiterProfileService.getMyCompany();
        
        // Validate company exists
        if (recruiterCompany == null) {
            log.error("Recruiter {} does not have a company. Cannot create job.", recruiter.getId());
            throw new RuntimeException("Recruiter must have a company to post jobs. Please create a company profile first.");
        }
        
        // Ensure company is fully loaded and has valid ID
        UUID companyId = recruiterCompany.getId();
        String companyName = recruiterCompany.getName();
        if (companyId == null) {
            log.error("Company has null ID for recruiter {}", recruiter.getId());
            throw new RuntimeException("Company information is invalid. Please update your company profile.");
        }
        
        log.info("Creating job with company: id={}, name={}", companyId, companyName);
        
        // Set recruiter and company - ALWAYS set company to ensure it's not null
        job.setRecruiter(recruiter);
        job.setCompany(recruiterCompany); // Always set, don't check if null
        
        // Validate required fields
        if (job.getTitle() == null || job.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Job title is required");
        }
        if (job.getDescription() == null || job.getDescription().trim().isEmpty()) {
            throw new RuntimeException("Job description is required");
        }
        if (job.getLocation() == null || job.getLocation().trim().isEmpty()) {
            throw new RuntimeException("Job location is required");
        }
        
        // Validate salary values (max 999,999,999,999.99 with precision 12,2)
        // But we increased to precision 18,2, so max is 9,999,999,999,999,999.99
        // However, for practical purposes, limit to 999,999,999,999.99 (999 tỷ)
        java.math.BigDecimal maxSalaryValue = new java.math.BigDecimal("999999999999.99");
        if (job.getMinSalary() != null && job.getMinSalary().compareTo(maxSalaryValue) > 0) {
            throw new RuntimeException("Mức lương tối thiểu quá lớn. Vui lòng nhập giá trị nhỏ hơn 999,999 triệu VND.");
        }
        if (job.getMaxSalary() != null && job.getMaxSalary().compareTo(maxSalaryValue) > 0) {
            throw new RuntimeException("Mức lương tối đa quá lớn. Vui lòng nhập giá trị nhỏ hơn 999,999 triệu VND.");
        }
        
        // Ensure status is set
        if (job.getStatus() == null) {
            job.setStatus(Job.JobStatus.PENDING); // Needs admin approval
        }
        
        log.info("Saving job: title={}, companyId={}, recruiterId={}", job.getTitle(), companyId, recruiter.getId());
        
        try {
            job = jobRepository.save(job);
            log.info("Job saved successfully: id={}", job.getId());
        } catch (Exception e) {
            log.error("Error saving job to database: {}", e.getMessage(), e);
            throw new RuntimeException("Error saving job: " + e.getMessage(), e);
        }

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

        // Nếu job có status PENDING, gửi thông báo cho tất cả ADMIN
        if (job.getStatus() == Job.JobStatus.PENDING) {
            try {
                String recruiterName = recruiter.getUser() != null ? recruiter.getUser().getFullName() : "Nhà tuyển dụng";
                notificationService.notifyAdminsAboutPendingJob(
                    job.getId(), 
                    job.getTitle(), 
                    recruiterName
                );
            } catch (Exception e) {
                // Log nhưng không fail việc tạo job
                log.warn("Error sending pending job notifications to admins: {}", e.getMessage());
            }
        }

        return job;
    }

    @Transactional(readOnly = true)
    public Page<Job> getMyJobs(Pageable pageable) {
        try {
            RecruiterProfile recruiter = recruiterProfileService.getCurrentRecruiterProfile();
            Page<Job> jobs = jobRepository.findByRecruiterId(recruiter.getId(), pageable);
            
            // Force load company for each job to avoid lazy loading issues
            if (jobs != null && jobs.getContent() != null) {
                jobs.getContent().forEach(job -> {
                    if (job.getCompany() != null) {
                        job.getCompany().getId(); // Force load
                        job.getCompany().getName(); // Force load
                    }
                    // Set recruiter to null to avoid circular reference
                    job.setRecruiter(null);
                });
            }
            
            return jobs;
        } catch (Exception e) {
            log.error("Error getting my jobs: {}", e.getMessage(), e);
            throw new RuntimeException("Error getting my jobs: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public Page<Job> searchJobs(String keyword, String location, Pageable pageable) {
        try {
            // Normalize null/empty strings
            String normalizedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
            String normalizedLocation = (location != null && !location.trim().isEmpty()) ? location.trim() : null;
            
            Page<Job> jobs = jobRepository.searchJobs(normalizedKeyword, normalizedLocation, pageable);
            
            // Force load company for each job to avoid lazy loading issues
            if (jobs != null && jobs.getContent() != null) {
                jobs.getContent().forEach(job -> {
                    if (job.getCompany() != null) {
                        job.getCompany().getId(); // Force load
                        job.getCompany().getName(); // Force load
                    }
                });
            }
            
            return jobs != null ? jobs : Page.empty(pageable);
        } catch (RuntimeException e) {
            log.error("Runtime error searching jobs: keyword={}, location={}, error={}", keyword, location, e.getMessage());
            return Page.empty(pageable);
        } catch (Exception e) {
            log.error("Unexpected error searching jobs: keyword={}, location={}", keyword, location, e);
            return Page.empty(pageable);
        }
    }

    @Transactional(readOnly = true)
    public Job getJob(UUID jobId) {
        try {
            Job job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));
            
            // Check if job is hidden - only allow admin or job owner to see hidden jobs
            if (job.getHidden() != null && job.getHidden()) {
                try {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if (auth != null && auth.getAuthorities() != null) {
                        boolean isAdmin = auth.getAuthorities().stream()
                                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                        if (isAdmin) {
                            // Admin can see hidden jobs
                        } else if (job.getRecruiter() != null && job.getRecruiter().getUser() != null) {
                            // Check if current user is the job owner
                            String email = auth.getName();
                            User currentUser = userRepository.findByEmail(email).orElse(null);
                            if (currentUser != null && job.getRecruiter().getUser().getId().equals(currentUser.getId())) {
                                // Job owner can see their hidden job
                            } else {
                                throw new RuntimeException("Job not found or has been hidden");
                            }
                        } else {
                            throw new RuntimeException("Job not found or has been hidden");
                        }
                    } else {
                        throw new RuntimeException("Job not found or has been hidden");
                    }
                } catch (Exception e) {
                    if (e instanceof RuntimeException) {
                        throw e;
                    }
                    throw new RuntimeException("Job not found or has been hidden");
                }
            }
            
            // Detach lazy-loaded relations
            // KHÔNG set null cho collections có cascade="all-delete-orphan" (skills, applications)
            // @JsonIgnore sẽ đảm bảo chúng không được serialize
            if (job != null) {
                job.setRecruiter(null);
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
}
