package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.model.Challenge;
import vn.careermate.model.ChallengeParticipation;
import vn.careermate.model.StudentProfile;
import vn.careermate.repository.ChallengeParticipationRepository;
import vn.careermate.repository.ChallengeRepository;
import vn.careermate.repository.StudentProfileRepository;
import vn.careermate.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipationRepository participationRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    public List<Challenge> getAvailableChallenges(String category) {
        if (category != null && !category.isEmpty()) {
            return challengeRepository.findByCategory(category);
        }
        LocalDateTime now = LocalDateTime.now();
        return challengeRepository.findByStartDateBeforeAndEndDateAfter(now, now);
    }

    public Challenge getChallengeById(UUID challengeId) {
        return challengeRepository.findById(challengeId)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
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

        participation.setStatus(ChallengeParticipation.ParticipationStatus.COMPLETED);
        participation.setCompletedAt(LocalDateTime.now());

        // Award badge if challenge has one
        if (participation.getChallenge().getBadge() != null) {
            // Award badge logic here
        }

        return participationRepository.save(participation);
    }

    public List<ChallengeParticipation> getMyParticipations() {
        UUID studentId = getCurrentStudentId();
        return participationRepository.findByStudentId(studentId);
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

