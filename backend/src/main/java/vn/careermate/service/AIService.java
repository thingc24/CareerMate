package vn.careermate.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.*;

/**
 * AI Service for CV Analysis, Job Matching, and Mock Interview
 * Integrates with Gemini API
 */
@Slf4j
@Service
public class AIService {

    @Value("${ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${ai.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String geminiBaseUrl;

    @Value("${ai.gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    @Value("${ai.gemini.timeout:30000}")
    private int timeout;

    private final WebClient webClient;

    public AIService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
            .baseUrl("https://generativelanguage.googleapis.com/v1beta")
            .build();
    }

    /**
     * Analyze CV and return structured feedback
     */
    public Map<String, Object> analyzeCV(String cvContent) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            log.warn("Gemini API key not configured");
            return createErrorResponse("AI service not configured");
        }

        String prompt = String.format(
            "Bạn là chuyên gia tư vấn nghề nghiệp. Hãy phân tích CV sau đây một cách chi tiết và trả về kết quả dưới dạng JSON với cấu trúc chính xác:\n\n" +
            "{\n" +
            "  \"score\": số từ 0-100 (tổng điểm),\n" +
            "  \"structureScore\": số từ 0-100 (điểm cấu trúc),\n" +
            "  \"contentScore\": số từ 0-100 (điểm nội dung),\n" +
            "  \"strengths\": [\"điểm mạnh 1\", \"điểm mạnh 2\", ...],\n" +
            "  \"weaknesses\": [\"điểm yếu 1\", \"điểm yếu 2\", ...],\n" +
            "  \"suggestions\": [\"gợi ý 1\", \"gợi ý 2\", ...],\n" +
            "  \"summary\": \"Tóm tắt đánh giá ngắn gọn\"\n" +
            "}\n\n" +
            "CV Content:\n%s\n\n" +
            "QUAN TRỌNG: Chỉ trả về JSON, không có text hoặc markdown khác.",
            cvContent.length() > 5000 ? cvContent.substring(0, 5000) + "..." : cvContent
        );

        try {
            String response = callGeminiAPI(prompt);
            
            // Try to parse JSON from response
            String jsonStr = cleanJSONResponse(response);
            
            Map<String, Object> result = new HashMap<>();
            
            // Extract scores
            result.put("score", extractNumber(jsonStr, "score", 75));
            result.put("structureScore", extractNumber(jsonStr, "structureScore", 70));
            result.put("contentScore", extractNumber(jsonStr, "contentScore", 80));
            
            result.put("strengths", extractArray(jsonStr, "strengths", 
                Arrays.asList("Có kinh nghiệm", "Kỹ năng tốt", "Trình độ phù hợp")));
            result.put("weaknesses", extractArray(jsonStr, "weaknesses",
                Arrays.asList("Cần bổ sung thông tin", "Cải thiện format")));
            result.put("suggestions", extractArray(jsonStr, "suggestions",
                Arrays.asList("Thêm thông tin chi tiết hơn", "Cải thiện cấu trúc CV", "Bổ sung kỹ năng")));
            result.put("summary", extractString(jsonStr, "summary", 
                "CV có tiềm năng nhưng cần cải thiện một số điểm."));
            
            return result;
        } catch (Exception e) {
            log.error("Error analyzing CV", e);
            return createErrorResponse("Error analyzing CV: " + e.getMessage());
        }
    }

    /**
     * Analyze CV asynchronously (for background processing)
     */
    @Async
    public void analyzeCVAsync(vn.careermate.model.CV cv) {
        try {
            // Extract CV content
            String cvContent = extractCVContent(cv);
            if (cvContent.isEmpty()) {
                log.warn("CV content is empty for CV: {}", cv.getId());
                return;
            }

            // Analyze
            analyzeCV(cvContent);
            
            // Update CV with analysis results
            // This would be done in a service that has access to CVRepository
            log.info("CV analysis completed for CV: {}", cv.getId());
        } catch (Exception e) {
            log.error("Error in async CV analysis", e);
        }
    }

    private String extractCVContent(vn.careermate.model.CV cv) {
        // This would extract content from file
        // For now, return empty string
        return "";
    }

    /**
     * Generate interview questions based on job and CV
     */
    public List<String> generateInterviewQuestions(String jobDescription, String cvContent) {
        String prompt = String.format(
            "Dựa trên mô tả công việc và CV sau, tạo ra 10 câu hỏi phỏng vấn phù hợp.\n\n" +
            "Mô tả công việc:\n%s\n\n" +
            "CV ứng viên:\n%s\n\n" +
            "Trả về danh sách câu hỏi, mỗi câu một dòng, đánh số từ 1-10.",
            jobDescription.length() > 2000 ? jobDescription.substring(0, 2000) : jobDescription,
            cvContent.length() > 2000 ? cvContent.substring(0, 2000) : cvContent
        );

        try {
            String response = callGeminiAPI(prompt);
            return Arrays.asList(response.split("\n"));
        } catch (Exception e) {
            log.error("Error generating interview questions", e);
            return Arrays.asList(
                "Giới thiệu về bản thân",
                "Tại sao bạn quan tâm đến vị trí này?",
                "Kinh nghiệm của bạn với công nghệ này?",
                "Thách thức lớn nhất bạn đã gặp?",
                "Bạn làm việc nhóm như thế nào?"
            );
        }
    }

    /**
     * Get career roadmap suggestions
     */
    public Map<String, Object> getCareerRoadmap(String currentSkills, String targetRole) {
        String prompt = String.format(
            "Tạo lộ trình nghề nghiệp cho vị trí %s dựa trên kỹ năng hiện tại:\n%s\n\n" +
            "Trả về JSON với các trường: steps (danh sách các bước), timeline (thời gian), skills (kỹ năng cần học).",
            targetRole, currentSkills
        );

        try {
            String response = callGeminiAPI(prompt);
            Map<String, Object> result = new HashMap<>();
            result.put("steps", extractArray(response, "steps", 
                Arrays.asList("Bước 1: Học kiến thức cơ bản", "Bước 2: Thực hành", "Bước 3: Xây dựng portfolio")));
            result.put("timeline", extractString(response, "timeline", "6 tháng"));
            result.put("skills", extractArray(response, "skills", 
                Arrays.asList("Skill 1", "Skill 2", "Skill 3")));
            return result;
        } catch (Exception e) {
            log.error("Error getting career roadmap", e);
            return createErrorResponse("Error generating roadmap");
        }
    }

    /**
     * Call Gemini API
     */
    private String callGeminiAPI(String prompt) {
        String url = String.format("%s/models/%s:generateContent?key=%s",
            geminiBaseUrl, geminiModel, geminiApiKey);

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

        try {
            Map<String, Object> response = webClient.post()
                .uri(url)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofMillis(timeout))
                .block();

            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    if (candidate.containsKey("content")) {
                        Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                        if (contentMap.containsKey("parts")) {
                            List<Map<String, Object>> partsList = (List<Map<String, Object>>) contentMap.get("parts");
                            if (!partsList.isEmpty()) {
                                return (String) partsList.get(0).get("text");
                            }
                        }
                    }
                }
            }

            throw new RuntimeException("Invalid response from Gemini API");
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            throw new RuntimeException("Failed to call Gemini API", e);
        }
    }

    private String cleanJSONResponse(String response) {
        String jsonStr = response.trim();
        if (jsonStr.startsWith("```json")) {
            jsonStr = jsonStr.substring(7);
        }
        if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.substring(3);
        }
        if (jsonStr.endsWith("```")) {
            jsonStr = jsonStr.substring(0, jsonStr.length() - 3);
        }
        return jsonStr.trim();
    }

    private int extractNumber(String json, String key, int defaultValue) {
        try {
            String pattern = "\"" + key + "\"\\s*:\\s*(\\d+)";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
            java.util.regex.Matcher m = p.matcher(json);
            if (m.find()) {
                return Integer.parseInt(m.group(1));
            }
        } catch (Exception e) {
            log.warn("Could not extract number for " + key, e);
        }
        return defaultValue;
    }

    private List<String> extractArray(String json, String key, List<String> defaultValue) {
        try {
            String pattern = "\"" + key + "\"\\s*:\\s*\\[([^\\]]+)\\]";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
            java.util.regex.Matcher m = p.matcher(json);
            if (m.find()) {
                String arrayContent = m.group(1);
                List<String> items = new ArrayList<>();
                String[] parts = arrayContent.split(",");
                for (String part : parts) {
                    String item = part.trim().replaceAll("^\"|\"$", "");
                    if (!item.isEmpty()) {
                        items.add(item);
                    }
                }
                if (!items.isEmpty()) {
                    return items;
                }
            }
        } catch (Exception e) {
            log.warn("Could not extract array for " + key, e);
        }
        return defaultValue;
    }

    private String extractString(String json, String key, String defaultValue) {
        try {
            String pattern = "\"" + key + "\"\\s*:\\s*\"([^\"]+)\"";
            java.util.regex.Pattern p = java.util.regex.Pattern.compile(pattern);
            java.util.regex.Matcher m = p.matcher(json);
            if (m.find()) {
                return m.group(1);
            }
        } catch (Exception e) {
            log.warn("Could not extract string for " + key, e);
        }
        return defaultValue;
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
