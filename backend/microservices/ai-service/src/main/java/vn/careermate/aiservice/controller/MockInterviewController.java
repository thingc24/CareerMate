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
@RequestMapping("/students/mock-interview")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
public class MockInterviewController {

    private final MockInterviewService mockInterviewService;
    private final JobServiceClient jobServiceClient;

    @PostMapping("/start/{jobId}")
    public ResponseEntity<Map<String, Object>> startInterview(
            @PathVariable UUID jobId,
            @RequestBody(required = false) Map<String, String> studentProfile
    ) {
        // Get job via Feign Client
        JobDTO job;
        try {
            job = jobServiceClient.getJobById(jobId);
            if (job == null) {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error fetching job: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }

        String profile = studentProfile != null ? studentProfile.get("profile") : "";
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
}
