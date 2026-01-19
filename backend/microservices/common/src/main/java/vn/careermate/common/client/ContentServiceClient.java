package vn.careermate.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;
import vn.careermate.common.dto.CompanyDTO;
import vn.careermate.common.dto.ArticleDTO;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "content-service")
public interface ContentServiceClient {
    @GetMapping("/api/companies/{companyId}")
    CompanyDTO getCompanyById(@PathVariable UUID companyId);
    
    @GetMapping("/api/companies")
    List<CompanyDTO> getAllCompanies();
    
    // Article endpoints
    @GetMapping("/api/articles/{articleId}")
    ArticleDTO getArticleById(@PathVariable UUID articleId);
    
    @GetMapping("/api/articles/admin/all")
    List<ArticleDTO> getAllArticles(
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    );
    
    @GetMapping("/api/articles/admin/pending")
    List<ArticleDTO> getPendingArticles(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    );
    
    // Admin endpoints (TODO: Implement in content-service)
    @PostMapping("/api/articles/{articleId}/approve")
    ArticleDTO approveArticle(@PathVariable UUID articleId, @RequestParam UUID adminId);
    
    @PostMapping("/api/articles/{articleId}/reject")
    ArticleDTO rejectArticle(@PathVariable UUID articleId, @RequestParam UUID adminId);
    
    @PostMapping("/api/articles/{articleId}/hide")
    ArticleDTO hideArticle(@PathVariable UUID articleId, @RequestParam UUID adminId, @RequestParam String reason);
    
    @PostMapping("/api/articles/{articleId}/unhide")
    ArticleDTO unhideArticle(@PathVariable UUID articleId, @RequestParam UUID adminId);
    
    @DeleteMapping("/api/articles/{articleId}")
    void deleteArticle(@PathVariable UUID articleId, @RequestParam UUID adminId, @RequestParam String reason);
    
    @GetMapping("/api/articles/admin/count")
    Long getArticleCount(@RequestParam(required = false) String status);
    
    @GetMapping("/api/companies/admin/count")
    Long getCompanyCount();
}
