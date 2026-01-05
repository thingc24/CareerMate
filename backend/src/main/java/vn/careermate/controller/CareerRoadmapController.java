package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.careermate.model.CareerRoadmap;
import vn.careermate.repository.StudentProfileRepository;
import vn.careermate.repository.UserRepository;
import vn.careermate.service.CareerRoadmapService;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/students/roadmap")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class CareerRoadmapController {

    private final CareerRoadmapService roadmapService;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;

    @PostMapping("/generate")
    public ResponseEntity<CareerRoadmap> generateRoadmap(
            @RequestParam String careerGoal,
            @RequestParam(required = false, defaultValue = "BEGINNER") String currentLevel
    ) {
        UUID studentId = getCurrentStudentId();
        return ResponseEntity.ok(roadmapService.generateRoadmap(studentId, careerGoal, currentLevel));
    }

    @GetMapping
    public ResponseEntity<CareerRoadmap> getMyRoadmap() {
        UUID studentId = getCurrentStudentId();
        Optional<CareerRoadmap> roadmap = roadmapService.getStudentRoadmap(studentId);
        return roadmap.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{roadmapId}/progress")
    public ResponseEntity<CareerRoadmap> updateProgress(
            @PathVariable UUID roadmapId,
            @RequestParam Integer progressPercentage
    ) {
        return ResponseEntity.ok(roadmapService.updateProgress(roadmapId, progressPercentage));
    }

    private UUID getCurrentStudentId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UUID userId = userRepository.findByEmail(email)
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return studentProfileRepository.findByUserId(userId)
                .map(profile -> profile.getId())
                .orElseThrow(() -> new RuntimeException("Student profile not found"));
    }
}

