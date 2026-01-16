package vn.careermate.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.userservice.model.User;
import vn.careermate.userservice.repository.UserRepository;

@Slf4j
@Component
@RequiredArgsConstructor
@Order(1) // Chạy đầu tiên
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        String adminEmail = "admin@careermate.vn";
        
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Admin user already exists: {}", adminEmail);
            return;
        }

        log.info("Creating default admin user...");
        
        // Tạo password hash đúng cách
        String passwordHash = passwordEncoder.encode("admin123");
        
        User admin = User.builder()
                .email(adminEmail)
                .passwordHash(passwordHash)
                .fullName("System Admin")
                .role(User.UserRole.ADMIN)
                .status(User.UserStatus.ACTIVE)
                .emailVerified(true)
                .build();

        userRepository.save(admin);
        log.info("Default admin user created successfully!");
        log.info("Email: {}", adminEmail);
        log.info("Password: admin123");
    }
}
