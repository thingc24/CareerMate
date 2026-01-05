package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import vn.careermate.model.CVTemplate;
import vn.careermate.repository.CVTemplateRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CVTemplateService {

    private final CVTemplateRepository templateRepository;

    public List<CVTemplate> getAllTemplates(String category) {
        if (category != null && !category.isEmpty()) {
            return templateRepository.findByCategory(category);
        }
        return templateRepository.findAll();
    }

    public List<CVTemplate> getFreeTemplates() {
        return templateRepository.findByIsPremium(false);
    }

    public List<CVTemplate> getPremiumTemplates() {
        return templateRepository.findByIsPremium(true);
    }

    public CVTemplate getTemplateById(UUID templateId) {
        return templateRepository.findById(templateId)
                .orElseThrow(() -> new RuntimeException("Template not found"));
    }
}

