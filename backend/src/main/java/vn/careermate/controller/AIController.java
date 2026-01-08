package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;
import vn.careermate.model.CV;
import vn.careermate.model.Job;
import vn.careermate.model.JobSkill;
import vn.careermate.repository.CVRepository;
import vn.careermate.repository.JobRepository;
import vn.careermate.repository.JobSkillRepository;
import vn.careermate.service.AIService;
import vn.careermate.service.FileStorageService;
import vn.careermate.service.VectorDBService;
import vn.careermate.util.DOCXExtractor;
import vn.careermate.util.PDFExtractor;

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
    private final CVRepository cvRepository;
    private final JobRepository jobRepository;
    private final JobSkillRepository jobSkillRepository;
    private final FileStorageService fileStorageService;

    /**
     * Analyze CV
     * POST /ai/cv/analyze/{cvId}
     */
    @PostMapping("/cv/analyze/{cvId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'RECRUITER')")
    public ResponseEntity<Map<String, Object>> analyzeCV(@PathVariable String cvId) {
        try {
            // Get CV from database
            CV cv = cvRepository.findById(UUID.fromString(cvId))
                .orElseThrow(() -> new RuntimeException("CV not found"));

            // Extract text content from CV file
            String cvContent = "";
            if (cv.getFileUrl() != null) {
                try {
                    // Resolve web path to actual file system path
                    String actualFilePath = fileStorageService.resolveFilePath(cv.getFileUrl());
                    log.info("Extracting CV content from file: {} (resolved from: {})", actualFilePath, cv.getFileUrl());
                    
                    if (cv.getFileUrl().endsWith(".pdf")) {
                        cvContent = PDFExtractor.extractText(actualFilePath);
                    } else if (cv.getFileUrl().endsWith(".docx")) {
                        cvContent = DOCXExtractor.extractText(actualFilePath);
                    }
                } catch (Exception e) {
                    log.error("Error extracting CV content from file: {}", cv.getFileUrl(), e);
                    throw new RuntimeException("Không thể đọc nội dung CV: " + e.getMessage(), e);
                }
            }

            if (cvContent.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "CV content is empty"));
            }

            // Analyze CV with AI
            Map<String, Object> analysis = aiService.analyzeCV(cvContent);
            
            // Store CV in vector DB for future matching
            if (vectorDBService.isEnabled() && cvContent.length() > 100) {
                // Generate embedding and store (async)
                // This would be done in a separate service
            }

            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Error analyzing CV: " + e.getMessage()));
        }
    }

    /**
     * Get job matching candidates using AI
     * GET /ai/jobs/{jobId}/matching
     */
    @GetMapping("/jobs/{jobId}/matching")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Map<String, Object>> getJobMatching(@PathVariable String jobId) {
        try {
            // Get job from database
            Job job = jobRepository.findById(UUID.fromString(jobId))
                .orElseThrow(() -> new RuntimeException("Job not found"));

            // Build job description for matching
            StringBuilder jobDescBuilder = new StringBuilder();
            jobDescBuilder.append(job.getTitle()).append(". ");
            if (job.getDescription() != null) {
                jobDescBuilder.append(job.getDescription()).append(". ");
            }
            if (job.getRequirements() != null) {
                jobDescBuilder.append("Requirements: ").append(job.getRequirements()).append(". ");
            }
            
            // Get skills from JobSkill entities
            List<JobSkill> jobSkills = jobSkillRepository.findByJobId(job.getId());
            List<String> requiredSkills = jobSkills.stream()
                .filter(JobSkill::getIsRequired)
                .map(JobSkill::getSkillName)
                .collect(Collectors.toList());
            
            if (!requiredSkills.isEmpty()) {
                jobDescBuilder.append("Skills: ").append(String.join(", ", requiredSkills));
            }
            
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
                // This would use AI to score CVs
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
            String jobId = request.get("jobId");
            String cvId = request.get("cvId");
            
            // Get job and CV
            Job job = jobId != null ? jobRepository.findById(UUID.fromString(jobId))
                .orElseThrow(() -> new RuntimeException("Job not found")) : null;
            CV cv = cvId != null ? cvRepository.findById(UUID.fromString(cvId))
                .orElseThrow(() -> new RuntimeException("CV not found")) : null;
            
            // Extract content
            String jobDescription = job != null ? 
                String.format("%s. %s", job.getTitle(), job.getDescription()) : "Job description";
            String cvContent = "";
            if (cv != null && cv.getFileUrl() != null) {
                try {
                    // Resolve web path to actual file system path
                    String actualFilePath = fileStorageService.resolveFilePath(cv.getFileUrl());
                    log.info("Extracting CV content for interview from file: {} (resolved from: {})", actualFilePath, cv.getFileUrl());
                    
                    if (cv.getFileUrl().endsWith(".pdf")) {
                        cvContent = PDFExtractor.extractText(actualFilePath);
                    } else if (cv.getFileUrl().endsWith(".docx")) {
                        cvContent = DOCXExtractor.extractText(actualFilePath);
                    }
                } catch (Exception e) {
                    log.error("Error extracting CV content for interview from file: {}", cv.getFileUrl(), e);
                }
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

