package vn.careermate.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    @Value("${app.storage.local.path:./uploads}")
    private String uploadPath;

    public String storeFile(MultipartFile file, String subdirectory) throws IOException {
        // Create directory if not exists
        Path uploadDir = Paths.get(uploadPath, subdirectory);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = uploadDir.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        log.info("File saved: {}", filePath.toString());
        
        // Return web-accessible relative path (e.g., /uploads/avatars/filename.jpg)
        // This path will be used in frontend to construct full URL: http://localhost:8080/uploads/avatars/filename.jpg
        String relativePath = "/uploads/" + subdirectory + "/" + fileName;
        
        log.info("Returning relative path for web: {}", relativePath);
        return relativePath;
    }

    public void deleteFile(String filePath) {
        try {
            Path path = Paths.get(filePath);
            if (Files.exists(path)) {
                Files.delete(path);
                log.info("File deleted: {}", filePath);
            }
        } catch (IOException e) {
            log.error("Error deleting file: {}", filePath, e);
        }
    }

    public boolean fileExists(String filePath) {
        return Files.exists(Paths.get(filePath));
    }

    /**
     * Resolve web path to actual file system path
     * Converts /uploads/cvs/filename.pdf to actual file system path
     */
    public String resolveFilePath(String webPath) {
        if (webPath == null || webPath.isEmpty()) {
            return null;
        }
        
        // If already an absolute path, return as is
        if (Paths.get(webPath).isAbsolute()) {
            return webPath;
        }
        
        // Remove leading slash if present (web path)
        String cleanPath = webPath.startsWith("/") ? webPath.substring(1) : webPath;
        
        // Remove "uploads/" prefix if present (already included in uploadPath)
        if (cleanPath.startsWith("uploads/")) {
            cleanPath = cleanPath.substring("uploads/".length());
        }
        
        // Resolve against uploadPath
        Path resolvedPath = Paths.get(uploadPath).resolve(cleanPath).normalize();
        
        log.info("Resolving web path '{}' to file system path '{}'", webPath, resolvedPath.toString());
        return resolvedPath.toString();
    }
}

