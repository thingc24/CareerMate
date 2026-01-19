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
import vn.careermate.userservice.service.FileStorageService;
import vn.careermate.common.client.ContentServiceClient;
import vn.careermate.common.client.JobServiceClient;
import vn.careermate.common.dto.CompanyDTO;

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
    private final FileStorageService fileStorageService;
    // Feign Clients for inter-service communication
    private final ContentServiceClient contentServiceClient;
    private final JobServiceClient jobServiceClient;

    @Transactional(readOnly = true)
    public RecruiterProfile getCurrentRecruiterProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Use JOIN FETCH to load user eagerly
        RecruiterProfile profile = recruiterProfileRepository.findByUserIdWithUser(user.getId())
                .orElseGet(() -> {
                    // Auto-create profile if it doesn't exist
                    RecruiterProfile newProfile = RecruiterProfile.builder()
                            .user(user)
                            .position("Nhà tuyển dụng")
                            .build();
                    RecruiterProfile saved = recruiterProfileRepository.save(newProfile);
                    // Reload with JOIN FETCH to ensure user is loaded
                    return recruiterProfileRepository.findByUserIdWithUser(user.getId())
                            .orElse(saved);
                });
        
        // Force load user fields to ensure they're initialized
        if (profile.getUser() != null) {
            profile.getUser().getId();
            profile.getUser().getFullName();
            profile.getUser().getEmail();
            profile.getUser().getAvatarUrl();
        }
        
        return profile;
    }

    public RecruiterProfile getRecruiterByUserId(java.util.UUID userId) {
        return recruiterProfileRepository.findByUserId(userId).orElse(null);
    }
    
    public RecruiterProfile getRecruiterProfileById(UUID recruiterId) {
        return recruiterProfileRepository.findById(recruiterId).orElse(null);
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

    // TODO: Refactor to use ContentServiceClient.getCompanyById() when content-service is ready
    @Transactional(readOnly = true)
    public CompanyDTO getMyCompany() {
        log.warn("getMyCompany() is not available in microservice architecture. Use content-service endpoints directly.");
        // Fetch companyId from RecruiterProfile and use ContentServiceClient
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        if (recruiter.getCompanyId() == null) {
            return null;
        }
        try {
            CompanyDTO companyDTO = contentServiceClient.getCompanyById(recruiter.getCompanyId());
            // Convert DTO to Company entity if needed, or return DTO
            // For now, return null as Company entity is in content-service
            log.warn("Company info should be fetched from content-service. Company ID: {}", recruiter.getCompanyId());
            return null;
        } catch (Exception e) {
            log.error("Error fetching company from content-service: {}", e.getMessage());
            return null;
        }
        
        /* Original implementation - commented for microservice refactoring
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
        */
    }

    // TODO: Refactor to use ContentServiceClient.createOrUpdateCompany() when content-service is ready
    @Transactional
    public CompanyDTO createOrUpdateCompany(CompanyDTO companyDTO) {
        log.warn("createOrUpdateCompany() is not available in microservice architecture. Use content-service endpoints directly.");
        throw new RuntimeException("Company management has been moved to content-service. Please use /api/companies endpoint.");
        
        /* Original implementation - commented for microservice refactoring
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
        */
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

        // Update company with logo URL via content-service
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        UUID companyId = recruiter.getCompanyId();
        
        if (companyId == null) {
            throw new RuntimeException("Company not found. Please create company profile first.");
        }

        // TODO: Update company logo via ContentServiceClient
        // For now, just return the file path - content-service should handle logo update
        log.warn("Company logo update should be handled by content-service. Company ID: {}, Logo URL: {}", companyId, filePath);
        
        /* Original implementation - commented for microservice refactoring
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
        */

        return filePath;
    }

    // TODO: Refactor to use JobServiceClient.getDashboardStats() when job-service is ready
    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardStats() {
        log.warn("getDashboardStats() is not available in microservice architecture. Use job-service endpoints directly.");
        // Return empty stats - should be fetched from job-service
        return Map.of(
            "activeJobs", 0L,
            "newApplications", 0L,
            "upcomingInterviews", 0L,
            "successfulHires", 0L
        );
        
        /* Original implementation - commented for microservice refactoring
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
        */
    }

    @Transactional
    public User updateFullName(String fullName) {
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        User user = recruiter.getUser();
        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName.trim());
            return userRepository.save(user);
        }
        return user;
    }

    @Transactional
    public String uploadAvatar(MultipartFile file) throws IOException {
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
        String filePath = fileStorageService.storeFile(file, "avatars");

        // Update user avatar URL
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        User user = recruiter.getUser();
        
        // Delete old avatar if exists
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(user.getAvatarUrl());
            } catch (Exception e) {
                log.warn("Could not delete old avatar: {}", e.getMessage());
            }
        }
        
        user.setAvatarUrl(filePath);
        userRepository.save(user);

        return filePath;
    }
}
