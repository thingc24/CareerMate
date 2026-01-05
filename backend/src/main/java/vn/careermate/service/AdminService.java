package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.model.Job;
import vn.careermate.model.User;
import vn.careermate.repository.JobRepository;
import vn.careermate.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    @Transactional
    public User updateUserStatus(UUID userId, User.UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(status);
        return userRepository.save(user);
    }

    @Transactional
    public Job approveJob(UUID jobId, UUID adminId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        job.setStatus(Job.JobStatus.ACTIVE);
        job.setApprovedBy(userRepository.findById(adminId).orElse(null));
        job.setApprovedAt(LocalDateTime.now());
        
        return jobRepository.save(job);
    }

    @Transactional
    public Job rejectJob(UUID jobId, UUID adminId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        
        job.setStatus(Job.JobStatus.REJECTED);
        job.setApprovedBy(userRepository.findById(adminId).orElse(null));
        job.setApprovedAt(LocalDateTime.now());
        
        return jobRepository.save(job);
    }

    public Page<Job> getPendingJobs(Pageable pageable) {
        return jobRepository.findByStatus(Job.JobStatus.PENDING, pageable);
    }
}

