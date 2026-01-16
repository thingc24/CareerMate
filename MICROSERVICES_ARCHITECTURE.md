# Kiến Trúc Microservices - CareerMate

## 👥 Phân Công 5 Thành Viên

### 1. **Văn Tân - User Service** 👤
**Trách nhiệm:**
- Authentication & Authorization (JWT, OAuth)
- User Management (CRUD users)
- Student Profile Management
- Recruiter Profile Management
- Admin User Management
- Avatar Upload
- Password Management

**Công nghệ:** Spring Boot, PostgreSQL, JWT, Spring Security

---

### 2. **Ngọc Thi - Job Service** 💼
**Trách nhiệm:**
- Job Posting (CRUD jobs)
- Job Search & Filtering
- Application Management (Apply, Track, Update status)
- Job Matching & Recommendations
- Company Profile for Jobs
- Interview Scheduling
- Application Pipeline

**Công nghệ:** Spring Boot, PostgreSQL, Elasticsearch (optional)

---

### 3. **Anh Vũ - AI Service** 🤖
**Trách nhiệm:**
- CV Analysis (AI-powered)
- Career Chatbot (AI Coach)
- Career Roadmap Generation
- Job Matching Algorithm
- Skill Gap Analysis
- Mock Interview (AI-powered)
- Recommendation Engine

**Công nghệ:** Spring Boot, OpenRouter API, WebFlux, Python (optional)

---

### 4. **Hiệu Hiệu - Content Service** 📝
**Trách nhiệm:**
- Article Management (CRUD articles)
- Article Approval Workflow
- Comments & Replies (nested)
- Reactions (Like, Love, etc.)
- Company Information & Profiles
- Company Ratings & Reviews
- Search & Discovery

**Công nghệ:** Spring Boot, PostgreSQL, Redis (caching)

---

### 5. **Bảo Hân - Learning Service** 📚
**Trách nhiệm:**
- Course Management (CRUD courses)
- Course Content & Lessons
- Quiz System
- Challenge & Badge System
- CV Templates Management
- Package & Subscription Management
- Learning Progress Tracking

**Công nghệ:** Spring Boot, PostgreSQL

---

## 🏗️ Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway                              │
│         (Spring Cloud Gateway / Kong / Nginx)               │
│              - Routing                                      │
│              - Load Balancing                               │
│              - Authentication                               │
└──────────────────┬──────────────────────────────────────────┘
                   │
     ┌─────────────┼─────────────┬─────────────┬─────────────┐
     │             │             │             │             │
┌────▼─────┐  ┌───▼────┐  ┌────▼─────┐  ┌───▼─────┐  ┌───▼──────┐
│  User    │  │  Job   │  │   AI     │  │ Content │  │ Learning │
│ Service  │  │ Service│  │ Service  │  │ Service │  │ Service  │
│          │  │        │  │          │  │         │  │          │
│ :8081    │  │ :8082  │  │ :8083    │  │ :8084   │  │ :8085    │
└────┬─────┘  └───┬────┘  └────┬─────┘  └───┬─────┘  └───┬──────┘
     │            │             │            │            │
┌────▼─────┐  ┌───▼────┐  ┌────▼─────┐  ┌───▼─────┐  ┌───▼──────┐
│  User    │  │  Job   │  │  AI      │  │ Content │  │ Learning │
│ Database │  │Database│  │ Cache    │  │Database │  │ Database │
│          │  │        │  │ (Redis)  │  │         │  │          │
└──────────┘  └────────┘  └──────────┘  └─────────┘  └──────────┘
```

## 🔄 Inter-Service Communication

### 1. **Synchronous (HTTP/REST)**
- API Gateway → Services
- Service-to-Service (when needed)
- Using OpenFeign or WebClient

### 2. **Asynchronous (Message Queue - Optional)**
- Events: User Created, Job Posted, Article Published
- Using RabbitMQ or Kafka (for future scaling)

## 📦 Database per Service

| Service | Database | Tables |
|---------|----------|--------|
| **User Service** | `user_db` | users, student_profiles, recruiter_profiles, avatars |
| **Job Service** | `job_db` | jobs, applications, application_history, interviews |
| **AI Service** | `ai_cache` | cv_analysis_cache, roadmap_cache (Redis) |
| **Content Service** | `content_db` | articles, article_comments, article_reactions, companies, company_ratings |
| **Learning Service** | `learning_db` | courses, course_enrollments, quizzes, quiz_attempts, challenges, badges, cv_templates, packages, subscriptions |

## 🔐 Service Ports

| Service | Port | Health Check |
|---------|------|--------------|
| API Gateway | 8080 | /actuator/health |
| User Service | 8081 | /actuator/health |
| Job Service | 8082 | /actuator/health |
| AI Service | 8083 | /actuator/health |
| Content Service | 8084 | /actuator/health |
| Learning Service | 8085 | /actuator/health |

## 📋 API Routes Mapping

```
API Gateway (8080)
├── /api/users/**         → User Service (8081)
├── /api/jobs/**          → Job Service (8082)
├── /api/ai/**            → AI Service (8083)
├── /api/articles/**      → Content Service (8084)
├── /api/courses/**       → Learning Service (8085)
└── /api/packages/**      → Learning Service (8085)
```

## 🚀 Deployment Strategy

### Development
- Run all services locally on different ports
- Use Docker Compose for databases
- Manual service discovery

### Production
- Docker containers for each service
- Kubernetes (optional) for orchestration
- Load balancer for API Gateway
- Service mesh (Istio/Linkerd) for advanced features

## 📝 Next Steps

1. ✅ **Phase 1: User Service (Văn Tân)** - Create standalone service
2. ⏳ Phase 2: Extract Job Service (Ngọc Thi)
3. ⏳ Phase 3: Extract AI Service (Anh Vũ)
4. ⏳ Phase 4: Extract Content Service (Hiệu Hiệu)
5. ⏳ Phase 5: Extract Learning Service (Bảo Hân)
6. ⏳ Phase 6: Setup API Gateway & Service Discovery
7. ⏳ Phase 7: Integration Testing & Deployment
