# Job-Service Migration Plan

## 🎯 Mục tiêu: Đạt 100% Microservice Compliance

Tương tự như User-Service, Job-Service cần:
1. ✅ Copy code từ monolith
2. ✅ Refactor để loại bỏ direct dependencies
3. ✅ Tạo database riêng
4. ✅ Setup configuration
5. ✅ Migrate data
6. ✅ Test và verify

## 📋 Các bước thực hiện:

### Bước 1: Copy Code từ Monolith
- Models: Job, Application, SavedJob, JobSkill, ApplicationHistory
- Repositories: JobRepository, ApplicationRepository, SavedJobRepository, JobSkillRepository
- Services: JobService, ApplicationService
- Controllers: JobController, ApplicationController
- DTOs: JobDTO, ApplicationDTO, SavedJobDTO
- Database: schema.sql

### Bước 2: Refactor Dependencies
- Thay `RecruiterProfile` entity → `UUID recruiterId`
- Thay `Company` entity → `UUID companyId`
- Thay `StudentProfile` entity → `UUID studentId`
- Thay `CV` entity → `UUID cvId`
- Sử dụng Feign Clients: UserServiceClient, ContentServiceClient

### Bước 3: Database Setup
- Tạo database: `job_service_db`
- Tạo schema: `jobservice`
- Migrate data từ `careermate_db.jobservice`

### Bước 4: Configuration
- Update `application.yml` với database mới
- Add common module dependency
- Configure Feign Clients

### Bước 5: Test
- Start service
- Verify database connection
- Test endpoints
