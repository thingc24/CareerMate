package vn.careermate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.oauth2.client.servlet.OAuth2ClientAutoConfiguration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication(
    exclude = {OAuth2ClientAutoConfiguration.class},
    scanBasePackages = {
        "vn.careermate.userservice",      // User Service - Văn Tân
        "vn.careermate.job.service",       // Job Service - Ngọc Thi (will be created)
        "vn.careermate.ai.service",        // AI Service - Anh Vũ (will be created)
        "vn.careermate.content.service",   // Content Service - Hiệu Hiệu (will be created)
        "vn.careermate.learning.service",  // Learning Service - Bảo Hân (will be created)
        "vn.careermate.common",            // Common code (will be created)
        "vn.careermate.config",            // Shared configs (if any remain at root)
        "vn.careermate.model",             // Models (remaining, will be moved to respective services)
        "vn.careermate.repository",        // Repositories (remaining, will be moved)
        "vn.careermate.service",           // Services (remaining, will be moved)
        "vn.careermate.controller",        // Controllers (remaining, will be moved)
        "vn.careermate.dto",               // DTOs (remaining, will be moved)
        "vn.careermate.util"               // Utilities
    }
)
@EnableJpaAuditing
@EnableAsync
@EnableScheduling
public class CareerMateApplication {

    public static void main(String[] args) {
        SpringApplication.run(CareerMateApplication.class, args);
    }
}

