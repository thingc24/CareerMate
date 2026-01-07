package vn.careermate.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.model.SavedJob;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SavedJobRepository extends JpaRepository<SavedJob, UUID> {
    
    Page<SavedJob> findByStudentIdOrderBySavedAtDesc(UUID studentId, Pageable pageable);
    
    List<SavedJob> findByStudentIdOrderBySavedAtDesc(UUID studentId);
    
    Optional<SavedJob> findByStudentIdAndJobId(UUID studentId, UUID jobId);
    
    boolean existsByStudentIdAndJobId(UUID studentId, UUID jobId);
    
    void deleteByStudentIdAndJobId(UUID studentId, UUID jobId);
    
    long countByStudentId(UUID studentId);
    
    @Query("SELECT sj FROM SavedJob sj WHERE sj.student.id = :studentId AND sj.job.id = :jobId")
    Optional<SavedJob> findSavedJob(@Param("studentId") UUID studentId, @Param("jobId") UUID jobId);
}

