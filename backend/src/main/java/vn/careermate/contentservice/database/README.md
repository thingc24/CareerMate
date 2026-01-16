# Content Service Database Schema

Thư mục này chứa tất cả các file SQL liên quan đến **Content Service** trong kiến trúc microservices.

**Vị trí:** `backend/src/main/java/vn/careermate/contentservice/database/`

## Cấu trúc

```
backend/src/main/java/vn/careermate/contentservice/
├── model/                                 # Java entities
├── service/                               # Business logic
├── controller/                            # REST endpoints
├── repository/                            # Data access
└── database/                              # Database files (SQL)
    ├── schema.sql
    ├── migrations/
    └── README.md
```

## Các bảng trong contentservice schema

### Companies
1. **companies** - Thông tin công ty
2. **company_ratings** - Đánh giá công ty của sinh viên

### Articles
3. **articles** - Bài viết của nhà tuyển dụng
4. **article_reactions** - Cảm xúc (like, love, haha, wow, sad, angry) cho bài viết
5. **article_comments** - Bình luận bài viết
6. **comment_reactions** - Cảm xúc cho bình luận

## Cách sử dụng

### Tạo schema mới (nếu chưa có)

```bash
cd backend
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate_db -f src\main\java\vn\careermate\contentservice\database\schema.sql
```

Hoặc từ thư mục gốc:
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate_db -f backend\src\main\java\vn\careermate\contentservice\database\schema.sql
```

## Lưu ý

- Tất cả các bảng đều sử dụng schema `contentservice` (không phải `public`)
- JPA entities phải có `@Table(schema = "contentservice")` để trỏ đúng schema
- Foreign keys đến các bảng trong schemas khác:
  - `author_id`, `user_id`, `approved_by` references `userservice.users(id)`
  - `student_id` references `userservice.student_profiles(id)`
