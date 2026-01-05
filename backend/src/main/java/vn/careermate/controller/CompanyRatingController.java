package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.model.CompanyRating;
import vn.careermate.service.CompanyRatingService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/companies")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CompanyRatingController {

    private final CompanyRatingService ratingService;

    @GetMapping("/{companyId}/ratings")
    public ResponseEntity<List<CompanyRating>> getCompanyRatings(@PathVariable UUID companyId) {
        return ResponseEntity.ok(ratingService.getCompanyRatings(companyId));
    }

    @GetMapping("/{companyId}/rating/average")
    public ResponseEntity<Map<String, Double>> getAverageRating(@PathVariable UUID companyId) {
        Double average = ratingService.getAverageRating(companyId);
        return ResponseEntity.ok(Map.of("averageRating", average));
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
}

