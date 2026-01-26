package vn.careermate.aiservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import vn.careermate.aiservice.service.AIService;
import vn.careermate.aiservice.service.VectorDBService;
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.client.JobServiceClient;
import vn.careermate.common.dto.JobDTO;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Controller for AI services
 * CV Analysis, Job Matching, Mock Interview
 */
@Slf4j
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIService aiService;
    private final VectorDBService vectorDBService;
    private final UserServiceClient userServiceClient;
    private final JobServiceClient jobServiceClient;

    /**
     * Analyze CV
     * POST /ai/cv/analyze/{cvId}
     */
    @PostMapping("/cv/analyze/{cvId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER')")
    public ResponseEntity<Map<String, Object>> analyzeCV(@PathVariable String cvId) {
        // TODO: Get CV via UserServiceClient (need to add CV endpoint to UserServiceClient)
        // For now, CV content should be passed in request body
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Please use POST /ai/cv/analyze with CV content in request body"));
    }

    /**
     * Get job matching candidates using AI
     * GET /ai/jobs/{jobId}/matching
     */
    @GetMapping("/jobs/{jobId}/matching")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Map<String, Object>> getJobMatching(@PathVariable String jobId) {
        try {
            // Get job via Feign Client
            JobDTO job;
            try {
                job = jobServiceClient.getJobById(UUID.fromString(jobId));
                if (job == null) {
                    return ResponseEntity.notFound().build();
                }
            } catch (Exception e) {
                log.error("Error fetching job: {}", e.getMessage());
                return ResponseEntity.notFound().build();
            }

            // Build job description for matching
            StringBuilder jobDescBuilder = new StringBuilder();
            jobDescBuilder.append(job.getTitle()).append(". ");
            if (job.getDescription() != null) {
                jobDescBuilder.append(job.getDescription()).append(". ");
            }
            // Note: JobDTO may not have requirements field, or it might be in description
            // TODO: Add requirements field to JobDTO if needed
            
            String jobDescription = jobDescBuilder.toString();

            // Use vector DB for semantic search if enabled
            if (vectorDBService.isEnabled()) {
                List<String> matchingCVIds = vectorDBService.findMatchingCVs(jobDescription, 10);
                return ResponseEntity.ok(Map.of(
                    "jobId", jobId,
                    "matchingCVs", matchingCVIds,
                    "method", "vector-db"
                ));
            } else {
                // Fallback to AI-based matching
                return ResponseEntity.ok(Map.of(
                    "jobId", jobId,
                    "matchingCVs", List.of(),
                    "method", "ai-fallback",
                    "message", "Vector DB not enabled, using basic matching"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error finding matching candidates: " + e.getMessage()));
        }
    }

    /**
     * Start mock interview
     * POST /ai/interview/start
     */
    @PostMapping("/interview/start")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> startMockInterview(
            @RequestBody Map<String, String> request) {
        try {
            String jobIdStr = request.get("jobId");
            String cvContent = request.get("cvContent"); // CV content passed directly
            
            // Get job via Feign Client if jobId provided
            String jobDescription = "Job description";
            if (jobIdStr != null) {
                try {
                    JobDTO job = jobServiceClient.getJobById(UUID.fromString(jobIdStr));
                    if (job != null) {
                        jobDescription = String.format("%s. %s", job.getTitle(), job.getDescription());
                    }
                } catch (Exception e) {
                    log.warn("Error fetching job: {}", e.getMessage());
                }
            }
            
            // Use CV content from request body (or empty if not provided)
            if (cvContent == null) {
                cvContent = "";
            }
            
            // Generate interview questions
            List<String> questions = aiService.generateInterviewQuestions(jobDescription, cvContent);
            
            Map<String, Object> response = Map.of(
                "interviewId", "interview-" + System.currentTimeMillis(),
                "questions", questions
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error starting interview: " + e.getMessage()));
        }
    }

    /**
     * Get career roadmap
     * POST /ai/career/roadmap
     */
    @PostMapping("/career/roadmap")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getCareerRoadmap(
            @RequestBody Map<String, String> request) {
        String currentSkills = request.get("currentSkills");
        String targetRole = request.get("targetRole");
        
        Map<String, Object> roadmap = aiService.getCareerRoadmap(currentSkills, targetRole);
        return ResponseEntity.ok(roadmap);
    }

    /**
     * AI Chat endpoint
     * POST /ai/chat
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            String context = request.getOrDefault("context", "general");
            String role = request.getOrDefault("role", "STUDENT");
            
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Message is required"));
            }
            
            String response = aiService.chat(message, context, role);
            
            return ResponseEntity.ok(Map.of(
                "response", response,
                "context", context,
                "role", role
            ));
        } catch (RuntimeException e) {
            log.error("Error in chat", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error processing chat: " + e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error in chat", e);
            return ResponseEntity.status(500)
                .body(Map.of("error", "Internal server error: " + e.getClass().getSimpleName()));
        }
    }
}
