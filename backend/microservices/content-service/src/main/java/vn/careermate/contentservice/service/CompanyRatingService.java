package vn.careermate.contentservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.contentservice.model.Company;
import vn.careermate.contentservice.model.CompanyRating;
// import vn.careermate.userservice.model.StudentProfile; // Replaced with Feign Client
import vn.careermate.contentservice.repository.CompanyRatingRepository;
import vn.careermate.contentservice.repository.CompanyRepository;
// import vn.careermate.userservice.repository.StudentProfileRepository; // Replaced with Feign Client
// import vn.careermate.userservice.repository.UserRepository; // Replaced with Feign Client
import vn.careermate.common.client.UserServiceClient;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.common.dto.StudentProfileDTO;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyRatingService {

    private final CompanyRatingRepository ratingRepository;
    private final CompanyRepository companyRepository;
    private final UserServiceClient userServiceClient;

    // TODO: Refactor to use UserServiceClient for fetching student details
    // Currently returns ratings with studentId (UUID) - client should fetch student details separately
    @Transactional(readOnly = true)
    public List<CompanyRating> getCompanyRatings(UUID companyId) {
        List<CompanyRating> ratings = ratingRepository.findByCompanyId(companyId);
        // Note: Student info now fetched via Feign Client when needed
        // No need to force load entity fields since we use UUID
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
            // Note: Student info now fetched via Feign Client when needed
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
        // Verify student exists via UserServiceClient
        try {
            StudentProfileDTO student = userServiceClient.getStudentProfileById(studentId);
            if (student == null) {
                throw new RuntimeException("Student not found");
            }
        } catch (Exception e) {
            throw new RuntimeException("Student not found: " + e.getMessage());
        }

        // Check if rating exists
        CompanyRating existingRating = ratingRepository.findByCompanyId(companyId).stream()
                .filter(r -> r.getStudentId().equals(studentId))
                .findFirst()
                .orElse(null);

        if (existingRating != null) {
            existingRating.setRating(rating);
            existingRating.setReviewText(reviewText);
            return ratingRepository.save(existingRating);
        } else {
            CompanyRating newRating = new CompanyRating();
            newRating.setCompany(company);
            newRating.setStudentId(studentId);
            newRating.setRating(rating);
            newRating.setReviewText(reviewText);
            return ratingRepository.save(newRating);
        }
    }

    private UUID getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UserDTO user = userServiceClient.getUserByEmail(email);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        
        StudentProfileDTO profile = userServiceClient.getStudentProfileByUserId(user.getId());
        if (profile == null) {
            throw new RuntimeException("Student profile not found");
        }
        
        return profile.getId();
    }
}
