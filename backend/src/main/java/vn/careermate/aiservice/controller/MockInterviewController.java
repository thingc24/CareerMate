package vn.careermate.aiservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.jobservice.model.Job;
import vn.careermate.jobservice.repository.JobRepository;
import vn.careermate.aiservice.service.MockInterviewService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/students/mock-interview")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class MockInterviewController {

    private final MockInterviewService mockInterviewService;
    private final JobRepository jobRepository;

    @PostMapping("/start/{jobId}")
    public ResponseEntity<Map<String, Object>> startInterview(
            @PathVariable UUID jobId,
            @RequestBody(required = false) Map<String, String> studentProfile
    ) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));

        String profile = studentProfile != null ? studentProfile.get("profile") : "";
        Map<String, Object> interview = mockInterviewService.startMockInterview(job, profile);
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
