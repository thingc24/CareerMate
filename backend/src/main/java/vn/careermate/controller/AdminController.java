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
import vn.careermate.dto.AdminAnalytics;
import vn.careermate.dto.AdminDashboardStats;
import vn.careermate.learningservice.model.CVTemplate;
import vn.careermate.jobservice.model.Job;
import vn.careermate.learningservice.model.Package;
import vn.careermate.learningservice.model.Subscription;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.UserRepository;
import vn.careermate.service.AdminService;
import vn.careermate.learningservice.service.CVTemplateService;
import vn.careermate.learningservice.service.PackageService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final CVTemplateService cvTemplateService;
    private final PackageService packageService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<AdminDashboardStats> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getAllUsers(
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        if (role != null && !role.isEmpty()) {
            try {
                User.UserRole userRole = User.UserRole.valueOf(role.toUpperCase());
                return ResponseEntity.ok(adminService.getUsersByRole(userRole, pageable));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.ok(adminService.getAllUsers(pageable));
            }
        }
        return ResponseEntity.ok(adminService.getAllUsers(pageable));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable UUID userId,
            @RequestParam User.UserStatus status
    ) {
        return ResponseEntity.ok(adminService.updateUserStatus(userId, status));
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<Job>> getAllJobs(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        if (status != null && !status.isEmpty()) {
            try {
                Job.JobStatus jobStatus = Job.JobStatus.valueOf(status.toUpperCase());
                return ResponseEntity.ok(adminService.getJobsByStatus(jobStatus, pageable));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.ok(adminService.getAllJobs(pageable));
            }
        }
        return ResponseEntity.ok(adminService.getAllJobs(pageable));
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

    // CV Templates Management
    @GetMapping("/cv-templates")
    public ResponseEntity<List<CVTemplate>> getAllCVTemplates() {
        return ResponseEntity.ok(cvTemplateService.getAllTemplates(null));
    }

    @PostMapping("/cv-templates")
    public ResponseEntity<CVTemplate> createCVTemplate(@RequestBody CVTemplate template) {
        return ResponseEntity.ok(cvTemplateService.createTemplate(template));
    }

    @PutMapping("/cv-templates/{templateId}")
    public ResponseEntity<CVTemplate> updateCVTemplate(
            @PathVariable UUID templateId,
            @RequestBody CVTemplate template
    ) {
        return ResponseEntity.ok(cvTemplateService.updateTemplate(templateId, template));
    }

    @DeleteMapping("/cv-templates/{templateId}")
    public ResponseEntity<Void> deleteCVTemplate(@PathVariable UUID templateId) {
        cvTemplateService.deleteTemplate(templateId);
        return ResponseEntity.ok().build();
    }

    // Packages Management
    @GetMapping("/packages")
    public ResponseEntity<List<Package>> getAllPackages() {
        return ResponseEntity.ok(packageService.getAllPackages());
    }

    @PostMapping("/packages")
    public ResponseEntity<Package> createPackage(@RequestBody Package packageEntity) {
        return ResponseEntity.ok(packageService.createPackage(packageEntity));
    }

    @PutMapping("/packages/{packageId}")
    public ResponseEntity<Package> updatePackage(
            @PathVariable UUID packageId,
            @RequestBody Package packageEntity
    ) {
        return ResponseEntity.ok(packageService.updatePackage(packageId, packageEntity));
    }

    @DeleteMapping("/packages/{packageId}")
    public ResponseEntity<Void> deletePackage(@PathVariable UUID packageId) {
        packageService.deletePackage(packageId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<List<Subscription>> getAllSubscriptions() {
        return ResponseEntity.ok(packageService.getAllSubscriptions());
    }

    // Analytics
    @GetMapping("/analytics")
    public ResponseEntity<AdminAnalytics> getAnalytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }
}

