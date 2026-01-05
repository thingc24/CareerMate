package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import vn.careermate.dto.RecruiterProfileUpdateRequest;
import vn.careermate.model.Application;
import vn.careermate.model.Company;
import vn.careermate.model.Job;
import vn.careermate.model.RecruiterProfile;
import vn.careermate.service.RecruiterService;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/recruiters")
@RequiredArgsConstructor
@PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class RecruiterController {

    private final RecruiterService recruiterService;

    @PostMapping("/jobs")
    public ResponseEntity<Job> createJob(
            @RequestBody Job job,
            @RequestParam(required = false) List<String> requiredSkills,
            @RequestParam(required = false) List<String> optionalSkills
    ) {
        return ResponseEntity.ok(recruiterService.createJob(job, requiredSkills, optionalSkills));
    }

    @GetMapping("/jobs")
    public ResponseEntity<Page<Job>> getMyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(recruiterService.getMyJobs(pageable));
    }

    @GetMapping("/jobs/{jobId}/applicants")
    public ResponseEntity<Page<Application>> getJobApplicants(
            @PathVariable UUID jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(recruiterService.getJobApplicants(jobId, pageable));
    }

    @PutMapping("/applications/{applicationId}/status")
    public ResponseEntity<Application> updateApplicationStatus(
            @PathVariable UUID applicationId,
            @RequestParam Application.ApplicationStatus status,
            @RequestParam(required = false) String notes
    ) {
        return ResponseEntity.ok(recruiterService.updateApplicationStatus(applicationId, status, notes));
    }

    @PostMapping("/applications/{applicationId}/interview")
    public ResponseEntity<Application> scheduleInterview(
            @PathVariable UUID applicationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime interviewTime
    ) {
        return ResponseEntity.ok(recruiterService.scheduleInterview(applicationId, interviewTime));
    }

    @GetMapping("/profile")
    public ResponseEntity<RecruiterProfile> getMyProfile() {
        return ResponseEntity.ok(recruiterService.getMyProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<RecruiterProfile> updateProfile(@RequestBody RecruiterProfileUpdateRequest request) {
        return ResponseEntity.ok(recruiterService.updateProfile(
            request.getPosition(),
            request.getDepartment(),
            request.getPhone(),
            request.getBio()
        ));
    }

    @GetMapping("/company")
    public ResponseEntity<Company> getMyCompany() {
        Company company = recruiterService.getMyCompany();
        if (company == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(company);
    }

    @PostMapping("/company")
    public ResponseEntity<Company> createOrUpdateCompany(@RequestBody Company company) {
        return ResponseEntity.ok(recruiterService.createOrUpdateCompany(company));
    }
}

