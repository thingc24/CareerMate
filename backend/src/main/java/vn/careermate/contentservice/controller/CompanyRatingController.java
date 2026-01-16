package vn.careermate.contentservice.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.contentservice.model.CompanyRating;
import vn.careermate.contentservice.service.CompanyRatingService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CompanyRatingController {

    private final CompanyRatingService ratingService;

    @GetMapping("/{companyId}/ratings")
    public ResponseEntity<List<Map<String, Object>>> getCompanyRatings(@PathVariable UUID companyId) {
        List<CompanyRating> ratings = ratingService.getCompanyRatings(companyId);
        
        // Convert to DTO with user info
        List<Map<String, Object>> ratingDTOs = ratings.stream().map(rating -> {
            Map<String, Object> dto = new HashMap<>();
            dto.put("id", rating.getId());
            dto.put("rating", rating.getRating());
            dto.put("reviewText", rating.getReviewText());
            dto.put("createdAt", rating.getCreatedAt());
            
            // Student info with user
            if (rating.getStudent() != null) {
                Map<String, Object> studentMap = new HashMap<>();
                studentMap.put("id", rating.getStudent().getId());
                
                // Load user info if available (even though it's @JsonIgnore, we can access it here)
                if (rating.getStudent().getUser() != null) {
                    Map<String, Object> userMap = new HashMap<>();
                    userMap.put("id", rating.getStudent().getUser().getId());
                    userMap.put("fullName", rating.getStudent().getUser().getFullName());
                    userMap.put("email", rating.getStudent().getUser().getEmail());
                    userMap.put("avatarUrl", rating.getStudent().getUser().getAvatarUrl());
                    studentMap.put("user", userMap);
                }
                
                dto.put("student", studentMap);
            }
            
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(ratingDTOs);
    }

    @GetMapping("/{companyId}/rating/average")
    public ResponseEntity<Map<String, Double>> getAverageRating(@PathVariable UUID companyId) {
        Double average = ratingService.getAverageRating(companyId);
        return ResponseEntity.ok(Map.of("averageRating", average));
    }

    @GetMapping("/{companyId}/ratings/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> getMyRating(@PathVariable UUID companyId) {
        CompanyRating rating = ratingService.getMyRating(companyId);
        if (rating == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Convert to DTO
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", rating.getId());
        dto.put("rating", rating.getRating());
        dto.put("reviewText", rating.getReviewText());
        dto.put("createdAt", rating.getCreatedAt());
        
        // Student info (user is @JsonIgnore, so we don't include it here)
        if (rating.getStudent() != null) {
            Map<String, Object> studentMap = new HashMap<>();
            studentMap.put("id", rating.getStudent().getId());
            dto.put("student", studentMap);
        }
        
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{companyId}/ratings")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<CompanyRating> createOrUpdateRating(
            @PathVariable UUID companyId,
            @RequestParam Integer rating,
            @RequestParam(required = false) String reviewText
    ) {
        return ResponseEntity.ok(ratingService.createOrUpdateRating(companyId, rating, reviewText));
    }
    
    @DeleteMapping("/{companyId}/ratings")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, String>> deleteMyRating(@PathVariable UUID companyId) {
        ratingService.deleteMyRating(companyId);
        return ResponseEntity.ok(Map.of("message", "Rating deleted successfully"));
    }
}
