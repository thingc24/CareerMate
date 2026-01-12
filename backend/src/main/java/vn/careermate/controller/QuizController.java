package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.careermate.model.Quiz;
import vn.careermate.model.QuizAttempt;
import vn.careermate.repository.StudentProfileRepository;
import vn.careermate.repository.UserRepository;
import vn.careermate.service.QuizService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/students/quizzes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class QuizController {

    private final QuizService quizService;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Quiz>> getAvailableQuizzes(
            @RequestParam(required = false) String category
    ) {
        return ResponseEntity.ok(quizService.getAvailableQuizzes(category));
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable UUID quizId) {
        return ResponseEntity.ok(quizService.getQuizById(quizId));
    }

    @PostMapping("/{quizId}/start")
    public ResponseEntity<QuizAttempt> startQuiz(@PathVariable UUID quizId) {
        UUID studentId = getCurrentStudentId();
        return ResponseEntity.ok(quizService.startQuiz(quizId, studentId));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<QuizAttempt> submitQuiz(
            @PathVariable UUID attemptId,
            @RequestBody Map<UUID, String> answers
    ) {
        try {
            return ResponseEntity.ok(quizService.submitQuiz(attemptId, answers));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/attempts")
    public ResponseEntity<List<QuizAttempt>> getMyAttempts() {
        UUID studentId = getCurrentStudentId();
        return ResponseEntity.ok(quizService.getStudentAttempts(studentId));
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

