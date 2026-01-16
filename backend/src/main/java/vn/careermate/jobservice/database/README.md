# Job Service Database Schema

Thư mục này chứa tất cả các file SQL liên quan đến **Job Service** trong kiến trúc microservices.

**Vị trí:** `backend/src/main/java/vn/careermate/jobservice/database/`

## Cấu trúc

```
backend/src/main/java/vn/careermate/jobservice/
├── model/                                 # Java entities
├── service/                               # Business logic
├── controller/                            # REST endpoints
├── repository/                            # Data access
└── database/                              # Database files (SQL)
    ├── schema.sql
    ├── migrations/
    └── README.md
```

## Các bảng trong jobservice schema

1. **jobs** - Tin tuyển dụng
2. **job_skills** - Kỹ năng yêu cầu cho job (many-to-many)
3. **applications** - Đơn ứng tuyển của sinh viên
4. **application_history** - Lịch sử thay đổi trạng thái ứng tuyển
5. **saved_jobs** - Jobs đã được sinh viên lưu lại

## Cách sử dụng

### Tạo schema mới (nếu chưa có)

```bash
cd backend
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate_db -f src\main\java\vn\careermate\jobservice\database\schema.sql
```

Hoặc từ thư mục gốc:
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate_db -f backend\src\main\java\vn\careermate\jobservice\database\schema.sql
```

## Lưu ý

- Tất cả các bảng đều sử dụng schema `jobservice` (không phải `public`)
- JPA entities phải có `@Table(schema = "jobservice")` để trỏ đúng schema
- Foreign keys đến các bảng trong schemas khác:
  - `recruiter_id` references `userservice.recruiter_profiles(id)`
  - `company_id` references `contentservice.companies(id)`
  - `student_id` references `userservice.student_profiles(id)`
  - `cv_id` references `userservice.cvs(id)`
  - `approved_by`, `changed_by` references `userservice.users(id)`
