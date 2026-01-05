package vn.careermate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.model.Quiz;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    List<Quiz> findByCategoryAndIsActiveTrue(String category);
    List<Quiz> findByTypeAndIsActiveTrue(Quiz.QuizType type);
    List<Quiz> findByIsActiveTrue();
}

