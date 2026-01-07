package vn.careermate.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for generating embeddings using Gemini API
 * Used for Vector DB storage
 */
@Slf4j
@Service
public class EmbeddingService {

    @Value("${ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${ai.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String geminiBaseUrl;

    @Value("${ai.gemini.embedding-model:models/text-embedding-004}")
    private String embeddingModel;

    private final WebClient webClient;

    public EmbeddingService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
            .baseUrl("https://generativelanguage.googleapis.com/v1beta")
            .build();
    }

    /**
     * Generate embedding for text content
     * @param text Text to embed
     * @return List of floats representing the embedding vector
     */
    public List<Float> generateEmbedding(String text) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            log.warn("Gemini API key not configured for embeddings");
            return new ArrayList<>();
        }

        try {
            String url = String.format("%s/%s:embedContent?key=%s",
                geminiBaseUrl, embeddingModel, geminiApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("taskType", "RETRIEVAL_DOCUMENT");
            
            Map<String, Object> content = new HashMap<>();
            content.put("parts", List.of(Map.of("text", text)));
            requestBody.put("content", content);

            Map<String, Object> response = webClient.post()
                .uri(url)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(Duration.ofSeconds(10))
                .block();

            if (response != null && response.containsKey("embedding")) {
                Map<String, Object> embedding = (Map<String, Object>) response.get("embedding");
                if (embedding.containsKey("values")) {
                    List<Double> values = (List<Double>) embedding.get("values");
                    List<Float> floatValues = new ArrayList<>();
                    for (Double value : values) {
                        floatValues.add(value.floatValue());
                    }
                    return floatValues;
                }
            }

            log.warn("Could not extract embedding from response");
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Error generating embedding", e);
            return new ArrayList<>();
        }
    }

    /**
     * Generate embedding for CV content
     */
    public List<Float> generateCVEmbedding(String cvContent) {
        // Truncate if too long (embedding models have token limits)
        if (cvContent.length() > 8000) {
            cvContent = cvContent.substring(0, 8000);
        }
        return generateEmbedding(cvContent);
    }

    /**
     * Generate embedding for Job description
     */
    public List<Float> generateJobEmbedding(String jobTitle, String jobDescription, String requirements) {
        String combined = String.format("%s. %s. %s", 
            jobTitle, 
            jobDescription != null ? jobDescription : "",
            requirements != null ? requirements : "");
        
        if (combined.length() > 8000) {
            combined = combined.substring(0, 8000);
        }
        return generateEmbedding(combined);
    }
}

