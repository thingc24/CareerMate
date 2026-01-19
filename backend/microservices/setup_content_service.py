#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to setup Content-Service for microservice architecture
Similar to job-service setup
"""

import os
import shutil
import sys
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent.parent
MONOLITH_SRC = BASE_DIR / "backend" / "src" / "main" / "java" / "vn" / "careermate"
CONTENT_SERVICE_SRC = BASE_DIR / "backend" / "microservices" / "content-service" / "src" / "main" / "java" / "vn" / "careermate" / "contentservice"

# Files to copy
FILES_TO_COPY = {
    "contentservice/model": ["Company.java", "CompanyRating.java", "Article.java", "ArticleReaction.java", "ArticleComment.java"],
    "contentservice/repository": ["CompanyRepository.java", "CompanyRatingRepository.java", "ArticleRepository.java", "ArticleReactionRepository.java", "ArticleCommentRepository.java"],
    "contentservice/service": ["CompanyService.java", "CompanyRatingService.java", "ArticleService.java", "ArticleReactionService.java", "ArticleCommentService.java"],
    "contentservice/controller": ["CompanyController.java", "CompanyRatingController.java", "ArticleController.java"],
    "contentservice/dto": ["CompanyDTO.java", "CreateArticleRequest.java", "ArticleCommentDTO.java"],
    "contentservice/database": ["schema.sql"]
}

def copy_files():
    """Copy files from monolith to content-service"""
    sys.stdout.buffer.write(("=" * 60 + "\n").encode('utf-8'))
    sys.stdout.buffer.write("Copying files from monolith to content-service...\n".encode('utf-8'))
    sys.stdout.buffer.write(("=" * 60 + "\n").encode('utf-8'))
    
    copied = 0
    skipped = 0
    
    for relative_path, files in FILES_TO_COPY.items():
        source_dir = MONOLITH_SRC / relative_path
        target_dir = CONTENT_SERVICE_SRC / relative_path
        
        # Create target directory
        target_dir.mkdir(parents=True, exist_ok=True)
        
        for file in files:
            source_file = source_dir / file
            target_file = target_dir / file
            
            if source_file.exists():
                shutil.copy2(source_file, target_file)
                sys.stdout.buffer.write(f"[OK] Copied: {relative_path}/{file}\n".encode('utf-8'))
                copied += 1
            else:
                sys.stdout.buffer.write(f"[SKIP] Not found: {relative_path}/{file}\n".encode('utf-8'))
                skipped += 1
    
    sys.stdout.buffer.write(f"\nCopied: {copied} files\n".encode('utf-8'))
    sys.stdout.buffer.write(f"Skipped: {skipped} files\n".encode('utf-8'))
    return copied > 0

def refactor_entities():
    """Refactor entities to remove cross-service dependencies"""
    sys.stdout.buffer.write(("\n" + "=" * 60 + "\n").encode('utf-8'))
    sys.stdout.buffer.write("Refactoring entities to remove cross-service dependencies...\n".encode('utf-8'))
    sys.stdout.buffer.write(("=" * 60 + "\n").encode('utf-8'))
    
    # Article.java - Replace User author and approvedBy with UUIDs
    article_file = CONTENT_SERVICE_SRC / "model" / "Article.java"
    if article_file.exists():
        content = article_file.read_text(encoding='utf-8')
        
        # Replace imports
        content = content.replace(
            "import vn.careermate.userservice.model.User;",
            "// import vn.careermate.userservice.model.User; // Replaced with UUID"
        )
        
        # Replace author field
        content = content.replace(
            "@ManyToOne(fetch = FetchType.EAGER)\n    @JoinColumn(name = \"author_id\", nullable = false)\n    private User author;",
            "@Column(name = \"author_id\", nullable = false)\n    private UUID authorId;"
        )
        
        # Replace approvedBy field
        content = content.replace(
            "@ManyToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = \"approved_by\")\n    @JsonIgnore\n    private User approvedBy;",
            "@Column(name = \"approved_by\")\n    private UUID approvedBy;"
        )
        
        article_file.write_text(content, encoding='utf-8')
        sys.stdout.buffer.write("[OK] Refactored Article.java\n".encode('utf-8'))
    
    # CompanyRating.java - Replace StudentProfile with UUID
    company_rating_file = CONTENT_SERVICE_SRC / "model" / "CompanyRating.java"
    if company_rating_file.exists():
        content = company_rating_file.read_text(encoding='utf-8')
        
        # Replace imports
        content = content.replace(
            "import vn.careermate.userservice.model.StudentProfile;",
            "// import vn.careermate.userservice.model.StudentProfile; // Replaced with UUID"
        )
        
        # Replace student field
        content = content.replace(
            "@ManyToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = \"student_id\", nullable = false)\n    private StudentProfile student;",
            "@Column(name = \"student_id\", nullable = false)\n    private UUID studentId;"
        )
        
        company_rating_file.write_text(content, encoding='utf-8')
        sys.stdout.buffer.write("[OK] Refactored CompanyRating.java\n".encode('utf-8'))
    
    # ArticleReaction.java - Replace User with UUID
    article_reaction_file = CONTENT_SERVICE_SRC / "model" / "ArticleReaction.java"
    if article_reaction_file.exists():
        content = article_reaction_file.read_text(encoding='utf-8')
        
        # Replace imports
        content = content.replace(
            "import vn.careermate.userservice.model.User;",
            "// import vn.careermate.userservice.model.User; // Replaced with UUID"
        )
        
        # Replace user field
        content = content.replace(
            "@ManyToOne(fetch = FetchType.EAGER)\n    @JoinColumn(name = \"user_id\", nullable = false)\n    private User user;",
            "@Column(name = \"user_id\", nullable = false)\n    private UUID userId;"
        )
        
        article_reaction_file.write_text(content, encoding='utf-8')
        sys.stdout.buffer.write("[OK] Refactored ArticleReaction.java\n".encode('utf-8'))
    
    # ArticleComment.java - Replace User with UUID
    article_comment_file = CONTENT_SERVICE_SRC / "model" / "ArticleComment.java"
    if article_comment_file.exists():
        content = article_comment_file.read_text(encoding='utf-8')
        
        # Replace imports
        content = content.replace(
            "import vn.careermate.userservice.model.User;",
            "// import vn.careermate.userservice.model.User; // Replaced with UUID"
        )
        
        # Replace user field
        content = content.replace(
            "@ManyToOne(fetch = FetchType.EAGER)\n    @JoinColumn(name = \"user_id\", nullable = false)\n    private User user;",
            "@Column(name = \"user_id\", nullable = false)\n    private UUID userId;"
        )
        
        article_comment_file.write_text(content, encoding='utf-8')
        sys.stdout.buffer.write("[OK] Refactored ArticleComment.java\n".encode('utf-8'))

def main():
    sys.stdout.buffer.write("Content-Service Setup Script\n".encode('utf-8'))
    sys.stdout.buffer.write(("=" * 60 + "\n").encode('utf-8'))
    
    if copy_files():
        refactor_entities()
        sys.stdout.buffer.write(("\n" + "=" * 60 + "\n").encode('utf-8'))
        sys.stdout.buffer.write("[OK] Content-Service setup completed!\n".encode('utf-8'))
        sys.stdout.buffer.write(("=" * 60 + "\n").encode('utf-8'))
        sys.stdout.buffer.write("\nNext steps:\n".encode('utf-8'))
        sys.stdout.buffer.write("1. Update pom.xml to add common module dependency\n".encode('utf-8'))
        sys.stdout.buffer.write("2. Refactor services to use Feign Clients\n".encode('utf-8'))
        sys.stdout.buffer.write("3. Create database: content_service_db\n".encode('utf-8'))
        sys.stdout.buffer.write("4. Update application.yml\n".encode('utf-8'))
        sys.stdout.buffer.write("5. Migrate data\n".encode('utf-8'))
    else:
        sys.stdout.buffer.write("\n[ERROR] No files copied. Please check paths.\n".encode('utf-8'))

if __name__ == "__main__":
    main()
