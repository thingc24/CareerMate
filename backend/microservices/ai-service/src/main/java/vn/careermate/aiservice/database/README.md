# AI Service Database Schema

Thư mục này chứa tất cả các file SQL liên quan đến **AI Service** trong kiến trúc microservices.

**Vị trí:** `backend/src/main/java/vn/careermate/aiservice/database/`

## Cấu trúc

```
backend/src/main/java/vn/careermate/aiservice/
├── model/                                 # Java entities
├── service/                               # Business logic
├── controller/                            # REST endpoints
├── repository/                            # Data access
└── database/                              # Database files (SQL)
    ├── schema.sql
    ├── migrations/
    └── README.md
```

## Các bảng trong aiservice schema

1. **ai_chat_conversations** - Cuộc trò chuyện với AI (Career Coach, CV Advisor, etc.)
2. **ai_chat_messages** - Tin nhắn trong cuộc trò chuyện với AI
3. **job_recommendations** - Gợi ý việc làm dựa trên AI matching
4. **career_roadmaps** - Lộ trình nghề nghiệp được AI tạo ra
5. **mock_interviews** - Buổi phỏng vấn thử với AI
6. **mock_interview_questions** - Câu hỏi trong mock interview

## Cách sử dụng

### Tạo schema mới (nếu chưa có)

```bash
cd backend
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate_db -f src\main\java\vn\careermate\aiservice\database\schema.sql
```

Hoặc từ thư mục gốc:
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate_db -f backend\src\main\java\vn\careermate\aiservice\database\schema.sql
```

## Lưu ý

- Tất cả các bảng đều sử dụng schema `aiservice` (không phải `public`)
- JPA entities phải có `@Table(schema = "aiservice")` để trỏ đúng schema
- Foreign keys đến các bảng trong schemas khác:
  - `student_id` references `userservice.student_profiles(id)`
  - `job_id` references `jobservice.jobs(id)`
  - `cv_id` references `userservice.cvs(id)`
