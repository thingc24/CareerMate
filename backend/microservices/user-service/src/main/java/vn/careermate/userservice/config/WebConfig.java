package vn.careermate.userservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Path without trailing slash
        String path = "C:/xampp/htdocs/CareerMate/backend/uploads";
        
        System.out.println("====== WEB CONFIG: STATIC RESOURCES ======");
        System.out.println("Mapping /uploads/** to file:///" + path + "/");
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:///" + path + "/");
                
        registry.addResourceHandler("/test/**")
                .addResourceLocations("file:./");
    }
}
