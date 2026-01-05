package vn.careermate.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import vn.careermate.model.Application;
import vn.careermate.model.CV;
import vn.careermate.model.Job;
import vn.careermate.repository.ApplicationRepository;
import vn.careermate.repository.CVRepository;
import vn.careermate.repository.JobRepository;
import vn.careermate.util.DOCXExtractor;
import vn.careermate.util.PDFExtractor;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIService {

    private final CVRepository cvRepository;
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${ai.gemini.api-key}")
    private String geminiApiKey;

    @Value("${ai.gemini.model}")
    private String geminiModel;

    @Value("${ai.gemini.base-url}")
    private String geminiBaseUrl;

    @Async
    public void analyzeCVAsync(CV cv) {
        try {
            analyzeCV(cv);
        } catch (Exception e) {
            log.error("Error analyzing CV: {}", cv.getId(), e);
        }
    }

    public void analyzeCV(CV cv) throws IOException {
        // Extract text from CV file based on file type
        String cvContent = extractCVText(cv);

        // Create prompt for CV analysis
        String prompt = String.format(
            "Bạn là một chuyên gia tư vấn nghề nghiệp. Hãy phân tích CV sau đây và trả lời CHỈ dưới dạng JSON (không có text thêm):\n" +
            "{\n" +
            "  \"overallScore\": <số từ 0-100>,\n" +
            "  \"strengths\": [\"điểm mạnh 1\", \"điểm mạnh 2\"],\n" +
            "  \"weaknesses\": [\"điểm yếu 1\", \"điểm yếu 2\"],\n" +
            "  \"suggestions\": [\"gợi ý 1\", \"gợi ý 2\"],\n" +
            "  \"skillsDetected\": [\"skill1\", \"skill2\"],\n" +
            "  \"experienceYears\": <số năm>\n" +
            "}\n\n" +
            "Nội dung CV:\n%s", cvContent
        );

        // Call Gemini API
        String response = callGeminiAPI(prompt);

        // Parse response and update CV
        Map<String, Object> analysis = parseAnalysisResponse(response);
        
        cv.setAiAnalysis(analysis);
        if (analysis.containsKey("overallScore")) {
            Object score = analysis.get("overallScore");
            if (score instanceof Number) {
                cv.setAiScore(new BigDecimal(score.toString()));
            }
        }
        
        cvRepository.save(cv);
        log.info("CV analysis completed for CV: {}", cv.getId());
    }

    private String extractCVText(CV cv) throws IOException {
        String filePath = cv.getFileUrl();
        String fileType = cv.getFileType() != null ? cv.getFileType().toLowerCase() : "";
        String fileName = cv.getFileName().toLowerCase();

        if (fileType.contains("pdf") || fileName.endsWith(".pdf")) {
            return PDFExtractor.extractText(filePath);
        } else if (fileType.contains("word") || fileType.contains("document") || 
                   fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
            return DOCXExtractor.extractText(filePath);
        } else {
            // Assume plain text
            return new String(java.nio.file.Files.readAllBytes(Paths.get(filePath)));
        }
    }

    @Async
    public void calculateJobMatchAsync(Application application) {
        try {
            calculateJobMatch(application);
        } catch (Exception e) {
            log.error("Error calculating job match: {}", application.getId(), e);
        }
    }

    public void calculateJobMatch(Application application) {
        try {
            Job job = application.getJob();
            CV cv = application.getCv();
            
            if (cv == null || job == null) {
                log.warn("Cannot calculate match: CV or Job is null");
                return;
            }

            // Get job requirements
            String jobDescription = job.getDescription() + " " + job.getRequirements();
            
            // Get CV content
            String cvContent = extractCVText(cv);
            
            // Create prompt for matching
            String prompt = String.format(
                "Bạn là một chuyên gia tuyển dụng. Hãy đánh giá độ phù hợp giữa CV và công việc sau đây.\n" +
                "Trả lời CHỈ dưới dạng JSON:\n" +
                "{\n" +
                "  \"matchScore\": <số từ 0-100>,\n" +
                "  \"skillMatch\": <số từ 0-100>,\n" +
                "  \"experienceMatch\": <số từ 0-100>,\n" +
                "  \"educationMatch\": <số từ 0-100>,\n" +
                "  \"notes\": \"Ghi chú về độ phù hợp\"\n" +
                "}\n\n" +
                "Mô tả công việc:\n%s\n\n" +
                "Nội dung CV:\n%s", jobDescription, cvContent
            );

            String response = callGeminiAPI(prompt);
            Map<String, Object> matchResult = parseAnalysisResponse(response);
            
            if (matchResult.containsKey("matchScore")) {
                Object score = matchResult.get("matchScore");
                if (score instanceof Number) {
                    application.setMatchScore(new BigDecimal(score.toString()));
                }
            }
            
            if (matchResult.containsKey("notes")) {
                application.setAiNotes(matchResult.get("notes").toString());
            }
            
            applicationRepository.save(application);
            log.info("Job match calculated for application: {}", application.getId());
        } catch (Exception e) {
            log.error("Error calculating job match", e);
        }
    }

    private String callGeminiAPI(String prompt) {
        try {
            WebClient webClient = webClientBuilder.baseUrl(geminiBaseUrl).build();
            
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> content = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> part = new HashMap<>();
            
            part.put("text", prompt);
            parts.add(part);
            content.put("parts", parts);
            contents.add(content);
            requestBody.put("contents", contents);

            String response = webClient.post()
                    .uri("/models/{model}:generateContent?key={key}", geminiModel, geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            return response;
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return "{}";
        }
    }

    public Map<String, Object> generateCareerRoadmap(String studentInfo, String careerGoal, String currentLevel) {
        String prompt = String.format(
            "Bạn là một chuyên gia tư vấn nghề nghiệp. Hãy tạo một lộ trình nghề nghiệp chi tiết.\n" +
            "Trả lời CHỈ dưới dạng JSON:\n" +
            "{\n" +
            "  \"skillsGap\": [\"skill1\", \"skill2\"],\n" +
            "  \"recommendedCourses\": [\n" +
            "    {\"name\": \"Course 1\", \"duration\": \"20 hours\", \"level\": \"beginner\"}\n" +
            "  ],\n" +
            "  \"estimatedDurationMonths\": 6,\n" +
            "  \"milestones\": [\n" +
            "    {\"title\": \"Milestone 1\", \"description\": \"...\", \"targetDate\": \"2025-03-01\"}\n" +
            "  ],\n" +
            "  \"steps\": [\n" +
            "    {\"step\": 1, \"title\": \"Step 1\", \"description\": \"...\", \"duration\": \"1 month\"}\n" +
            "  ]\n" +
            "}\n\n" +
            "Thông tin sinh viên:\n%s\n\n" +
            "Mục tiêu nghề nghiệp: %s\n" +
            "Trình độ hiện tại: %s",
            studentInfo, careerGoal, currentLevel
        );

        String response = callGeminiAPI(prompt);
        return parseAnalysisResponse(response);
    }

    private Map<String, Object> parseAnalysisResponse(String response) {
        Map<String, Object> analysis = new HashMap<>();
        
        try {
            JsonNode rootNode = objectMapper.readTree(response);
            
            // Extract text from Gemini response
            String text = "";
            if (rootNode.has("candidates") && rootNode.get("candidates").isArray()) {
                JsonNode candidates = rootNode.get("candidates");
                if (candidates.size() > 0) {
                    JsonNode candidate = candidates.get(0);
                    if (candidate.has("content") && candidate.get("content").has("parts")) {
                        JsonNode parts = candidate.get("content").get("parts");
                        if (parts.isArray() && parts.size() > 0) {
                            JsonNode part = parts.get(0);
                            if (part.has("text")) {
                                text = part.get("text").asText();
                            }
                        }
                    }
                }
            }
            
            // Try to extract JSON from text (might be wrapped in markdown code blocks)
            text = text.trim();
            if (text.startsWith("```json")) {
                text = text.substring(7);
            }
            if (text.startsWith("```")) {
                text = text.substring(3);
            }
            if (text.endsWith("```")) {
                text = text.substring(0, text.length() - 3);
            }
            text = text.trim();
            
            // Parse the JSON content
            JsonNode analysisNode = objectMapper.readTree(text);
            
            // Convert to Map
            analysis = objectMapper.convertValue(analysisNode, Map.class);
            
        } catch (Exception e) {
            log.error("Error parsing AI response: {}", response, e);
            // Return empty analysis on error
        }
        
        return analysis;
    }
}

