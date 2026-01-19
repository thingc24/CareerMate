package vn.careermate.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import vn.careermate.common.dto.CVTemplateDTO;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "learning-service")
public interface LearningServiceClient {
    @GetMapping("/cv-templates/{templateId}")
    CVTemplateDTO getCVTemplateById(@PathVariable UUID templateId);
    
    @GetMapping("/cv-templates")
    List<CVTemplateDTO> getAllCVTemplates();
}
