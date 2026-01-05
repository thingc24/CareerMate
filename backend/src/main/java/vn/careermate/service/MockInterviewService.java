package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import vn.careermate.model.Job;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class MockInterviewService {

    private final WebClient.Builder webClientBuilder;

    @Value("${ai.gemini.api-key}")
    private String geminiApiKey;

    @Value("${ai.gemini.model}")
    private String geminiModel;

    @Value("${ai.gemini.base-url}")
    private String geminiBaseUrl;

    public Map<String, Object> startMockInterview(Job job, String studentProfile) {
        // Generate interview questions based on job
        String prompt = String.format(
            "Bạn là một người phỏng vấn chuyên nghiệp. Dựa trên công việc sau đây, hãy tạo 5 câu hỏi phỏng vấn phù hợp.\n" +
            "Trả lời dưới dạng JSON:\n" +
            "{\n" +
            "  \"questions\": [\n" +
            "    {\"question\": \"Câu hỏi 1\", \"type\": \"technical\"},\n" +
            "    {\"question\": \"Câu hỏi 2\", \"type\": \"behavioral\"}\n" +
            "  ]\n" +
            "}\n\n" +
            "Công việc: %s\n" +
            "Mô tả: %s\n" +
            "Yêu cầu: %s",
            job.getTitle(), job.getDescription(), job.getRequirements()
        );

        String response = callGeminiAPI(prompt);
        Map<String, Object> result = parseResponse(response);

        // Add interview session info
        result.put("jobId", job.getId());
        result.put("jobTitle", job.getTitle());
        result.put("startedAt", new Date());
        result.put("currentQuestionIndex", 0);

        return result;
    }

    public Map<String, Object> evaluateAnswer(String question, String answer, String jobContext) {
        String prompt = String.format(
            "Bạn là một chuyên gia đánh giá phỏng vấn. Hãy đánh giá câu trả lời sau đây.\n" +
            "Trả lời dưới dạng JSON:\n" +
            "{\n" +
            "  \"score\": <số từ 0-100>,\n" +
            "  \"feedback\": \"Nhận xét chi tiết\",\n" +
            "  \"strengths\": [\"điểm mạnh 1\", \"điểm mạnh 2\"],\n" +
            "  \"improvements\": [\"cần cải thiện 1\", \"cần cải thiện 2\"]\n" +
            "}\n\n" +
            "Câu hỏi: %s\n" +
            "Câu trả lời: %s\n" +
            "Ngữ cảnh công việc: %s",
            question, answer, jobContext
        );

        String response = callGeminiAPI(prompt);
        return parseResponse(response);
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

            return webClient.post()
                    .uri("/models/{model}:generateContent?key={key}", geminiModel, geminiApiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return "{}";
        }
    }

    private Map<String, Object> parseResponse(String response) {
        // Similar to AIService parsing
        Map<String, Object> result = new HashMap<>();
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(response);
            
            String text = "";
            if (rootNode.has("candidates") && rootNode.get("candidates").isArray()) {
                com.fasterxml.jackson.databind.JsonNode candidates = rootNode.get("candidates");
                if (candidates.size() > 0) {
                    com.fasterxml.jackson.databind.JsonNode candidate = candidates.get(0);
                    if (candidate.has("content") && candidate.get("content").has("parts")) {
                        com.fasterxml.jackson.databind.JsonNode parts = candidate.get("content").get("parts");
                        if (parts.isArray() && parts.size() > 0) {
                            text = parts.get(0).get("text").asText();
                        }
                    }
                }
            }
            
            // Clean text
            text = text.trim();
            if (text.startsWith("```json")) text = text.substring(7);
            if (text.startsWith("```")) text = text.substring(3);
            if (text.endsWith("```")) text = text.substring(0, text.length() - 3);
            text = text.trim();
            
            com.fasterxml.jackson.databind.JsonNode jsonNode = mapper.readTree(text);
            result = mapper.convertValue(jsonNode, Map.class);
        } catch (Exception e) {
            log.error("Error parsing response", e);
        }
        return result;
    }
}

