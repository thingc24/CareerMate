package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.model.CareerRoadmap;
import vn.careermate.model.StudentProfile;
import vn.careermate.repository.CareerRoadmapRepository;
import vn.careermate.repository.StudentProfileRepository;

import java.util.*;

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

        CareerRoadmap roadmap = CareerRoadmap.builder()
                .student(student)
                .careerGoal(careerGoal)
                .currentLevel(currentLevel)
                .targetLevel("ADVANCED") // Default
                .roadmapData(roadmapData)
                .skillsGap((List<String>) roadmapData.getOrDefault("skillsGap", new ArrayList<>()))
                .recommendedCourses((List<Map<String, Object>>) roadmapData.getOrDefault("recommendedCourses", new ArrayList<>()))
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
        info.append("University: ").append(student.getUniversity() != null ? student.getUniversity() : "N/A").append("\n");
        info.append("Major: ").append(student.getMajor() != null ? student.getMajor() : "N/A").append("\n");
        info.append("Current Status: ").append(student.getCurrentStatus() != null ? student.getCurrentStatus() : "N/A").append("\n");
        
        if (student.getSkills() != null && !student.getSkills().isEmpty()) {
            info.append("Skills: ");
            student.getSkills().forEach(skill -> 
                info.append(skill.getSkillName()).append(" (").append(skill.getProficiencyLevel()).append("), ")
            );
        }
        
        return info.toString();
    }
}

