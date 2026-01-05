package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import vn.careermate.model.Company;
import vn.careermate.repository.CompanyRatingRepository;
import vn.careermate.repository.CompanyRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyRatingRepository ratingRepository;

    public Page<Company> getAllCompanies(Pageable pageable) {
        return companyRepository.findAll(pageable);
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
}

