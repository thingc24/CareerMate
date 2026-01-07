package vn.careermate.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.storage.local.path:./uploads}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files from uploads directory
        // Maps /uploads/** to the actual uploads directory on disk
        String uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize().toString();
        
        // Normalize path separators for Windows compatibility
        if (uploadDir.contains("\\")) {
            uploadDir = uploadDir.replace("\\", "/");
        }
        
        // Ensure path ends with /
        if (!uploadDir.endsWith("/")) {
            uploadDir += "/";
        }
        
        // Map /uploads/** to file system uploads directory
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:///" + uploadDir)
                .setCachePeriod(3600); // Cache for 1 hour
    }
}

