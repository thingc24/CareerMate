package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.model.Company;
import vn.careermate.model.CompanyRating;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.repository.CompanyRatingRepository;
import vn.careermate.repository.CompanyRepository;
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

    public List<CompanyRating> getCompanyRatings(UUID companyId) {
        return ratingRepository.findByCompanyId(companyId);
    }

    public Double getAverageRating(UUID companyId) {
        Double avg = ratingRepository.getAverageRatingByCompanyId(companyId);
        return avg != null ? avg : 0.0;
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

