package vn.careermate.learningservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.learningservice.model.ChallengeParticipation;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChallengeParticipationRepository extends JpaRepository<ChallengeParticipation, UUID> {
    List<ChallengeParticipation> findByStudentId(UUID studentId);
    List<ChallengeParticipation> findByChallengeId(UUID challengeId);
}
