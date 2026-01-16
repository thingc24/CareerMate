package vn.careermate.contentservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.careermate.contentservice.model.Company;
import vn.careermate.contentservice.service.CompanyService;
import vn.careermate.userservice.model.RecruiterProfile;
import vn.careermate.userservice.repository.RecruiterProfileRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CompanyController {

    private final CompanyService companyService;
    private final RecruiterProfileRepository recruiterProfileRepository;

    @GetMapping
    public ResponseEntity<Page<Map<String, Object>>> getAllCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Company> companiesPage = companyService.getAllCompanies(pageable, keyword);
        
        // Convert to DTO with rating info
        List<Map<String, Object>> companiesWithRatings = companiesPage.getContent().stream()
                .map(company -> {
                    Double avgRating = companyService.getAverageRating(company.getId());
                    Long ratingsCount = companyService.getRatingsCount(company.getId());
                    Map<String, Object> companyMap = new HashMap<>();
                    companyMap.put("id", company.getId());
                    companyMap.put("name", company.getName());
                    companyMap.put("description", company.getDescription());
                    companyMap.put("websiteUrl", company.getWebsiteUrl());
                    companyMap.put("logoUrl", company.getLogoUrl());
                    companyMap.put("industry", company.getIndustry());
                    companyMap.put("companySize", company.getCompanySize());
                    companyMap.put("foundedYear", company.getFoundedYear());
                    companyMap.put("headquarters", company.getHeadquarters());
                    companyMap.put("createdAt", company.getCreatedAt());
                    companyMap.put("updatedAt", company.getUpdatedAt());
                    companyMap.put("averageRating", avgRating);
                    companyMap.put("ratingsCount", ratingsCount);
                    return companyMap;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(new PageImpl<>(companiesWithRatings, pageable, companiesPage.getTotalElements()));
    }

    @GetMapping("/top")
    public ResponseEntity<List<Company>> getTopCompanies(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(companyService.getTopCompanies(limit));
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<Map<String, Object>> getCompany(@PathVariable UUID companyId) {
        Company company = companyService.getCompanyById(companyId);
        Double avgRating = companyService.getAverageRating(companyId);
        Long ratingsCount = companyService.getRatingsCount(companyId);
        
        Map<String, Object> companyMap = new HashMap<>();
        companyMap.put("id", company.getId());
        companyMap.put("name", company.getName());
        companyMap.put("description", company.getDescription());
        companyMap.put("websiteUrl", company.getWebsiteUrl());
        companyMap.put("logoUrl", company.getLogoUrl());
        companyMap.put("industry", company.getIndustry());
        companyMap.put("companySize", company.getCompanySize());
        companyMap.put("foundedYear", company.getFoundedYear());
        companyMap.put("headquarters", company.getHeadquarters());
        companyMap.put("createdAt", company.getCreatedAt());
        companyMap.put("updatedAt", company.getUpdatedAt());
        companyMap.put("averageRating", avgRating);
        companyMap.put("ratingsCount", ratingsCount);
        
        return ResponseEntity.ok(companyMap);
    }
    
    @GetMapping("/{companyId}/recruiter")
    public ResponseEntity<Map<String, Object>> getRecruiterByCompany(@PathVariable UUID companyId) {
        Optional<RecruiterProfile> recruiterOpt = recruiterProfileRepository.findByCompanyId(companyId);
        if (!recruiterOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        
        RecruiterProfile recruiter = recruiterOpt.get();
        Map<String, Object> recruiterMap = new HashMap<>();
        
        if (recruiter.getUser() != null) {
            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", recruiter.getUser().getId());
            userMap.put("fullName", recruiter.getUser().getFullName());
            userMap.put("email", recruiter.getUser().getEmail());
            userMap.put("avatarUrl", recruiter.getUser().getAvatarUrl());
            recruiterMap.put("user", userMap);
        }
        
        recruiterMap.put("id", recruiter.getId());
        recruiterMap.put("position", recruiter.getPosition());
        recruiterMap.put("department", recruiter.getDepartment());
        recruiterMap.put("phone", recruiter.getPhone());
        recruiterMap.put("bio", recruiter.getBio());
        
        return ResponseEntity.ok(recruiterMap);
    }
}
