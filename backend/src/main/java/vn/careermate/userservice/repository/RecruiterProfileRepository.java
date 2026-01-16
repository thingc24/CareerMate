package vn.careermate.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.userservice.model.RecruiterProfile;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface RecruiterProfileRepository extends JpaRepository<RecruiterProfile, UUID> {
    Optional<RecruiterProfile> findByUserId(UUID userId);
    
    @Query("SELECT rp FROM RecruiterProfile rp LEFT JOIN FETCH rp.company WHERE rp.id = :id")
    Optional<RecruiterProfile> findByIdWithCompany(@Param("id") UUID id);
    
    @Query("SELECT rp FROM RecruiterProfile rp LEFT JOIN FETCH rp.company LEFT JOIN FETCH rp.user WHERE rp.user.id = :userId")
    Optional<RecruiterProfile> findByUserIdWithCompany(@Param("userId") UUID userId);
}
