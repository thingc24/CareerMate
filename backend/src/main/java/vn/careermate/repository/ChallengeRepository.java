package vn.careermate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.model.Challenge;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, UUID> {
    List<Challenge> findByCategory(String category);
    List<Challenge> findByStartDateBeforeAndEndDateAfter(LocalDateTime now1, LocalDateTime now2);
}

