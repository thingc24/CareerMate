package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.model.Article;
import vn.careermate.model.ArticleReaction;
import vn.careermate.userservice.model.User;
import vn.careermate.repository.ArticleReactionRepository;
import vn.careermate.repository.ArticleRepository;
import vn.careermate.userservice.repository.UserRepository;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ArticleReactionService {

    private final ArticleReactionRepository reactionRepository;
    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    @Transactional
    public ArticleReaction toggleReaction(UUID articleId, ArticleReaction.ReactionType reactionType) {
        User user = getCurrentUser();
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));

        Optional<ArticleReaction> existingReaction = reactionRepository.findByArticleIdAndUserId(articleId, user.getId());

        if (existingReaction.isPresent()) {
            ArticleReaction reaction = existingReaction.get();
            if (reaction.getReactionType() == reactionType) {
                // Remove reaction if clicking the same type
                reactionRepository.delete(reaction);
                updateArticleReactionsCount(articleId);
                return null;
            } else {
                // Update reaction type
                reaction.setReactionType(reactionType);
                return reactionRepository.save(reaction);
            }
        } else {
            // Create new reaction
            ArticleReaction reaction = ArticleReaction.builder()
                    .article(article)
                    .user(user)
                    .reactionType(reactionType)
                    .build();
            ArticleReaction saved = reactionRepository.save(reaction);
            updateArticleReactionsCount(articleId);
            return saved;
        }
    }

    public Map<ArticleReaction.ReactionType, Long> getReactionCounts(UUID articleId) {
        return Map.of(
            ArticleReaction.ReactionType.LIKE, reactionRepository.countByArticleIdAndReactionType(articleId, ArticleReaction.ReactionType.LIKE),
            ArticleReaction.ReactionType.LOVE, reactionRepository.countByArticleIdAndReactionType(articleId, ArticleReaction.ReactionType.LOVE),
            ArticleReaction.ReactionType.HAHA, reactionRepository.countByArticleIdAndReactionType(articleId, ArticleReaction.ReactionType.HAHA),
            ArticleReaction.ReactionType.WOW, reactionRepository.countByArticleIdAndReactionType(articleId, ArticleReaction.ReactionType.WOW),
            ArticleReaction.ReactionType.SAD, reactionRepository.countByArticleIdAndReactionType(articleId, ArticleReaction.ReactionType.SAD),
            ArticleReaction.ReactionType.ANGRY, reactionRepository.countByArticleIdAndReactionType(articleId, ArticleReaction.ReactionType.ANGRY)
        );
    }

    public ArticleReaction getUserReaction(UUID articleId) {
        User user = getCurrentUser();
        return reactionRepository.findByArticleIdAndUserId(articleId, user.getId()).orElse(null);
    }

    @Transactional
    private void updateArticleReactionsCount(UUID articleId) {
        Article article = articleRepository.findById(articleId).orElse(null);
        if (article != null) {
            long count = reactionRepository.countByArticleId(articleId);
            article.setReactionsCount((int) count);
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
