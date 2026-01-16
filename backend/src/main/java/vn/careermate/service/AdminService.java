package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.dto.AdminAnalytics;
import vn.careermate.dto.AdminDashboardStats;
import vn.careermate.jobservice.model.Application;
import vn.careermate.jobservice.model.Job;
import vn.careermate.model.Article;
import vn.careermate.userservice.model.User;
import vn.careermate.jobservice.repository.ApplicationRepository;
import vn.careermate.jobservice.repository.JobRepository;
import vn.careermate.jobservice.repository.JobSkillRepository;
import vn.careermate.repository.ArticleRepository;
import vn.careermate.repository.CompanyRepository;
import vn.careermate.userservice.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final CompanyRepository companyRepository;
    private final ArticleRepository articleRepository;
    private final JobSkillRepository jobSkillRepository;

    public AdminDashboardStats getDashboardStats() {
        return AdminDashboardStats.builder()
                .totalUsers(userRepository.count())
                .totalStudents(userRepository.countByRole(User.UserRole.STUDENT))
                .totalRecruiters(userRepository.countByRole(User.UserRole.RECRUITER))
                .totalAdmins(userRepository.countByRole(User.UserRole.ADMIN))
                .totalJobs(jobRepository.count())
                .pendingJobs(jobRepository.countByStatus(Job.JobStatus.PENDING))
                .activeJobs(jobRepository.countByStatus(Job.JobStatus.ACTIVE))
                .totalApplications(applicationRepository.count())
                .totalCompanies(companyRepository.count())
                .totalArticles(articleRepository.count())
                .pendingArticles(articleRepository.countByStatus(Article.ArticleStatus.PENDING))
                .publishedArticles(articleRepository.countByStatus(Article.ArticleStatus.PUBLISHED))
                .build();
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public Page<User> getUsersByRole(User.UserRole role, Pageable pageable) {
        return userRepository.findByRole(role, pageable);
    }

    @Transactional
    public User updateUserStatus(UUID userId, User.UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        return userRepository.save(user);
    }

    @Transactional
    public Job approveJob(UUID jobId, UUID adminId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        job.setStatus(Job.JobStatus.ACTIVE);
        job.setApprovedBy(userRepository.findById(adminId).orElse(null));
        job.setApprovedAt(LocalDateTime.now());
        
        job = jobRepository.save(job);
        jobRepository.flush(); // Force flush to database immediately
        return job;
    }

    @Transactional
    public Job rejectJob(UUID jobId, UUID adminId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        job.setStatus(Job.JobStatus.REJECTED);
        job.setApprovedBy(userRepository.findById(adminId).orElse(null));
        job.setApprovedAt(LocalDateTime.now());
        
        return jobRepository.save(job);
    }

    public Page<Job> getPendingJobs(Pageable pageable) {
        return jobRepository.findByStatus(Job.JobStatus.PENDING, pageable);
    }

    public Page<Job> getAllJobs(Pageable pageable) {
        return jobRepository.findAll(pageable);
    }

    public Page<Job> getJobsByStatus(Job.JobStatus status, Pageable pageable) {
        return jobRepository.findByStatus(status, pageable);
    }

    public AdminAnalytics getAnalytics() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime last30Days = now.minusDays(30);
        LocalDateTime last7Days = now.minusDays(7);

        // User analytics
        long newUsersLast30Days = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(last30Days))
                .count();
        long newUsersLast7Days = userRepository.findAll().stream()
                .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(last7Days))
                .count();
        
        Map<String, Long> usersByRole = new HashMap<>();
        for (User.UserRole role : User.UserRole.values()) {
            usersByRole.put(role.name(), userRepository.countByRole(role));
        }

        // Job analytics
        List<Job> allJobs = jobRepository.findAll();
        long newJobsLast30Days = allJobs.stream()
                .filter(j -> j.getCreatedAt() != null && j.getCreatedAt().isAfter(last30Days))
                .count();
        long newJobsLast7Days = allJobs.stream()
                .filter(j -> j.getCreatedAt() != null && j.getCreatedAt().isAfter(last7Days))
                .count();
        
        Map<String, Long> jobsByStatus = new HashMap<>();
        for (Job.JobStatus status : Job.JobStatus.values()) {
            jobsByStatus.put(status.name(), jobRepository.countByStatus(status));
        }

        // Application analytics
        List<Application> allApplications = applicationRepository.findAll();
        long newApplicationsLast30Days = allApplications.stream()
                .filter(a -> a.getAppliedAt() != null && a.getAppliedAt().isAfter(last30Days))
                .count();
        long newApplicationsLast7Days = allApplications.stream()
                .filter(a -> a.getAppliedAt() != null && a.getAppliedAt().isAfter(last7Days))
                .count();

        // Top skills in demand
        List<AdminAnalytics.SkillDemand> topSkills = new ArrayList<>();
        Map<String, Long> skillJobCount = new HashMap<>();
        jobSkillRepository.findAll().forEach(js -> {
            skillJobCount.put(js.getSkillName(), 
                skillJobCount.getOrDefault(js.getSkillName(), 0L) + 1);
        });
        
        topSkills = skillJobCount.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(10)
                .map(e -> AdminAnalytics.SkillDemand.builder()
                        .skillName(e.getKey())
                        .jobCount(e.getValue())
                        .applicationCount(0L) // Simplified
                        .build())
                .collect(Collectors.toList());

        return AdminAnalytics.builder()
                .newUsersLast30Days(newUsersLast30Days)
                .newUsersLast7Days(newUsersLast7Days)
                .usersByRole(usersByRole)
                .newJobsLast30Days(newJobsLast30Days)
                .newJobsLast7Days(newJobsLast7Days)
                .jobsByStatus(jobsByStatus)
                .newApplicationsLast30Days(newApplicationsLast30Days)
                .newApplicationsLast7Days(newApplicationsLast7Days)
                .topSkillsInDemand(topSkills)
                .applicationTrafficLast30Days(new ArrayList<>()) // Simplified
                .build();
    }
}

