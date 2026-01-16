package vn.careermate.contentservice.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import vn.careermate.contentservice.dto.CreateArticleRequest;
import vn.careermate.contentservice.model.Article;
import vn.careermate.contentservice.model.ArticleComment;
import vn.careermate.contentservice.model.ArticleReaction;
import vn.careermate.userservice.repository.UserRepository;
import vn.careermate.contentservice.service.ArticleCommentService;
import vn.careermate.contentservice.service.ArticleReactionService;
import vn.careermate.contentservice.service.ArticleService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/articles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ArticleController {

    private final ArticleService articleService;
    private final ArticleReactionService reactionService;
    private final ArticleCommentService commentService;
    private final UserRepository userRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<Page<Article>> getPublishedArticles(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        try {
            log.info("=== ArticleController.getPublishedArticles ===");
            log.info("keyword: {}, category: {}, page: {}, size: {}", keyword, category, page, size);
            
            Pageable pageable = PageRequest.of(page, size);
            log.info("Calling articleService.getPublishedArticles...");
            
            Page<Article> articles = articleService.getPublishedArticles(keyword, category, pageable);
            
            log.info("Articles retrieved: {} total, {} in page", articles.getTotalElements(), articles.getContent().size());
            
            // Ensure author is properly initialized to avoid lazy loading issues during serialization
            articles.getContent().forEach(article -> {
                if (article.getAuthor() != null) {
                    // Force initialization of author fields including avatarUrl
                    try {
                        article.getAuthor().getId();
                        article.getAuthor().getFullName();
                        article.getAuthor().getEmail();
                        article.getAuthor().getRole();
                        article.getAuthor().getAvatarUrl(); // Ensure avatarUrl is loaded
                    } catch (Exception ex) {
                        log.warn("Error accessing author fields for article {}: {}", article.getId(), ex.getMessage());
                    }
                }
            });
            
            // Log first article if exists
            if (!articles.getContent().isEmpty()) {
                Article first = articles.getContent().get(0);
                log.info("First article: id={}, title={}, author={}", 
                    first.getId(), first.getTitle(), 
                    first.getAuthor() != null ? first.getAuthor().getFullName() : "null");
            }
            
            return ResponseEntity.ok(articles);
        } catch (Exception e) {
            log.error("ERROR in getPublishedArticles: {}", e.getMessage(), e);
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{articleId}")
    public ResponseEntity<Article> getArticle(@PathVariable UUID articleId) {
        return ResponseEntity.ok(articleService.getArticleById(articleId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<Article> createArticle(@RequestBody CreateArticleRequest request) {
        return ResponseEntity.ok(articleService.createArticle(request));
    }
    
    @GetMapping("/{articleId}/author-name")
    public ResponseEntity<String> getAuthorDisplayName(@PathVariable UUID articleId) {
        Article article = articleService.getArticleById(articleId);
        return ResponseEntity.ok(articleService.getAuthorDisplayName(article));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Article>> getPendingArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(articleService.getPendingArticles(pageable));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Article>> getAllArticles(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(articleService.getAllArticles(status, pageable));
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

    // Reactions endpoints
    @PostMapping("/{articleId}/reactions")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ArticleReaction> toggleReaction(
            @PathVariable UUID articleId,
            @RequestParam String reactionType
    ) {
        ArticleReaction.ReactionType type = ArticleReaction.ReactionType.valueOf(reactionType.toUpperCase());
        ArticleReaction reaction = reactionService.toggleReaction(articleId, type);
        if (reaction == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(reaction);
    }

    @GetMapping("/{articleId}/reactions")
    public ResponseEntity<Map<ArticleReaction.ReactionType, Long>> getReactionCounts(@PathVariable UUID articleId) {
        return ResponseEntity.ok(reactionService.getReactionCounts(articleId));
    }

    @GetMapping("/{articleId}/reactions/my")
    public ResponseEntity<ArticleReaction> getMyReaction(@PathVariable UUID articleId) {
        try {
            ArticleReaction reaction = reactionService.getUserReaction(articleId);
            if (reaction == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(reaction);
        } catch (Exception e) {
            log.error("Error getting my reaction: {}", e.getMessage(), e);
            return ResponseEntity.notFound().build();
        }
    }

    // Comments endpoints
    @GetMapping("/{articleId}/comments")
    public ResponseEntity<?> getComments(@PathVariable UUID articleId) {
        try {
            System.out.println("=== GET /articles/" + articleId + "/comments ===");
            // Use DTO to avoid serialization issues
            List<vn.careermate.contentservice.dto.ArticleCommentDTO> comments = commentService.getCommentsAsDTO(articleId);
            System.out.println("Found " + comments.size() + " comments");
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            System.err.println("ERROR in getComments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Page<Article>> getMyArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(articleService.getMyArticles(pageable));
    }

    @PostMapping("/{articleId}/comments")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ArticleComment> createComment(
            @PathVariable UUID articleId,
            @RequestBody java.util.Map<String, Object> request
    ) {
        try {
            String content = (String) request.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            UUID parentCommentId = null;
            if (request.get("parentCommentId") != null) {
                try {
                    parentCommentId = UUID.fromString(request.get("parentCommentId").toString());
                } catch (IllegalArgumentException e) {
                    // Invalid UUID format, treat as null
                    parentCommentId = null;
                }
            }
            return ResponseEntity.ok(commentService.createComment(articleId, content, parentCommentId));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ArticleComment> updateComment(
            @PathVariable UUID commentId,
            @RequestBody java.util.Map<String, String> request
    ) {
        return ResponseEntity.ok(commentService.updateComment(commentId, request.get("content")));
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}
