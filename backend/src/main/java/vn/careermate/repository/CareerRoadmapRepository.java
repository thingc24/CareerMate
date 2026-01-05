package vn.careermate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import vn.careermate.model.CareerRoadmap;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CareerRoadmapRepository extends JpaRepository<CareerRoadmap, UUID> {
    Optional<CareerRoadmap> findByStudentId(UUID studentId);
    List<CareerRoadmap> findByStudentIdOrderByCreatedAtDesc(UUID studentId);
}

