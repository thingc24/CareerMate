package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.model.CareerRoadmap;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.repository.CareerRoadmapRepository;
import vn.careermate.userservice.repository.StudentProfileRepository;

import java.util.*;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CareerRoadmapService {

    private final CareerRoadmapRepository roadmapRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final AIService aiService;

    @Transactional
    public CareerRoadmap generateRoadmap(UUID studentId, String careerGoal, String currentLevel) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // Use AI to generate personalized roadmap
        String studentInfo = buildStudentInfo(student);
        Map<String, Object> roadmapData = aiService.getCareerRoadmap(studentInfo, careerGoal);

        @SuppressWarnings("unchecked")
        List<String> skillsGap = (List<String>) roadmapData.getOrDefault("skillsGap", new ArrayList<>());
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> recommendedCourses = (List<Map<String, Object>>) roadmapData.getOrDefault("recommendedCourses", new ArrayList<>());
        
        CareerRoadmap roadmap = CareerRoadmap.builder()
                .student(student)
                .careerGoal(careerGoal)
                .currentLevel(currentLevel)
                .targetLevel("ADVANCED") // Default
                .roadmapData(roadmapData)
                .skillsGap(skillsGap)
                .recommendedCourses(recommendedCourses)
                .estimatedDurationMonths((Integer) roadmapData.getOrDefault("estimatedDurationMonths", 6))
                .progressPercentage(0)
                .build();

        return roadmapRepository.save(roadmap);
    }

    public Optional<CareerRoadmap> getStudentRoadmap(UUID studentId) {
        return roadmapRepository.findByStudentId(studentId);
    }

    @Transactional
    public CareerRoadmap updateProgress(UUID roadmapId, Integer progressPercentage) {
        CareerRoadmap roadmap = roadmapRepository.findById(roadmapId)
                .orElseThrow(() -> new RuntimeException("Roadmap not found"));

        roadmap.setProgressPercentage(progressPercentage);
        return roadmapRepository.save(roadmap);
    }

    private String buildStudentInfo(StudentProfile student) {
        StringBuilder info = new StringBuilder();
        info.append("=== THÔNG TIN SINH VIÊN ===\n");
        info.append("Trường đại học: ").append(student.getUniversity() != null ? student.getUniversity() : "Chưa cập nhật").append("\n");
        info.append("Chuyên ngành: ").append(student.getMajor() != null ? student.getMajor() : "Chưa cập nhật").append("\n");
        info.append("Năm tốt nghiệp: ").append(student.getGraduationYear() != null ? student.getGraduationYear() : "Chưa xác định").append("\n");
        info.append("GPA: ").append(student.getGpa() != null ? student.getGpa() : "Chưa cập nhật").append("\n");
        info.append("Trạng thái hiện tại: ").append(student.getCurrentStatus() != null ? student.getCurrentStatus() : "STUDENT").append("\n");
        
        if (student.getBio() != null && !student.getBio().trim().isEmpty()) {
            info.append("Giới thiệu: ").append(student.getBio()).append("\n");
        }
        
        if (student.getSkills() != null && !student.getSkills().isEmpty()) {
            info.append("\n=== KỸ NĂNG HIỆN TẠI ===\n");
            student.getSkills().forEach(skill -> {
                info.append("- ").append(skill.getSkillName());
                if (skill.getProficiencyLevel() != null) {
                    info.append(" (Mức độ: ").append(skill.getProficiencyLevel()).append(")");
                }
                if (skill.getYearsOfExperience() != null) {
                    info.append(" - Kinh nghiệm: ").append(skill.getYearsOfExperience()).append(" năm");
                }
                info.append("\n");
            });
        } else {
            info.append("\nKỹ năng: Chưa cập nhật\n");
        }
        
        // Add CV information if available
        if (student.getCvs() != null && !student.getCvs().isEmpty()) {
            info.append("\n=== CV ===\n");
            info.append("Đã có ").append(student.getCvs().size()).append(" CV trong hệ thống\n");
        }
        
        return info.toString();
    }
}

