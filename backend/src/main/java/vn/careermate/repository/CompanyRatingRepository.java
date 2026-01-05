package vn.careermate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import vn.careermate.model.CompanyRating;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompanyRatingRepository extends JpaRepository<CompanyRating, UUID> {
    List<CompanyRating> findByCompanyId(UUID companyId);
    
    @Query("SELECT AVG(cr.rating) FROM CompanyRating cr WHERE cr.company.id = :companyId")
    Double getAverageRatingByCompanyId(UUID companyId);
}

