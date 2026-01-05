package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.careermate.model.Job;
import vn.careermate.model.User;
import vn.careermate.repository.UserRepository;
import vn.careermate.service.AdminService;

import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable UUID userId,
            @RequestParam User.UserStatus status
    ) {
        return ResponseEntity.ok(adminService.updateUserStatus(userId, status));
    }

    @GetMapping("/jobs/pending")
    public ResponseEntity<Page<Job>> getPendingJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(adminService.getPendingJobs(pageable));
    }

    @PostMapping("/jobs/{jobId}/approve")
    public ResponseEntity<Job> approveJob(@PathVariable UUID jobId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UUID adminId = userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        return ResponseEntity.ok(adminService.approveJob(jobId, adminId));
    }

    @PostMapping("/jobs/{jobId}/reject")
    public ResponseEntity<Job> rejectJob(@PathVariable UUID jobId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        UUID adminId = userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        return ResponseEntity.ok(adminService.rejectJob(jobId, adminId));
    }
}

