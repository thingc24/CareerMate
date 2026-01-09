package vn.careermate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import vn.careermate.model.LessonProgress;

import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {
    
    Optional<LessonProgress> findByEnrollmentIdAndLessonId(UUID enrollmentId, UUID lessonId);
    
    List<LessonProgress> findByEnrollmentId(UUID enrollmentId);
    
    @Query("SELECT COUNT(lp) FROM LessonProgress lp WHERE lp.enrollment.id = :enrollmentId AND lp.isCompleted = true")
    Long countCompletedLessonsByEnrollmentId(@Param("enrollmentId") UUID enrollmentId);
    
    @Query("SELECT COUNT(l) FROM Lesson l WHERE l.module.course.id = (SELECT e.course.id FROM CourseEnrollment e WHERE e.id = :enrollmentId)")
    Long countTotalLessonsByEnrollmentId(@Param("enrollmentId") UUID enrollmentId);
}
