package vn.careermate.learningservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.learningservice.model.Badge;
import vn.careermate.learningservice.model.Challenge;
import vn.careermate.learningservice.model.ChallengeParticipation;
import vn.careermate.learningservice.model.StudentBadge;
import vn.careermate.learningservice.repository.BadgeRepository;
import vn.careermate.learningservice.repository.ChallengeParticipationRepository;
import vn.careermate.learningservice.repository.ChallengeRepository;
import vn.careermate.learningservice.repository.StudentBadgeRepository;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.StudentProfileDTO;
import vn.careermate.common.dto.UserDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipationRepository participationRepository;
    private final StudentBadgeRepository studentBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final UserServiceClient userServiceClient;

    public List<Challenge> getAvailableChallenges(String category) {
        try {
            LocalDateTime now = LocalDateTime.now();
            List<Challenge> challenges;
            
            if (category != null && !category.isEmpty()) {
                challenges = challengeRepository.findByCategory(category);
                // Filter by date for category query too
                challenges = challenges.stream()
                    .filter(c -> (c.getStartDate() == null || !c.getStartDate().isAfter(now))
                              && (c.getEndDate() == null || !c.getEndDate().isBefore(now)))
                    .collect(java.util.stream.Collectors.toList());
            } else {
                // Get all challenges, then filter by active dates
                // Include challenges with null startDate or endDate (always active)
                challenges = challengeRepository.findAll().stream()
                    .filter(c -> (c.getStartDate() == null || !c.getStartDate().isAfter(now))
                              && (c.getEndDate() == null || !c.getEndDate().isBefore(now)))
                    .collect(java.util.stream.Collectors.toList());
            }
            
            log.debug("Found {} available challenges (category: {})", challenges.size(), category);
            return challenges;
        } catch (Exception e) {
            log.error("Error getting available challenges", e);
            throw new RuntimeException("Error getting available challenges: " + e.getMessage(), e);
        }
    }

    public Challenge getChallengeById(UUID challengeId) {
        try {
            Challenge challenge = challengeRepository.findById(challengeId)
                    .orElseThrow(() -> new RuntimeException("Challenge not found"));
            // Ensure badge is loaded if exists
            if (challenge.getBadge() != null) {
                // Badge is already loaded with EAGER fetch, but ensure it's accessible
                log.debug("Loaded challenge {} with badge {}", challengeId, challenge.getBadge().getId());
            } else {
                log.debug("Loaded challenge {} without badge", challengeId);
            }
            return challenge;
        } catch (java.util.NoSuchElementException e) {
            log.warn("Challenge not found: {}", challengeId);
            throw new RuntimeException("Challenge not found");
        } catch (Exception e) {
            log.error("Error getting challenge by id: {}", challengeId, e);
            throw new RuntimeException("Error getting challenge: " + e.getMessage(), e);
        }
    }

    @Transactional
    public ChallengeParticipation joinChallenge(UUID challengeId) {
        Challenge challenge = getChallengeById(challengeId);
        UUID studentId = getCurrentStudentId();
        
        // Verify student exists via Feign Client
        try {
            StudentProfileDTO student = userServiceClient.getStudentProfileById(studentId);
            if (student == null) {
                throw new RuntimeException("Student not found");
            }
        } catch (Exception e) {
            log.error("Error fetching student profile: {}", e.getMessage());
            throw new RuntimeException("Student not found");
        }

        // Check if already joined
        participationRepository.findByStudentId(studentId).stream()
                .filter(p -> p.getChallenge().getId().equals(challengeId))
                .findFirst()
                .ifPresent(p -> {
                    throw new RuntimeException("Already joined this challenge");
                });

        ChallengeParticipation participation = ChallengeParticipation.builder()
                .studentId(studentId) // Use UUID instead of entity
                .challenge(challenge)
                .status(ChallengeParticipation.ParticipationStatus.IN_PROGRESS)
                .build();

        return participationRepository.save(participation);
    }

    @Transactional
    public ChallengeParticipation submitChallenge(UUID challengeId, String answer, String attachmentUrl) {
        UUID studentId = getCurrentStudentId();
        
        // Get challenge to access passing score and expected keywords
        Challenge challenge = getChallengeById(challengeId);
        
        // Find or create participation
        ChallengeParticipation participation = participationRepository.findByStudentId(studentId).stream()
                .filter(p -> p.getChallenge().getId().equals(challengeId))
                .findFirst()
                .orElse(null);
        
        if (participation == null) {
            // Auto-join if not already joined
            participation = joinChallenge(challengeId);
        }
        
        // Update submission
        participation.setAnswer(answer);
        participation.setAttachmentUrl(attachmentUrl);
        participation.setSubmittedAt(LocalDateTime.now());
        
        // Auto-grade the submission
        Integer score = autoGradeSubmission(answer, challenge);
        participation.setScore(score);
        
        // Get passing score (default 70 if not set)
        Integer passingScore = challenge.getPassingScore() != null ? challenge.getPassingScore() : 70;
        
        // If score meets passing requirement, automatically complete and award badge
        if (score >= passingScore) {
            participation.setStatus(ChallengeParticipation.ParticipationStatus.COMPLETED);
            participation.setCompletedAt(LocalDateTime.now());
            
            // Award badge if challenge has one
            if (challenge.getBadgeId() != null) {
                try {
                    awardBadge(studentId, challenge.getBadgeId());
                    log.info("Awarded badge {} to student {} for completing challenge {}", 
                            challenge.getBadgeId(), studentId, challengeId);
                } catch (Exception e) {
                    log.error("Error awarding badge: {}", e.getMessage(), e);
                    // Continue even if badge award fails
                }
            }
        } else {
            participation.setStatus(ChallengeParticipation.ParticipationStatus.FAILED);
        }
        
        participation = participationRepository.save(participation);
        
        // Force reload challenge with badge to ensure everything is loaded
        try {
            // Reload challenge to ensure it's in persistence context
            Challenge reloadedChallenge = challengeRepository.findById(challengeId).orElse(null);
            if (reloadedChallenge != null) {
                // Load all challenge fields
                reloadedChallenge.getId();
                reloadedChallenge.getTitle();
                reloadedChallenge.getDescription();
                reloadedChallenge.getCategory();
                reloadedChallenge.getDifficulty();
                
                // Load badge if exists
                if (reloadedChallenge.getBadge() != null) {
                    reloadedChallenge.getBadge().getId();
                    reloadedChallenge.getBadge().getName();
                    reloadedChallenge.getBadge().getDescription();
                    reloadedChallenge.getBadge().getIconUrl();
                    reloadedChallenge.getBadge().getCategory();
                    reloadedChallenge.getBadge().getRarity();
                }
                
                // Set the reloaded challenge to participation
                participation.setChallenge(reloadedChallenge);
                log.info("Challenge and badge loaded for participation response. Badge: {}", 
                        reloadedChallenge.getBadge() != null ? reloadedChallenge.getBadge().getName() : "none");
            }
        } catch (Exception e) {
            log.error("Error loading challenge/badge for participation response: {}", e.getMessage(), e);
        }
        
        return participation;
    }
    
    /**
     * Auto-grade submission based on expected keywords
     * Simple keyword matching algorithm - can be enhanced with AI later
     */
    private Integer autoGradeSubmission(String answer, Challenge challenge) {
        if (answer == null || answer.trim().isEmpty()) {
            return 0;
        }
        
        String answerLower = answer.toLowerCase().trim();
        String expectedKeywords = challenge.getExpectedKeywords();
        
        // If no expected keywords, give a default score based on answer length
        if (expectedKeywords == null || expectedKeywords.trim().isEmpty()) {
            // Simple scoring: More lenient scoring for testing
            // Base score of 60, then add points based on length
            int length = answer.trim().length();
            if (length < 20) return 60; // Very short answers still get 60
            if (length < 50) return 70; // Short answers get 70 (passing)
            if (length < 100) return 75;
            if (length < 200) return 80;
            if (length < 500) return 85;
            return 90; // Long answers get high score
        }
        
        // Keyword-based scoring
        String[] keywords = expectedKeywords.toLowerCase().split(",");
        int matchedKeywords = 0;
        
        for (String keyword : keywords) {
            keyword = keyword.trim();
            if (!keyword.isEmpty() && answerLower.contains(keyword)) {
                matchedKeywords++;
            }
        }
        
        // Calculate score: base 60 + (matched keywords / total keywords) * 40
        // More lenient - minimum 60 points
        int totalKeywords = keywords.length;
        if (totalKeywords == 0) {
            return 70; // Default score if no keywords (passing)
        }
        
        int score = 60 + (matchedKeywords * 40 / totalKeywords);
        return Math.min(100, score); // Cap at 100
    }

    @Transactional
    public ChallengeParticipation completeChallenge(UUID participationId) {
        ChallengeParticipation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        UUID studentId = getCurrentStudentId();
        
        // Verify this participation belongs to current student
        if (!participation.getStudentId().equals(studentId)) {
            throw new RuntimeException("This participation does not belong to current student");
        }

        participation.setStatus(ChallengeParticipation.ParticipationStatus.COMPLETED);
        participation.setCompletedAt(LocalDateTime.now());
        
        participation = participationRepository.save(participation);

        // Award badge if challenge has one
        Challenge challenge = participation.getChallenge();
        if (challenge.getBadgeId() != null) {
            awardBadge(studentId, challenge.getBadgeId());
        }

        return participation;
    }

    @Transactional
    public void awardBadge(UUID studentId, UUID badgeId) {
        // Check if student already has this badge
        if (studentBadgeRepository.existsByStudentIdAndBadgeId(studentId, badgeId)) {
            log.info("Student {} already has badge {}", studentId, badgeId);
            return;
        }

        // Verify student exists via Feign Client
        try {
            StudentProfileDTO student = userServiceClient.getStudentProfileById(studentId);
            if (student == null) {
                throw new RuntimeException("Student not found");
            }
        } catch (Exception e) {
            log.error("Error fetching student profile: {}", e.getMessage());
            throw new RuntimeException("Student not found");
        }

        // Get badge from repository
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new RuntimeException("Badge not found"));

        StudentBadge studentBadge = StudentBadge.builder()
                .studentId(studentId) // Use UUID instead of entity
                .badge(badge)
                .build();

        studentBadgeRepository.save(studentBadge);
        log.info("Awarded badge {} to student {}", badge.getName(), studentId);
    }

    public List<ChallengeParticipation> getMyParticipations() {
        UUID studentId = getCurrentStudentId();
        List<ChallengeParticipation> participations = participationRepository.findByStudentId(studentId);
        
        // Filter out orphan participations (where challenge was deleted) and eagerly load remaining ones
        List<ChallengeParticipation> validParticipations = new java.util.ArrayList<>();
        
        for (ChallengeParticipation participation : participations) {
            try {
                // Verify student exists via Feign Client (optional check)
                UUID studentId = participation.getStudentId();
                try {
                    StudentProfileDTO student = userServiceClient.getStudentProfileById(studentId);
                    if (student == null) {
                        log.warn("Skipping participation {} - student {} not found", participation.getId(), studentId);
                        continue;
                    }
                } catch (Exception e) {
                    log.warn("Skipping participation {} - error fetching student: {}", participation.getId(), e.getMessage());
                    continue;
                }
                
                // Try to load challenge - if it fails, the challenge was deleted
                try {
                    Challenge challenge = participation.getChallenge();
                    if (challenge != null) {
                        // Verify challenge still exists in database
                        UUID challengeId = challenge.getId();
                        if (challengeRepository.existsById(challengeId)) {
                            // Load all challenge fields
                            challenge.getTitle();
                            challenge.getDescription();
                            challenge.getCategory();
                            challenge.getDifficulty();
                            // Badge is now UUID, no need to load entity
                            validParticipations.add(participation);
                        } else {
                            // Challenge was deleted, skip this participation
                            log.warn("Skipping participation {} - challenge {} no longer exists", 
                                    participation.getId(), challengeId);
                        }
                    } else {
                        log.warn("Skipping participation {} - challenge is null", participation.getId());
                    }
                } catch (org.hibernate.LazyInitializationException e) {
                    // Challenge was deleted, skip this participation
                    log.warn("Skipping participation {} - challenge was deleted (lazy init failed)", 
                            participation.getId());
                } catch (Exception e) {
                    log.warn("Error loading challenge for participation {}: {}", 
                            participation.getId(), e.getMessage());
                    // Skip this participation if we can't load it
                }
            } catch (Exception e) {
                log.warn("Error processing participation {}: {}", participation.getId(), e.getMessage());
                // Skip this participation
            }
        }
        
        return validParticipations;
    }

    public List<Badge> getMyBadges() {
        UUID studentId = getCurrentStudentId();
        List<StudentBadge> studentBadges = studentBadgeRepository.findByStudentId(studentId);
        return studentBadges.stream()
                .map(StudentBadge::getBadge)
                .collect(Collectors.toList());
    }

    private UUID getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        try {
            UserDTO user = userServiceClient.getUserByEmail(email);
            if (user == null) {
                throw new RuntimeException("User not found");
            }
            
            StudentProfileDTO studentProfile = userServiceClient.getStudentProfileByUserId(user.getId());
            if (studentProfile == null) {
                throw new RuntimeException("Student profile not found");
            }
            
            return studentProfile.getId();
        } catch (Exception e) {
            log.error("Error getting current student ID: {}", e.getMessage());
            throw new RuntimeException("Student profile not found");
        }
    }
}
