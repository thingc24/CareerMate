package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.model.Badge;
import vn.careermate.model.Challenge;
import vn.careermate.model.ChallengeParticipation;
import vn.careermate.model.StudentBadge;
import vn.careermate.model.StudentProfile;
import vn.careermate.repository.BadgeRepository;
import vn.careermate.repository.ChallengeParticipationRepository;
import vn.careermate.repository.ChallengeRepository;
import vn.careermate.repository.StudentBadgeRepository;
import vn.careermate.repository.StudentProfileRepository;
import vn.careermate.repository.UserRepository;

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
    private final StudentProfileRepository studentProfileRepository;
    private final StudentBadgeRepository studentBadgeRepository;
    private final BadgeRepository badgeRepository;
    private final UserRepository userRepository;

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
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if already joined
        participationRepository.findByStudentId(studentId).stream()
                .filter(p -> p.getChallenge().getId().equals(challengeId))
                .findFirst()
                .ifPresent(p -> {
                    throw new RuntimeException("Already joined this challenge");
                });

        ChallengeParticipation participation = ChallengeParticipation.builder()
                .student(student)
                .challenge(challenge)
                .status(ChallengeParticipation.ParticipationStatus.IN_PROGRESS)
                .build();

        return participationRepository.save(participation);
    }

    @Transactional
    public ChallengeParticipation completeChallenge(UUID participationId) {
        ChallengeParticipation participation = participationRepository.findById(participationId)
                .orElseThrow(() -> new RuntimeException("Participation not found"));

        UUID studentId = getCurrentStudentId();
        
        // Verify this participation belongs to current student
        if (!participation.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("This participation does not belong to current student");
        }

        participation.setStatus(ChallengeParticipation.ParticipationStatus.COMPLETED);
        participation.setCompletedAt(LocalDateTime.now());
        
        participation = participationRepository.save(participation);

        // Award badge if challenge has one
        Challenge challenge = participation.getChallenge();
        if (challenge.getBadge() != null) {
            awardBadge(studentId, challenge.getBadge().getId());
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

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Get badge from repository
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> new RuntimeException("Badge not found"));

        StudentBadge studentBadge = StudentBadge.builder()
                .student(student)
                .badge(badge)
                .build();

        studentBadgeRepository.save(studentBadge);
        log.info("Awarded badge {} to student {}", badge.getName(), studentId);
    }

    public List<ChallengeParticipation> getMyParticipations() {
        UUID studentId = getCurrentStudentId();
        return participationRepository.findByStudentId(studentId);
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
        UUID userId = userRepository.findByEmail(email)
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return studentProfileRepository.findByUserId(userId)
                .map(profile -> profile.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }
}

