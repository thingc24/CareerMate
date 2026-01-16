package vn.careermate.jobservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.jobservice.model.Job;
import vn.careermate.jobservice.model.JobSkill;
import vn.careermate.jobservice.repository.JobRepository;
import vn.careermate.jobservice.repository.JobSkillRepository;
import vn.careermate.model.Company;
import vn.careermate.userservice.model.RecruiterProfile;
import vn.careermate.userservice.service.RecruiterProfileService;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final RecruiterProfileService recruiterProfileService;

    @Transactional
    public Job createJob(Job job, List<String> requiredSkills, List<String> optionalSkills) {
        RecruiterProfile recruiter = recruiterProfileService.getCurrentRecruiterProfile();
        
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

    @Transactional(readOnly = true)
    public Page<Job> getMyJobs(Pageable pageable) {
        RecruiterProfile recruiter = recruiterProfileService.getCurrentRecruiterProfile();
        return jobRepository.findByRecruiterId(recruiter.getId(), pageable);
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
