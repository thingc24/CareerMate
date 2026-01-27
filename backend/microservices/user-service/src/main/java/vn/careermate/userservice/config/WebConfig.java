package vn.careermate.userservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @org.springframework.beans.factory.annotation.Value("${app.storage.local.path}")
    private String uploadPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Use the path configuration from application.yml
        // "file:" prefix handles both absolute and relative paths correctly
        String resourceLocation = "file:" + uploadPath + "/";
        // Handle windows path issue if needed (replace backslashes)
        
        System.out.println("====== WEB CONFIG: STATIC RESOURCES ======");
        System.out.println("Mapping /uploads/** to " + resourceLocation);
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(resourceLocation);

        // Map /users/uploads/** to the same location to handle Gateway forwarding
        registry.addResourceHandler("/users/uploads/**")
                .addResourceLocations(resourceLocation);
                
        // For testing/development
        registry.addResourceHandler("/test/**")
                .addResourceLocations("file:./");
    }
}
