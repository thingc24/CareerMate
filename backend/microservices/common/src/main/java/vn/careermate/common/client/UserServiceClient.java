package vn.careermate.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.common.dto.RecruiterProfileDTO;

import java.util.UUID;

@FeignClient(name = "user-service")
public interface UserServiceClient {
    @GetMapping("/users/{userId}")
    UserDTO getUserById(@PathVariable UUID userId);
    
    @GetMapping("/users/email/{email}")
    UserDTO getUserByEmail(@PathVariable String email);
    
    // Recruiter Profile endpoints
    @GetMapping("/recruiters/profile/current")
    RecruiterProfileDTO getCurrentRecruiterProfile();
    
    @GetMapping("/recruiters/profile/user/{userId}")
    RecruiterProfileDTO getRecruiterProfileByUserId(@PathVariable UUID userId);
    
    @GetMapping("/recruiters/profile/{recruiterId}")
    RecruiterProfileDTO getRecruiterProfileById(@PathVariable UUID recruiterId);
}
