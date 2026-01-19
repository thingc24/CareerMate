# Learning Service Database Schema

Thư mục này chứa tất cả các file SQL liên quan đến **Learning Service** trong kiến trúc microservices.

**Vị trí:** `backend/src/main/java/vn/careermate/learningservice/database/`

## Cấu trúc

```
backend/src/main/java/vn/careermate/learningservice/
├── model/                                 # Java entities
├── service/                               # Business logic
├── controller/                            # REST endpoints
├── repository/                            # Data access
└── database/                              # Database files (SQL)
    ├── schema.sql
    ├── migrations/
    └── README.md
```

## Các bảng trong learningservice schema

### Courses & Learning
1. **courses** - Khóa học
2. **course_modules** - Module trong khóa học
3. **lessons** - Bài học trong module
4. **course_enrollments** - Ghi danh khóa học của sinh viên
5. **lesson_progress** - Tiến độ học bài của sinh viên

### Quizzes
6. **quizzes** - Câu đố/Quiz
7. **quiz_questions** - Câu hỏi trong quiz
8. **quiz_attempts** - Lần làm quiz của sinh viên
9. **quiz_answers** - Câu trả lời của sinh viên

### CV Templates
10. **cv_templates** - Mẫu CV

### Gamification
11. **challenges** - Thử thách
12. **challenge_participations** - Tham gia thử thách
13. **badges** - Huy hiệu
14. **student_badges** - Huy hiệu của sinh viên
15. **leaderboard** - Bảng xếp hạng

### Subscriptions
16. **packages** - Gói dịch vụ
17. **subscriptions** - Đăng ký gói dịch vụ của người dùng

## Cách sử dụng

### Tạo schema mới (nếu chưa có)

```bash
cd backend
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate_db -f src\main\java\vn\careermate\learningservice\database\schema.sql
```

Hoặc từ thư mục gốc:
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate_db -f backend\src\main\java\vn\careermate\learningservice\database\schema.sql
```

## Lưu ý

- Tất cả các bảng đều sử dụng schema `learningservice` (không phải `public`)
- JPA entities phải có `@Table(schema = "learningservice")` để trỏ đúng schema
- Foreign keys đến các bảng trong schemas khác:
  - `student_id` references `userservice.student_profiles(id)`
  - `user_id` references `userservice.users(id)`
