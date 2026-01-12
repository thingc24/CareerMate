package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.model.Article;
import vn.careermate.model.ArticleComment;
import vn.careermate.model.User;
import vn.careermate.repository.ArticleCommentRepository;
import vn.careermate.repository.ArticleRepository;
import vn.careermate.repository.UserRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ArticleCommentService {

    private final ArticleCommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    public List<ArticleComment> getComments(UUID articleId) {
        List<ArticleComment> comments = commentRepository.findByArticleIdAndParentCommentIsNullOrderByCreatedAtAsc(articleId);
        // Load replies for each comment
        comments.forEach(comment -> {
            List<ArticleComment> replies = commentRepository.findByParentCommentIdOrderByCreatedAtAsc(comment.getId());
            comment.setReplies(replies);
        });
        return comments;
    }

    @Transactional
    public ArticleComment createComment(UUID articleId, String content, UUID parentCommentId) {
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
        updateArticleCommentsCount(articleId);
        return saved;
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
