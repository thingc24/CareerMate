package vn.careermate.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.model.Job;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    Page<Job> findByStatus(Job.JobStatus status, Pageable pageable);
    
    // Use native query to avoid bytea casting issues
    @Query(value = "SELECT * FROM jobs j WHERE j.status = 'ACTIVE' AND " +
           "(:location IS NULL OR LOWER(j.location::text) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:keyword IS NULL OR LOWER(j.title::text) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(j.description::text) LIKE LOWER(CONCAT('%', :keyword, '%')))",
           nativeQuery = true)
    Page<Job> searchJobs(@Param("keyword") String keyword, 
                        @Param("location") String location, 
                        Pageable pageable);
    
    List<Job> findByRecruiterId(UUID recruiterId);
    
    @Query("SELECT j FROM Job j WHERE j.recruiter.id = :recruiterId")
    Page<Job> findByRecruiterId(@Param("recruiterId") UUID recruiterId, Pageable pageable);
}

