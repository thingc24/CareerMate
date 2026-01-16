package vn.careermate.contentservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.contentservice.model.Company;
import vn.careermate.contentservice.model.CompanyRating;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.contentservice.repository.CompanyRatingRepository;
import vn.careermate.contentservice.repository.CompanyRepository;
import vn.careermate.userservice.repository.StudentProfileRepository;
import vn.careermate.userservice.repository.UserRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyRatingService {

    private final CompanyRatingRepository ratingRepository;
    private final CompanyRepository companyRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CompanyRating> getCompanyRatings(UUID companyId) {
        List<CompanyRating> ratings = ratingRepository.findByCompanyId(companyId);
        // Force load student and user for each rating
        ratings.forEach(rating -> {
            if (rating.getStudent() != null) {
                // Access student to trigger lazy load within transaction
                rating.getStudent().getId();
                // Load user even though it's @JsonIgnore - we'll need it in DTO
                try {
                    if (rating.getStudent().getUser() != null) {
                        rating.getStudent().getUser().getId();
                        rating.getStudent().getUser().getFullName();
                        rating.getStudent().getUser().getEmail();
                        String userAvatarUrl = rating.getStudent().getUser().getAvatarUrl();
                        // If User.avatarUrl is null, try to get from StudentProfile
                        if (userAvatarUrl == null || userAvatarUrl.isEmpty()) {
                            // StudentProfile.avatarUrl should be loaded already (since we have rating.getStudent())
                            if (rating.getStudent().getAvatarUrl() != null && 
                                !rating.getStudent().getAvatarUrl().isEmpty()) {
                                // Sync StudentProfile.avatarUrl to User.avatarUrl for display
                                rating.getStudent().getUser().setAvatarUrl(rating.getStudent().getAvatarUrl());
                            }
                        }
                        rating.getStudent().getUser().getAvatarUrl();
                    }
                } catch (Exception e) {
                    // If user can't be loaded, continue
                }
            }
        });
        return ratings;
    }

    public Double getAverageRating(UUID companyId) {
        Double avg = ratingRepository.getAverageRatingByCompanyId(companyId);
        return avg != null ? avg : 0.0;
    }
    
    @Transactional(readOnly = true)
    public CompanyRating getMyRating(UUID companyId) {
        try {
            UUID studentId = getCurrentStudentId();
            CompanyRating rating = ratingRepository.findByCompanyIdAndStudentId(companyId, studentId);
            // Force load student and user if rating exists
            if (rating != null && rating.getStudent() != null) {
                rating.getStudent().getId();
                // Load user for potential use
                try {
                    if (rating.getStudent().getUser() != null) {
                        rating.getStudent().getUser().getId();
                        rating.getStudent().getUser().getFullName();
                    }
                } catch (Exception e) {
                    // Continue if user can't be loaded
                }
            }
            return rating;
        } catch (Exception e) {
            return null;
        }
    }
    
    @Transactional
    public void deleteMyRating(UUID companyId) {
        UUID studentId = getCurrentStudentId();
        CompanyRating rating = ratingRepository.findByCompanyIdAndStudentId(companyId, studentId);
        if (rating != null) {
            ratingRepository.delete(rating);
        }
    }

    @Transactional
    public CompanyRating createOrUpdateRating(UUID companyId, Integer rating, String reviewText) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        
        UUID studentId = getCurrentStudentId();
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Check if rating exists
        CompanyRating existingRating = ratingRepository.findByCompanyId(companyId).stream()
                .filter(r -> r.getStudent().getId().equals(studentId))
                .findFirst()
                .orElse(null);

        if (existingRating != null) {
            existingRating.setRating(rating);
            existingRating.setReviewText(reviewText);
            return ratingRepository.save(existingRating);
        } else {
            CompanyRating newRating = CompanyRating.builder()
                    .company(company)
                    .student(student)
                    .rating(rating)
                    .reviewText(reviewText)
                    .build();
            return ratingRepository.save(newRating);
        }
    }

    private UUID getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UUID userId = userRepository.findByEmail(email)
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return studentProfileRepository.findByUserId(userId)
                .map(profile -> profile.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }
}
