# 🏛️ CareerMate - Technical Architecture & Implementation Details

**Document Version**: 1.0  
**Date**: 24/01/2026  

---

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [Database Design](#database-design)
5. [Authentication Flow](#authentication-flow)
6. [Deployment Architecture](#deployment-architecture)

---

## System Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Web Browser (React SPA)                                 │   │
│  │  - React Router for navigation                           │   │
│  │  - Context API for state management                      │   │
│  │  - Axios for HTTP requests                              │   │
│  └────────────────────────┬─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                             │ HTTP/HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY LAYER                            │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Spring Cloud Gateway (Port 8080)                        │   │
│  │  - Route requests to appropriate microservices          │   │
│  │  - JWT validation & token refresh                        │   │
│  │  - CORS handling                                         │   │
│  │  - Load balancing                                        │   │
│  └────────────────────────┬─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
┌───────────────────┐ ┌──────────────┐ ┌─────────────────┐
│  EUREKA SERVER    │ │  DISCOVERY   │ │  SERVICE MESH   │
│  (Port 8761)      │ │  (Deployed)  │ │  (In Progress)  │
│                   │ │              │ │                 │
│ Registry of all   │ │ DNS-based    │ │ Future: Istio   │
│ microservices     │ │ service      │ │ or Linkerd      │
└───────────────────┘ │ lookup       │ └─────────────────┘
                      └──────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
   │   USER       │  │    JOB       │   │   CONTENT    │
   │  SERVICE     │  │  SERVICE     │   │  SERVICE     │
   │ (8081)       │  │ (8082)       │   │ (8083)       │
   └──────────────┘  └──────────────┘   └──────────────┘
        │                    │                    │
        │    ┌───────────────┼───────────────┐   │
        │    │               │               │   │
        ▼    ▼               ▼               ▼   ▼
   ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
   │  LEARNING    │  │NOTIFICATION  │   │     AI       │
   │  SERVICE     │  │  SERVICE     │   │  SERVICE     │
   │ (8084)       │  │ (8086)       │   │ (8087)       │
   └──────────────┘  └──────────────┘   └──────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
   ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
   │    ADMIN     │  │  COMMONS     │   │  UTILITIES   │
   │  SERVICE     │  │  MODULE      │   │  & HELPERS   │
   │ (8085)       │  │ (Shared)     │   │ (Internal)   │
   └──────────────┘  └──────────────┘   └──────────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                             ▼
        ┌────────────────────────────────────┐
        │   PERSISTENCE LAYER                │
        │                                    │
        │  PostgreSQL Database               │
        │  - careermate_db (main)           │
        │  - Separate schemas per service   │
        │  - Connection pooling (HikariCP)  │
        │  - Transactions & ACID compliance │
        └────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   [PUBLIC]             [JOBSERVICE]        [CONTENTSERVICE]
   SCHEMA               SCHEMA              SCHEMA
   - users              - jobs              - articles
   - roles              - applications      - companies
   - permissions        - saved_jobs        - company_ratings
   - refresh_tokens     - job_skills        - content_categories
        
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   [LEARNINGSERVICE]   [NOTIFICATIONSERVICE]  [AISERVICE]
   SCHEMA              SCHEMA                SCHEMA
   - cv_templates      - notifications       - ai_logs
   - courses           - notification_types  - ai_responses
   - lessons           - notification_settings
   - enrollments       - email_logs
   - challenges
   - badges
```

---

## Frontend Architecture

### React Component Hierarchy

```
App.jsx (Root Component)
│
├── AuthContext Provider
├── DarkModeContext Provider
│
├── Public Routes
│   ├── /login (Login Page)
│   └── /register (Register Page)
│
├── Student Routes (/student/*)
│   ├── StudentLayout
│   │   ├── Navigation Bar
│   │   ├── Sidebar
│   │   └── Main Content
│   │
│   ├── Dashboard (StudentDashboard)
│   ├── Jobs Section
│   │   ├── JobList
│   │   └── JobDetail
│   │   └── JobRecommendations (AI)
│   ├── CV Section
│   │   ├── CVUpload
│   │   └── CVAnalysis (AI)
│   ├── Learning Section
│   │   ├── CVTemplates
│   │   ├── CVTemplateEditor
│   │   ├── Courses
│   │   ├── CourseDetail
│   │   └── CoursePlayer
│   ├── Career Section
│   │   ├── CareerRoadmap (AI)
│   │   ├── Quiz
│   │   └── Challenges
│   ├── Content Section
│   │   ├── Articles
│   │   └── ArticleDetail
│   ├── Companies
│   │   ├── CompanyList
│   │   └── CompanyDetail (with ratings)
│   ├── Other Features
│   │   ├── Applications
│   │   ├── Packages (Premium)
│   │   ├── Messages
│   │   ├── Profile
│   │   └── Notifications
│
├── Recruiter Routes (/recruiter/*)
│   ├── RecruiterLayout
│   │
│   ├── Dashboard (RecruiterDashboard)
│   ├── Jobs Management
│   │   └── PostJob
│   ├── Candidates
│   │   ├── Applicants
│   │   └── FindCandidates
│   ├── Company Management
│   │   ├── CompanyView
│   │   └── CompanyEdit
│   ├── Content
│   │   ├── CreateArticle
│   │   └── MyArticles
│   ├── Other Features
│   │   ├── Profile
│   │   ├── Messages
│   │   └── Notifications
│
└── Admin Routes (/admin/*)
    ├── AdminLayout
    │
    ├── Dashboard (AdminDashboard with Analytics)
    ├── User Management (UserManagement)
    ├── Content Management
    │   ├── JobManagement
    │   ├── ArticleManagement
    │   │   └── CreateArticle
    │   ├── CVTemplatesManagement
    │   └── PackagesManagement
    ├── Analytics (Analytics & Reports)
    └── Other Features
        ├── Messages
        └── Notifications
```

### Frontend State Management

```
Global State (Context API):
│
├── AuthContext
│   ├── user (current user object)
│   ├── loading (auth loading state)
│   ├── login() (function)
│   ├── register() (function)
│   └── logout() (function)
│
└── DarkModeContext
    ├── isDarkMode (boolean)
    └── toggleDarkMode() (function)

Local Component State (useState):
├── Form state (input fields)
├── Loading state per component
├── Error messages
├── Filter/Sort options
└── Pagination state
```

### API Communication

```
┌──────────────────────────────────┐
│      Frontend (React)            │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  Axios HTTP Client (api.js)      │
│  - Base URL: http://localhost:8080/api
│  - Request interceptor (add JWT) │
│  - Response interceptor (handle errors)
│  - Token refresh logic           │
└──────────────┬───────────────────┘
               │
               ▼
┌──────────────────────────────────┐
│  API Gateway (Spring Cloud)      │
│  Port: 8080                      │
└──────────────┬───────────────────┘
               │
        ┌──────┴──────────┐
        │                 │
        ▼                 ▼
  [Service 1]      [Service 2]
  Microservices    Microservices
```

### Frontend Features by Page

| Feature | Component | Status |
|---------|-----------|--------|
| Authentication | Login, Register | ✅ Complete |
| Dashboard | Role-specific dashboards | ✅ Complete |
| Job Management | JobList, JobDetail, PostJob | ✅ Complete |
| CV Management | CVUpload, CVAnalysis | ✅ Complete |
| AI Features | JobRecommendations, CareerRoadmap, ChatWidget | ✅ Complete |
| Learning | Courses, CoursePlayer, CVTemplates | ✅ Complete |
| Content | Articles, Companies | ✅ Complete |
| Admin | UserMgmt, JobMgmt, Analytics | ✅ Complete |
| Messaging | Messages component | ✅ Complete |
| Notifications | NotificationBell, Notifications page | ✅ Complete |
| Dark Mode | DarkModeToggle | ✅ Complete |

---

## Backend Architecture

### Microservices Overview

#### 1. **Eureka Server** (Port 8761)
**Purpose**: Service Registry & Discovery

```java
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}
```

**Key Configuration**:
- `spring.application.name: eureka-server`
- `server.port: 8761`
- Service registration and heartbeat
- Dashboard at `/eureka`

---

#### 2. **API Gateway** (Port 8080)
**Purpose**: Single entry point, request routing, security

```yaml
# application.yml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/auth/**,/api/users/**,/api/students/**,/api/recruiters/**
        
        - id: job-service
          uri: lb://job-service
          predicates:
            - Path=/api/jobs/**,/api/applications/**,/api/saved-jobs/**
        
        - id: content-service
          uri: lb://content-service
          predicates:
            - Path=/api/articles/**,/api/companies/**
        
        # ... more routes
```

**Key Features**:
- Request routing using predicates
- Load balancing (lb://)
- JWT validation filter
- CORS configuration
- Circuit breaker pattern (ready for Resilience4j)

---

#### 3. **User Service** (Port 8081)
**Purpose**: User management, authentication, profiles

```
UserService/
├── src/main/java/vn/careermate/userservice/
│   ├── UserServiceApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java (JWT validation, Spring Security)
│   │   ├── JwtAuthenticationFilter.java
│   │   └── ApplicationConfig.java
│   ├── controller/
│   │   ├── AuthController.java (POST /register, /login, /validate-token)
│   │   ├── UserController.java (GET /users, PUT /users)
│   │   ├── StudentProfileController.java
│   │   └── RecruiterProfileController.java
│   ├── service/
│   │   ├── AuthService.java (Authentication logic)
│   │   ├── UserService.java (User management)
│   │   ├── StudentProfileService.java
│   │   └── RecruiterProfileService.java
│   ├── entity/
│   │   ├── User.java (Username, email, password, role)
│   │   ├── StudentProfile.java (Education, skills, profile)
│   │   └── RecruiterProfile.java (Company, experience)
│   ├── repository/
│   │   ├── UserRepository.java (extends JpaRepository)
│   │   ├── StudentProfileRepository.java
│   │   └── RecruiterProfileRepository.java
│   ├── dto/
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── AuthResponse.java
│   │   └── UserDTO.java
│   ├── exception/
│   │   ├── AuthenticationException.java
│   │   └── UserNotFoundException.java
│   └── util/
│       ├── JwtUtil.java (Token generation, validation)
│       └── PasswordUtil.java (BCrypt hashing)
```

**Database Schema** (public schema):
```sql
users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password VARCHAR NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    role ENUM('STUDENT', 'RECRUITER', 'ADMIN'),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    is_active BOOLEAN
)

student_profile (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    full_name VARCHAR,
    phone_number VARCHAR,
    bio TEXT,
    skills JSONB,
    education JSONB,
    experience JSONB
)

recruiter_profile (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    company_id UUID,
    full_name VARCHAR,
    phone_number VARCHAR,
    position VARCHAR
)
```

---

#### 4. **Job Service** (Port 8082)
**Purpose**: Job postings, applications, job search

```
JobService/
├── src/main/java/vn/careermate/jobservice/
│   ├── JobServiceApplication.java
│   ├── controller/
│   │   ├── JobController.java (GET /jobs, POST /jobs, etc.)
│   │   ├── ApplicationController.java (Applications management)
│   │   └── SavedJobController.java (Saved jobs)
│   ├── service/
│   │   ├── JobService.java
│   │   ├── ApplicationService.java
│   │   └── SavedJobService.java
│   ├── entity/
│   │   ├── Job.java (UUID recruiterId instead of direct reference)
│   │   ├── Application.java (UUID studentId instead of direct reference)
│   │   ├── SavedJob.java
│   │   └── JobSkill.java
│   ├── repository/
│   │   ├── JobRepository.java
│   │   ├── ApplicationRepository.java
│   │   ├── SavedJobRepository.java
│   │   └── JobSkillRepository.java
│   ├── dto/
│   │   ├── JobDTO.java
│   │   ├── ApplicationDTO.java
│   │   └── JobSearchRequest.java
│   ├── feign/
│   │   └── UserServiceClient.java (Call user-service via Feign)
│   └── util/
│       └── JobSearchUtil.java
```

**Database Schema** (jobservice schema):
```sql
jobs (
    id UUID PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    recruiter_id UUID,
    company_id UUID,
    salary_min DECIMAL,
    salary_max DECIMAL,
    location VARCHAR,
    experience_required INT,
    application_count INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

applications (
    id UUID PRIMARY KEY,
    job_id UUID REFERENCES jobs(id),
    student_id UUID,
    cv_id UUID,
    status ENUM('PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'),
    applied_at TIMESTAMP
)

saved_jobs (
    id UUID PRIMARY KEY,
    job_id UUID REFERENCES jobs(id),
    student_id UUID,
    saved_at TIMESTAMP
)

job_skills (
    id UUID PRIMARY KEY,
    job_id UUID REFERENCES jobs(id),
    skill_name VARCHAR
)
```

---

#### 5. **Content Service** (Port 8083)
**Purpose**: Articles, companies, content management

```
ContentService/
├── controller/
│   ├── ArticleController.java
│   ├── CompanyController.java
│   └── CompanyRatingController.java
├── service/
│   ├── ArticleService.java
│   ├── CompanyService.java
│   └── CompanyRatingService.java
├── entity/
│   ├── Article.java
│   ├── Company.java
│   └── CompanyRating.java
├── repository/
│   ├── ArticleRepository.java
│   ├── CompanyRepository.java
│   └── CompanyRatingRepository.java
└── dto/
    ├── ArticleDTO.java
    ├── CompanyDTO.java
    └── CompanyRatingDTO.java
```

**Database Schema** (contentservice schema):
```sql
articles (
    id UUID PRIMARY KEY,
    title VARCHAR NOT NULL,
    content TEXT NOT NULL,
    author_id UUID,
    category VARCHAR,
    views INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

companies (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    website VARCHAR,
    location VARCHAR,
    industry VARCHAR,
    employee_count INT,
    founded_year INT,
    logo_url VARCHAR
)

company_ratings (
    id UUID PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    rater_id UUID,
    rating DECIMAL(2,1),
    review TEXT,
    created_at TIMESTAMP
)
```

---

#### 6. **Learning Service** (Port 8084)
**Purpose**: Courses, CV templates, lessons

```
LearningService/
├── controller/
│   ├── CVTemplateController.java
│   ├── CourseController.java
│   ├── LessonController.java
│   └── EnrollmentController.java
├── service/
│   ├── CVTemplateService.java
│   ├── CourseService.java
│   └── EnrollmentService.java
├── entity/
│   ├── CVTemplate.java
│   ├── Course.java
│   ├── Lesson.java
│   └── Enrollment.java
└── repository/
    ├── CVTemplateRepository.java
    ├── CourseRepository.java
    ├── LessonRepository.java
    └── EnrollmentRepository.java
```

**Database Schema** (learningservice schema):
```sql
cv_templates (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    description TEXT,
    template_content JSONB,
    created_by UUID,
    created_at TIMESTAMP
)

courses (
    id UUID PRIMARY KEY,
    title VARCHAR NOT NULL,
    description TEXT,
    instructor_id UUID,
    category VARCHAR,
    level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCED'),
    duration_hours INT,
    price DECIMAL,
    rating DECIMAL(3,2)
)

lessons (
    id UUID PRIMARY KEY,
    course_id UUID REFERENCES courses(id),
    title VARCHAR NOT NULL,
    content TEXT,
    video_url VARCHAR,
    order_index INT
)

enrollments (
    id UUID PRIMARY KEY,
    course_id UUID REFERENCES courses(id),
    student_id UUID,
    enrollment_date TIMESTAMP,
    completion_status DECIMAL(3,2)
)
```

---

#### 7. **AI Service** (Port 8087)
**Purpose**: AI-powered features using OpenRouter API

```
AIService/
├── controller/
│   ├── CVAnalysisController.java
│   ├── JobRecommendationController.java
│   ├── CareerRoadmapController.java
│   └── AIChatController.java
├── service/
│   ├── CVAnalysisService.java
│   ├── JobRecommendationService.java
│   ├── CareerRoadmapService.java
│   ├── AIChatService.java
│   └── OpenRouterService.java (External API calls)
├── client/
│   └── OpenRouterClient.java (Feign client for OpenRouter API)
├── dto/
│   ├── CVAnalysisRequest.java
│   ├── CVAnalysisResponse.java
│   ├── JobRecommendationRequest.java
│   ├── AIChatRequest.java
│   └── OpenRouterRequest.java
└── util/
    └── AIPromptBuilder.java (Build prompts for AI)
```

**Key Features**:
- CV Analysis: Parse CV, identify strengths/weaknesses
- Job Recommendations: Based on CV, skills, experience
- Career Roadmap: Generate personalized career path
- AI Chat: Conversational career coach

**Configuration**:
```yaml
ai:
  openrouter:
    api-key: ${OPENROUTER_API_KEY}
    api-url: https://openrouter.ai/api/v1
    model: anthropic/claude-3-haiku
    max-tokens: 2000
```

---

#### 8. **Notification Service** (Port 8086)
**Purpose**: User notifications, alerts

```
NotificationService/
├── controller/
│   └── NotificationController.java
├── service/
│   └── NotificationService.java
├── entity/
│   └── Notification.java
├── repository/
│   └── NotificationRepository.java
└── producer/
    └── NotificationProducer.java (Kafka/RabbitMQ ready)
```

---

#### 9. **Admin Service** (Port 8085)
**Purpose**: Admin operations, system management

```
AdminService/
├── controller/
│   ├── AdminUserController.java
│   ├── AdminJobController.java
│   ├── AdminArticleController.java
│   ├── AdminAnalyticsController.java
│   └── AdminReportController.java
├── service/
│   ├── AdminUserService.java
│   ├── AdminJobService.java
│   ├── AdminAnalyticsService.java
│   └── AdminReportService.java
└── feign/
    ├── UserServiceClient.java
    ├── JobServiceClient.java
    └── ContentServiceClient.java
```

---

### Common Module Architecture

```
Common/
├── src/main/java/vn/careermate/common/
│   ├── dto/
│   │   ├── UserDTO.java
│   │   ├── NotificationRequest.java
│   │   ├── ApiResponse.java
│   │   └── ErrorResponse.java
│   ├── feign/
│   │   ├── UserServiceClient.java
│   │   │   @FeignClient("user-service")
│   │   │   GET /api/users/{userId}
│   │   │   GET /api/auth/validate-token
│   │   │
│   │   ├── NotificationServiceClient.java
│   │   │   @FeignClient("notification-service")
│   │   │   POST /api/notifications/send
│   │   │
│   │   ├── JobServiceClient.java
│   │   │   @FeignClient("job-service")
│   │   │   GET /api/jobs/{jobId}
│   │   │
│   │   └── ContentServiceClient.java
│   │       @FeignClient("content-service")
│   │       GET /api/companies/{companyId}
│   │
│   ├── exception/
│   │   ├── ResourceNotFoundException.java
│   │   ├── UnauthorizedException.java
│   │   └── ServiceException.java
│   │
│   ├── util/
│   │   ├── JwtUtil.java
│   │   ├── ValidationUtil.java
│   │   └── DateUtil.java
│   │
│   └── constant/
│       ├── Constants.java
│       ├── ErrorMessages.java
│       └── SuccessMessages.java
```

---

## Database Design

### Schema Organization

```
Database: careermate_db
│
├── public (User & Auth)
│   ├── users
│   ├── student_profile
│   ├── recruiter_profile
│   ├── roles
│   ├── refresh_tokens
│   └── audit_log
│
├── jobservice (Job Management)
│   ├── jobs
│   ├── applications
│   ├── saved_jobs
│   └── job_skills
│
├── contentservice (Content Management)
│   ├── articles
│   ├── companies
│   ├── company_ratings
│   └── content_categories
│
├── learningservice (Learning Platform)
│   ├── cv_templates
│   ├── courses
│   ├── lessons
│   ├── enrollments
│   ├── challenges
│   └── badges
│
├── notificationservice (Notifications)
│   ├── notifications
│   ├── notification_types
│   ├── notification_settings
│   └── email_logs
│
└── aiservice (AI Logs)
    ├── ai_logs
    ├── ai_responses
    └── ai_usage_stats
```

### Key Relationships

```
User (1) ──────→ (Many) StudentProfile
User (1) ──────→ (Many) RecruiterProfile
User (1) ──────→ (Many) Notification

StudentProfile (1) ──────→ (Many) Application
RecruiterProfile (1) ──────→ (Many) Job
Company (1) ──────→ (Many) Job
Company (1) ──────→ (Many) CompanyRating

Job (1) ──────→ (Many) Application
Job (1) ──────→ (Many) SavedJob
Job (1) ──────→ (Many) JobSkill

Course (1) ──────→ (Many) Lesson
Course (1) ──────→ (Many) Enrollment
StudentProfile (1) ──────→ (Many) Enrollment

User (1) ──────→ (Many) Article
```

### Index Strategy

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX idx_applications_student_id ON applications(student_id);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_courses_category ON courses(category);
CREATE INDEX idx_enrollments_student_id ON enrollments(student_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
```

---

## Authentication Flow

### JWT Authentication Architecture

```
1. User Login Request
   ┌─────────────────────────────┐
   │ Frontend sends credentials  │
   │ POST /api/auth/login        │
   └──────────────┬──────────────┘
                  │
                  ▼
2. API Gateway passes to User Service
   ┌─────────────────────────────┐
   │ API Gateway                 │
   │ Checks credentials          │
   └──────────────┬──────────────┘
                  │
                  ▼
3. User Service validates
   ┌─────────────────────────────────┐
   │ AuthService.authenticate()      │
   │ - Find user by email            │
   │ - Hash password & compare       │
   │ - Generate JWT token            │
   │ - Generate refresh token        │
   └──────────────┬──────────────────┘
                  │
                  ▼
4. Return tokens to frontend
   ┌─────────────────────────────────┐
   │ Response:                       │
   │ {                               │
   │   "accessToken": "jwt...",      │
   │   "refreshToken": "jwt...",     │
   │   "user": { id, email, role }   │
   │ }                               │
   └─────────────────────────────────┘

5. Frontend stores tokens
   ├── localStorage.setItem("token", accessToken)
   ├── localStorage.setItem("refreshToken", refreshToken)
   └── localStorage.setItem("user", userObject)

6. Subsequent API requests
   ┌─────────────────────────────────────┐
   │ Frontend adds Authorization header  │
   │ GET /api/jobs                       │
   │ Authorization: Bearer <accessToken> │
   └──────────────┬──────────────────────┘
                  │
                  ▼
7. API Gateway validates JWT
   ┌────────────────────────────────┐
   │ JwtAuthenticationFilter        │
   │ - Extract token from header    │
   │ - Validate signature           │
   │ - Check expiration             │
   │ - Pass to next service         │
   └────────────────────────────────┘

8. Microservice validates token
   ┌────────────────────────────────┐
   │ Service-level security         │
   │ JwtAuthenticationFilter        │
   │ - Validate token locally       │
   │ - Extract user info            │
   │ - Continue request             │
   └────────────────────────────────┘

9. Token refresh flow (if expired)
   ┌────────────────────────────────┐
   │ Frontend detects 401 Unauthorized
   │ POST /api/auth/refresh-token   │
   │ Body: { refreshToken }         │
   └──────────────┬─────────────────┘
                  │
                  ▼
   ┌────────────────────────────────┐
   │ User Service validates refresh │
   │ - Check if refresh token valid │
   │ - Generate new access token    │
   │ - Return new token             │
   └────────────────────────────────┘

10. Logout flow
    ┌─────────────────────────────┐
    │ Frontend: POST /api/auth/logout
    │ - Clear localStorage        │
    │ - Invalidate refresh token  │
    └─────────────────────────────┘
```

### JWT Token Structure

```
Header:
{
  "alg": "HS256",
  "typ": "JWT"
}

Payload:
{
  "sub": "user-id-uuid",
  "email": "user@example.com",
  "role": "STUDENT",
  "iat": 1704843000,
  "exp": 1704929400,
  "iss": "careermate",
  "aud": "careermate-frontend"
}

Signature:
HMACSHA256(base64url(header) + "." + base64url(payload), SECRET_KEY)
```

---

## Deployment Architecture

### Development Environment

```
Local Machine (Windows):
│
├── Frontend Dev Server (Vite)
│   └── Port 5173 (npm run dev)
│
├── Backend Services (Maven)
│   ├── Eureka Server (8761)
│   ├── API Gateway (8080)
│   ├── User Service (8081)
│   ├── Job Service (8082)
│   ├── Content Service (8083)
│   ├── Learning Service (8084)
│   ├── Notification Service (8086)
│   ├── Admin Service (8085)
│   └── AI Service (8087)
│
├── PostgreSQL Database
│   └── Port 5432
│
└── Redis Cache (optional)
    └── Port 6379
```

### Production Architecture (Recommended)

```
Cloud Provider (AWS/Azure/GCP):
│
├── CDN (CloudFlare)
│   └── Static assets distribution
│
├── Load Balancer
│   └── Distributes traffic
│
├── Container Orchestration (Kubernetes)
│   ├── Frontend Pod (React SPA in Nginx)
│   ├── API Gateway Pod (multiple replicas)
│   ├── Microservices Pods (multiple replicas each)
│   │   ├── User Service (2-3 replicas)
│   │   ├── Job Service (2-3 replicas)
│   │   ├── Content Service (2-3 replicas)
│   │   ├── Learning Service (2-3 replicas)
│   │   ├── AI Service (2-3 replicas)
│   │   ├── Notification Service (2-3 replicas)
│   │   └── Admin Service (1-2 replicas)
│   │
│   ├── Eureka Server Pod (replicated)
│   │
│   ├── Config Server Pod (for external config)
│   │
│   └── Message Broker Pod (RabbitMQ/Kafka)
│
├── Database Cluster
│   ├── PostgreSQL Primary
│   └── PostgreSQL Replicas
│
├── Cache Layer
│   ├── Redis Cluster
│   └── Redis Sentinel
│
├── Logging & Monitoring
│   ├── ELK Stack (Elasticsearch, Logstash, Kibana)
│   ├── Prometheus + Grafana
│   └── Jaeger (Distributed Tracing)
│
└── CI/CD Pipeline
    ├── GitHub Actions / GitLab CI
    ├── Build stage
    ├── Test stage
    ├── Docker build & push
    └── Kubernetes deployment
```

### Docker Deployment

```dockerfile
# Backend Services
FROM openjdk:17-slim
WORKDIR /app
COPY target/service-name-1.0.0.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]

# Frontend
FROM node:18-alpine as build
WORKDIR /app
COPY . .
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: careermate_db
      POSTGRES_USER: careermate_user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"

  eureka-server:
    build: ./backend/microservices/eureka-server
    ports:
      - "8761:8761"
    depends_on:
      - postgres

  api-gateway:
    build: ./backend/microservices/api-gateway
    ports:
      - "8080:8080"
    depends_on:
      - eureka-server

  user-service:
    build: ./backend/microservices/user-service
    ports:
      - "8081:8081"
    depends_on:
      - eureka-server
      - postgres

  # ... more services ...

  frontend:
    build: ./frontend
    ports:
      - "5173:3000"
    depends_on:
      - api-gateway
```

---

## Performance Considerations

### Optimization Strategies

1. **Database**
   - Connection pooling (HikariCP)
   - Query optimization with indexes
   - Batch processing for bulk operations
   - Pagination for large result sets

2. **Caching**
   - Redis for session storage
   - Cache layers for frequently accessed data
   - Cache invalidation strategies

3. **API**
   - API Gateway rate limiting
   - Request/response compression
   - Async processing for long-running tasks

4. **Frontend**
   - Code splitting and lazy loading
   - Image optimization
   - Minification and compression
   - Service workers for offline capability

---

## Security Measures

1. **Authentication & Authorization**
   - JWT tokens with expiration
   - Role-based access control
   - Token refresh mechanism

2. **Data Protection**
   - HTTPS/TLS encryption
   - Password hashing (BCrypt)
   - Input validation & sanitization
   - SQL injection prevention

3. **API Security**
   - CORS configuration
   - CSRF protection
   - Rate limiting
   - API key management for external services

4. **Infrastructure**
   - Secrets management (.env files, Vault)
   - Environment-specific configurations
   - Logging & audit trails

---

## Scalability Strategy

1. **Horizontal Scaling**
   - Multiple replicas per service
   - Load balancing
   - Session replication

2. **Vertical Scaling**
   - Resource allocation per container
   - Database optimization

3. **Service Communication**
   - Asynchronous messaging (RabbitMQ/Kafka)
   - Circuit breaker pattern
   - Retry mechanisms with backoff

---

*End of Technical Architecture Document*
