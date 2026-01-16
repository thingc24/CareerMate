package vn.careermate.userservice.service;

import lombok.RequiredArgsConstructor;
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
import vn.careermate.model.Company;
import vn.careermate.repository.CompanyRepository;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class RecruiterProfileService {

    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final FileStorageService fileStorageService;

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
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        Company company = recruiter.getCompany();
        if (company != null) {
            // Force load by accessing ID to trigger fetch
            company.getId();
            company.getName();
        }
        return company;
    }

    @Transactional
    public Company createOrUpdateCompany(Company company) {
        RecruiterProfile recruiter = getCurrentRecruiterProfile();
        
        // Force load company if it exists
        Company existingCompany = recruiter.getCompany();
        if (existingCompany != null) {
            // Force load by accessing ID
            existingCompany.getId();
        }
        
        if (existingCompany != null) {
            // Update existing company
            if (company.getName() != null) existingCompany.setName(company.getName());
            if (company.getWebsiteUrl() != null) existingCompany.setWebsiteUrl(company.getWebsiteUrl());
            if (company.getHeadquarters() != null) existingCompany.setHeadquarters(company.getHeadquarters());
            if (company.getDescription() != null) existingCompany.setDescription(company.getDescription());
            if (company.getCompanySize() != null) existingCompany.setCompanySize(company.getCompanySize());
            if (company.getIndustry() != null) existingCompany.setIndustry(company.getIndustry());
            if (company.getFoundedYear() != null) existingCompany.setFoundedYear(company.getFoundedYear());
            if (company.getLogoUrl() != null) existingCompany.setLogoUrl(company.getLogoUrl());
            company = companyRepository.save(existingCompany);
        } else {
            // Create new company
            company = companyRepository.save(company);
            // Link company to recruiter
            recruiter.setCompany(company);
            recruiterProfileRepository.save(recruiter);
            // Flush to ensure company_id is set
            recruiterProfileRepository.flush();
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
}
