package vn.careermate.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
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
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    @PersistenceContext
    private EntityManager entityManager;

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final CVRepository cvRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final AIService aiService;
    private final FileStorageService fileStorageService;
    private final SavedJobRepository savedJobRepository;
    private final AIChatConversationRepository aiChatConversationRepository;
    private final AIChatMessageRepository aiChatMessageRepository;
    private final MockInterviewRepository mockInterviewRepository;
    private final MockInterviewQuestionRepository mockInterviewQuestionRepository;
    private final JobRecommendationRepository jobRecommendationRepository;

    @Transactional
    public StudentProfile getCurrentStudentProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        log.info("Getting current student profile. Authentication: {}, Name: {}", 
            auth != null ? "present" : "null",
            auth != null ? auth.getName() : "N/A");
        
        if (auth == null) {
            log.error("Authentication is null - user not authenticated");
            throw new RuntimeException("Authentication required. Please login first.");
        }
        
        if (auth.getName() == null) {
            log.error("Authentication name is null");
            throw new RuntimeException("Authentication name is null. Please login again.");
        }
        
        if ("anonymousUser".equals(auth.getName())) {
            log.error("User is anonymous - token may be missing or invalid");
            throw new RuntimeException("Authentication required. Please login first.");
        }
        
        try {
            String email = auth.getName();
            log.info("Looking up user with email: {}", email);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.error("User not found in database for email: {}", email);
                        return new RuntimeException("User not found: " + email + ". Please register first.");
                    });

            log.info("Found user: {} (ID: {})", user.getEmail(), user.getId());

            StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                    .orElse(null);

            // Tạo profile mới nếu chưa có
            if (profile == null) {
                log.info("Creating default profile for user: {} (ID: {})", email, user.getId());
                profile = createDefaultProfile(user);
                log.info("Default profile created with ID: {}", profile.getId());
            } else {
                log.info("Found existing profile with ID: {}", profile.getId());
            }

            // Reload từ database để đảm bảo có data mới nhất (tránh cache)
            UUID profileId = profile.getId();
            entityManager.flush(); // Ensure any pending changes are saved
            entityManager.clear(); // Clear persistence context
            StudentProfile freshProfile = studentProfileRepository.findById(profileId)
                    .orElseThrow(() -> new RuntimeException("Profile not found: " + profileId));
            
            log.info("Profile reloaded from database. ID: {}, University: {}, Major: {}, City: {}, Address: {}, Gender: {}", 
                freshProfile.getId(), freshProfile.getUniversity(), freshProfile.getMajor(), 
                freshProfile.getCity(), freshProfile.getAddress(), freshProfile.getGender());

            // Detach entity khỏi persistence context để tránh cascade operations
            entityManager.detach(freshProfile);
            
            log.info("Profile detached from persistence context. ID: {}", freshProfile.getId());
            return freshProfile;
        } catch (RuntimeException e) {
            log.error("RuntimeException getting student profile: {}", e.getMessage(), e);
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
        try {
            // Get current profile WITHOUT detaching - we need it to be managed
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                throw new RuntimeException("Authentication required. Please login first.");
            }
            
            String email = auth.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
            
            // Get existing profile - DO NOT detach, we need it managed
            StudentProfile existing = studentProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Profile not found for user: " + email));
            
            log.info("Updating profile ID: {}, current university: {}, new university: {}", 
                existing.getId(), existing.getUniversity(), profile.getUniversity());
            log.info("Profile update data - gender: {}, address: {}, city: {}, university: {}, major: {}", 
                profile.getGender(), profile.getAddress(), profile.getCity(), profile.getUniversity(), profile.getMajor());
            
            // Update all fields - allow null to clear fields
            // Use reflection or check if field was explicitly set in the profile object
            // For now, update all fields that are in the profile object
            existing.setDateOfBirth(profile.getDateOfBirth());
            existing.setGender(profile.getGender());
            existing.setAddress(profile.getAddress());
            existing.setCity(profile.getCity());
            existing.setCountry(profile.getCountry() != null ? profile.getCountry() : "Vietnam");
            existing.setUniversity(profile.getUniversity());
            existing.setMajor(profile.getMajor());
            existing.setGraduationYear(profile.getGraduationYear());
            existing.setGpa(profile.getGpa());
            existing.setBio(profile.getBio());
            existing.setLinkedinUrl(profile.getLinkedinUrl());
            existing.setGithubUrl(profile.getGithubUrl());
            existing.setPortfolioUrl(profile.getPortfolioUrl());
            existing.setAvatarUrl(profile.getAvatarUrl());
            existing.setCurrentStatus(profile.getCurrentStatus() != null ? profile.getCurrentStatus() : "STUDENT");
            
            log.info("After setting fields - gender: {}, address: {}, city: {}, university: {}, major: {}", 
                existing.getGender(), existing.getAddress(), existing.getCity(), existing.getUniversity(), existing.getMajor());
            
            // Save và flush để đảm bảo data được lưu vào database ngay lập tức
            log.info("Before save - existing profile: ID={}, University={}, Major={}, City={}, Address={}, Gender={}", 
                existing.getId(), existing.getUniversity(), existing.getMajor(), existing.getCity(), existing.getAddress(), existing.getGender());
            
            StudentProfile saved = studentProfileRepository.save(existing);
            entityManager.flush(); // Force write to database
            entityManager.clear(); // Clear persistence context để reload fresh data
            
            log.info("After save and flush - saved profile: ID={}, University={}, Major={}, City={}, Address={}, Gender={}", 
                saved.getId(), saved.getUniversity(), saved.getMajor(), saved.getCity(), saved.getAddress(), saved.getGender());
            
            // Reload từ database bằng cách query trực tiếp để đảm bảo có data mới nhất
            UUID profileId = saved.getId();
            StudentProfile freshData = studentProfileRepository.findById(profileId)
                    .orElseThrow(() -> new RuntimeException("Profile not found after save: " + profileId));
            
            log.info("After reload from DB - fresh profile: ID={}, University={}, Major={}, City={}, Address={}, Gender={}", 
                freshData.getId(), freshData.getUniversity(), freshData.getMajor(), freshData.getCity(), freshData.getAddress(), freshData.getGender());
            
            // Verify data was actually saved - log comparison
            log.info("Data verification - Existing University: {}, Fresh University: {}", 
                existing.getUniversity(), freshData.getUniversity());
            log.info("Data verification - Existing City: {}, Fresh City: {}", 
                existing.getCity(), freshData.getCity());
            log.info("Data verification - Existing Address: {}, Fresh Address: {}", 
                existing.getAddress(), freshData.getAddress());
            
            // Detach fresh data before returning
            entityManager.detach(freshData);
            
            return freshData;
        } catch (Exception e) {
            log.error("Error in updateProfile service", e);
            throw new RuntimeException("Failed to update profile: " + e.getMessage(), e);
        }
    }

    @Transactional
    public String uploadAvatar(MultipartFile file) throws IOException {
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
        String filePath = fileStorageService.storeFile(file, "avatars");

        // Update profile with avatar URL
        StudentProfile profile = getCurrentStudentProfile();
        // Delete old avatar if exists
        if (profile.getAvatarUrl() != null && !profile.getAvatarUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(profile.getAvatarUrl());
            } catch (Exception e) {
                log.warn("Could not delete old avatar: {}", e.getMessage());
            }
        }
        profile.setAvatarUrl(filePath);
        studentProfileRepository.save(profile);

        return filePath;
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

    @Transactional(readOnly = true)
    public List<CV> getCVs() {
        try {
            // Get current user from security context
            org.springframework.security.core.Authentication auth = 
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            
            if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                log.warn("No authentication found when getting CVs");
                return List.of();
            }
            
            // Find user by email
            User user = userRepository.findByEmail(auth.getName())
                .orElse(null);
            
            if (user == null) {
                log.warn("User not found: {}", auth.getName());
                return List.of();
            }
            
            // Find student profile
            StudentProfile student = studentProfileRepository.findByUserId(user.getId())
                .orElse(null);
            
            if (student == null || student.getId() == null) {
                log.warn("Student profile not found for user: {}", auth.getName());
                return List.of();
            }
            
            // Get CVs directly without calling getCurrentStudentProfile() to avoid transaction issues
            List<CV> cvs = cvRepository.findByStudentId(student.getId());
            
            // Detach lazy-loaded relations to prevent serialization issues
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

    public boolean isJobSaved(UUID jobId) {
        StudentProfile student = getCurrentStudentProfile();
        if (student == null || student.getId() == null) {
            return false;
        }
        return savedJobRepository.existsByStudentIdAndJobId(student.getId(), jobId);
    }

    // ========== AI CHAT CONVERSATIONS ==========
    public Page<AIChatConversation> getChatConversations(Pageable pageable) {
        StudentProfile student = getCurrentStudentProfile();
        if (student == null || student.getId() == null) {
            return Page.empty(pageable);
        }
        return aiChatConversationRepository.findByStudentIdOrderByCreatedAtDesc(student.getId(), pageable);
    }

    @Transactional
    public AIChatConversation createChatConversation(String role, String context) {
        StudentProfile student = getCurrentStudentProfile();
        AIChatConversation conversation = AIChatConversation.builder()
                .student(student)
                .role(role)
                .context(context)
                .build();
        return aiChatConversationRepository.save(conversation);
    }

    public List<AIChatMessage> getChatMessages(UUID conversationId) {
        return aiChatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    @Transactional
    public AIChatMessage saveChatMessage(UUID conversationId, AIChatMessage.SenderType senderType, String message, Integer tokensUsed) {
        AIChatConversation conversation = aiChatConversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));
        
        AIChatMessage chatMessage = AIChatMessage.builder()
                .conversation(conversation)
                .senderType(senderType)
                .message(message)
                .tokensUsed(tokensUsed)
                .build();
        
        return aiChatMessageRepository.save(chatMessage);
    }

    // ========== JOB RECOMMENDATIONS ==========
    public Page<JobRecommendation> getJobRecommendations(Pageable pageable) {
        StudentProfile student = getCurrentStudentProfile();
        if (student == null || student.getId() == null) {
            return Page.empty(pageable);
        }
        return jobRecommendationRepository.findByStudentIdOrderByMatchScoreDescCreatedAtDesc(student.getId(), pageable);
    }

    @Transactional
    public void markRecommendationAsViewed(UUID recommendationId) {
        JobRecommendation recommendation = jobRecommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new RuntimeException("Recommendation not found"));
        recommendation.setIsViewed(true);
        recommendation.setViewedAt(LocalDateTime.now());
        jobRecommendationRepository.save(recommendation);
    }

    @Transactional
    public void markRecommendationAsApplied(UUID recommendationId) {
        JobRecommendation recommendation = jobRecommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new RuntimeException("Recommendation not found"));
        recommendation.setIsApplied(true);
        jobRecommendationRepository.save(recommendation);
    }

    public List<JobRecommendation> getUnviewedRecommendations() {
        StudentProfile student = getCurrentStudentProfile();
        if (student == null || student.getId() == null) {
            return List.of();
        }
        return jobRecommendationRepository.findUnviewedByStudentId(student.getId());
    }
}

