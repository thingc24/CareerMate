# Tổ Chức Lại Backend Theo Cấu Trúc Microservice

## 🎯 Mục Tiêu

Tổ chức lại code trong `backend/` thành 5 services riêng biệt theo nhiệm vụ của 5 thành viên:
- **Văn Tân** - User Service (Authentication, User Management, Profiles)
- **Ngọc Thi** - Job Service (Jobs, Applications, Interviews)
- **Anh Vũ** - AI Service (CV Analysis, Chatbot, Roadmap, Matching)
- **Hiệu Hiệu** - Content Service (Articles, Comments, Reactions, Companies)
- **Bảo Hân** - Learning Service (Courses, Quizzes, Challenges, Templates, Packages)

## 📁 Cấu Trúc Mới

```
backend/
├── src/main/java/vn/careermate/
│   ├── user-service/          # 👤 Văn Tân
│   │   ├── model/            # User, StudentProfile, RecruiterProfile
│   │   ├── repository/       # UserRepository, StudentProfileRepository, RecruiterProfileRepository
│   │   ├── service/          # AuthService, StudentProfileService, RecruiterProfileService
│   │   ├── controller/       # AuthController, StudentProfileController, RecruiterProfileController
│   │   ├── config/           # JwtService, SecurityConfig, JwtAuthenticationFilter
│   │   └── dto/              # AuthRequest, AuthResponse, RegisterRequest, UserInfo
│   │
│   ├── job-service/           # 💼 Ngọc Thi
│   │   ├── model/            # Job, Application, ApplicationHistory, Interview
│   │   ├── repository/       # JobRepository, ApplicationRepository
│   │   ├── service/          # JobService, ApplicationService, InterviewService
│   │   ├── controller/       # JobController, ApplicationController, InterviewController
│   │   └── dto/              # JobDTO, ApplicationDTO, InterviewDTO
│   │
│   ├── ai-service/            # 🤖 Anh Vũ
│   │   ├── model/            # (nếu cần)
│   │   ├── service/          # AIService, CVAnalysisService, ChatbotService, RoadmapService
│   │   ├── controller/       # AIController, MockInterviewController, CareerRoadmapController
│   │   └── dto/              # CVAnalysisDTO, ChatbotRequest, RoadmapDTO
│   │
│   ├── content-service/       # 📝 Hiệu Hiệu
│   │   ├── model/            # Article, ArticleComment, ArticleReaction, Company, CompanyRating
│   │   ├── repository/       # ArticleRepository, ArticleCommentRepository, CompanyRepository
│   │   ├── service/          # ArticleService, ArticleCommentService, CompanyService
│   │   ├── controller/       # ArticleController, CompanyController, CompanyRatingController
│   │   └── dto/              # ArticleDTO, ArticleCommentDTO, CompanyDTO
│   │
│   ├── learning-service/      # 📚 Bảo Hân
│   │   ├── model/            # Course, CourseContent, Quiz, QuizAttempt, Challenge, Badge, CVTemplate, Package
│   │   ├── repository/       # CourseRepository, QuizRepository, ChallengeRepository, CVTemplateRepository
│   │   ├── service/          # CourseService, QuizService, ChallengeService, PackageService
│   │   ├── controller/       # CourseController, QuizController, ChallengeController, CVTemplateController, PackageController
│   │   └── dto/              # CourseDTO, QuizDTO, ChallengeDTO, PackageDTO
│   │
│   ├── gateway/               # 🌐 API Gateway (optional - có thể tách riêng)
│   │   └── config/           # GatewayConfig, RoutingConfig
│   │
│   ├── common/                # 🔧 Common utilities (nếu cần)
│   │   ├── exception/        # GlobalExceptionHandler, ErrorResponse
│   │   ├── util/             # Common utilities
│   │   └── config/           # CommonConfig, WebConfig
│   │
│   └── CareerMateApplication.java  # Main application class
│
├── src/main/resources/
│   ├── application.yml       # Main config
│   ├── application-user-service.yml    # Config cho User Service
│   ├── application-job-service.yml     # Config cho Job Service
│   └── ...
│
└── pom.xml                   # Maven dependencies
```

## 🔄 Quy Trình Di Chuyển

### Bước 1: Tạo Cấu Trúc Thư Mục
1. Tạo các folder services: `user-service/`, `job-service/`, `ai-service/`, `content-service/`, `learning-service/`
2. Tạo folder `common/` cho code dùng chung

### Bước 2: Di Chuyển Code Theo Service

#### User Service (Văn Tân)
Từ `model/` → `user-service/model/`:
- `User.java`
- `StudentProfile.java`
- `RecruiterProfile.java`

Từ `repository/` → `user-service/repository/`:
- `UserRepository.java`
- `StudentProfileRepository.java`
- `RecruiterProfileRepository.java`

Từ `service/` → `user-service/service/`:
- `AuthService.java`
- Profile methods từ `StudentService.java` → `StudentProfileService.java`
- Profile methods từ `RecruiterService.java` → `RecruiterProfileService.java`

Từ `controller/` → `user-service/controller/`:
- `AuthController.java`
- Profile endpoints từ `StudentController.java` → `StudentProfileController.java`
- Profile endpoints từ `RecruiterController.java` → `RecruiterProfileController.java`

Từ `config/` → `user-service/config/`:
- `JwtService.java`
- `SecurityConfig.java`
- `JwtAuthenticationFilter.java`
- `UserDetailsServiceImpl.java`

Từ `dto/` → `user-service/dto/`:
- `AuthRequest.java`
- `AuthResponse.java`
- `RegisterRequest.java`
- `UserInfo.java`

#### Job Service (Ngọc Thi)
Từ `model/` → `job-service/model/`:
- `Job.java`
- `Application.java`
- `ApplicationHistory.java`
- `Interview.java` (nếu có)
- `JobSkill.java` (nếu có)

Từ `repository/` → `job-service/repository/`:
- `JobRepository.java`
- `ApplicationRepository.java`
- `ApplicationHistoryRepository.java`
- `InterviewRepository.java` (nếu có)

Từ `service/` → `job-service/service/`:
- Job methods từ `RecruiterService.java` → `JobService.java`
- Application methods từ `StudentService.java` và `RecruiterService.java` → `ApplicationService.java`

Từ `controller/` → `job-service/controller/`:
- Job endpoints từ `RecruiterController.java` → `JobController.java`
- Application endpoints từ `StudentController.java` và `RecruiterController.java` → `ApplicationController.java`
- Interview endpoints → `InterviewController.java`

#### AI Service (Anh Vũ)
Từ `service/` → `ai-service/service/`:
- `AIService.java`
- `CareerRoadmapService.java` (nếu có)

Từ `controller/` → `ai-service/controller/`:
- `AIController.java`
- `MockInterviewController.java`
- `CareerRoadmapController.java`

#### Content Service (Hiệu Hiệu)
Từ `model/` → `content-service/model/`:
- `Article.java`
- `ArticleComment.java`
- `ArticleReaction.java`
- `Company.java`
- `CompanyRating.java`

Từ `repository/` → `content-service/repository/`:
- `ArticleRepository.java`
- `ArticleCommentRepository.java`
- `ArticleReactionRepository.java`
- `CompanyRepository.java`
- `CompanyRatingRepository.java`

Từ `service/` → `content-service/service/`:
- `ArticleService.java`
- `ArticleCommentService.java`
- `ArticleReactionService.java`
- `CompanyService.java`

Từ `controller/` → `content-service/controller/`:
- `ArticleController.java`
- `CompanyController.java`
- `CompanyRatingController.java`

#### Learning Service (Bảo Hân)
Từ `model/` → `learning-service/model/`:
- `Course.java`
- `CourseContent.java`
- `Quiz.java`
- `QuizAttempt.java`
- `QuizQuestion.java`
- `QuizAnswer.java`
- `Challenge.java`
- `Badge.java`
- `CVTemplate.java`
- `Package.java`
- `Subscription.java`

Từ `repository/` → `learning-service/repository/`:
- `CourseRepository.java`
- `QuizRepository.java`
- `ChallengeRepository.java`
- `CVTemplateRepository.java`
- `PackageRepository.java`

Từ `service/` → `learning-service/service/`:
- `CourseService.java`
- `QuizService.java`
- `ChallengeService.java`
- `PackageService.java`

Từ `controller/` → `learning-service/controller/`:
- `CourseController.java`
- `QuizController.java`
- `ChallengeController.java`
- `CVTemplateController.java`
- `PackageController.java`

### Bước 3: Update Package Names

Sau khi di chuyển, update package names trong **TẤT CẢ** files:

**User Service:**
- `package vn.careermate.model;` → `package vn.careermate.user.service.model;`
- `package vn.careermate.repository;` → `package vn.careermate.user.service.repository;`
- `package vn.careermate.service;` → `package vn.careermate.user.service.service;`
- `package vn.careermate.controller;` → `package vn.careermate.user.service.controller;`
- `package vn.careermate.config;` → `package vn.careermate.user.service.config;`
- `package vn.careermate.dto;` → `package vn.careermate.user.service.dto;`

**Job Service:**
- `package vn.careermate.model;` → `package vn.careermate.job.service.model;`
- ... (tương tự)

**AI Service:**
- `package vn.careermate.service;` → `package vn.careermate.ai.service.service;`
- ... (tương tự)

**Content Service:**
- `package vn.careermate.model;` → `package vn.careermate.content.service.model;`
- ... (tương tự)

**Learning Service:**
- `package vn.careermate.model;` → `package vn.careermate.learning.service.model;`
- ... (tương tự)

### Bước 4: Update Imports

Update tất cả import statements trong các files:
- `import vn.careermate.model.*;` → `import vn.careermate.user.service.model.*;`
- ... (tương tự cho tất cả services)

### Bước 5: Xóa Dependencies Không Cần

Sau khi di chuyển, mỗi service chỉ giữ code liên quan:
- **User Service:** Chỉ giữ User, Auth, Profile code
- **Job Service:** Chỉ giữ Job, Application code
- **AI Service:** Chỉ giữ AI-related code
- **Content Service:** Chỉ giữ Article, Company code
- **Learning Service:** Chỉ giữ Course, Quiz, Challenge, Template, Package code

### Bước 6: Update Main Application

File `CareerMateApplication.java` ở root:
```java
package vn.careermate;

@SpringBootApplication
@EnableJpaAuditing
public class CareerMateApplication {
    public static void main(String[] args) {
        SpringApplication.run(CareerMateApplication.class, args);
    }
}
```

Scan tất cả packages:
```java
@SpringBootApplication(scanBasePackages = {
    "vn.careermate.user.service",
    "vn.careermate.job.service",
    "vn.careermate.ai.service",
    "vn.careermate.content.service",
    "vn.careermate.learning.service",
    "vn.careermate.common"
})
```

## 📋 Checklist Theo Từng Thành Viên

### 👤 Văn Tân - User Service
- [ ] Tạo folder `user-service/`
- [ ] Di chuyển User, StudentProfile, RecruiterProfile models
- [ ] Di chuyển User-related repositories
- [ ] Di chuyển AuthService và profile services
- [ ] Di chuyển AuthController và profile controllers
- [ ] Di chuyển JWT configs
- [ ] Di chuyển Auth-related DTOs
- [ ] Update package names
- [ ] Xóa dependencies không cần

### 💼 Ngọc Thi - Job Service
- [ ] Tạo folder `job-service/`
- [ ] Di chuyển Job, Application models
- [ ] Di chuyển Job-related repositories
- [ ] Di chuyển Job and Application services
- [ ] Di chuyển Job and Application controllers
- [ ] Di chuyển Job-related DTOs
- [ ] Update package names
- [ ] Xóa dependencies không cần

### 🤖 Anh Vũ - AI Service
- [ ] Tạo folder `ai-service/`
- [ ] Di chuyển AIService
- [ ] Di chuyển AI-related controllers
- [ ] Di chuyển AI-related DTOs
- [ ] Update package names

### 📝 Hiệu Hiệu - Content Service
- [ ] Tạo folder `content-service/`
- [ ] Di chuyển Article, Comment, Company models
- [ ] Di chuyển Content-related repositories
- [ ] Di chuyển Article and Company services
- [ ] Di chuyển Article and Company controllers
- [ ] Update package names
- [ ] Xóa dependencies không cần

### 📚 Bảo Hân - Learning Service
- [ ] Tạo folder `learning-service/`
- [ ] Di chuyển Course, Quiz, Challenge, Template models
- [ ] Di chuyển Learning-related repositories
- [ ] Di chuyển Learning services
- [ ] Di chuyển Learning controllers
- [ ] Update package names
- [ ] Xóa dependencies không cần

## 🎯 Kết Quả Mong Đợi

Sau khi tổ chức lại:
- ✅ Mỗi service nằm trong folder riêng trong `backend/`
- ✅ Mỗi thành viên chỉ làm việc với code của mình
- ✅ Code được tổ chức rõ ràng, dễ maintain
- ✅ Có thể deploy riêng từng service sau này (nếu cần)
- ✅ Dễ dàng thêm tính năng mới vào từng service

## 🚀 Bước Tiếp Theo

1. **Bắt đầu với User Service (Văn Tân)**
2. Sau đó làm lần lượt các services khác
3. Test từng service sau khi di chuyển
4. Cập nhật `application.yml` nếu cần config riêng cho từng service
