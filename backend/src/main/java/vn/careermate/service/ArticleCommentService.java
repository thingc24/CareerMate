package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.dto.ArticleCommentDTO;
import vn.careermate.model.Article;
import vn.careermate.model.ArticleComment;
import vn.careermate.userservice.model.User;
import vn.careermate.repository.ArticleCommentRepository;
import vn.careermate.repository.ArticleRepository;
import vn.careermate.userservice.repository.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleCommentService {

    private final ArticleCommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ArticleComment> getComments(UUID articleId) {
        try {
            System.out.println("=== ArticleCommentService.getComments for articleId: " + articleId + " ===");
            List<ArticleComment> comments = commentRepository.findByArticleIdAndParentCommentIsNullOrderByCreatedAtAsc(articleId);
            System.out.println("Found " + comments.size() + " top-level comments");
            
            // Load replies for each comment and force load all fields
            for (ArticleComment comment : comments) {
                try {
                    // Force load user and article
                    if (comment.getUser() != null) {
                        comment.getUser().getId();
                        comment.getUser().getFullName();
                        comment.getUser().getEmail();
                    }
                    if (comment.getArticle() != null) {
                        comment.getArticle().getId();
                        comment.getArticle().getTitle();
                    }
                    
                    // Force load parent comment if exists
                    if (comment.getParentComment() != null) {
                        comment.getParentComment().getId();
                    }
                    
                    List<ArticleComment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(comment.getId());
                    System.out.println("Comment " + comment.getId() + " has " + replies.size() + " replies");
                    
                    // Force load user and article for each reply, and ensure replies list is empty to avoid nested replies
                    for (ArticleComment reply : replies) {
                        try {
                            if (reply.getUser() != null) {
                                reply.getUser().getId();
                                reply.getUser().getFullName();
                                reply.getUser().getEmail();
                            }
                            if (reply.getArticle() != null) {
                                reply.getArticle().getId();
                            }
                            if (reply.getParentComment() != null) {
                                reply.getParentComment().getId();
                            }
                            // Clear nested replies to avoid circular reference
                            reply.setReplies(java.util.Collections.emptyList());
                        } catch (Exception e) {
                            System.err.println("Error loading reply " + reply.getId() + ": " + e.getMessage());
                            e.printStackTrace();
                        }
                    }
                    comment.setReplies(replies);
                } catch (Exception e) {
                    System.err.println("Error processing comment " + comment.getId() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            System.out.println("Successfully loaded " + comments.size() + " comments with replies");
            return comments;
        } catch (Exception e) {
            System.err.println("ERROR in getComments: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error loading comments: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<ArticleCommentDTO> getCommentsAsDTO(UUID articleId) {
        try {
            System.out.println("=== ArticleCommentService.getCommentsAsDTO for articleId: " + articleId + " ===");
            List<ArticleComment> comments = commentRepository.findByArticleIdAndParentCommentIsNullOrderByCreatedAtAsc(articleId);
            System.out.println("Found " + comments.size() + " top-level comments");
            
            // Load all replies recursively for each comment
            for (ArticleComment comment : comments) {
                try {
                    // Force load user and article
                    if (comment.getUser() != null) {
                        comment.getUser().getId();
                        comment.getUser().getFullName();
                        comment.getUser().getEmail();
                    }
                    if (comment.getArticle() != null) {
                        comment.getArticle().getId();
                    }
                    
                    // Load all nested replies recursively
                    loadRepliesRecursively(comment);
                } catch (Exception e) {
                    System.err.println("Error processing comment " + comment.getId() + ": " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            // Convert to DTOs
            List<ArticleCommentDTO> dtos = comments.stream()
                    .map(ArticleCommentDTO::fromEntity)
                    .collect(Collectors.toList());
            
            System.out.println("Successfully converted " + dtos.size() + " comments to DTOs");
            return dtos;
        } catch (Exception e) {
            System.err.println("ERROR in getCommentsAsDTO: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error loading comments: " + e.getMessage(), e);
        }
    }

    /**
     * Load all nested replies recursively for a comment
     */
    private void loadRepliesRecursively(ArticleComment comment) {
        List<ArticleComment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(comment.getId());
        System.out.println("Comment " + comment.getId() + " has " + replies.size() + " replies");
        
        // Force load user for each reply
        for (ArticleComment reply : replies) {
            if (reply.getUser() != null) {
                reply.getUser().getId();
                reply.getUser().getFullName();
                reply.getUser().getEmail();
            }
            if (reply.getArticle() != null) {
                reply.getArticle().getId();
            }
            
            // Recursively load nested replies
            loadRepliesRecursively(reply);
        }
        
        comment.setReplies(replies);
    }

    @Transactional
    public ArticleComment createComment(UUID articleId, String content, UUID parentCommentId) {
        try {
            User user = getCurrentUser();
            Article article = articleRepository.findById(articleId)
                    .orElseThrow(() -> new RuntimeException("Article not found"));

            ArticleComment comment = ArticleComment.builder()
                    .article(article)
                    .user(user)
                    .content(content)
                    .build();

            if (parentCommentId != null) {
                ArticleComment parent = commentRepository.findById(parentCommentId)
                        .orElseThrow(() -> new RuntimeException("Parent comment not found"));
                comment.setParentComment(parent);
            }

            ArticleComment saved = commentRepository.save(comment);
            
            // Force load user and article for serialization
            saved.getUser().getId();
            saved.getUser().getFullName();
            saved.getArticle().getId();
            
            updateArticleCommentsCount(articleId);
            return saved;
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public ArticleComment updateComment(UUID commentId, String content) {
        ArticleComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        User user = getCurrentUser();
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own comments");
        }

        comment.setContent(content);
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(UUID commentId) {
        ArticleComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        User user = getCurrentUser();
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own comments");
        }

        UUID articleId = comment.getArticle().getId();
        commentRepository.delete(comment);
        updateArticleCommentsCount(articleId);
    }

    @Transactional
    private void updateArticleCommentsCount(UUID articleId) {
        Article article = articleRepository.findById(articleId).orElse(null);
        if (article != null) {
            long count = commentRepository.countByArticleId(articleId);
            article.setCommentsCount((int) count);
            articleRepository.save(article);
        }
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
