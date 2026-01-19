package vn.careermate.contentservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.contentservice.model.Company;
import vn.careermate.contentservice.repository.CompanyRatingRepository;
import vn.careermate.contentservice.repository.CompanyRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyRatingRepository ratingRepository;

    @Transactional(readOnly = true)
    public Page<Company> getAllCompanies(Pageable pageable, String keyword) {
        List<Company> allCompanies = companyRepository.findAll();
        
        // Filter by keyword if provided
        if (keyword != null && !keyword.trim().isEmpty()) {
            String lowerKeyword = keyword.toLowerCase();
            allCompanies = allCompanies.stream()
                    .filter(company -> 
                        (company.getName() != null && company.getName().toLowerCase().contains(lowerKeyword)) ||
                        (company.getIndustry() != null && company.getIndustry().toLowerCase().contains(lowerKeyword)) ||
                        (company.getDescription() != null && company.getDescription().toLowerCase().contains(lowerKeyword))
                    )
                    .collect(Collectors.toList());
        }
        
        // Calculate average rating for each company and sort by rating DESC
        List<CompanyWithRating> companiesWithRatings = allCompanies.stream()
                .map(company -> {
                    Double avgRating = ratingRepository.getAverageRatingByCompanyId(company.getId());
                    avgRating = avgRating != null ? avgRating : 0.0;
                    Long ratingsCount = ratingRepository.countByCompanyId(company.getId());
                    return new CompanyWithRating(company, avgRating, ratingsCount != null ? ratingsCount : 0L);
                })
                .sorted((a, b) -> Double.compare(b.averageRating, a.averageRating)) // DESC order
                .collect(Collectors.toList());
        
        // Manually paginate
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), companiesWithRatings.size());
        List<CompanyWithRating> pageContent = companiesWithRatings.subList(start, end);
        
        // Convert back to Company list and set rating info if needed
        List<Company> result = pageContent.stream()
                .map(cwr -> {
                    // Note: We can't add fields to Company entity directly
                    // The rating will be calculated in the controller/DTO
                    return cwr.company;
                })
                .collect(Collectors.toList());
        
        return new PageImpl<>(result, pageable, companiesWithRatings.size());
    }
    
    // Helper class to hold company with its rating
    private static class CompanyWithRating {
        Company company;
        Double averageRating;
        Long ratingsCount;
        
        CompanyWithRating(Company company, Double averageRating, Long ratingsCount) {
            this.company = company;
            this.averageRating = averageRating;
            this.ratingsCount = ratingsCount;
        }
    }

    public List<Company> getTopCompanies(int limit) {
        // Get companies sorted by average rating
        List<Company> allCompanies = companyRepository.findAll();
        return allCompanies.stream()
                .sorted((a, b) -> {
                    Double ratingA = ratingRepository.getAverageRatingByCompanyId(a.getId());
                    Double ratingB = ratingRepository.getAverageRatingByCompanyId(b.getId());
                    ratingA = ratingA != null ? ratingA : 0.0;
                    ratingB = ratingB != null ? ratingB : 0.0;
                    return Double.compare(ratingB, ratingA); // Descending
                })
                .limit(limit)
                .toList();
    }

    public Company getCompanyById(UUID companyId) {
        return companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
    }
    
    public Double getAverageRating(UUID companyId) {
        try {
            Double avg = ratingRepository.getAverageRatingByCompanyId(companyId);
            log.debug("Average rating for company {}: {}", companyId, avg);
            return avg != null ? avg : 0.0;
        } catch (Exception e) {
            log.error("Error getting average rating for company {}: {}", companyId, e.getMessage(), e);
            return 0.0;
        }
    }
    
    public Long getRatingsCount(UUID companyId) {
        try {
            Long count = ratingRepository.countByCompanyId(companyId);
            log.debug("Ratings count for company {}: {}", companyId, count);
            return count != null ? count : 0L;
        } catch (Exception e) {
            log.error("Error getting ratings count for company {}: {}", companyId, e.getMessage(), e);
            return 0L;
        }
    }
}
