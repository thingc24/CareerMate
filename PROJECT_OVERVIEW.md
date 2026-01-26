# 📚 CareerMate - Tóm Tắt Toàn Bộ Dự Án

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 24/01/2026  
**Trạng thái:** Microservices Architecture (Partial Migration)

---

## 🎯 Mục Đích Dự Án

**CareerMate** là một hệ thống quản lý nghề nghiệp được thiết kế cho ba nhóm người dùng chính:
- 👨‍🎓 **Sinh viên**: Tìm việc, upload CV, nhận AI coaching, lộ trình sự nghiệp
- 👔 **Nhà tuyển dụng**: Đăng tin tuyển dụng, tìm ứng viên, quản lý công ty
- 👨‍💼 **Quản trị viên**: Quản lý toàn bộ hệ thống, phân tích dữ liệu

---

## 🏗️ Kiến Trúc Hệ Thống

### **Frontend (React + Vite)**
```
c:\xampp\htdocs\CareerMate\frontend/
├── public/                 # Static assets
├── src/
│   ├── App.jsx            # Main app component with routing
│   ├── main.jsx           # Entry point
│   ├── index.css          # Global styles
│   ├── pages/             # Page components (organized by role)
│   │   ├── auth/          # Login, Register
│   │   ├── student/       # Student features (dashboard, jobs, CV, etc.)
│   │   ├── recruiter/     # Recruiter features (post jobs, view applicants, etc.)
│   │   └── admin/         # Admin features (user/job/content management)
│   ├── components/        # Reusable components
│   ├── contexts/          # React Contexts (Auth, DarkMode)
│   ├── services/          # API client (api.js)
│   └── layouts/           # Layout components
├── package.json           # Dependencies: React 18, React Router 7, Axios, Tailwind CSS
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS config
└── postcss.config.js      # PostCSS config
```

**Key Technologies:**
- React 18.2.0
- React Router DOM 7.11.0
- Axios 1.13.2 (HTTP client)
- Tailwind CSS 3.4.17 (Styling)
- Vite 7.2.4 (Build tool)

---

### **Backend (Spring Boot Microservices)**

#### **Structure Overview**
```
c:\xampp\htdocs\CareerMate\backend/
├── microservices/         # Microservices architecture
│   ├── eureka-server/         (Port 8761) - Service Discovery
│   ├── api-gateway/           (Port 8080) - API Gateway (Spring Cloud Gateway)
│   ├── common/                - Shared DTOs & Feign Clients
│   ├── user-service/          (Port 8081) - User Management
│   ├── job-service/           (Port 8082) - Job Management
│   ├── content-service/       (Port 8083) - Content & Articles
│   ├── learning-service/      (Port 8084) - Learning & Courses
│   ├── notification-service/  (Port 8086) - Notifications
│   ├── admin-service/         (Port 8085) - Admin Panel
│   └── ai-service/            (Port 8087) - AI Services (OpenRouter API)
├── src/                   # Legacy monolith source (for reference)
├── pom.xml               # Root pom.xml
├── Dockerfile            # Docker configuration
└── docker-compose.yml    # Docker Compose setup
```

**Technology Stack:**
- Java 17+ (JDK 23 recommended)
- Spring Boot 3.2.0
- Spring Cloud 2023.0.0
- Spring Cloud Gateway (API routing)
- Spring Cloud OpenFeign (Inter-service communication)
- Spring Cloud Eureka (Service discovery)
- Spring Data JPA (ORM)
- Spring Security + JWT (Authentication)
- PostgreSQL 12+ (Database)
- Redis (optional, caching)
- Maven 3.6+ (Build tool)

---

## 📊 Database Architecture

### **Database Structure**
- **Main DB**: `careermate_db` 
- **Separate Schemas** per service:
  - `public` - Users, authentication data
  - `jobservice` - Job, Application, SavedJob, JobSkill
  - `contentservice` - Article, Company, CompanyRating
  - `learningservice` - CVTemplate, Course, Lesson, Enrollment
  - `notificationservice` - Notification
  - `aiservice` - AI-related data
  - `adminservice` - Admin configurations

### **Key Tables**
| Table | Service | Purpose |
|-------|---------|---------|
| `users` | user-service | User accounts, authentication |
| `student_profile` | user-service | Student profile info |
| `recruiter_profile` | user-service | Recruiter profile info |
| `jobs` | job-service | Job postings |
| `applications` | job-service | Job applications |
| `saved_jobs` | job-service | Saved jobs by students |
| `articles` | content-service | Blog articles |
| `companies` | content-service | Company information |
| `company_ratings` | content-service | Company ratings/reviews |
| `cv_templates` | learning-service | CV templates |
| `courses` | learning-service | Learning courses |
| `enrollments` | learning-service | Course enrollments |
| `notifications` | notification-service | User notifications |

---

## 🔄 Microservices Communication

### **Service Interaction Pattern**
```
Frontend (React) 
    ↓
API Gateway (8080)
    ↓
Eureka Server (8761) ← Service Registry
    ↓
Microservices (8081-8087)
    ↓
PostgreSQL Database
```

### **Inter-Service Communication**
- **Method**: Spring Cloud OpenFeign (Feign Clients)
- **Location**: `backend/microservices/common/` contains shared Feign Client interfaces
- **Key Clients**:
  - `UserServiceClient` - Get user info
  - `NotificationServiceClient` - Send notifications
  - `JobServiceClient` - Get job data
  - `ContentServiceClient` - Get articles, company info
  - `LearningServiceClient` - Get courses, CV templates
  - `AIServiceClient` - Get AI services

### **Authentication**
- JWT token-based authentication
- API Gateway validates JWT on entry
- Each service validates JWT independently
- Token stored in `Authorization: Bearer <token>` header

---

## 👥 User Roles & Permissions

### **1. STUDENT**
**Features:**
- ✅ User authentication (signup/login)
- ✅ Profile management
- ✅ CV upload & storage
- ✅ CV Analysis (AI-powered) using OpenRouter API
- ✅ View job listings & details
- ✅ Apply for jobs
- ✅ Job recommendations (AI-powered)
- ✅ Career Roadmap (AI-powered)
- ✅ View articles
- ✅ Company search & ratings
- ✅ CV Templates (view & edit)
- ✅ Learning Courses (view & enroll)
- ✅ Challenges & Badges (gamification)
- ✅ Premium Packages
- ✅ Messages/Chat
- ✅ Quiz
- ✅ Dashboard

**Pages:**
- `/student/dashboard` - Dashboard
- `/student/jobs` - Job listing
- `/student/jobs/:id` - Job details
- `/student/recommendations` - Job recommendations
- `/student/cv` - CV upload
- `/student/cv/:cvId/analysis` - CV analysis
- `/student/roadmap` - Career roadmap
- `/student/quiz` - Quiz
- `/student/applications` - My applications
- `/student/articles` - Articles
- `/student/articles/:id` - Article details
- `/student/companies` - Company search
- `/student/companies/:id` - Company details
- `/student/cv-templates` - CV templates
- `/student/cv-templates/:id` - CV editor
- `/student/courses` - Courses
- `/student/courses/:id` - Course details
- `/student/courses/:courseId/learn/:enrollmentId/:lessonId?` - Course player
- `/student/challenges` - Challenges
- `/student/challenges/:id` - Challenge details
- `/student/packages` - Premium packages
- `/student/messages` - Messages
- `/student/profile` - Profile view/edit

### **2. RECRUITER**
**Features:**
- ✅ User authentication
- ✅ Company profile management
- ✅ Post job postings
- ✅ View applicants
- ✅ Find candidates
- ✅ Articles creation/management
- ✅ Messages/Chat
- ✅ Dashboard

**Pages:**
- `/recruiter/dashboard` - Dashboard
- `/recruiter/post-job` - Post new job
- `/recruiter/applicants` - View applicants
- `/recruiter/find-candidates` - Find candidates
- `/recruiter/company/view` - View company info
- `/recruiter/company/edit` - Edit company info
- `/recruiter/profile` - Profile
- `/recruiter/articles/create` - Create article
- `/recruiter/articles` - My articles
- `/recruiter/messages` - Messages

### **3. ADMIN**
**Features:**
- ✅ User management
- ✅ Job management (approve/reject/hide)
- ✅ Article management
- ✅ CV Template management
- ✅ Package management
- ✅ Analytics & Reports
- ✅ Messages
- ✅ Dashboard

**Pages:**
- `/admin/dashboard` - Dashboard with analytics
- `/admin/users` - User management
- `/admin/jobs` - Job management
- `/admin/articles` - Article management
- `/admin/articles/create` - Create article
- `/admin/cv-templates` - CV templates management
- `/admin/packages` - Packages management
- `/admin/analytics` - Analytics
- `/admin/messages` - Messages

---

## 🤖 AI Integration

**Service**: `ai-service` (Port 8087)

**Features:**
1. **CV Analysis**: Analyze uploaded CV, provide suggestions using AI
2. **Job Recommendations**: AI-powered job recommendations based on student profile
3. **Career Roadmap**: Generate career development roadmap using AI
4. **AI Chat Coach**: Conversational AI assistant for career guidance

**Provider**: OpenRouter API (supports multiple AI models)

**Configuration**:
- API Key: Set via environment variable `OPENROUTER_API_KEY`
- Models: Claude, GPT, etc. (configurable)
- Endpoint: OpenRouter API (`https://openrouter.ai/api/v1/*`)

---

## 📁 Project File Structure

### **Key Files**

**Root Directory:**
```
CareerMate/
├── README.md                              # Main documentation
├── HUONG_DAN_CHAY_PROJECT.md             # Setup guide (Vietnamese)
├── HUONG_DAN_CHAY_SQL_CMD.md             # SQL setup guide
├── HUONG_DAN_LOG.md                      # Logging guide
├── TAO_DATABASE.sql                      # Database creation script
├── TAO_BANG_CHUC_NANG_SINH_VIEN.sql     # Create student functions table
├── KIEM_TRA_QUIZ_TABLES.sql              # Check quiz tables
├── GEMINI_MODEL_TEST_RESULTS.md          # AI model test results
├── DANH_SACH_CHUC_NANG_THIEU.md         # Missing features list (Vietnamese)

# Batch Files (Windows)
├── COPY_USER_SERVICE.bat                 # Copy user service
├── KIEM_TRA_DATABASE.bat                 # Check database
├── TAO_DATABASE_CMD.bat                  # Create database
├── TAO_QUIZ_TABLES.bat                   # Create quiz tables

# PowerShell Scripts
├── CHAY_BACKEND.ps1                      # Run backend
├── CHAY_FRONTEND.ps1                     # Run frontend
├── CHAY_TAT_CA.ps1                       # Run all (backend + frontend)
├── TEST_OPENROUTER_API.ps1               # Test OpenRouter API
├── INSERT_PACKAGES.ps1                   # Insert package data
├── KIEM_TRA_SERVICES.ps1                 # Check services
├── RESTART_API_GATEWAY.ps1               # Restart API gateway
├── RESTART_BACKEND.ps1                   # Restart backend
├── TIM_KIEM_LOG.ps1                      # Search logs
├── XEM_LOG.ps1                           # View logs
├── XEM_LOG_ERROR.ps1                     # View error logs
├── XEM_LOG_SUBMIT.ps1                    # View submission logs
├── XEM_LOG_THEO_DOI.ps1                  # Follow logs
├── XOA_LOG_CU.ps1                        # Delete old logs
```

---

## 🚀 How to Run

### **Prerequisites**
- Java JDK 17+ (JDK 23 recommended)
- Maven 3.6+
- PostgreSQL 12+
- Node.js 18+
- npm or yarn

### **Quick Start**

**1. Setup Database:**
```powershell
# Create database
psql -U postgres -f TAO_DATABASE.sql

# Create student functions table (if needed)
psql -U postgres -d careermate_db -f TAO_BANG_CHUC_NANG_SINH_VIEN.sql
```

**2. Run Backend Services:**
```powershell
# Run all microservices automatically
.\CHAY_TAT_CA.ps1 -ApiKey "YOUR_OPENROUTER_API_KEY"

# OR manually start each service:
cd backend\microservices
.\START_SERVICES.ps1
```

**3. Run Frontend:**
```powershell
.\CHAY_FRONTEND.ps1

# OR manually:
cd frontend
npm install
npm run dev
```

**4. Access Application:**
- Frontend: `http://localhost:5173`
- API Gateway: `http://localhost:8080`
- Eureka Dashboard: `http://localhost:8761`

---

## 📋 Current Status

### **✅ Completed**
- ✅ Full microservices architecture setup (8 services)
- ✅ Eureka Server & API Gateway
- ✅ User authentication with JWT
- ✅ Database schemas for each service
- ✅ Frontend: Complete UI for all roles
- ✅ Frontend: Responsive design with Tailwind CSS
- ✅ Frontend: Dark mode support
- ✅ AI integration via OpenRouter API
- ✅ Core features: jobs, CV, applications, articles, etc.

### **⏳ In Progress / Partially Complete**
- ⏳ Microservices refactoring (removing direct dependencies)
- ⏳ Feign Client implementation (needs completion in some services)
- ⏳ Cross-service data consistency
- ⏳ Error handling improvements
- ⏳ API documentation (Swagger/OpenAPI)

### **❌ Missing Features**
- ❌ Google OAuth login
- ❌ Payment integration (Premium packages)
- ❌ Email notifications (scheduled, real-time)
- ❌ Video streaming (for courses)
- ❌ Advanced analytics dashboard
- ❌ Unit & integration tests (comprehensive)
- ❌ API rate limiting
- ❌ Caching optimization (Redis)
- ❌ WebSocket for real-time features
- ❌ Docker deployment with Kubernetes

---

## 🔐 Security

### **Authentication & Authorization**
1. JWT-based authentication
2. Spring Security configuration per service
3. Token validation at API Gateway level
4. Role-based access control (RBAC)
5. Password hashing (BCrypt)

### **Security Headers**
- CORS configuration
- CSRF protection (where applicable)
- Input validation
- SQL injection prevention (JPA)

---

## 📊 API Endpoints Overview

### **User Service (8081)**
```
POST   /api/auth/register              - Register new user
POST   /api/auth/login                 - Login
GET    /api/auth/validate-token        - Validate JWT
GET    /api/users/{userId}             - Get user info
PUT    /api/users/{userId}             - Update user
GET    /api/students/{studentId}       - Get student profile
POST   /api/students                   - Create student profile
PUT    /api/recruiters/{recruiterId}   - Update recruiter profile
```

### **Job Service (8082)**
```
GET    /api/jobs                       - Get all jobs
GET    /api/jobs/{jobId}               - Get job details
POST   /api/jobs                       - Post new job (recruiter)
GET    /api/applications               - Get student applications
POST   /api/applications               - Apply for job
POST   /api/saved-jobs                 - Save job
GET    /api/saved-jobs                 - Get saved jobs
```

### **Content Service (8083)**
```
GET    /api/articles                   - Get articles
GET    /api/articles/{articleId}       - Get article details
POST   /api/articles                   - Create article
GET    /api/companies                  - Get companies
GET    /api/companies/{companyId}      - Get company details
GET    /api/companies/{companyId}/ratings - Get company ratings
POST   /api/companies/{companyId}/ratings - Rate company
```

### **Learning Service (8084)**
```
GET    /api/cv-templates               - Get CV templates
GET    /api/cv-templates/{templateId}  - Get template details
GET    /api/courses                    - Get courses
GET    /api/courses/{courseId}         - Get course details
POST   /api/enrollments                - Enroll in course
GET    /api/lessons/{lessonId}         - Get lesson details
```

### **Notification Service (8086)**
```
POST   /api/notifications              - Send notification
GET    /api/notifications              - Get user notifications
PUT    /api/notifications/{id}/read    - Mark as read
```

### **Admin Service (8085)**
```
GET    /api/admin/users                - Get all users
PUT    /api/admin/users/{userId}       - Update user (admin)
GET    /api/admin/jobs                 - Get all jobs
PUT    /api/admin/jobs/{jobId}         - Update job status
GET    /api/admin/analytics            - Get analytics
```

### **AI Service (8087)**
```
POST   /api/ai/analyze-cv              - Analyze CV
POST   /api/ai/job-recommendations     - Get job recommendations
POST   /api/ai/career-roadmap          - Generate career roadmap
POST   /api/ai/chat                    - Chat with AI coach
```

---

## 🛠️ Development & Deployment Scripts

### **PowerShell Scripts**
| Script | Purpose |
|--------|---------|
| `CHAY_BACKEND.ps1` | Start backend services |
| `CHAY_FRONTEND.ps1` | Start frontend dev server |
| `CHAY_TAT_CA.ps1` | Start all (backend + frontend) |
| `RESTART_BACKEND.ps1` | Restart backend |
| `RESTART_API_GATEWAY.ps1` | Restart API gateway only |
| `KIEM_TRA_SERVICES.ps1` | Check service health |
| `XEM_LOG.ps1` | View log files |
| `XEM_LOG_ERROR.ps1` | View error logs only |
| `TIM_KIEM_LOG.ps1` | Search logs by keyword |
| `TEST_OPENROUTER_API.ps1` | Test AI API integration |

### **Batch Files**
| File | Purpose |
|------|---------|
| `TAO_DATABASE_CMD.bat` | Create database |
| `KIEM_TRA_DATABASE.bat` | Check database |
| `COPY_USER_SERVICE.bat` | Copy user service |
| `TAO_QUIZ_TABLES.bat` | Create quiz tables |

---

## 📝 Important Configuration Files

### **Backend Configs**
- `backend/microservices/*/src/main/resources/application.yml` - Service configuration
- `backend/microservices/eureka-server/src/main/resources/application.yml` - Eureka config
- `backend/microservices/api-gateway/src/main/resources/application.yml` - Gateway routes

### **Frontend Configs**
- `frontend/vite.config.js` - Vite build config
- `frontend/tailwind.config.js` - Tailwind CSS config
- `frontend/postcss.config.js` - PostCSS config
- `.env` (not tracked) - Environment variables like `VITE_API_BASE_URL`

### **Database Configs**
- `TAO_DATABASE.sql` - Main database creation
- `TAO_BANG_CHUC_NANG_SINH_VIEN.sql` - Student functions

---

## 🔗 Important Documentation Files

| File | Content |
|------|---------|
| [README.md](README.md) | Main project overview |
| [HUONG_DAN_CHAY_PROJECT.md](HUONG_DAN_CHAY_PROJECT.md) | Detailed setup guide |
| [DANH_SACH_CHUC_NANG_THIEU.md](DANH_SACH_CHUC_NANG_THIEU.md) | Missing features checklist |
| [GEMINI_MODEL_TEST_RESULTS.md](GEMINI_MODEL_TEST_RESULTS.md) | AI model test results |
| [backend/microservices/README.md](backend/microservices/README.md) | Microservices overview |
| [backend/microservices/MICROSERVICE_STATUS.md](backend/microservices/MICROSERVICE_STATUS.md) | Current microservices status |
| [backend/microservices/FEIGN_CLIENTS_GUIDE.md](backend/microservices/FEIGN_CLIENTS_GUIDE.md) | Feign client usage |
| [backend/microservices/SUMMARY.md](backend/microservices/SUMMARY.md) | Migration summary |

---

## 📈 Project Metrics

### **Codebase Size**
- **Backend**: ~50,000+ lines (distributed across microservices)
- **Frontend**: ~15,000+ lines (React components)
- **Database**: 20+ tables, multiple schemas
- **Services**: 8 microservices (Eureka, Gateway + 6 business services + 1 AI service)

### **Dependencies**
- **Backend**: 40+ Maven dependencies per service
- **Frontend**: 5 main dependencies (React, Router, Axios, Tailwind, Vite)

---

## 🎓 Learning Resources

### **Key Concepts Implemented**
1. **Microservices Architecture** - Service discovery, API gateway, inter-service communication
2. **Spring Cloud** - Eureka, Feign, Gateway, Security
3. **JWT Authentication** - Token-based security
4. **React Routing** - Role-based routing, protected routes
5. **RESTful APIs** - Resource-oriented API design
6. **Database Design** - Schema-per-service pattern
7. **CI/CD** - PowerShell automation scripts

---

## 📞 Support & Contact

**Project Structure**: Vietnamese naming convention for documentation (HUONG_DAN_*, etc.)  
**Language**: Vietnamese comments in most documentation files  
**Contact**: Check project README for contact information

---

## 🎉 Conclusion

CareerMate is a comprehensive, modern full-stack application demonstrating:
- ✅ Microservices architecture with Spring Cloud
- ✅ React frontend with role-based features
- ✅ JWT-based security
- ✅ AI integration (OpenRouter API)
- ✅ Complex database design
- ✅ Professional development workflow

**Current Phase**: Feature-complete with microservices refactoring in progress.

---

*Document generated: 24/01/2026*
