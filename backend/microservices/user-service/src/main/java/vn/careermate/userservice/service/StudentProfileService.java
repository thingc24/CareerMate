package vn.careermate.userservice.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import vn.careermate.userservice.model.StudentProfile;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.StudentProfileRepository;
import vn.careermate.userservice.repository.UserRepository;
import vn.careermate.userservice.service.FileStorageService;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class StudentProfileService {

    @PersistenceContext
    private EntityManager entityManager;

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public StudentProfile getCurrentStudentProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        log.info("Getting current student profile. Authentication: {}, Name: {}", 
            auth != null ? "present" : "null",
            auth != null ? auth.getName() : "N/A");
        
        if (auth == null) {
            log.error("Authentication is null - user not authenticated");
            throw new RuntimeException("Authentication required. Please login first.");
        }
        
        if (auth.getName() == null) {
            log.error("Authentication name is null");
            throw new RuntimeException("Authentication name is null. Please login again.");
        }
        
        if ("anonymousUser".equals(auth.getName())) {
            log.error("User is anonymous - token may be missing or invalid");
            throw new RuntimeException("Authentication required. Please login first.");
        }
        
        try {
            String email = auth.getName();
            log.info("Looking up user with email: {}", email);
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> {
                        log.error("User not found in database for email: {}", email);
                        return new RuntimeException("User not found: " + email + ". Please register first.");
                    });

            log.info("Found user: {} (ID: {})", user.getEmail(), user.getId());

            StudentProfile profile = studentProfileRepository.findByUserId(user.getId())
                    .orElse(null);

            // Tạo profile mới nếu chưa có
            if (profile == null) {
                log.info("Creating default profile for user: {} (ID: {})", email, user.getId());
                profile = createDefaultProfile(user);
                log.info("Default profile created with ID: {}", profile.getId());
            } else {
                log.info("Found existing profile with ID: {}", profile.getId());
            }

            // Reload từ database để đảm bảo có data mới nhất (tránh cache)
            UUID profileId = profile.getId();
            entityManager.flush(); // Ensure any pending changes are saved
            entityManager.clear(); // Clear persistence context
            StudentProfile freshProfile = studentProfileRepository.findById(profileId)
                    .orElseThrow(() -> new RuntimeException("Profile not found: " + profileId));
            
            log.info("Profile reloaded from database. ID: {}, University: {}, Major: {}, City: {}, Address: {}, Gender: {}", 
                freshProfile.getId(), freshProfile.getUniversity(), freshProfile.getMajor(), 
                freshProfile.getCity(), freshProfile.getAddress(), freshProfile.getGender());

            // Detach entity khỏi persistence context để tránh cascade operations
            entityManager.detach(freshProfile);
            
            log.info("Profile detached from persistence context. ID: {}", freshProfile.getId());
            return freshProfile;
        } catch (RuntimeException e) {
            log.error("RuntimeException getting student profile: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error getting student profile", e);
            throw new RuntimeException("Error getting student profile: " + e.getMessage(), e);
        }
    }

    @Transactional
    private StudentProfile createDefaultProfile(User user) {
        StudentProfile profile = new StudentProfile();
        profile.setUser(user);
        profile.setCurrentStatus("STUDENT");
        return studentProfileRepository.save(profile);
    }

    @Transactional
    public StudentProfile updateProfile(StudentProfile profile) {
        try {
            // Get current profile WITHOUT detaching - we need it to be managed
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
                throw new RuntimeException("Authentication required. Please login first.");
            }
            
            String email = auth.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found: " + email));
            
            // Get existing profile - DO NOT detach, we need it managed
            StudentProfile existing = studentProfileRepository.findByUserId(user.getId())
                    .orElseThrow(() -> new RuntimeException("Profile not found for user: " + email));
            
            log.info("Updating profile ID: {}, current university: {}, new university: {}", 
                existing.getId(), existing.getUniversity(), profile.getUniversity());
            log.info("Profile update data - gender: {}, address: {}, city: {}, university: {}, major: {}", 
                profile.getGender(), profile.getAddress(), profile.getCity(), profile.getUniversity(), profile.getMajor());
            
            // Update all fields - allow null to clear fields
            existing.setDateOfBirth(profile.getDateOfBirth());
            existing.setGender(profile.getGender());
            existing.setAddress(profile.getAddress());
            existing.setCity(profile.getCity());
            existing.setCountry(profile.getCountry() != null ? profile.getCountry() : "Vietnam");
            existing.setUniversity(profile.getUniversity());
            existing.setMajor(profile.getMajor());
            existing.setGraduationYear(profile.getGraduationYear());
            existing.setGpa(profile.getGpa());
            existing.setBio(profile.getBio());
            existing.setLinkedinUrl(profile.getLinkedinUrl());
            existing.setGithubUrl(profile.getGithubUrl());
            existing.setPortfolioUrl(profile.getPortfolioUrl());
            existing.setAvatarUrl(profile.getAvatarUrl());
            existing.setCurrentStatus(profile.getCurrentStatus() != null ? profile.getCurrentStatus() : "STUDENT");
            
            log.info("After setting fields - gender: {}, address: {}, city: {}, university: {}, major: {}", 
                existing.getGender(), existing.getAddress(), existing.getCity(), existing.getUniversity(), existing.getMajor());
            
            // Save và flush để đảm bảo data được lưu vào database ngay lập tức
            log.info("Before save - existing profile: ID={}, University={}, Major={}, City={}, Address={}, Gender={}", 
                existing.getId(), existing.getUniversity(), existing.getMajor(), existing.getCity(), existing.getAddress(), existing.getGender());
            
            StudentProfile saved = studentProfileRepository.save(existing);
            entityManager.flush(); // Force write to database
            entityManager.clear(); // Clear persistence context để reload fresh data
            
            log.info("After save and flush - saved profile: ID={}, University={}, Major={}, City={}, Address={}, Gender={}", 
                saved.getId(), saved.getUniversity(), saved.getMajor(), saved.getCity(), saved.getAddress(), saved.getGender());
            
            // Reload từ database bằng cách query trực tiếp để đảm bảo có data mới nhất
            UUID profileId = saved.getId();
            StudentProfile freshData = studentProfileRepository.findById(profileId)
                    .orElseThrow(() -> new RuntimeException("Profile not found after save: " + profileId));
            
            log.info("After reload from DB - fresh profile: ID={}, University={}, Major={}, City={}, Address={}, Gender={}", 
                freshData.getId(), freshData.getUniversity(), freshData.getMajor(), freshData.getCity(), freshData.getAddress(), freshData.getGender());
            
            // Detach fresh data before returning
            entityManager.detach(freshData);
            
            return freshData;
        } catch (Exception e) {
            log.error("Error in updateProfile service", e);
            throw new RuntimeException("Failed to update profile: " + e.getMessage(), e);
        }
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

        // Update profile with avatar URL
        StudentProfile profile = getCurrentStudentProfile();
        // Delete old avatar if exists
        if (profile.getAvatarUrl() != null && !profile.getAvatarUrl().isEmpty()) {
            try {
                fileStorageService.deleteFile(profile.getAvatarUrl());
            } catch (Exception e) {
                log.warn("Could not delete old avatar: {}", e.getMessage());
            }
        }
        profile.setAvatarUrl(filePath);
        studentProfileRepository.save(profile);

        return filePath;
    }
}
