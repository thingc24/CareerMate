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
import vn.careermate.dto.CreateArticleRequest;
import vn.careermate.model.Article;
import vn.careermate.model.ArticleComment;
import vn.careermate.model.ArticleReaction;
import vn.careermate.repository.UserRepository;
import vn.careermate.service.ArticleCommentService;
import vn.careermate.service.ArticleReactionService;
import vn.careermate.service.ArticleService;

import java.util.List;
import java.util.Map;
import java.util.UUID;

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
    @PreAuthorize("hasRole('STUDENT')")
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
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ArticleReaction> getMyReaction(@PathVariable UUID articleId) {
        ArticleReaction reaction = reactionService.getUserReaction(articleId);
        if (reaction == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(reaction);
    }

    // Comments endpoints
    @GetMapping("/{articleId}/comments")
    public ResponseEntity<List<ArticleComment>> getComments(@PathVariable UUID articleId) {
        return ResponseEntity.ok(commentService.getComments(articleId));
    }

    @PostMapping("/{articleId}/comments")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ArticleComment> createComment(
            @PathVariable UUID articleId,
            @RequestBody java.util.Map<String, Object> request
    ) {
        String content = (String) request.get("content");
        UUID parentCommentId = request.get("parentCommentId") != null 
            ? UUID.fromString(request.get("parentCommentId").toString()) 
            : null;
        return ResponseEntity.ok(commentService.createComment(articleId, content, parentCommentId));
    }

    @PutMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ArticleComment> updateComment(
            @PathVariable UUID commentId,
            @RequestBody java.util.Map<String, String> request
    ) {
        return ResponseEntity.ok(commentService.updateComment(commentId, request.get("content")));
    }

    @DeleteMapping("/comments/{commentId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}

