package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.model.*;
import vn.careermate.repository.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AIService aiService;

    public List<Quiz> getAvailableQuizzes(String category) {
        if (category != null && !category.isEmpty()) {
            return quizRepository.findByCategoryAndIsActiveTrue(category);
        }
        return quizRepository.findByIsActiveTrue();
    }

    public Quiz getQuizById(UUID quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz not found"));
    }

    @Transactional
    public QuizAttempt startQuiz(UUID quizId, UUID studentId) {
        Quiz quiz = getQuizById(quizId);
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .student(student)
                .totalQuestions(quiz.getTotalQuestions())
                .status(QuizAttempt.AttemptStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .build();

        return quizAttemptRepository.save(attempt);
    }

    @Transactional
    public QuizAttempt submitQuiz(UUID attemptId, Map<UUID, String> answers) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

        int correctAnswers = 0;
        int totalScore = 0;

        // Evaluate answers
        for (Map.Entry<UUID, String> entry : answers.entrySet()) {
            UUID questionId = entry.getKey();
            String answer = entry.getValue();

            // Find question and check answer
            QuizQuestion question = attempt.getQuiz().getQuestions().stream()
                    .filter(q -> q.getId().equals(questionId))
                    .findFirst()
                    .orElse(null);

            if (question != null) {
                boolean isCorrect = question.getCorrectAnswer() != null &&
                        question.getCorrectAnswer().equalsIgnoreCase(answer.trim());

                QuizAnswer quizAnswer = QuizAnswer.builder()
                        .attempt(attempt)
                        .question(question)
                        .answer(answer)
                        .isCorrect(isCorrect)
                        .pointsEarned(isCorrect ? question.getPoints() : 0)
                        .build();

                if (isCorrect) {
                    correctAnswers++;
                    totalScore += question.getPoints();
                }
            }
        }

        attempt.setCorrectAnswers(correctAnswers);
        attempt.setScore(totalScore);
        attempt.setStatus(QuizAttempt.AttemptStatus.COMPLETED);
        attempt.setCompletedAt(LocalDateTime.now());

        return quizAttemptRepository.save(attempt);
    }

    public List<QuizAttempt> getStudentAttempts(UUID studentId) {
        return quizAttemptRepository.findByStudentId(studentId);
    }
}

