package vn.careermate.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.careermate.model.Article;

import java.util.List;
import java.util.UUID;

@Repository
public interface ArticleRepository extends JpaRepository<Article, UUID> {
    Page<Article> findByStatus(Article.ArticleStatus status, Pageable pageable);
    
    @Query("SELECT a FROM Article a WHERE a.status = 'PUBLISHED' AND " +
           "(:category IS NULL OR a.category = :category) AND " +
           "(:keyword IS NULL OR a.title LIKE %:keyword% OR a.content LIKE %:keyword%)")
    Page<Article> searchPublishedArticles(@Param("keyword") String keyword,
                                         @Param("category") String category,
                                         Pageable pageable);
    
    List<Article> findByAuthorId(UUID authorId);
}

