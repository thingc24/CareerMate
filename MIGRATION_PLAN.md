# Kế Hoạch Migration và Hoàn Thiện Project

## 🎯 Mục Tiêu
Sửa lại project để đáp ứng đúng 100% yêu cầu của thầy.

---

## 📋 Các Bước Thực Hiện

### Phase 1: ReactJS Frontend (Ưu tiên cao) ✅ Đang làm

#### 1.1 Setup Cơ Bản ✅
- [x] Tạo React app với Vite
- [x] Cài đặt dependencies (react-router-dom, axios, tailwindcss)
- [x] Setup Tailwind CSS
- [x] Tạo API client service

#### 1.2 Cấu Trúc Components
- [ ] Tạo layout components (Header, Sidebar, Footer)
- [ ] Tạo auth components (Login, Register)
- [ ] Tạo student components (Dashboard, JobList, JobDetail, CVUpload)
- [ ] Tạo recruiter components (Dashboard, PostJob, Applicants, Company)
- [ ] Tạo admin components (Dashboard, UserManagement, JobManagement)

#### 1.3 Routing
- [ ] Setup React Router
- [ ] Protected routes với authentication
- [ ] Role-based routing (Student, Recruiter, Admin)

#### 1.4 State Management
- [ ] Setup Context API hoặc Redux
- [ ] Auth context
- [ ] User context

#### 1.5 Migrate Pages
- [ ] Login/Register pages
- [ ] Student dashboard và pages
- [ ] Recruiter dashboard và pages
- [ ] Admin dashboard và pages

---

### Phase 2: Vector DB Integration (Ưu tiên cao)

#### 2.1 Setup Weaviate
- [ ] Thêm Weaviate dependency vào pom.xml
- [ ] Cấu hình Weaviate connection
- [ ] Tạo Weaviate client service

#### 2.2 Vector Embeddings
- [ ] Setup embedding service (sử dụng Gemini hoặc OpenAI)
- [ ] Tạo embeddings cho CVs
- [ ] Tạo embeddings cho Job Descriptions

#### 2.3 Semantic Search
- [ ] Implement semantic job matching
- [ ] Implement candidate search
- [ ] API endpoints cho vector search

---

### Phase 3: AI Services Hoàn Thiện

#### 3.1 CV Analyzer Service
- [ ] Tách CV Analyzer thành service riêng
- [ ] API endpoint `/ai/cv/analyze/{cvId}`
- [ ] Structured output (JSON với scores, feedback)
- [ ] Integration với Gemini API

#### 3.2 Job Matching AI
- [ ] AI-based matching algorithm
- [ ] Integration với Vector DB
- [ ] Scoring system
- [ ] API endpoint `/ai/jobs/{jobId}/matching`

#### 3.3 Mock Interview AI
- [ ] Real-time interview simulation
- [ ] Voice/Text interaction
- [ ] Feedback và scoring
- [ ] API endpoint `/ai/interview/*`

#### 3.4 Career Coach
- [ ] Đã có, cần cải thiện
- [ ] Better prompts
- [ ] Context awareness

---

### Phase 4: React Native Mobile App

#### 4.1 Setup
- [ ] Tạo React Native project
- [ ] Setup navigation (React Navigation)
- [ ] Setup API client

#### 4.2 Core Features
- [ ] Authentication
- [ ] Job browsing
- [ ] CV upload
- [ ] Application tracking
- [ ] AI Chat

#### 4.3 Native Features
- [ ] Push notifications
- [ ] Camera integration
- [ ] File picker

---

### Phase 5: Payment System

#### 5.1 Premium Packages
- [ ] Package model trong database
- [ ] Package management API
- [ ] Payment gateway integration (Stripe/PayPal)

#### 5.2 Subscription Management
- [ ] Subscription service
- [ ] Payment processing
- [ ] Subscription status tracking

---

### Phase 6: Gamification

#### 6.1 Challenges System
- [ ] Challenge model
- [ ] Challenge completion tracking
- [ ] Badge system

#### 6.2 Leaderboards
- [ ] Ranking system
- [ ] Leaderboard API
- [ ] Display components

---

## 📁 Cấu Trúc Thư Mục Mới

```
CareerMate/
├── frontend/              # ReactJS Frontend (MỚI)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── contexts/
│   │   └── utils/
│   └── package.json
├── mobile/                # React Native App (MỚI)
│   ├── src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── services/
│   │   └── navigation/
│   └── package.json
├── backend/               # Spring Boot (ĐÃ CÓ)
│   └── src/
│       └── main/java/vn/careermate/
│           ├── service/
│           │   ├── AIService.java          # MỚI
│           │   ├── VectorDBService.java    # MỚI
│           │   └── CVAnalyzerService.java  # MỚI
│           └── ...
└── Web/                   # HTML/JS cũ (GIỮ LẠI ĐỂ THAM KHẢO)
```

---

## ⏱️ Timeline Ước Tính

- **Phase 1 (ReactJS)**: 2-3 tuần
- **Phase 2 (Vector DB)**: 1 tuần
- **Phase 3 (AI Services)**: 1-2 tuần
- **Phase 4 (Mobile)**: 2-3 tuần
- **Phase 5 (Payment)**: 1 tuần
- **Phase 6 (Gamification)**: 1 tuần

**Tổng**: ~8-11 tuần

---

## 🚀 Bắt Đầu Ngay

Đang thực hiện Phase 1 - ReactJS Frontend.

