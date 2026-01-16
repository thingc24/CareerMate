package vn.careermate.userservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import vn.careermate.contentservice.model.Company;
import vn.careermate.userservice.dto.RecruiterProfileUpdateRequest;
import vn.careermate.userservice.model.RecruiterProfile;
import vn.careermate.userservice.service.RecruiterProfileService;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/recruiters")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RecruiterProfileController {

    private final RecruiterProfileService recruiterProfileService;

    @GetMapping("/profile")
    public ResponseEntity<RecruiterProfile> getMyProfile() {
        return ResponseEntity.ok(recruiterProfileService.getMyProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<RecruiterProfile> updateProfile(@RequestBody RecruiterProfileUpdateRequest request) {
        return ResponseEntity.ok(recruiterProfileService.updateProfile(
            request.getPosition(),
            request.getDepartment(),
            request.getPhone(),
            request.getBio()
        ));
    }

    @GetMapping("/company")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<?> getMyCompany() {
        try {
            Company company = recruiterProfileService.getMyCompany();
            if (company == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(company);
        } catch (Exception e) {
            log.error("Error getting company: {}", e.getMessage(), e);
            return ResponseEntity.status(400)
                .body(Map.of("error", "Error loading company: " + e.getMessage()));
        }
    }

    @PostMapping("/company")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Company> createOrUpdateCompany(@RequestBody Company company) {
        return ResponseEntity.ok(recruiterProfileService.createOrUpdateCompany(company));
    }

    @GetMapping("/by-user/{userId}")
    @PreAuthorize("permitAll()")
    public ResponseEntity<RecruiterProfile> getRecruiterByUserId(@PathVariable UUID userId) {
        RecruiterProfile profile = recruiterProfileService.getRecruiterByUserId(userId);
        if (profile == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/company/logo")
    @PreAuthorize("hasRole('RECRUITER')")
    public ResponseEntity<Map<String, String>> uploadCompanyLogo(@RequestParam("file") MultipartFile file) {
        try {
            String logoUrl = recruiterProfileService.uploadCompanyLogo(file);
            return ResponseEntity.ok(Map.of("logoUrl", logoUrl));
        } catch (RuntimeException e) {
            return ResponseEntity.status(400)
                .body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error uploading file: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Error uploading logo: " + e.getMessage()));
        }
    }
}
