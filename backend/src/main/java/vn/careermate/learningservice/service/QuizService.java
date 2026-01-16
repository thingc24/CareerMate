package vn.careermate.learningservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.learningservice.model.*;
import vn.careermate.learningservice.repository.*;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.userservice.repository.StudentProfileRepository;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final StudentProfileRepository studentProfileRepository;

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
        try {
            QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                    .orElseThrow(() -> new RuntimeException("Quiz attempt not found"));

            // Load quiz with questions eagerly to avoid lazy loading issues
            Quiz quiz = quizRepository.findById(attempt.getQuiz().getId())
                    .orElseThrow(() -> new RuntimeException("Quiz not found"));
            
            // Load questions
            List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByOrderIndex(quiz.getId());
            quiz.setQuestions(questions);
            attempt.setQuiz(quiz);

            int correctAnswers = 0;
            int totalScore = 0;
            List<QuizAnswer> quizAnswers = new ArrayList<>();

            // Evaluate answers
            for (Map.Entry<UUID, String> entry : answers.entrySet()) {
                UUID questionId = entry.getKey();
                String answer = entry.getValue();

                // Find question
                QuizQuestion question = questions.stream()
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
                            .pointsEarned(isCorrect ? (question.getPoints() != null ? question.getPoints() : 1) : 0)
                            .build();

                    quizAnswers.add(quizAnswer);

                    if (isCorrect) {
                        correctAnswers++;
                        totalScore += (question.getPoints() != null ? question.getPoints() : 1);
                    }
                } else {
                    log.warn("Question {} not found in quiz {}", questionId, quiz.getId());
                }
            }

            // Save all answers first
            if (!quizAnswers.isEmpty()) {
                quizAnswerRepository.saveAll(quizAnswers);
                log.info("Saved {} quiz answers for attempt {}", quizAnswers.size(), attemptId);
            } else {
                log.warn("No quiz answers to save for attempt {}", attemptId);
            }

            // Update attempt
            attempt.setCorrectAnswers(correctAnswers);
            attempt.setScore(totalScore);
            attempt.setStatus(QuizAttempt.AttemptStatus.COMPLETED);
            attempt.setCompletedAt(LocalDateTime.now());
            attempt.setAnswers(quizAnswers);

            QuizAttempt savedAttempt = quizAttemptRepository.save(attempt);
            log.info("Quiz attempt {} submitted successfully. Score: {}/{}", attemptId, correctAnswers, attempt.getTotalQuestions());
            
            return savedAttempt;
        } catch (Exception e) {
            log.error("Error submitting quiz", e);
            throw new RuntimeException("Error submitting quiz: " + e.getMessage(), e);
        }
    }

    public List<QuizAttempt> getStudentAttempts(UUID studentId) {
        return quizAttemptRepository.findByStudentId(studentId);
    }
}
