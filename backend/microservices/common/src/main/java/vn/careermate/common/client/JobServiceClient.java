package vn.careermate.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import vn.careermate.common.dto.JobDTO;
import vn.careermate.common.dto.ApplicationDTO;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "job-service")
public interface JobServiceClient {
    @GetMapping("/jobs/{jobId}")
    JobDTO getJobById(@PathVariable UUID jobId);
    
    @GetMapping("/jobs")
    List<JobDTO> getJobsByRecruiter(@RequestParam UUID recruiterId);
    
    @GetMapping("/applications")
    List<ApplicationDTO> getApplicationsByStudent(@RequestParam UUID studentId);
    
    @GetMapping("/applications/{applicationId}")
    ApplicationDTO getApplicationById(@PathVariable UUID applicationId);
    
    @GetMapping("/saved-jobs")
    List<JobDTO> getSavedJobsByStudent(@RequestParam UUID studentId);
    
    @PostMapping("/saved-jobs")
    void saveJob(@RequestParam UUID studentId, @RequestParam UUID jobId);
    
    @DeleteMapping("/saved-jobs/{savedJobId}")
    void unsaveJob(@PathVariable UUID savedJobId);
}
