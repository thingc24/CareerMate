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

    @Value("${ai.openrouter.api-key:}")
    private String openRouterApiKey;

    @Value("${ai.openrouter.model:meta-llama/llama-3.2-3b-instruct:free}")
    private String openRouterModel;

    @Value("${ai.openrouter.base-url:https://openrouter.ai/api/v1}")
    private String openRouterBaseUrl;

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

        String response = callOpenRouterAPI(prompt);
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

        String response = callOpenRouterAPI(prompt);
        return parseResponse(response);
    }

    private String callOpenRouterAPI(String prompt) {
        try {
            WebClient webClient = webClientBuilder
                .baseUrl(openRouterBaseUrl)
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("Authorization", "Bearer " + openRouterApiKey)
                .defaultHeader("HTTP-Referer", "http://localhost:8080")
                .defaultHeader("X-Title", "CareerMate")
                .build();
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", openRouterModel);
            
            List<Map<String, Object>> messages = new ArrayList<>();
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);
            messages.add(message);
            requestBody.put("messages", messages);

            Map<String, Object> response = webClient.post()
                    .uri("/chat/completions")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            
            // Parse OpenAI-compatible response
            if (response != null && response.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> choice = choices.get(0);
                    if (choice.containsKey("message")) {
                        Map<String, Object> messageMap = (Map<String, Object>) choice.get("message");
                        if (messageMap.containsKey("content")) {
                            return messageMap.get("content").toString();
                        }
                    }
                }
            }
            
            return "{}";
        } catch (Exception e) {
            log.error("Error calling OpenRouter API", e);
            return "{}";
        }
    }

    private Map<String, Object> parseResponse(String response) {
        Map<String, Object> result = new HashMap<>();
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            
            // Clean text (remove markdown code blocks if present)
            String text = response.trim();
            if (text.startsWith("```json")) text = text.substring(7);
            if (text.startsWith("```")) text = text.substring(3);
            if (text.endsWith("```")) text = text.substring(0, text.length() - 3);
            text = text.trim();
            
            // Try to parse as JSON
            com.fasterxml.jackson.databind.JsonNode jsonNode = mapper.readTree(text);
            result = mapper.convertValue(jsonNode, Map.class);
        } catch (Exception e) {
            log.error("Error parsing response", e);
            // Return empty result if parsing fails
        }
        return result;
    }
}

