package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.model.Article;
import vn.careermate.model.User;
import vn.careermate.repository.ArticleRepository;
import vn.careermate.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;

    public Page<Article> getPublishedArticles(String keyword, String category, Pageable pageable) {
        return articleRepository.searchPublishedArticles(keyword, category, pageable);
    }

    public Article getArticleById(UUID articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        
        // Increment views
        article.setViewsCount(article.getViewsCount() + 1);
        articleRepository.save(article);
        
        return article;
    }

    @Transactional
    public Article createArticle(Article article) {
        User author = getCurrentUser();
        article.setAuthor(author);
        article.setStatus(Article.ArticleStatus.PENDING); // Needs admin approval
        return articleRepository.save(article);
    }

    @Transactional
    public Article updateArticle(UUID articleId, Article articleData) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        
        article.setTitle(articleData.getTitle());
        article.setContent(articleData.getContent());
        article.setExcerpt(articleData.getExcerpt());
        article.setCategory(articleData.getCategory());
        article.setTags(articleData.getTags());
        article.setThumbnailUrl(articleData.getThumbnailUrl());
        
        return articleRepository.save(article);
    }

    @Transactional
    public Article approveArticle(UUID articleId, UUID adminId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        
        article.setStatus(Article.ArticleStatus.PUBLISHED);
        article.setPublishedAt(LocalDateTime.now());
        article.setApprovedBy(userRepository.findById(adminId).orElse(null));
        article.setApprovedAt(LocalDateTime.now());
        
        return articleRepository.save(article);
    }

    @Transactional
    public Article rejectArticle(UUID articleId, UUID adminId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        
        article.setStatus(Article.ArticleStatus.REJECTED);
        article.setApprovedBy(userRepository.findById(adminId).orElse(null));
        article.setApprovedAt(LocalDateTime.now());
        
        return articleRepository.save(article);
    }

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

