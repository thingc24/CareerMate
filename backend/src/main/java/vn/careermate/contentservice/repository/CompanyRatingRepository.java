package vn.careermate.contentservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.contentservice.model.CompanyRating;

import java.util.List;
import java.util.UUID;

@Repository
public interface CompanyRatingRepository extends JpaRepository<CompanyRating, UUID> {
    // Note: Cannot JOIN FETCH nested relationships (student.user) in single query
    // Will need to manually load or use separate query
    @Query("SELECT DISTINCT cr FROM CompanyRating cr LEFT JOIN FETCH cr.student WHERE cr.company.id = :companyId")
    List<CompanyRating> findByCompanyId(@Param("companyId") UUID companyId);
    
    @Query("SELECT DISTINCT cr FROM CompanyRating cr LEFT JOIN FETCH cr.student WHERE cr.company.id = :companyId AND cr.student.id = :studentId")
    CompanyRating findByCompanyIdAndStudentId(@Param("companyId") UUID companyId, @Param("studentId") UUID studentId);
    
    @Query(value = "SELECT AVG(rating) FROM contentservice.company_ratings WHERE company_id = :companyId", nativeQuery = true)
    Double getAverageRatingByCompanyId(@Param("companyId") UUID companyId);
    
    @Query(value = "SELECT COUNT(*) FROM contentservice.company_ratings WHERE company_id = :companyId", nativeQuery = true)
    Long countByCompanyId(@Param("companyId") UUID companyId);
}
