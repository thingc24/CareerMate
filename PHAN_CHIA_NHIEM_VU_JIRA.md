# PHÂN CHIA NHIỆM VỤ DỰ ÁN CAREERMATE - JIRA TASKS

## 👥 THÀNH VIÊN NHÓM (5 người)
- **Member 1**: Backend Lead (Database & Core Services)
- **Member 2**: Backend Developer (API & Business Logic)
- **Member 3**: Frontend Developer (UI/UX)
- **Member 4**: AI Integration Specialist
- **Member 5**: DevOps & Testing

---

## 📅 GIAI ĐOẠN 1: SETUP & DATABASE (Tuần 1-2)

### Epic 1.1: Project Setup & Infrastructure
**Assignee: Member 5 (DevOps)**

#### Story 1.1.1: Project Initialization
- [ ] **Task 1.1.1.1**: Setup Spring Boot project structure
  - Tạo Maven project với Spring Boot 3.2.0
  - Cấu hình pom.xml với dependencies
  - Setup folder structure (model, repository, service, controller)
- [ ] **Task 1.1.1.2**: Setup React frontend project
  - Tạo Vite + React project
  - Cấu hình Tailwind CSS
  - Setup routing với React Router
- [ ] **Task 1.1.1.3**: Setup Docker environment
  - Tạo Dockerfile cho backend
  - Tạo docker-compose.yml
  - Cấu hình PostgreSQL container

#### Story 1.1.2: Database Configuration
- [ ] **Task 1.1.2.1**: Install & configure PostgreSQL
  - Cài đặt PostgreSQL (port 5433)
  - Tạo database `careermate_db`
  - Cấu hình connection pool
- [ ] **Task 1.1.2.2**: Create database scripts
  - Script tạo database (TAO_DATABASE.sql)
  - Script cấu hình PostgreSQL (CAU_HINH_POSTGRESQL_PORT_5433.ps1)
  - PowerShell automation scripts

---

### Epic 1.2: Database Schema Design
**Assignee: Member 1 (Backend Lead)**

#### Story 1.2.1: Core Database Tables
- [ ] **Task 1.2.1.1**: Design Users & Authentication tables
  - Tạo bảng `users`, `oauth_providers`
  - Indexes và constraints
  - Foreign keys relationships
- [ ] **Task 1.2.1.2**: Design Student Profile tables
  - Bảng `student_profiles`, `student_skills`, `cvs`
  - Relationships và indexes
- [ ] **Task 1.2.1.3**: Design Recruiter & Company tables
  - Bảng `companies`, `recruiter_profiles`, `company_ratings`
  - Business logic constraints

#### Story 1.2.2: Business Logic Tables
- [ ] **Task 1.2.2.1**: Design Jobs & Applications tables
  - Bảng `jobs`, `job_skills`, `applications`, `application_history`
  - Status workflows
- [ ] **Task 1.2.2.2**: Design Learning & Gamification tables
  - Bảng `courses`, `course_enrollments`, `challenges`, `badges`
  - Progress tracking
- [ ] **Task 1.2.2.3**: Design Student Feature tables
  - Bảng `ai_chat_conversations`, `ai_chat_messages`
  - Bảng `saved_jobs`, `mock_interviews`, `job_recommendations`
  - File: TAO_BANG_CHUC_NANG_SINH_VIEN.sql

#### Story 1.2.3: AI & System Tables
- [ ] **Task 1.2.3.1**: Design AI Service tables
  - Bảng `cv_analyses`, `job_matches`
  - JSONB fields cho AI data
- [ ] **Task 1.2.3.2**: Design System tables
  - Bảng `system_logs`, `system_settings`
  - Bảng `articles`, `cv_templates`, `packages`, `subscriptions`

#### Story 1.2.4: Database Triggers & Functions
- [ ] **Task 1.2.4.1**: Create auto-update triggers
  - Trigger `update_updated_at_column()`
  - Apply cho tất cả bảng có `updated_at`
- [ ] **Task 1.2.4.2**: Create initial data scripts
  - Insert default admin user
  - Insert default packages
  - Insert default badges

**Deliverables:**
- ✅ File: `backend/database/schema.sql` (485 lines)
- ✅ File: `TAO_BANG_CHUC_NANG_SINH_VIEN.sql` (132 lines)
- ✅ File: `TAO_DATABASE.sql` (26 lines)

---

## 📅 GIAI ĐOẠN 2: BACKEND CORE - MODELS & REPOSITORIES (Tuần 3-4)

### Epic 2.1: Entity Models Development
**Assignee: Member 1 (Backend Lead) + Member 2 (Backend Developer)**

#### Story 2.1.1: Core Entity Models
**Assignee: Member 1**
- [ ] **Task 2.1.1.1**: Create User & Authentication models
  - `User.java` - User entity với roles
  - `OAuthProvider.java` - OAuth integration
  - JPA annotations, relationships
- [ ] **Task 2.1.1.2**: Create Student Profile models
  - `StudentProfile.java` - Student profile
  - `StudentSkill.java` - Student skills
  - `CV.java` - CV management
- [ ] **Task 2.1.1.3**: Create Recruiter models
  - `RecruiterProfile.java` - Recruiter profile
  - `Company.java` - Company information
  - `CompanyRating.java` - Company ratings

#### Story 2.1.2: Business Logic Models
**Assignee: Member 2**
- [ ] **Task 2.1.2.1**: Create Job & Application models
  - `Job.java` - Job postings
  - `JobSkill.java` - Job required skills
  - `Application.java` - Job applications
  - `ApplicationHistory.java` - Application timeline
- [ ] **Task 2.1.2.2**: Create Learning models
  - `Course.java`, `CourseEnrollment.java`
  - `Quiz.java`, `QuizQuestion.java`, `QuizAttempt.java`, `QuizAnswer.java`
- [ ] **Task 2.1.2.3**: Create Gamification models
  - `Challenge.java`, `ChallengeParticipation.java`
  - `Badge.java`, `StudentBadge.java`
  - `Leaderboard.java`

#### Story 2.1.3: Student Feature Models
**Assignee: Member 1**
- [ ] **Task 2.1.3.1**: Create AI Chat models
  - `AIChatConversation.java` - Conversation management
  - `AIChatMessage.java` - Message storage
- [ ] **Task 2.1.3.2**: Create Job Management models
  - `SavedJob.java` - Favorite jobs
  - `JobRecommendation.java` - AI recommendations
- [ ] **Task 2.1.3.3**: Create Mock Interview models
  - `MockInterview.java` - Interview sessions
  - `MockInterviewQuestion.java` - Questions & answers

#### Story 2.1.4: AI & System Models
**Assignee: Member 2**
- [ ] **Task 2.1.4.1**: Create AI Service models
  - `CVAnalysis.java` - CV analysis results
  - `JobMatch.java` - Job matching scores
- [ ] **Task 2.1.4.2**: Create System models
  - `Article.java` - Articles/Blog posts
  - `CVTemplate.java` - CV templates
  - `Package.java`, `Subscription.java` - Premium packages
  - `CareerRoadmap.java` - Career roadmaps

**Deliverables:**
- ✅ 31 Model files trong `backend/src/main/java/vn/careermate/model/`

---

### Epic 2.2: Repository Layer
**Assignee: Member 1 (Backend Lead) + Member 2 (Backend Developer)**

#### Story 2.2.1: Core Repositories
**Assignee: Member 1**
- [ ] **Task 2.2.1.1**: Create User repositories
  - `UserRepository.java` - User CRUD
  - Custom queries cho authentication
- [ ] **Task 2.2.1.2**: Create Student repositories
  - `StudentProfileRepository.java`
  - `StudentSkillRepository.java`
  - `CVRepository.java`
- [ ] **Task 2.2.1.3**: Create Recruiter repositories
  - `RecruiterProfileRepository.java`
  - `CompanyRepository.java`
  - `CompanyRatingRepository.java`

#### Story 2.2.2: Business Logic Repositories
**Assignee: Member 2**
- [ ] **Task 2.2.2.1**: Create Job repositories
  - `JobRepository.java` - Job search & filtering
  - `JobSkillRepository.java`
  - `ApplicationRepository.java` - Application management
  - `ApplicationHistoryRepository.java`
- [ ] **Task 2.2.2.2**: Create Learning repositories
  - `CourseRepository.java`, `CourseEnrollmentRepository.java`
  - `QuizRepository.java`, `QuizAttemptRepository.java`
- [ ] **Task 2.2.2.3**: Create Gamification repositories
  - `ChallengeRepository.java`, `BadgeRepository.java`
  - `LeaderboardRepository.java`

#### Story 2.2.3: Student Feature Repositories
**Assignee: Member 1**
- [ ] **Task 2.2.3.1**: Create AI Chat repositories
  - `AIChatConversationRepository.java`
  - `AIChatMessageRepository.java`
- [ ] **Task 2.2.3.2**: Create Job Management repositories
  - `SavedJobRepository.java`
  - `JobRecommendationRepository.java`
- [ ] **Task 2.2.3.3**: Create Mock Interview repositories
  - `MockInterviewRepository.java`
  - `MockInterviewQuestionRepository.java`

#### Story 2.2.4: AI & System Repositories
**Assignee: Member 2**
- [ ] **Task 2.2.4.1**: Create AI Service repositories
  - `CVAnalysisRepository.java`
  - `JobMatchRepository.java`
- [ ] **Task 2.2.4.2**: Create System repositories
  - `ArticleRepository.java`
  - `CVTemplateRepository.java`
  - `PackageRepository.java`, `SubscriptionRepository.java`
  - `CareerRoadmapRepository.java`

**Deliverables:**
- ✅ 28 Repository files trong `backend/src/main/java/vn/careermate/repository/`

---

## 📅 GIAI ĐOẠN 3: BACKEND SERVICES & CONTROLLERS (Tuần 5-7)

### Epic 3.1: Service Layer Development
**Assignee: Member 1 (Backend Lead) + Member 2 (Backend Developer)**

#### Story 3.1.1: Core Services
**Assignee: Member 1**
- [ ] **Task 3.1.1.1**: Implement AuthService
  - User registration & login
  - JWT token generation & validation
  - Password hashing (BCrypt)
  - OAuth2 integration
- [ ] **Task 3.1.1.2**: Implement StudentService
  - Profile CRUD operations
  - Skills management
  - CV upload & management
- [ ] **Task 3.1.1.3**: Implement RecruiterService
  - Recruiter profile management
  - Company management
  - Company ratings

#### Story 3.1.2: Business Logic Services
**Assignee: Member 2**
- [ ] **Task 3.1.2.1**: Implement Job & Application Services
  - Job posting & search
  - Application submission
  - Application status management
  - Job matching algorithm
- [ ] **Task 3.1.2.2**: Implement Learning Services
  - CourseService - Course management
  - QuizService - Quiz creation & grading
  - Enrollment tracking
- [ ] **Task 3.1.2.3**: Implement Gamification Services
  - ChallengeService - Challenge management
  - Badge system
  - Leaderboard calculation

#### Story 3.1.3: Student Feature Services
**Assignee: Member 1**
- [ ] **Task 3.1.3.1**: Implement AI Chat Service
  - Conversation management
  - Message history
  - Context management
- [ ] **Task 3.1.3.2**: Implement Job Management Services
  - SavedJobService - Favorite jobs
  - JobRecommendationService - AI recommendations
- [ ] **Task 3.1.3.3**: Implement Mock Interview Service
  - Interview session management
  - Question generation
  - Answer evaluation

#### Story 3.1.4: AI & System Services
**Assignee: Member 2**
- [ ] **Task 3.1.4.1**: Implement File Storage Service
  - File upload handling (PDF, DOCX, images)
  - File storage management
  - File validation
- [ ] **Task 3.1.4.2**: Implement System Services
  - ArticleService - Content management
  - CVTemplateService - Template management
  - PackageService - Premium packages
  - CareerRoadmapService - Roadmap generation
- [ ] **Task 3.1.4.3**: Implement Admin Service
  - User management
  - Content approval
  - System monitoring

**Deliverables:**
- ✅ 19 Service files trong `backend/src/main/java/vn/careermate/service/`

---

### Epic 3.2: Controller Layer (REST API)
**Assignee: Member 2 (Backend Developer)**

#### Story 3.2.1: Authentication & User APIs
- [ ] **Task 3.2.1.1**: Implement AuthController
  - POST `/api/auth/register` - User registration
  - POST `/api/auth/login` - User login
  - POST `/api/auth/refresh` - Token refresh
  - GET `/api/auth/me` - Current user info
- [ ] **Task 3.2.1.2**: Implement StudentController
  - GET/PUT `/api/students/profile` - Profile management
  - POST `/api/students/cvs` - CV upload
  - GET `/api/students/cvs` - List CVs
  - GET `/api/students/skills` - Skills management

#### Story 3.2.2: Job & Application APIs
- [ ] **Task 3.2.2.1**: Implement Job Search APIs
  - GET `/api/jobs` - Search jobs
  - GET `/api/jobs/{id}` - Job details
  - POST `/api/jobs/{id}/apply` - Apply for job
- [ ] **Task 3.2.2.2**: Implement Application APIs
  - GET `/api/applications` - List applications
  - GET `/api/applications/{id}` - Application details
  - PUT `/api/applications/{id}/status` - Update status

#### Story 3.2.3: Student Feature APIs
- [ ] **Task 3.2.3.1**: Implement AI Chat APIs
  - POST `/api/ai/chat/conversations` - Create conversation
  - GET `/api/ai/chat/conversations` - List conversations
  - POST `/api/ai/chat/messages` - Send message
  - GET `/api/ai/chat/conversations/{id}/messages` - Get messages
- [ ] **Task 3.2.3.2**: Implement Job Management APIs
  - POST `/api/jobs/{id}/save` - Save job
  - GET `/api/jobs/saved` - List saved jobs
  - GET `/api/jobs/recommendations` - Get recommendations
- [ ] **Task 3.2.3.3**: Implement Mock Interview APIs
  - POST `/api/mock-interviews` - Start interview
  - GET `/api/mock-interviews` - List interviews
  - POST `/api/mock-interviews/{id}/answer` - Submit answer

#### Story 3.2.4: Recruiter & Admin APIs
- [ ] **Task 3.2.4.1**: Implement RecruiterController
  - POST `/api/recruiters/jobs` - Post job
  - GET `/api/recruiters/jobs` - List posted jobs
  - GET `/api/recruiters/applications` - View applications
  - PUT `/api/recruiters/applications/{id}/status` - Update status
- [ ] **Task 3.2.4.2**: Implement AdminController
  - GET `/api/admin/users` - User management
  - GET `/api/admin/jobs` - Job approval
  - GET `/api/admin/articles` - Content approval
  - GET `/api/admin/stats` - System statistics

#### Story 3.2.5: Learning & Gamification APIs
- [ ] **Task 3.2.5.1**: Implement Learning APIs
  - GET `/api/courses` - List courses
  - POST `/api/courses/{id}/enroll` - Enroll course
  - GET `/api/quizzes` - List quizzes
  - POST `/api/quizzes/{id}/attempt` - Take quiz
- [ ] **Task 3.2.5.2**: Implement Gamification APIs
  - GET `/api/challenges` - List challenges
  - POST `/api/challenges/{id}/join` - Join challenge
  - GET `/api/badges` - List badges
  - GET `/api/leaderboard` - Leaderboard

**Deliverables:**
- ✅ 15 Controller files
- ✅ 50+ API endpoints

---

## 📅 GIAI ĐOẠN 4: AI INTEGRATION (Tuần 8-9)

### Epic 4.1: AI Service Integration
**Assignee: Member 4 (AI Integration Specialist)**

#### Story 4.1.1: Google Gemini API Setup
- [ ] **Task 4.1.1.1**: Configure Gemini API client
  - Setup API key management
  - Create WebClient configuration
  - Error handling & retry logic
- [ ] **Task 4.1.1.2**: Test Gemini API connection
  - Test API connectivity
  - Test different models (gemini-1.5-flash, gemini-pro)
  - Create test utilities

#### Story 4.1.2: CV Analysis AI Service
- [ ] **Task 4.1.2.1**: Implement CV text extraction
  - PDF extraction (PDFExtractor.java)
  - DOCX extraction (DOCXExtractor.java)
  - Text preprocessing
- [ ] **Task 4.1.2.2**: Implement CV Analysis with AI
  - Send CV content to Gemini API
  - Parse AI response (strengths, weaknesses, suggestions)
  - Calculate CV score (0-100)
  - Store analysis results
- [ ] **Task 4.1.2.3**: Create CV Analysis endpoints
  - POST `/api/ai/cv/analyze` - Analyze CV
  - GET `/api/ai/cv/{cvId}/analysis` - Get analysis results

#### Story 4.1.3: Career Coach Chatbot
- [ ] **Task 4.1.3.1**: Implement Chat Service
  - Conversation context management
  - Message history tracking
  - Role-based prompts (CAREER_COACH, CV_ADVISOR, INTERVIEW_PREP)
- [ ] **Task 4.1.3.2**: Integrate with Gemini API
  - Send messages to Gemini
  - Handle streaming responses
  - Token usage tracking
- [ ] **Task 4.1.3.3**: Create Chat Widget
  - Frontend chat component (ChatWidget.jsx)
  - Real-time message display
  - Conversation history

#### Story 4.1.4: Job Matching AI
- [ ] **Task 4.1.4.1**: Implement Job Matching Algorithm
  - Compare student profile with job requirements
  - Skill matching calculation
  - Experience level matching
  - Education matching
- [ ] **Task 4.1.4.2**: AI-powered Recommendations
  - Use Gemini to analyze job descriptions
  - Generate match reasons
  - Calculate match scores (0-100)
- [ ] **Task 4.1.4.3**: Recommendation Service
  - Generate recommendations for student
  - Update recommendations periodically
  - Track viewed/applied status

#### Story 4.1.5: Mock Interview AI
- [ ] **Task 4.1.5.1**: Implement Question Generation
  - Generate interview questions based on job & CV
  - Use Gemini to create relevant questions
  - Question difficulty levels
- [ ] **Task 4.1.5.2**: Implement Answer Evaluation
  - Send student answers to Gemini
  - Get AI feedback & scoring
  - Overall interview score calculation
- [ ] **Task 4.1.5.3**: Mock Interview Flow
  - Interview session management
  - Question-answer flow
  - Results & feedback display

#### Story 4.1.6: Vector Database Integration
- [ ] **Task 4.1.6.1**: Setup Vector Database
  - Configure vector DB service
  - Embedding generation
- [ ] **Task 4.1.6.2**: Implement Semantic Search
  - Create embeddings for jobs
  - Semantic job search
  - Similar job recommendations

**Deliverables:**
- ✅ AIService.java
- ✅ EmbeddingService.java
- ✅ VectorDBService.java
- ✅ PDFExtractor.java, DOCXExtractor.java
- ✅ GeminiModelTester.java

---

## 📅 GIAI ĐOẠN 5: SECURITY & CONFIGURATION (Tuần 10)

### Epic 5.1: Security Implementation
**Assignee: Member 1 (Backend Lead)**

#### Story 5.1.1: JWT Authentication
- [ ] **Task 5.1.1.1**: Implement JWT Service
  - JWT token generation (JwtService.java)
  - Token validation
  - Token refresh mechanism
- [ ] **Task 5.1.1.2**: Implement JWT Filter
  - JwtAuthenticationFilter.java
  - Request authentication
  - Token extraction from headers
- [ ] **Task 5.1.1.3**: Configure Spring Security
  - SecurityConfig.java
  - Public vs protected endpoints
  - Role-based access control

#### Story 5.1.2: OAuth2 Integration
- [ ] **Task 5.1.2.1**: Configure OAuth2 Client
  - Google OAuth2 setup
  - OAuth2 provider configuration
- [ ] **Task 5.1.2.2**: Implement OAuth2 Callback
  - Handle OAuth2 callback
  - Create/update user from OAuth
  - Generate JWT after OAuth login

#### Story 5.1.3: User Details Service
- [ ] **Task 5.1.3.1**: Implement UserDetailsService
  - UserDetailsServiceImpl.java
  - Load user by email
  - Password authentication

**Deliverables:**
- ✅ JwtService.java
- ✅ JwtAuthenticationFilter.java
- ✅ SecurityConfig.java
- ✅ UserDetailsServiceImpl.java

---

### Epic 5.2: Configuration & Utilities
**Assignee: Member 5 (DevOps)**

#### Story 5.2.1: Application Configuration
- [ ] **Task 5.2.1.1**: Setup application.yml
  - Database configuration
  - JWT secret configuration
  - AI API configuration
  - File upload configuration
- [ ] **Task 5.2.1.2**: Environment-specific configs
  - application-dev.yml
  - application-prod.yml
  - Environment variables

#### Story 5.2.2: OpenAPI/Swagger Documentation
- [ ] **Task 5.2.2.1**: Configure OpenAPI
  - OpenAPIConfig.java
  - API documentation setup
  - Swagger UI configuration

#### Story 5.2.3: Exception Handling
- [ ] **Task 5.2.3.1**: Global Exception Handler
  - GlobalExceptionHandler.java
  - Custom exception classes
  - Error response format

**Deliverables:**
- ✅ application.yml, application-dev.yml
- ✅ OpenAPIConfig.java
- ✅ GlobalExceptionHandler.java
- ✅ ErrorResponse.java

---

## 📅 GIAI ĐOẠN 6: FRONTEND DEVELOPMENT (Tuần 11-13)

### Epic 6.1: Frontend Setup & Core
**Assignee: Member 3 (Frontend Developer)**

#### Story 6.1.1: Project Setup
- [ ] **Task 6.1.1.1**: Initialize React project
  - Setup Vite + React
  - Configure Tailwind CSS
  - Setup project structure
- [ ] **Task 6.1.1.2**: Setup Routing
  - React Router configuration
  - Protected routes
  - Route guards

#### Story 6.1.2: Core Components
- [ ] **Task 6.1.2.1**: Create Layout Components
  - StudentLayout.jsx
  - RecruiterLayout.jsx
  - AdminLayout.jsx
- [ ] **Task 6.1.2.2**: Create Auth Context
  - AuthContext.jsx
  - Authentication state management
  - Token storage

#### Story 6.1.3: API Client
- [ ] **Task 6.1.3.1**: Create API Service
  - api.js - Axios configuration
  - API endpoints mapping
  - Request/response interceptors
  - Error handling

---

### Epic 6.2: Student Frontend Pages
**Assignee: Member 3 (Frontend Developer)**

#### Story 6.2.1: Authentication Pages
- [ ] **Task 6.2.1.1**: Login Page
  - Login.jsx - Login form
  - OAuth2 login buttons
  - Error handling
- [ ] **Task 6.2.1.2**: Register Page
  - Register.jsx - Registration form
  - Form validation
  - Role selection

#### Story 6.2.2: Student Dashboard
- [ ] **Task 6.2.2.1**: Dashboard Page
  - Dashboard.jsx - Statistics display
  - Recent jobs widget
  - Quick actions
- [ ] **Task 6.2.2.2**: Profile Management
  - Profile.jsx - Edit profile
  - ProfileView.jsx - View profile
  - Skills management UI

#### Story 6.2.3: CV Management
- [ ] **Task 6.2.3.1**: CV Upload Page
  - CVUpload.jsx - File upload
  - CV list display
  - Set default CV
- [ ] **Task 6.2.3.2**: CV Analysis Page
  - CVAnalysis.jsx - Display analysis results
  - Score visualization
  - Improvement suggestions

#### Story 6.2.4: Job Features
- [ ] **Task 6.2.4.1**: Job List Page
  - JobList.jsx - Job search & filters
  - Job cards display
  - Pagination
- [ ] **Task 6.2.4.2**: Job Detail Page
  - JobDetail.jsx - Job details
  - Apply button
  - Save job button
- [ ] **Task 6.2.4.3**: Job Recommendations
  - JobRecommendations.jsx - AI recommendations
  - Match score display
  - Apply from recommendations

#### Story 6.2.5: AI Features
- [ ] **Task 6.2.5.1**: Career Coach Page
  - CareerCoach.jsx - Chat interface
  - Conversation history
  - Message input
- [ ] **Task 6.2.5.2**: Chat Widget Component
  - ChatWidget.jsx - Floating chat widget
  - Real-time messaging
  - Conversation management

#### Story 6.2.6: Learning Features
- [ ] **Task 6.2.6.1**: Career Roadmap
  - CareerRoadmap.jsx - Roadmap visualization
  - Milestone tracking
- [ ] **Task 6.2.6.2**: Quiz Page
  - Quiz.jsx - Quiz taking interface
  - Question display
  - Results page

#### Story 6.2.7: Applications
- [ ] **Task 6.2.7.1**: Applications Page
  - Applications.jsx - Application list
  - Status tracking
  - Application details

**Deliverables:**
- ✅ 15+ Frontend pages trong `frontend/src/pages/`
- ✅ Layout components
- ✅ API client service

---

### Epic 6.3: Recruiter & Admin Frontend
**Assignee: Member 3 (Frontend Developer)**

#### Story 6.3.1: Recruiter Pages
- [ ] **Task 6.3.1.1**: Recruiter Dashboard
  - Dashboard.jsx - Statistics
  - Recent applications
- [ ] **Task 6.3.1.2**: Post Job Page
  - PostJob.jsx - Job posting form
  - Job management
- [ ] **Task 6.3.1.3**: Applicants Page
  - Applicants.jsx - Application pipeline
  - Candidate profiles
  - Status management
- [ ] **Task 6.3.1.4**: Company & Profile
  - Company.jsx - Company management
  - Profile.jsx - Recruiter profile

#### Story 6.3.2: Admin Pages
- [ ] **Task 6.3.2.1**: Admin Dashboard
  - Dashboard.jsx - System statistics
  - Quick actions
- [ ] **Task 6.3.2.2**: User Management
  - UserManagement.jsx - User list
  - User actions (activate, suspend)
- [ ] **Task 6.3.2.3**: Job Management
  - JobManagement.jsx - Job approval
  - Content moderation

**Deliverables:**
- ✅ Recruiter pages (4 pages)
- ✅ Admin pages (3 pages)

---

## 📅 GIAI ĐOẠN 7: TESTING & DOCUMENTATION (Tuần 14-15)

### Epic 7.1: Testing
**Assignee: Member 5 (DevOps & Testing)**

#### Story 7.1.1: Unit Testing
- [ ] **Task 7.1.1.1**: Service Layer Tests
  - Test all service methods
  - Mock dependencies
  - Test edge cases
- [ ] **Task 7.1.1.2**: Repository Tests
  - Test custom queries
  - Test CRUD operations
- [ ] **Task 7.1.1.3**: Controller Tests
  - Test API endpoints
  - Test authentication
  - Test authorization

#### Story 7.1.2: Integration Testing
- [ ] **Task 7.1.2.1**: API Integration Tests
  - Test complete API flows
  - Test database integration
  - Test AI service integration
- [ ] **Task 7.1.2.2**: End-to-End Tests
  - Test user journeys
  - Test cross-module flows

#### Story 7.1.3: Frontend Testing
- [ ] **Task 7.1.3.1**: Component Tests
  - Test React components
  - Test user interactions
- [ ] **Task 7.1.3.2**: Integration Tests
  - Test API integration
  - Test routing

---

### Epic 7.2: Documentation
**Assignee: All Members**

#### Story 7.2.1: Technical Documentation
**Assignee: Member 1 + Member 2**
- [ ] **Task 7.2.1.1**: API Documentation
  - Swagger/OpenAPI documentation
  - Endpoint descriptions
  - Request/response examples
- [ ] **Task 7.2.1.2**: Database Documentation
  - ERD diagrams
  - Table descriptions
  - Relationship documentation

#### Story 7.2.2: User Documentation
**Assignee: Member 3**
- [ ] **Task 7.2.2.1**: Installation Guide
  - Setup instructions
  - Environment configuration
  - Database setup
- [ ] **Task 7.2.2.2**: User Manual
  - Student user guide
  - Recruiter user guide
  - Admin user guide

#### Story 7.2.3: Project Documentation
**Assignee: Member 5**
- [ ] **Task 7.2.3.1**: Architecture Documentation
  - System architecture
  - Technology stack
  - Design decisions
- [ ] **Task 7.2.3.2**: Deployment Guide
  - Docker deployment
  - Production setup
  - Environment variables

**Deliverables:**
- ✅ Test coverage reports
- ✅ API documentation (Swagger)
- ✅ Installation guides
- ✅ User manuals

---

## 📊 TỔNG KẾT PHÂN CÔNG

### Member 1 (Backend Lead) - Database & Core Services
**Tổng số tasks: ~35 tasks**
- Giai đoạn 1: Database schema design (Epic 1.2)
- Giai đoạn 2: Core models & repositories (Epic 2.1, 2.2.1, 2.2.3)
- Giai đoạn 3: Core services (Epic 3.1.1, 3.1.3)
- Giai đoạn 5: Security implementation (Epic 5.1)

### Member 2 (Backend Developer) - API & Business Logic
**Tổng số tasks: ~40 tasks**
- Giai đoạn 2: Business logic models & repositories (Epic 2.1.2, 2.2.2, 2.2.4)
- Giai đoạn 3: Business services & all controllers (Epic 3.1.2, 3.1.4, Epic 3.2)
- Giai đoạn 7: Technical documentation

### Member 3 (Frontend Developer) - UI/UX
**Tổng số tasks: ~30 tasks**
- Giai đoạn 6: Toàn bộ frontend development (Epic 6.1, 6.2, 6.3)
- Giai đoạn 7: User documentation

### Member 4 (AI Integration Specialist)
**Tổng số tasks: ~15 tasks**
- Giai đoạn 4: Toàn bộ AI integration (Epic 4.1)
- AI service testing & optimization

### Member 5 (DevOps & Testing)
**Tổng số tasks: ~20 tasks**
- Giai đoạn 1: Project setup & infrastructure (Epic 1.1)
- Giai đoạn 5: Configuration (Epic 5.2)
- Giai đoạn 7: Testing & deployment docs (Epic 7.1, 7.2.3)

---

## 📈 TIẾN ĐỘ TỔNG THỂ

| Giai đoạn | Thời gian | Trạng thái | Hoàn thành |
|-----------|-----------|------------|------------|
| Giai đoạn 1: Setup & Database | Tuần 1-2 | ✅ Hoàn thành | 100% |
| Giai đoạn 2: Models & Repositories | Tuần 3-4 | ✅ Hoàn thành | 100% |
| Giai đoạn 3: Services & Controllers | Tuần 5-7 | ✅ Hoàn thành | 100% |
| Giai đoạn 4: AI Integration | Tuần 8-9 | ✅ Hoàn thành | 100% |
| Giai đoạn 5: Security & Config | Tuần 10 | ✅ Hoàn thành | 100% |
| Giai đoạn 6: Frontend Development | Tuần 11-13 | ⏳ Đang làm | 60% |
| Giai đoạn 7: Testing & Documentation | Tuần 14-15 | ⏳ Chưa bắt đầu | 0% |

---

## 📝 GHI CHÚ QUAN TRỌNG

1. **Các task đã hoàn thành (✅)**: Đã có code trong repository
2. **Các task đang làm (⏳)**: Đã có một phần, cần hoàn thiện
3. **Các task chưa bắt đầu**: Cần implement

4. **Dependencies**: 
   - Giai đoạn 2 phụ thuộc vào Giai đoạn 1
   - Giai đoạn 3 phụ thuộc vào Giai đoạn 2
   - Giai đoạn 4 có thể làm song song với Giai đoạn 3
   - Giai đoạn 6 phụ thuộc vào Giai đoạn 3 (API endpoints)

5. **Parallel Work**:
   - Member 1 & Member 2 có thể làm song song trong Giai đoạn 2
   - Member 4 có thể bắt đầu Giai đoạn 4 khi có API endpoints cơ bản
   - Member 3 có thể bắt đầu frontend khi có API documentation

---

**File này có thể import vào Jira hoặc sử dụng làm template để tạo tickets.**

