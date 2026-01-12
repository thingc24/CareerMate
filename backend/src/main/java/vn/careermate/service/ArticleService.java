package vn.careermate.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.careermate.dto.CreateArticleRequest;
import vn.careermate.model.Article;
import vn.careermate.model.RecruiterProfile;
import vn.careermate.model.User;
import vn.careermate.repository.ArticleRepository;
import vn.careermate.repository.RecruiterProfileRepository;
import vn.careermate.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final UserRepository userRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;

    public Page<Article> getPublishedArticles(String keyword, String category, Pageable pageable) {
        return articleRepository.searchPublishedArticles(keyword, category, pageable);
    }

    public Page<Article> getPendingArticles(Pageable pageable) {
        return articleRepository.findByStatusOrderByCreatedAtDesc(Article.ArticleStatus.PENDING, pageable);
    }

    public Page<Article> getAllArticles(String status, Pageable pageable) {
        if (status != null && !status.isEmpty()) {
            Article.ArticleStatus articleStatus = Article.ArticleStatus.valueOf(status.toUpperCase());
            return articleRepository.findByStatusOrderByCreatedAtDesc(articleStatus, pageable);
        }
        return articleRepository.findAll(pageable);
    }

    public Article getArticleById(UUID articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new RuntimeException("Article not found"));
        
        // Load author eagerly to avoid lazy loading issues
        article.getAuthor().getId();
        article.getAuthor().getFullName();
        article.getAuthor().getRole();
        
        // Increment views
        article.setViewsCount(article.getViewsCount() + 1);
        articleRepository.save(article);
        
        return article;
    }
    
    /**
     * Get author display name for article
     * - If recruiter: return company name or recruiter name
     * - If admin: return "Admin + admin name"
     */
    public String getAuthorDisplayName(Article article) {
        User author = article.getAuthor();
        if (author.getRole() == User.UserRole.ADMIN) {
            return "Admin " + author.getFullName();
        } else if (author.getRole() == User.UserRole.RECRUITER) {
            RecruiterProfile profile = recruiterProfileRepository.findByUserId(author.getId())
                    .orElse(null);
            if (profile != null && profile.getCompany() != null) {
                return profile.getCompany().getName();
            }
            return author.getFullName();
        }
        return author.getFullName();
    }

    @Transactional
    public Article createArticle(CreateArticleRequest request) {
        User author = getCurrentUser();
        
        Article article = Article.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .excerpt(request.getExcerpt())
                .category(request.getCategory())
                .tags(request.getTags())
                .thumbnailUrl(request.getThumbnailUrl())
                .author(author)
                .build();
        
        // Admin can publish directly, recruiter needs approval
        if (author.getRole() == User.UserRole.ADMIN) {
            article.setStatus(Article.ArticleStatus.PUBLISHED);
            article.setPublishedAt(LocalDateTime.now());
        } else if (author.getRole() == User.UserRole.RECRUITER) {
            article.setStatus(Article.ArticleStatus.PENDING); // Needs admin approval
        } else {
            throw new RuntimeException("Only ADMIN or RECRUITER can create articles");
        }
        
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

