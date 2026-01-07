package vn.careermate.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

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
    private final ObjectMapper objectMapper;

    public AIService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
            .baseUrl("https://generativelanguage.googleapis.com")
            .defaultHeader("Content-Type", "application/json")
            .build();
        this.objectMapper = new ObjectMapper();
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
     * Get career roadmap suggestions with detailed steps
     */
    public Map<String, Object> getCareerRoadmap(String studentInfo, String targetRole) {
        String prompt = String.format(
            "Bạn là chuyên gia tư vấn nghề nghiệp. Hãy tạo một lộ trình nghề nghiệp CHI TIẾT và CỤ THỂ cho vị trí \"%s\" dựa trên thông tin sinh viên sau:\n\n" +
            "=== THÔNG TIN SINH VIÊN ===\n%s\n\n" +
            "=== YÊU CẦU ===\n" +
            "Tạo lộ trình với 5-8 bước, mỗi bước phải có:\n" +
            "- title: Tiêu đề bước (ngắn gọn, rõ ràng)\n" +
            "- description: Mô tả chi tiết về bước này (ít nhất 100 từ, giải thích cụ thể cần làm gì, tại sao, như thế nào)\n" +
            "- skills: Danh sách kỹ năng cụ thể cần học trong bước này\n" +
            "- resources: Danh sách tài nguyên học tập (khóa học, sách, website, project thực hành)\n" +
            "- duration: Thời gian ước tính (ví dụ: \"2-3 tháng\", \"1 tuần\")\n" +
            "- milestones: Các mốc quan trọng cần đạt được trong bước này\n" +
            "- projects: Đề xuất project thực hành cụ thể\n\n" +
            "=== CẤU TRÚC JSON ===\n" +
            "Trả về CHỈ JSON, không có text khác, với cấu trúc:\n" +
            "{\n" +
            "  \"steps\": [\n" +
            "    {\n" +
            "      \"title\": \"Tiêu đề bước 1\",\n" +
            "      \"description\": \"Mô tả chi tiết ít nhất 100 từ về bước này, giải thích cụ thể cần làm gì, tại sao quan trọng, và cách thực hiện\",\n" +
            "      \"skills\": [\"Kỹ năng 1\", \"Kỹ năng 2\", ...],\n" +
            "      \"resources\": [\"Tài nguyên 1\", \"Tài nguyên 2\", ...],\n" +
            "      \"duration\": \"2-3 tháng\",\n" +
            "      \"milestones\": [\"Mốc 1\", \"Mốc 2\", ...],\n" +
            "      \"projects\": [\"Project 1\", \"Project 2\", ...]\n" +
            "    },\n" +
            "    ...\n" +
            "  ],\n" +
            "  \"timeline\": \"Tổng thời gian ước tính (ví dụ: 12-18 tháng)\",\n" +
            "  \"skillsGap\": [\"Kỹ năng còn thiếu 1\", \"Kỹ năng còn thiếu 2\", ...],\n" +
            "  \"recommendedCourses\": [\n" +
            "    {\"name\": \"Tên khóa học\", \"platform\": \"Nền tảng\", \"url\": \"Link (nếu có)\"},\n" +
            "    ...\n" +
            "  ],\n" +
            "  \"estimatedDurationMonths\": 12,\n" +
            "  \"summary\": \"Tóm tắt ngắn gọn về lộ trình (2-3 câu)\"\n" +
            "}\n\n" +
            "QUAN TRỌNG:\n" +
            "- Mỗi bước phải có nội dung CỤ THỂ, không chung chung\n" +
            "- Description phải ít nhất 100 từ, giải thích rõ ràng\n" +
            "- Đưa ra các project thực hành cụ thể, có thể làm ngay\n" +
            "- Tài nguyên học tập phải thực tế, có thể truy cập được\n" +
            "- Chỉ trả về JSON hợp lệ, không có markdown code blocks (```json), không có text giải thích thêm\n" +
            "- JSON phải là một object hợp lệ, bắt đầu bằng { và kết thúc bằng }\n" +
            "- Tất cả các trường phải có giá trị, không được null hoặc rỗng\n" +
            "- Mỗi step trong mảng steps phải là một object đầy đủ với tất cả các trường: title, description, skills, resources, duration, milestones, projects",
            targetRole, studentInfo
        );

        try {
            String response = callGeminiAPI(prompt);
            log.info("Raw AI response for roadmap (first 1000 chars): {}", 
                response.length() > 1000 ? response.substring(0, 1000) + "..." : response);
            
            // Clean and parse JSON response
            String jsonStr = cleanJSONResponse(response);
            log.info("Cleaned JSON length: {}", jsonStr.length());
            
            // Try to parse as complete JSON structure
            Map<String, Object> result = parseRoadmapJSON(jsonStr);
            
            // Validate and enhance result
            if (!result.containsKey("steps") || ((List<?>) result.getOrDefault("steps", List.of())).isEmpty()) {
                log.warn("Roadmap response missing steps, creating default structure");
                result = createDefaultRoadmap(targetRole);
            } else {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> steps = (List<Map<String, Object>>) result.get("steps");
                log.info("Roadmap generated successfully with {} steps", steps.size());
                for (int i = 0; i < steps.size(); i++) {
                    Map<String, Object> step = steps.get(i);
                    log.info("Step {}: title={}, has description={}", 
                        i + 1, 
                        step.get("title"),
                        step.containsKey("description") && step.get("description") != null);
                }
            }
            
            return result;
        } catch (Exception e) {
            log.error("Error getting career roadmap", e);
            return createDefaultRoadmap(targetRole);
        }
    }
    
    /**
     * Parse roadmap JSON from AI response using ObjectMapper
     */
    private Map<String, Object> parseRoadmapJSON(String jsonStr) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Clean JSON string - remove markdown code blocks if present
            jsonStr = cleanJSONResponse(jsonStr);
            
            // Try to find JSON object boundaries
            int startIdx = jsonStr.indexOf("{");
            int endIdx = jsonStr.lastIndexOf("}");
            
            if (startIdx >= 0 && endIdx > startIdx) {
                jsonStr = jsonStr.substring(startIdx, endIdx + 1);
            }
            
            log.info("Attempting to parse JSON (length: {})", jsonStr.length());
            log.debug("JSON content: {}", jsonStr.substring(0, Math.min(500, jsonStr.length())));
            
            // Try to parse with ObjectMapper
            try {
                TypeReference<Map<String, Object>> typeRef = new TypeReference<Map<String, Object>>() {};
                result = objectMapper.readValue(jsonStr, typeRef);
                
                log.info("Successfully parsed JSON with ObjectMapper");
                
                // Validate steps
                if (result.containsKey("steps")) {
                    Object stepsObj = result.get("steps");
                    if (stepsObj instanceof List) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> steps = (List<Map<String, Object>>) stepsObj;
                        log.info("Found {} steps in roadmap", steps.size());
                        
                        // Validate each step has required fields
                        for (int i = 0; i < steps.size(); i++) {
                            Map<String, Object> step = steps.get(i);
                            if (step == null) {
                                step = new HashMap<>();
                                steps.set(i, step);
                            }
                            if (!step.containsKey("title") || step.get("title") == null || step.get("title").toString().trim().isEmpty()) {
                                step.put("title", "Bước " + (i + 1));
                            }
                            if (!step.containsKey("description") || step.get("description") == null || step.get("description").toString().trim().isEmpty()) {
                                step.put("description", "Mô tả chi tiết về bước này sẽ được cập nhật.");
                            }
                            // Log step content for debugging
                            log.debug("Step {}: title={}, description length={}", 
                                i + 1, 
                                step.get("title"),
                                step.get("description") != null ? step.get("description").toString().length() : 0);
                        }
                    }
                } else {
                    log.warn("No 'steps' field found in parsed JSON");
                }
                
            } catch (Exception e) {
                log.error("Failed to parse JSON with ObjectMapper, trying fallback: {}", e.getMessage());
                // Fallback to manual parsing
                result = parseRoadmapJSONManual(jsonStr);
            }
            
        } catch (Exception e) {
            log.error("Error parsing roadmap JSON", e);
            result = new HashMap<>();
        }
        
        // Ensure we have at least default structure
        if (!result.containsKey("steps") || ((List<?>) result.getOrDefault("steps", List.of())).isEmpty()) {
            log.warn("No valid steps found, using default");
            result.put("steps", createDefaultSteps());
        }
        
        // Set defaults for missing fields
        result.putIfAbsent("timeline", "12-18 tháng");
        result.putIfAbsent("skillsGap", new ArrayList<>());
        result.putIfAbsent("recommendedCourses", new ArrayList<>());
        result.putIfAbsent("estimatedDurationMonths", 12);
        result.putIfAbsent("summary", "Lộ trình phát triển nghề nghiệp được tùy chỉnh cho bạn");
        
        return result;
    }
    
    /**
     * Manual parsing fallback if ObjectMapper fails
     */
    private Map<String, Object> parseRoadmapJSONManual(String jsonStr) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // Extract steps array
            List<Map<String, Object>> steps = extractStepsArray(jsonStr);
            result.put("steps", steps);
            
            // Extract other fields
            result.put("timeline", extractString(jsonStr, "timeline", "12-18 tháng"));
            result.put("skillsGap", extractArray(jsonStr, "skillsGap", new ArrayList<>()));
            result.put("recommendedCourses", extractCoursesArray(jsonStr));
            result.put("estimatedDurationMonths", extractNumber(jsonStr, "estimatedDurationMonths", 12));
            result.put("summary", extractString(jsonStr, "summary", "Lộ trình phát triển nghề nghiệp được tùy chỉnh cho bạn"));
            
            log.info("Parsed roadmap manually with {} steps", steps.size());
            
        } catch (Exception e) {
            log.error("Error in manual parsing", e);
        }
        
        return result;
    }
    
    /**
     * Extract steps array from JSON string
     */
    private List<Map<String, Object>> extractStepsArray(String jsonStr) {
        List<Map<String, Object>> steps = new ArrayList<>();
        
        try {
            // Find steps array
            int stepsStart = jsonStr.indexOf("\"steps\"");
            if (stepsStart < 0) {
                stepsStart = jsonStr.indexOf("'steps'");
            }
            
            if (stepsStart >= 0) {
                // Find the array start
                int arrayStart = jsonStr.indexOf("[", stepsStart);
                if (arrayStart >= 0) {
                    // Extract array content
                    int bracketCount = 0;
                    int arrayEnd = arrayStart;
                    for (int i = arrayStart; i < jsonStr.length(); i++) {
                        char c = jsonStr.charAt(i);
                        if (c == '[') bracketCount++;
                        if (c == ']') bracketCount--;
                        if (bracketCount == 0 && c == ']') {
                            arrayEnd = i;
                            break;
                        }
                    }
                    
                    String arrayContent = jsonStr.substring(arrayStart + 1, arrayEnd);
                    
                    // Parse each step object
                    steps = parseStepObjects(arrayContent);
                }
            }
        } catch (Exception e) {
            log.error("Error extracting steps array", e);
        }
        
        // If no steps found, create default steps
        if (steps.isEmpty()) {
            steps = createDefaultSteps();
        }
        
        return steps;
    }
    
    /**
     * Parse step objects from array content
     */
    private List<Map<String, Object>> parseStepObjects(String arrayContent) {
        List<Map<String, Object>> steps = new ArrayList<>();
        
        try {
            // Split by objects (looking for { ... })
            int braceCount = 0;
            int start = -1;
            
            for (int i = 0; i < arrayContent.length(); i++) {
                char c = arrayContent.charAt(i);
                if (c == '{') {
                    if (braceCount == 0) start = i;
                    braceCount++;
                }
                if (c == '}') {
                    braceCount--;
                    if (braceCount == 0 && start >= 0) {
                        String stepStr = arrayContent.substring(start, i + 1);
                        Map<String, Object> step = parseStepObject(stepStr);
                        if (!step.isEmpty()) {
                            steps.add(step);
                        }
                        start = -1;
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error parsing step objects", e);
        }
        
        return steps;
    }
    
    /**
     * Parse a single step object - try ObjectMapper first, then fallback to regex
     */
    private Map<String, Object> parseStepObject(String stepStr) {
        Map<String, Object> step = new HashMap<>();
        
        try {
            // Try ObjectMapper first
            try {
                TypeReference<Map<String, Object>> typeRef = new TypeReference<Map<String, Object>>() {};
                step = objectMapper.readValue(stepStr, typeRef);
                log.debug("Successfully parsed step with ObjectMapper");
            } catch (Exception e) {
                log.debug("ObjectMapper failed for step, using regex: {}", e.getMessage());
                // Fallback to regex extraction
                step.put("title", extractString(stepStr, "title", "Bước"));
                step.put("description", extractString(stepStr, "description", "Mô tả chi tiết về bước này"));
                step.put("skills", extractArray(stepStr, "skills", new ArrayList<>()));
                step.put("resources", extractArray(stepStr, "resources", new ArrayList<>()));
                step.put("duration", extractString(stepStr, "duration", "1-2 tháng"));
                step.put("milestones", extractArray(stepStr, "milestones", new ArrayList<>()));
                step.put("projects", extractArray(stepStr, "projects", new ArrayList<>()));
            }
            
            // Ensure all required fields exist
            if (!step.containsKey("title") || step.get("title") == null || step.get("title").toString().trim().isEmpty()) {
                step.put("title", "Bước");
            }
            if (!step.containsKey("description") || step.get("description") == null || step.get("description").toString().trim().isEmpty()) {
                step.put("description", "Mô tả chi tiết về bước này sẽ được cập nhật.");
            }
            step.putIfAbsent("skills", new ArrayList<>());
            step.putIfAbsent("resources", new ArrayList<>());
            step.putIfAbsent("duration", "1-2 tháng");
            step.putIfAbsent("milestones", new ArrayList<>());
            step.putIfAbsent("projects", new ArrayList<>());
            
        } catch (Exception e) {
            log.error("Error parsing step object", e);
            // Return minimal step
            step.put("title", "Bước");
            step.put("description", "Mô tả chi tiết về bước này sẽ được cập nhật.");
            step.put("skills", new ArrayList<>());
            step.put("resources", new ArrayList<>());
            step.put("duration", "1-2 tháng");
            step.put("milestones", new ArrayList<>());
            step.put("projects", new ArrayList<>());
        }
        
        return step;
    }
    
    /**
     * Extract courses array
     */
    private List<Map<String, Object>> extractCoursesArray(String jsonStr) {
        List<Map<String, Object>> courses = new ArrayList<>();
        
        try {
            int coursesStart = jsonStr.indexOf("\"recommendedCourses\"");
            if (coursesStart < 0) {
                coursesStart = jsonStr.indexOf("'recommendedCourses'");
            }
            
            if (coursesStart >= 0) {
                int arrayStart = jsonStr.indexOf("[", coursesStart);
                if (arrayStart >= 0) {
                    int bracketCount = 0;
                    int arrayEnd = arrayStart;
                    for (int i = arrayStart; i < jsonStr.length(); i++) {
                        char c = jsonStr.charAt(i);
                        if (c == '[') bracketCount++;
                        if (c == ']') bracketCount--;
                        if (bracketCount == 0 && c == ']') {
                            arrayEnd = i;
                            break;
                        }
                    }
                    
                    // Parse course objects similar to steps
                    // For now, return empty list
                }
            }
        } catch (Exception e) {
            log.error("Error extracting courses array", e);
        }
        
        return courses;
    }
    
    /**
     * Create default roadmap if AI fails
     */
    private Map<String, Object> createDefaultRoadmap(String targetRole) {
        Map<String, Object> result = new HashMap<>();
        result.put("steps", createDefaultSteps());
        result.put("timeline", "12-18 tháng");
        result.put("skillsGap", Arrays.asList("Kỹ năng chuyên môn", "Kinh nghiệm thực tế"));
        result.put("recommendedCourses", new ArrayList<>());
        result.put("estimatedDurationMonths", 12);
        result.put("summary", "Lộ trình phát triển nghề nghiệp cho " + targetRole);
        return result;
    }
    
    /**
     * Create default steps
     */
    private List<Map<String, Object>> createDefaultSteps() {
        List<Map<String, Object>> steps = new ArrayList<>();
        
        Map<String, Object> step1 = new HashMap<>();
        step1.put("title", "Nắm vững kiến thức cơ bản");
        step1.put("description", "Bắt đầu với việc học các kiến thức nền tảng quan trọng. Đây là bước đầu tiên và quan trọng nhất trong lộ trình của bạn. Hãy dành thời gian để hiểu sâu các khái niệm cơ bản, không chỉ học thuộc mà cần hiểu bản chất và cách áp dụng vào thực tế.");
        step1.put("skills", Arrays.asList("Kiến thức cơ bản", "Nguyên lý hoạt động"));
        step1.put("resources", Arrays.asList("Sách giáo khoa", "Khóa học online"));
        step1.put("duration", "2-3 tháng");
        step1.put("milestones", Arrays.asList("Hoàn thành khóa học cơ bản", "Làm được bài tập thực hành"));
        step1.put("projects", Arrays.asList("Project nhỏ đầu tiên"));
        steps.add(step1);
        
        Map<String, Object> step2 = new HashMap<>();
        step2.put("title", "Thực hành và xây dựng portfolio");
        step2.put("description", "Áp dụng kiến thức đã học vào các dự án thực tế. Xây dựng portfolio là cách tốt nhất để chứng minh năng lực của bạn. Hãy bắt đầu với các project nhỏ, sau đó nâng dần độ phức tạp. Mỗi project nên giải quyết một vấn đề cụ thể và thể hiện được kỹ năng của bạn.");
        step2.put("skills", Arrays.asList("Thực hành", "Xây dựng dự án"));
        step2.put("resources", Arrays.asList("GitHub", "Tài liệu tham khảo"));
        step2.put("duration", "3-4 tháng");
        step2.put("milestones", Arrays.asList("Hoàn thành 3-5 projects", "Có portfolio online"));
        step2.put("projects", Arrays.asList("Project trung bình", "Project cá nhân"));
        steps.add(step2);
        
        return steps;
    }

    /**
     * Call Gemini API
     */
    private String callGeminiAPI(String prompt) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            throw new RuntimeException("Gemini API key is not configured");
        }

        // Build URL - Gemini API format
        // URL format: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}
        String url = String.format("/v1beta/models/%s:generateContent?key=%s",
            geminiModel, geminiApiKey);

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
            log.info("Calling Gemini API with model: {}, API key present: {}", geminiModel, geminiApiKey != null && !geminiApiKey.isEmpty());
            Map<String, Object> response = webClient.post()
                .uri(url)
                .header("Content-Type", "application/json")
                .bodyValue(requestBody)
                .retrieve()
                .onStatus(status -> status.is4xxClientError() || status.is5xxServerError(), clientResponse -> {
                    log.error("Gemini API HTTP error: {}", clientResponse.statusCode());
                    return clientResponse.bodyToMono(String.class)
                        .doOnNext(body -> log.error("Error response body: {}", body))
                        .then(Mono.error(new RuntimeException("Gemini API returned error: " + clientResponse.statusCode())));
                })
                .bodyToMono(Map.class)
                .timeout(Duration.ofMillis(timeout))
                .doOnError(error -> log.error("Gemini API error: {}", error.getMessage(), error))
                .block();

            if (response == null) {
                log.error("Gemini API returned null response");
                throw new RuntimeException("Invalid response from Gemini API: null");
            }

            if (response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    if (candidate.containsKey("content")) {
                        Map<String, Object> contentMap = (Map<String, Object>) candidate.get("content");
                        if (contentMap.containsKey("parts")) {
                            List<Map<String, Object>> partsList = (List<Map<String, Object>>) contentMap.get("parts");
                            if (partsList != null && !partsList.isEmpty()) {
                                Object textObj = partsList.get(0).get("text");
                                if (textObj != null) {
                                    return textObj.toString();
                                }
                            }
                        }
                    }
                }
            }

            // Log full response for debugging
            log.error("Invalid response structure from Gemini API: {}", response);
            throw new RuntimeException("Invalid response from Gemini API: unexpected structure");
        } catch (org.springframework.web.reactive.function.client.WebClientException e) {
            log.error("WebClient error calling Gemini API", e);
            throw new RuntimeException("Failed to call Gemini API: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            throw new RuntimeException("Failed to call Gemini API: " + e.getMessage(), e);
        }
    }

    private String cleanJSONResponse(String response) {
        String jsonStr = response.trim();
        
        // Remove markdown code blocks
        if (jsonStr.startsWith("```json")) {
            jsonStr = jsonStr.substring(7);
        } else if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.substring(3);
        }
        
        if (jsonStr.endsWith("```")) {
            jsonStr = jsonStr.substring(0, jsonStr.length() - 3);
        }
        
        // Remove any leading/trailing whitespace and newlines
        jsonStr = jsonStr.trim();
        
        // Remove any text before first {
        int firstBrace = jsonStr.indexOf("{");
        if (firstBrace > 0) {
            jsonStr = jsonStr.substring(firstBrace);
        }
        
        // Remove any text after last }
        int lastBrace = jsonStr.lastIndexOf("}");
        if (lastBrace >= 0 && lastBrace < jsonStr.length() - 1) {
            jsonStr = jsonStr.substring(0, lastBrace + 1);
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

    /**
     * Chat with AI based on role and context
     */
    public String chat(String message, String context, String role) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
            log.warn("Gemini API key not configured");
            return "Xin lỗi, dịch vụ AI chưa được cấu hình. Vui lòng liên hệ quản trị viên.";
        }

        // Build context-specific prompt
        String systemPrompt = "";
        switch (role.toUpperCase()) {
            case "STUDENT":
                systemPrompt = "Bạn là Career AI Coach, một trợ lý tư vấn nghề nghiệp thông minh và thân thiện. " +
                    "Bạn giúp sinh viên:\n" +
                    "- Phân tích và cải thiện CV\n" +
                    "- Tư vấn nghề nghiệp và định hướng\n" +
                    "- Đề xuất kỹ năng cần phát triển\n" +
                    "- Luyện tập phỏng vấn\n" +
                    "- Tạo lộ trình nghề nghiệp\n\n" +
                    "Hãy trả lời một cách nhiệt tình, chi tiết và hữu ích. Sử dụng tiếng Việt.";
                break;
            case "RECRUITER":
                systemPrompt = "Bạn là AI Assistant cho Nhà tuyển dụng. " +
                    "Bạn giúp nhà tuyển dụng:\n" +
                    "- Tìm ứng viên phù hợp\n" +
                    "- Phân tích CV ứng viên\n" +
                    "- Đề xuất câu hỏi phỏng vấn\n" +
                    "- Đánh giá ứng viên\n\n" +
                    "Hãy trả lời một cách chuyên nghiệp và hữu ích. Sử dụng tiếng Việt.";
                break;
            case "ADMIN":
                systemPrompt = "Bạn là AI Assistant cho Quản trị viên hệ thống. " +
                    "Bạn giúp admin:\n" +
                    "- Phân tích dữ liệu hệ thống\n" +
                    "- Đề xuất cải thiện\n" +
                    "- Hỗ trợ quản lý người dùng\n" +
                    "- Báo cáo và thống kê\n\n" +
                    "Hãy trả lời một cách chính xác và chi tiết. Sử dụng tiếng Việt.";
                break;
            default:
                systemPrompt = "Bạn là AI Assistant hữu ích. Hãy trả lời câu hỏi một cách chi tiết và hữu ích. Sử dụng tiếng Việt.";
        }

        String prompt = systemPrompt + "\n\nCâu hỏi của người dùng: " + message;

        try {
            return callGeminiAPI(prompt);
        } catch (Exception e) {
            log.error("Error in chat", e);
            return "Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.";
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
