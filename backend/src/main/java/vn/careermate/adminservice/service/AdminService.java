package vn.careermate.adminservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.adminservice.dto.AdminAnalytics;
import vn.careermate.adminservice.dto.AdminDashboardStats;
import vn.careermate.adminservice.model.AuditLog;
import vn.careermate.adminservice.repository.AuditLogRepository;
import vn.careermate.jobservice.model.Application;
import vn.careermate.jobservice.model.Job;
import vn.careermate.jobservice.model.JobSkill;
import vn.careermate.jobservice.model.SavedJob;
import vn.careermate.contentservice.model.Article;
import vn.careermate.contentservice.model.ArticleComment;
import vn.careermate.contentservice.model.ArticleReaction;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.model.RecruiterProfile;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.jobservice.repository.ApplicationRepository;
import vn.careermate.jobservice.repository.JobRepository;
import vn.careermate.jobservice.repository.JobSkillRepository;
import vn.careermate.jobservice.repository.SavedJobRepository;
import vn.careermate.contentservice.repository.ArticleRepository;
import vn.careermate.contentservice.repository.ArticleCommentRepository;
import vn.careermate.contentservice.repository.ArticleReactionRepository;
import vn.careermate.contentservice.repository.CompanyRepository;
import vn.careermate.userservice.repository.UserRepository;
import vn.careermate.userservice.repository.RecruiterProfileRepository;
import vn.careermate.userservice.repository.StudentProfileRepository;
import vn.careermate.notificationservice.service.NotificationService;

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
    private final ArticleCommentRepository articleCommentRepository;
    private final ArticleReactionRepository articleReactionRepository;
    private final JobSkillRepository jobSkillRepository;
    private final SavedJobRepository savedJobRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationService notificationService;

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
        
        // Send notification to recruiter
        try {
            if (job.getRecruiter() != null && job.getRecruiter().getUser() != null) {
                UUID recruiterUserId = job.getRecruiter().getUser().getId();
                notificationService.notifyJobApproved(recruiterUserId, jobId, job.getTitle());
            }
        } catch (Exception e) {
            // Log but don't fail the operation
            System.err.println("Error sending notification for job approval: " + e.getMessage());
        }
        
        return job;
    }

    @Transactional
    public Job rejectJob(UUID jobId, UUID adminId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        job.setStatus(Job.JobStatus.REJECTED);
        job.setApprovedBy(userRepository.findById(adminId).orElse(null));
        job.setApprovedAt(LocalDateTime.now());
        
        job = jobRepository.save(job);
        
        // Send notification to recruiter
        try {
            if (job.getRecruiter() != null && job.getRecruiter().getUser() != null) {
                UUID recruiterUserId = job.getRecruiter().getUser().getId();
                notificationService.notifyJobRejected(recruiterUserId, jobId, job.getTitle());
            }
        } catch (Exception e) {
            // Log but don't fail the operation
            System.err.println("Error sending notification for job rejection: " + e.getMessage());
        }
        
        return job;
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

    /**
     * Create audit log entry
     */
    private void createAuditLog(UUID adminId, String adminEmail, AuditLog.ActionType actionType,
                                AuditLog.EntityType entityType, UUID entityId, String entityName,
                                String description, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .adminId(adminId)
                    .adminEmail(adminEmail)
                    .actionType(actionType)
                    .entityType(entityType)
                    .entityId(entityId)
                    .entityName(entityName)
                    .description(description)
                    .ipAddress(ipAddress)
                    .createdAt(LocalDateTime.now())
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            // Log error but don't fail the operation
            System.err.println("Error creating audit log: " + e.getMessage());
        }
    }

    /**
     * Hide job
     */
    @Transactional
    public Job hideJob(UUID jobId, UUID adminId, String adminEmail, String reason, String ipAddress) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        String jobTitle = job.getTitle(); // Store before modifying
        
        try {
            job.setHidden(true);
            job.setHiddenReason(reason);
            job.setHiddenAt(LocalDateTime.now());
            job = jobRepository.save(job);
            jobRepository.flush(); // Force flush to database
            
            // Reload job to ensure all fields are properly loaded
            job = jobRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found after save"));
        } catch (Exception e) {
            System.err.println("Error setting hidden fields on job: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to hide job. Please ensure database migration has been run. Error: " + e.getMessage(), e);
        }

        // Send notification to recruiter
        try {
            RecruiterProfile recruiter = job.getRecruiter();
            if (recruiter != null) {
                UUID recruiterId = recruiter.getId();
                // First try to get user ID from the recruiter if already loaded
                UUID recruiterUserId = null;
                try {
                    if (recruiter.getUser() != null) {
                        recruiterUserId = recruiter.getUser().getId();
                    }
                } catch (Exception e) {
                    // Lazy loading failed, need to query separately
                }
                
                // If user not loaded, query recruiter profile with user
                if (recruiterUserId == null) {
                    Optional<RecruiterProfile> loadedRecruiter = recruiterProfileRepository.findById(recruiterId);
                    if (loadedRecruiter.isPresent()) {
                        try {
                            RecruiterProfile rp = loadedRecruiter.get();
                            if (rp.getUser() != null) {
                                recruiterUserId = rp.getUser().getId();
                            } else {
                                // Try to find by recruiter ID and get user
                                Optional<RecruiterProfile> withUser = recruiterProfileRepository.findByIdWithCompany(recruiterId);
                                if (withUser.isPresent() && withUser.get().getUser() != null) {
                                    recruiterUserId = withUser.get().getUser().getId();
                                }
                            }
                        } catch (Exception e) {
                            System.err.println("Error loading user from recruiter: " + e.getMessage());
                        }
                    }
                }
                
                // Send notification if we have user ID
                if (recruiterUserId != null) {
                    notificationService.notifyJobHidden(recruiterUserId, jobId, job.getTitle(), reason);
                }
            }
        } catch (Exception e) {
            System.err.println("Error sending notification for job hide: " + e.getMessage());
            e.printStackTrace();
        }

        // Create audit log
        try {
            createAuditLog(adminId, adminEmail, AuditLog.ActionType.HIDE,
                    AuditLog.EntityType.JOB, jobId, jobTitle,
                    "Admin hid job: " + jobTitle + ". Reason: " + reason, ipAddress);
        } catch (Exception e) {
            System.err.println("Error creating audit log: " + e.getMessage());
            e.printStackTrace();
        }

        // Ensure company is properly loaded before detaching
        if (job.getCompany() != null) {
            job.getCompany().getId();
            job.getCompany().getName();
        }
        
        // Detach lazy-loaded relations to avoid serialization issues
        job.setRecruiter(null);
        
        return job;
    }

    /**
     * Unhide job
     */
    @Transactional
    public Job unhideJob(UUID jobId, UUID adminId, String adminEmail, String ipAddress) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        job.setHidden(false);
        job.setHiddenReason(null);
        job.setHiddenAt(null);
        job = jobRepository.save(job);
        jobRepository.flush(); // Force flush to database
        
        // Reload job to ensure all fields are properly loaded
        job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found after save"));

        // Send notification to recruiter
        try {
            RecruiterProfile recruiter = job.getRecruiter();
            if (recruiter != null) {
                UUID recruiterId = recruiter.getId();
                UUID recruiterUserId = null;
                
                try {
                    if (recruiter.getUser() != null) {
                        recruiterUserId = recruiter.getUser().getId();
                    }
                } catch (Exception e) {
                    // Lazy loading failed
                }
                
                if (recruiterUserId == null) {
                    Optional<RecruiterProfile> loadedRecruiter = recruiterProfileRepository.findById(recruiterId);
                    if (loadedRecruiter.isPresent() && loadedRecruiter.get().getUser() != null) {
                        recruiterUserId = loadedRecruiter.get().getUser().getId();
                    }
                }
                
                if (recruiterUserId != null) {
                    notificationService.notifyJobUnhidden(recruiterUserId, jobId, job.getTitle());
                }
            }
        } catch (Exception e) {
            System.err.println("Error sending notification for job unhide: " + e.getMessage());
            e.printStackTrace();
        }

        // Create audit log
        try {
            createAuditLog(adminId, adminEmail, AuditLog.ActionType.UNHIDE,
                    AuditLog.EntityType.JOB, jobId, job.getTitle(),
                    "Admin unhid job: " + job.getTitle(), ipAddress);
        } catch (Exception e) {
            System.err.println("Error creating audit log: " + e.getMessage());
            e.printStackTrace();
        }

        // Ensure company is properly loaded before detaching
        if (job.getCompany() != null) {
            job.getCompany().getId();
            job.getCompany().getName();
        }
        
        // Detach lazy-loaded relations to avoid serialization issues
        job.setRecruiter(null);
        
        return job;
    }

    /**
     * Delete job permanently (hard delete)
     */
    @Transactional
    public void deleteJob(UUID jobId, UUID adminId, String adminEmail, String reason, String ipAddress) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        String jobTitle = job.getTitle();

        // Send notification to recruiter before deleting
        try {
            RecruiterProfile recruiter = job.getRecruiter();
            if (recruiter != null) {
                UUID recruiterId = recruiter.getId();
                UUID recruiterUserId = null;
                
                // Try to get user ID
                try {
                    if (recruiter.getUser() != null) {
                        recruiterUserId = recruiter.getUser().getId();
                    }
                } catch (Exception e) {
                    // Lazy loading failed
                }
                
                // If user not loaded, query separately
                if (recruiterUserId == null) {
                    Optional<RecruiterProfile> loadedRecruiter = recruiterProfileRepository.findById(recruiterId);
                    if (loadedRecruiter.isPresent() && loadedRecruiter.get().getUser() != null) {
                        recruiterUserId = loadedRecruiter.get().getUser().getId();
                    }
                }
                
                if (recruiterUserId != null) {
                    notificationService.notifyJobDeleted(recruiterUserId, jobId, jobTitle, reason);
                }
            }
        } catch (Exception e) {
            System.err.println("Error sending notification for job deletion: " + e.getMessage());
            e.printStackTrace();
        }

        // Delete related data
        // 1. Delete applications
        List<Application> applications = applicationRepository.findByJobId(jobId);
        applicationRepository.deleteAll(applications);

        // 2. Delete saved jobs
        List<SavedJob> savedJobs = savedJobRepository.findByJobId(jobId);
        savedJobRepository.deleteAll(savedJobs);

        // 3. Delete job skills
        List<JobSkill> jobSkills = jobSkillRepository.findByJobId(jobId);
        jobSkillRepository.deleteAll(jobSkills);

        // 4. Delete job
        jobRepository.delete(job);
        jobRepository.flush();

        // Create audit log
        createAuditLog(adminId, adminEmail, AuditLog.ActionType.DELETE,
                AuditLog.EntityType.JOB, jobId, jobTitle,
                "Admin deleted job: " + jobTitle + ". Reason: " + reason, ipAddress);
    }

    /**
     * Hide article
     */
    @Transactional
    public Article hideArticle(UUID articleId, UUID adminId, String adminEmail, String reason, String ipAddress) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        try {
            article.setHidden(true);
            article.setHiddenReason(reason);
            article.setHiddenAt(LocalDateTime.now());
            article = articleRepository.save(article);
            articleRepository.flush(); // Force flush to database
        } catch (Exception e) {
            System.err.println("Error setting hidden fields on article: " + e.getMessage());
            e.printStackTrace();
            // If hidden column doesn't exist, try to update without it
            throw new RuntimeException("Failed to hide article. Please ensure database migration has been run. Error: " + e.getMessage(), e);
        }

        // Send notification to author
        try {
            if (article.getAuthor() != null) {
                UUID authorUserId = article.getAuthor().getId();
                notificationService.notifyArticleHidden(authorUserId, articleId, article.getTitle(), reason);
            }
        } catch (Exception e) {
            System.err.println("Error sending notification for article hide: " + e.getMessage());
            e.printStackTrace();
        }

        // Create audit log
        createAuditLog(adminId, adminEmail, AuditLog.ActionType.HIDE,
                AuditLog.EntityType.ARTICLE, articleId, article.getTitle(),
                "Admin hid article: " + article.getTitle() + ". Reason: " + reason, ipAddress);

        return article;
    }

    /**
     * Unhide article
     */
    @Transactional
    public Article unhideArticle(UUID articleId, UUID adminId, String adminEmail, String ipAddress) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        article.setHidden(false);
        article.setHiddenReason(null);
        article.setHiddenAt(null);
        article = articleRepository.save(article);
        articleRepository.flush(); // Force flush to database

        // Send notification to author
        try {
            if (article.getAuthor() != null) {
                UUID authorUserId = article.getAuthor().getId();
                notificationService.notifyArticleUnhidden(authorUserId, articleId, article.getTitle());
            }
        } catch (Exception e) {
            System.err.println("Error sending notification for article unhide: " + e.getMessage());
            e.printStackTrace();
        }

        // Create audit log
        createAuditLog(adminId, adminEmail, AuditLog.ActionType.UNHIDE,
                AuditLog.EntityType.ARTICLE, articleId, article.getTitle(),
                "Admin unhid article: " + article.getTitle(), ipAddress);

        return article;
    }

    /**
     * Delete article permanently (hard delete)
     */
    @Transactional
    public void deleteArticle(UUID articleId, UUID adminId, String adminEmail, String reason, String ipAddress) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        String articleTitle = article.getTitle();

        // Send notification to author before deleting
        try {
            if (article.getAuthor() != null) {
                UUID authorUserId = article.getAuthor().getId();
                notificationService.notifyArticleDeleted(authorUserId, articleId, articleTitle, reason);
            }
        } catch (Exception e) {
            System.err.println("Error sending notification for article deletion: " + e.getMessage());
        }

        // Delete related data
        // 1. Delete comments
        List<ArticleComment> comments = articleCommentRepository.findByArticleIdOrderByCreatedAtAsc(articleId);
        articleCommentRepository.deleteAll(comments);

        // 2. Delete reactions
        List<ArticleReaction> reactions = articleReactionRepository.findAll().stream()
                .filter(r -> r.getArticle() != null && r.getArticle().getId().equals(articleId))
                .collect(Collectors.toList());
        articleReactionRepository.deleteAll(reactions);

        // 3. Delete article
        articleRepository.delete(article);
        articleRepository.flush();

        // Create audit log
        createAuditLog(adminId, adminEmail, AuditLog.ActionType.DELETE,
                AuditLog.EntityType.ARTICLE, articleId, articleTitle,
                "Admin deleted article: " + articleTitle + ". Reason: " + reason, ipAddress);
    }

    /**
     * Delete user permanently (hard delete) - deletes all related data
     */
    @Transactional
    public void deleteUser(UUID userId, UUID adminId, String adminEmail, String ipAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String userName = user.getFullName() != null ? user.getFullName() : user.getEmail();
        User.UserRole userRole = user.getRole();

        // Delete related data based on user role
        if (userRole == User.UserRole.RECRUITER) {
            // Delete recruiter profile and related jobs
            Optional<RecruiterProfile> recruiterProfile = recruiterProfileRepository.findByUserId(userId);
            if (recruiterProfile.isPresent()) {
                UUID recruiterId = recruiterProfile.get().getId();
                
                // Delete jobs created by this recruiter
                List<Job> jobs = jobRepository.findByRecruiterId(recruiterId);
                for (Job job : jobs) {
                    // Delete applications for each job
                    List<Application> applications = applicationRepository.findByJobId(job.getId());
                    applicationRepository.deleteAll(applications);
                    
                    // Delete saved jobs
                    List<SavedJob> savedJobs = savedJobRepository.findByJobId(job.getId());
                    savedJobRepository.deleteAll(savedJobs);
                    
                    // Delete job skills
                    List<JobSkill> jobSkills = jobSkillRepository.findByJobId(job.getId());
                    jobSkillRepository.deleteAll(jobSkills);
                }
                jobRepository.deleteAll(jobs);
                
                // Delete recruiter profile
                recruiterProfileRepository.delete(recruiterProfile.get());
            }
        } else if (userRole == User.UserRole.STUDENT) {
            // Delete student profile and related data
            Optional<StudentProfile> studentProfile = studentProfileRepository.findByUserId(userId);
            if (studentProfile.isPresent()) {
                UUID studentId = studentProfile.get().getId();
                
                // Delete applications
                List<Application> applications = applicationRepository.findByStudentId(studentId);
                applicationRepository.deleteAll(applications);
                
                // Delete saved jobs
                List<SavedJob> savedJobs = savedJobRepository.findByStudentIdOrderBySavedAtDesc(studentId);
                savedJobRepository.deleteAll(savedJobs);
                
                // Delete student profile (CVs will be deleted by cascade)
                studentProfileRepository.delete(studentProfile.get());
            }
        }

        // Delete articles created by this user
        List<Article> articles = articleRepository.findByAuthorId(userId);
        for (Article article : articles) {
            // Delete comments
            List<ArticleComment> comments = articleCommentRepository.findByArticleIdOrderByCreatedAtAsc(article.getId());
            articleCommentRepository.deleteAll(comments);
            
            // Delete reactions
            List<ArticleReaction> reactions = articleReactionRepository.findAll().stream()
                    .filter(r -> r.getArticle() != null && r.getArticle().getId().equals(article.getId()))
                    .collect(Collectors.toList());
            articleReactionRepository.deleteAll(reactions);
        }
        articleRepository.deleteAll(articles);

        // Delete user (this will cascade delete related data via foreign keys)
        userRepository.delete(user);
        userRepository.flush();

        // Create audit log
        createAuditLog(adminId, adminEmail, AuditLog.ActionType.DELETE,
                AuditLog.EntityType.USER, userId, userName,
                "Admin deleted user: " + userName + " (Role: " + userRole + ")", ipAddress);
    }

    /**
     * Get audit logs
     */
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    /**
     * Get audit logs by admin
     */
    public Page<AuditLog> getAuditLogsByAdmin(UUID adminId, Pageable pageable) {
        return auditLogRepository.findByAdminIdOrderByCreatedAtDesc(adminId, pageable);
    }

    /**
     * Get audit logs by entity
     */
    public Page<AuditLog> getAuditLogsByEntity(AuditLog.EntityType entityType, UUID entityId, Pageable pageable) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(entityType, entityId, pageable);
    }
}
