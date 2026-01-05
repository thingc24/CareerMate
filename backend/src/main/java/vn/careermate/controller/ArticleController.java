package vn.careermate.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import vn.careermate.model.Article;
import vn.careermate.repository.UserRepository;
import vn.careermate.service.ArticleService;

import java.util.UUID;

@RestController
@RequestMapping("/articles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ArticleController {

    private final ArticleService articleService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<Article>> getPublishedArticles(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(articleService.getPublishedArticles(keyword, category, pageable));
    }

    @GetMapping("/{articleId}")
    public ResponseEntity<Article> getArticle(@PathVariable UUID articleId) {
        return ResponseEntity.ok(articleService.getArticleById(articleId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<Article> createArticle(@RequestBody Article article) {
        return ResponseEntity.ok(articleService.createArticle(article));
    }

    @PutMapping("/{articleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Article> updateArticle(
            @PathVariable UUID articleId,
            @RequestBody Article article
    ) {
        return ResponseEntity.ok(articleService.updateArticle(articleId, article));
    }

    @PostMapping("/{articleId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Article> approveArticle(@PathVariable UUID articleId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID adminId = userRepository.findByEmail(auth.getName())
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        return ResponseEntity.ok(articleService.approveArticle(articleId, adminId));
    }

    @PostMapping("/{articleId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Article> rejectArticle(@PathVariable UUID articleId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID adminId = userRepository.findByEmail(auth.getName())
                .map(user -> user.getId())
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        return ResponseEntity.ok(articleService.rejectArticle(articleId, adminId));
    }
}

