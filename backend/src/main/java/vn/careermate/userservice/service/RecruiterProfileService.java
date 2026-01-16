package vn.careermate.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.careermate.userservice.model.RecruiterProfile;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.RecruiterProfileRepository;
import vn.careermate.userservice.repository.UserRepository;
import vn.careermate.service.FileStorageService;
import vn.careermate.contentservice.model.Company;
import vn.careermate.contentservice.repository.CompanyRepository;
import vn.careermate.jobservice.model.Job;
import vn.careermate.jobservice.model.Application;
import vn.careermate.jobservice.repository.JobRepository;
import vn.careermate.jobservice.repository.ApplicationRepository;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecruiterProfileService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final FileStorageService fileStorageService;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    public RecruiterProfile getCurrentRecruiterProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return recruiterProfileRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    // Auto-create profile if it doesn't exist
                    RecruiterProfile profile = RecruiterProfile.builder()
                            .user(user)
                            .position("Nhà tuyển dụng")
                            .build();
                    return recruiterProfileRepository.save(profile);
                });
    }

    public RecruiterProfile getRecruiterByUserId(java.util.UUID userId) {
        return recruiterProfileRepository.findByUserId(userId).orElse(null);
    }

    public RecruiterProfile getMyProfile() {
        return getCurrentRecruiterProfile();
    }

    @Transactional
    public RecruiterProfile updateProfile(String position, String department, String phone, String bio) {
        RecruiterProfile profile = getCurrentRecruiterProfile();
        if (position != null) profile.setPosition(position);
        if (department != null) profile.setDepartment(department);
        if (phone != null) profile.setPhone(phone);
        if (bio != null) profile.setBio(bio);
        return recruiterProfileRepository.save(profile);
    }

    @Transactional(readOnly = true)
    public Company getMyCompany() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = auth.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            log.info("Getting company for user: {} (ID: {})", email, user.getId());
            
            // Use findByUserIdWithCompany directly to ensure company is loaded with JOIN FETCH
            Optional<RecruiterProfile> recruiterOpt = recruiterProfileRepository.findByUserIdWithCompany(user.getId());
            
            if (!recruiterOpt.isPresent()) {
                log.warn("Recruiter profile not found for user: {}", user.getId());
                return null;
            }
            
            RecruiterProfile recruiter = recruiterOpt.get();
            log.info("Found recruiter profile: {} (ID: {})", email, recruiter.getId());
            
            Company company = recruiter.getCompany();
            
            if (company != null) {
                // Force load by accessing ID and name to trigger fetch
                UUID companyId = company.getId();
                String companyName = company.getName();
                log.info("Found company for recruiter {}: id={}, name={}", recruiter.getId(), companyId, companyName);
            } else {
                log.warn("Recruiter {} does not have a company (company_id is null in database)", recruiter.getId());
            }
            return company;
        } catch (Exception e) {
            log.error("Error getting company: {}", e.getMessage(), e);
            throw new RuntimeException("Error loading company: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Company createOrUpdateCompany(Company company) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Use findByUserIdWithCompany to ensure company is loaded
        Optional<RecruiterProfile> recruiterOpt = recruiterProfileRepository.findByUserIdWithCompany(user.getId());
        RecruiterProfile recruiter = recruiterOpt.orElseThrow(() -> new RuntimeException("Recruiter profile not found"));
        
        log.info("Creating/updating company for recruiter: {} (ID: {})", email, recruiter.getId());
        
        // Check if company exists
        Company existingCompany = recruiter.getCompany();
        
        if (existingCompany != null) {
            // Update existing company
            log.info("Updating existing company: id={}, name={}", existingCompany.getId(), existingCompany.getName());
            if (company.getName() != null) existingCompany.setName(company.getName());
            if (company.getWebsiteUrl() != null) existingCompany.setWebsiteUrl(company.getWebsiteUrl());
            if (company.getHeadquarters() != null) existingCompany.setHeadquarters(company.getHeadquarters());
            if (company.getDescription() != null) existingCompany.setDescription(company.getDescription());
            if (company.getCompanySize() != null) existingCompany.setCompanySize(company.getCompanySize());
            if (company.getIndustry() != null) existingCompany.setIndustry(company.getIndustry());
            if (company.getFoundedYear() != null) existingCompany.setFoundedYear(company.getFoundedYear());
            if (company.getLogoUrl() != null) existingCompany.setLogoUrl(company.getLogoUrl());
            company = companyRepository.save(existingCompany);
            log.info("Company updated successfully: id={}, name={}", company.getId(), company.getName());
        } else {
            // Create new company
            log.info("Creating new company for recruiter");
            company = companyRepository.save(company);
            log.info("Company created: id={}, name={}", company.getId(), company.getName());
            
            // Link company to recruiter
            recruiter.setCompany(company);
            recruiterProfileRepository.save(recruiter);
            // Flush to ensure company_id is set in database
            recruiterProfileRepository.flush();
            log.info("Company linked to recruiter profile: recruiterId={}, companyId={}", recruiter.getId(), company.getId());
        }
        
        return company;
    }

    @Transactional
    public String uploadCompanyLogo(MultipartFile file) throws IOException {
        // Validate file type
        String contentType = file.getContentType();
        String fileName = file.getOriginalFilename();
        if (fileName == null || (contentType != null && !contentType.startsWith("image/"))) {
            throw new RuntimeException("Invalid file type. Only image files are allowed.");
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new RuntimeException("File size too large. Maximum size is 5MB.");
        }

        // Save file using FileStorageService
        String filePath = fileStorageService.storeFile(file, "company-logos");

        // Update company with logo URL
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        Company company = recruiter.getCompany();
        
        if (company == null) {
            throw new RuntimeException("Company not found. Please create company profile first.");
        }

        // Delete old logo if exists
        if (company.getLogoUrl() != null && !company.getLogoUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(company.getLogoUrl());
            } catch (Exception e) {
                // Log warning but continue
            }
        }
        
        company.setLogoUrl(filePath);
        companyRepository.save(company);

        return filePath;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        UUID recruiterId = recruiter.getId();
        
        // Count active jobs
        long activeJobsCount = jobRepository.countByRecruiterIdAndStatus(recruiterId, Job.JobStatus.ACTIVE);
        
        // Count new applications (PENDING status)
        long newApplicationsCount = applicationRepository.countByJobRecruiterIdAndStatus(
            recruiterId, Application.ApplicationStatus.PENDING);
        
        // Count upcoming interviews (INTERVIEW status with scheduled time in future)
        long upcomingInterviewsCount = applicationRepository.countUpcomingInterviewsByRecruiter(
            recruiterId, LocalDateTime.now());
        
        // Count successful hires (OFFERED status)
        long successfulHiresCount = applicationRepository.countByJobRecruiterIdAndStatus(
            recruiterId, Application.ApplicationStatus.OFFERED);
        
        return Map.of(
            "activeJobs", activeJobsCount,
            "newApplications", newApplicationsCount,
            "upcomingInterviews", upcomingInterviewsCount,
            "successfulHires", successfulHiresCount
        );
    }
}
