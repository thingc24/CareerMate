#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to setup Job-Service for microservice architecture
Similar to user-service setup
"""

import os
import shutil
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent.parent
MONOLITH_SRC = BASE_DIR / "backend" / "src" / "main" / "java" / "vn" / "careermate"
JOB_SERVICE_SRC = BASE_DIR / "backend" / "microservices" / "job-service" / "src" / "main" / "java" / "vn" / "careermate" / "jobservice"

# Files to copy
FILES_TO_COPY = {
    "jobservice/model": ["Job.java", "Application.java", "SavedJob.java", "JobSkill.java", "ApplicationHistory.java"],
    "jobservice/repository": ["JobRepository.java", "ApplicationRepository.java", "SavedJobRepository.java", "JobSkillRepository.java", "ApplicationHistoryRepository.java"],
    "jobservice/service": ["JobService.java", "ApplicationService.java"],
    "jobservice/controller": ["JobController.java", "ApplicationController.java"],
    "jobservice/dto": ["JobDTO.java", "ApplicationDTO.java", "SavedJobDTO.java", "ApplicationHistoryDTO.java"],
    "jobservice/database": ["schema.sql"]
}

def copy_files():
    """Copy files from monolith to job-service"""
    print("=" * 60)
    print("Copying files from monolith to job-service...")
    print("=" * 60)
    
    copied = 0
    skipped = 0
    
    for relative_path, files in FILES_TO_COPY.items():
        source_dir = MONOLITH_SRC / relative_path
        target_dir = JOB_SERVICE_SRC / relative_path
        
        # Create target directory
        target_dir.mkdir(parents=True, exist_ok=True)
        
        for file in files:
            source_file = source_dir / file
            target_file = target_dir / file
            
            if source_file.exists():
                shutil.copy2(source_file, target_file)
                print(f"[OK] Copied: {relative_path}/{file}")
                copied += 1
            else:
                print(f"[SKIP] Not found: {relative_path}/{file}")
                skipped += 1
    
    print(f"\nCopied: {copied} files")
    print(f"Skipped: {skipped} files")
    return copied > 0

def refactor_entities():
    """Refactor entities to remove cross-service dependencies"""
    print("\n" + "=" * 60)
    print("Refactoring entities to remove cross-service dependencies...")
    print("=" * 60)
    
    # Job.java - Replace RecruiterProfile and Company with UUIDs
    job_file = JOB_SERVICE_SRC / "model" / "Job.java"
    if job_file.exists():
        content = job_file.read_text(encoding='utf-8')
        
        # Replace imports
        content = content.replace(
            "import vn.careermate.userservice.model.RecruiterProfile;",
            "// import vn.careermate.userservice.model.RecruiterProfile; // Replaced with UUID"
        )
        content = content.replace(
            "import vn.careermate.contentservice.model.Company;",
            "// import vn.careermate.contentservice.model.Company; // Replaced with UUID"
        )
        
        # Replace fields
        content = content.replace(
            "@ManyToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = \"recruiter_id\", nullable = false)\n    @JsonIgnore\n    private RecruiterProfile recruiter;",
            "@Column(name = \"recruiter_id\", nullable = false)\n    private UUID recruiterId;"
        )
        content = content.replace(
            "@ManyToOne(fetch = FetchType.EAGER)\n    @JoinColumn(name = \"company_id\", nullable = false)\n    private Company company;",
            "@Column(name = \"company_id\", nullable = false)\n    private UUID companyId;"
        )
        
        job_file.write_text(content, encoding='utf-8')
        print("[OK] Refactored Job.java")
    
    # Application.java - Replace StudentProfile and CV with UUIDs
    app_file = JOB_SERVICE_SRC / "model" / "Application.java"
    if app_file.exists():
        content = app_file.read_text(encoding='utf-8')
        
        # Replace imports
        content = content.replace(
            "import vn.careermate.userservice.model.StudentProfile;",
            "// import vn.careermate.userservice.model.StudentProfile; // Replaced with UUID"
        )
        content = content.replace(
            "import vn.careermate.userservice.model.CV;",
            "// import vn.careermate.userservice.model.CV; // Replaced with UUID"
        )
        
        # Replace fields
        content = content.replace(
            "@ManyToOne(fetch = FetchType.EAGER)\n    @JoinColumn(name = \"student_id\", nullable = false)\n    @JsonIgnore\n    private StudentProfile student;",
            "@Column(name = \"student_id\", nullable = false)\n    private UUID studentId;"
        )
        content = content.replace(
            "@ManyToOne(fetch = FetchType.EAGER)\n    @JoinColumn(name = \"cv_id\")\n    private CV cv;",
            "@Column(name = \"cv_id\")\n    private UUID cvId;"
        )
        
        app_file.write_text(content, encoding='utf-8')
        print("[OK] Refactored Application.java")
    
    # SavedJob.java - Replace StudentProfile with UUID
    saved_job_file = JOB_SERVICE_SRC / "model" / "SavedJob.java"
    if saved_job_file.exists():
        content = saved_job_file.read_text(encoding='utf-8')
        
        # Replace imports
        content = content.replace(
            "import vn.careermate.userservice.model.StudentProfile;",
            "// import vn.careermate.userservice.model.StudentProfile; // Replaced with UUID"
        )
        
        # Replace field
        content = content.replace(
            "@ManyToOne(fetch = FetchType.EAGER)\n    @JoinColumn(name = \"student_id\", nullable = false)\n    @JsonIgnore\n    private StudentProfile student;",
            "@Column(name = \"student_id\", nullable = false)\n    private UUID studentId;"
        )
        
        saved_job_file.write_text(content, encoding='utf-8')
        print("[OK] Refactored SavedJob.java")

def main():
    print("Job-Service Setup Script")
    print("=" * 60)
    
    if copy_files():
        refactor_entities()
        print("\n" + "=" * 60)
        print("[OK] Job-Service setup completed!")
        print("=" * 60)
        print("\nNext steps:")
        print("1. Update pom.xml to add common module dependency")
        print("2. Refactor services to use Feign Clients")
        print("3. Create database: job_service_db")
        print("4. Update application.yml")
        print("5. Migrate data")
    else:
        print("\n[ERROR] No files copied. Please check paths.")

if __name__ == "__main__":
    main()
