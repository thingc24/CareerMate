package vn.careermate.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import vn.careermate.common.dto.JobDTO;
import vn.careermate.common.dto.ApplicationDTO;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "job-service")
public interface JobServiceClient {
    @GetMapping("/api/jobs/{jobId}")
    JobDTO getJobById(@PathVariable UUID jobId);
    
    @GetMapping("/api/jobs")
    List<JobDTO> getJobsByRecruiter(@RequestParam UUID recruiterId);
    
    @GetMapping("/api/applications")
    List<ApplicationDTO> getApplicationsByStudent(@RequestParam UUID studentId);
    
    @GetMapping("/api/applications/{applicationId}")
    ApplicationDTO getApplicationById(@PathVariable UUID applicationId);
    
    @GetMapping("/api/saved-jobs")
    List<JobDTO> getSavedJobsByStudent(@RequestParam UUID studentId);
    
    @PostMapping("/api/saved-jobs")
    void saveJob(@RequestParam UUID studentId, @RequestParam UUID jobId);
    
    @DeleteMapping("/api/saved-jobs/{savedJobId}")
    void unsaveJob(@PathVariable UUID savedJobId);
    
    // Admin endpoints (TODO: Implement in job-service)
    @PostMapping("/api/jobs/{jobId}/approve")
    JobDTO approveJob(@PathVariable UUID jobId, @RequestParam UUID adminId);
    
    @PostMapping("/api/jobs/{jobId}/reject")
    JobDTO rejectJob(@PathVariable UUID jobId, @RequestParam UUID adminId);
    
    @PostMapping("/api/jobs/{jobId}/hide")
    JobDTO hideJob(@PathVariable UUID jobId, @RequestParam UUID adminId, @RequestParam String reason);
    
    @PostMapping("/api/jobs/{jobId}/unhide")
    JobDTO unhideJob(@PathVariable UUID jobId, @RequestParam UUID adminId);
    
    @DeleteMapping("/api/jobs/{jobId}")
    void deleteJob(@PathVariable UUID jobId, @RequestParam UUID adminId, @RequestParam String reason);
    
    @GetMapping("/api/jobs/admin/all")
    List<JobDTO> getAllJobs(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    );
    
    @GetMapping("/api/jobs/admin/pending")
    List<JobDTO> getPendingJobs(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    );
    
    @GetMapping("/api/jobs/admin/count")
    Long getJobCount(@RequestParam(required = false) String status);
}
