package vn.careermate.aiservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.userservice.model.CV;
import vn.careermate.jobservice.model.Job;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "mock_interviews", indexes = {
    @Index(name = "idx_mock_interviews_student", columnList = "student_id"),
    @Index(name = "idx_mock_interviews_job", columnList = "job_id"),
    @Index(name = "idx_mock_interviews_status", columnList = "status")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class MockInterview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    @JsonIgnore
    private Job job;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id")
    @JsonIgnore
    private CV cv;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false)
    private InterviewStatus status = InterviewStatus.NOT_STARTED;

    @Column(name = "overall_score", precision = 5, scale = 2)
    private java.math.BigDecimal overallScore;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @Column(name = "answered_questions")
    private Integer answeredQuestions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "ai_feedback", columnDefinition = "jsonb")
    private Map<String, Object> aiFeedback; // Overall feedback from AI

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @CreatedDate
    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;

    @LastModifiedDate
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @OneToMany(mappedBy = "mockInterview", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MockInterviewQuestion> questions;

    public enum InterviewStatus {
        NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED
    }
}
