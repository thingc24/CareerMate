package vn.careermate.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.model.Application;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByStudentId(UUID studentId);
    List<Application> findByJobId(UUID jobId);
    Optional<Application> findByJobIdAndStudentId(UUID jobId, UUID studentId);
    Page<Application> findByStudentId(UUID studentId, Pageable pageable);
    Page<Application> findByJobId(UUID jobId, Pageable pageable);
}

