package vn.careermate.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import vn.careermate.common.dto.UserDTO;
import vn.careermate.common.dto.RecruiterProfileDTO;
import vn.careermate.common.dto.StudentProfileDTO;

import java.util.List;
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
    
    // Student Profile endpoints
    @GetMapping("/students/profile/current")
    StudentProfileDTO getCurrentStudentProfile();
    
    @GetMapping("/students/profile/{studentId}")
    StudentProfileDTO getStudentProfileById(@PathVariable UUID studentId);
    
    @GetMapping("/students/profile/user/{userId}")
    StudentProfileDTO getStudentProfileByUserId(@PathVariable UUID userId);
    
    // Get users by roles (for notifications)
    @PostMapping("/users/by-roles")
    List<UserDTO> getUsersByRoles(@RequestBody List<String> roles);
}
