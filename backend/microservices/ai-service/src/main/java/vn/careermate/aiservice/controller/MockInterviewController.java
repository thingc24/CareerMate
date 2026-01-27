package vn.careermate.aiservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.aiservice.service.MockInterviewService;
import vn.careermate.common.client.JobServiceClient;
import vn.careermate.common.dto.JobDTO;

import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/ai/students/mock-interview")
@RequiredArgsConstructor
//@PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
public class MockInterviewController {

    private final MockInterviewService mockInterviewService;
    private final JobServiceClient jobServiceClient;

    @PostMapping("/start/{jobId}")
    public ResponseEntity<Map<String, Object>> startInterview(
            @PathVariable UUID jobId,
            @RequestBody(required = false) Map<String, String> body
    ) {
        // Get Student ID from Body (temp) or Token
        // Ideally get from SecurityContext
        // For now, let's allow passing studentId in body for simplicity if needed, 
        // but typically it should start a session.
        // The service logic currently doesn't SAVE the start, it just generates questions.
        // To really persist, we need to change startMockInterview signature.
        
        // For now, just return specific Start Data.
        String profile = body != null ? body.get("profile") : "";
        Map<String, Object> interview = mockInterviewService.startMockInterview(jobId, profile);
        return ResponseEntity.ok(interview);
    }

    @PostMapping("/evaluate")
    public ResponseEntity<Map<String, Object>> evaluateAnswer(
            @RequestBody Map<String, String> request
    ) {
        String question = request.get("question");
        String answer = request.get("answer");
        String jobContext = request.get("jobContext");

        Map<String, Object> evaluation = mockInterviewService.evaluateAnswer(question, answer, jobContext);
        return ResponseEntity.ok(evaluation);
    }
    
    @PostMapping("/finish")
    public ResponseEntity<?> finishInterview(@RequestBody vn.careermate.aiservice.model.MockInterview interview) {
        log.info("Received finish interview request: {}", interview);
        return ResponseEntity.ok(mockInterviewService.saveInterview(interview));
    }
    
    @GetMapping("/history/{studentId}")
    public ResponseEntity<?> getHistory(@PathVariable UUID studentId) {
        return ResponseEntity.ok(mockInterviewService.getHistory(studentId));
    }

    @GetMapping("/admin/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAdminHistory() {
        return ResponseEntity.ok(mockInterviewService.getAllHistory());
    }
}
