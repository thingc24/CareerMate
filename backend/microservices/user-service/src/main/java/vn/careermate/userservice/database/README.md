# User Service Database Schema

Thư mục này chứa tất cả các file SQL liên quan đến **User Service** trong kiến trúc microservices.

**Vị trí:** `backend/src/main/java/vn/careermate/userservice/database/`

Đây là cấu trúc được tổ chức theo package structure, giúp tập trung tất cả code liên quan đến userservice (Java + SQL) trong một package.

## Cấu trúc

```
backend/src/main/java/vn/careermate/userservice/
├── model/                                 # Java entities
├── service/                               # Business logic
├── controller/                            # REST endpoints
├── repository/                            # Data access
└── database/                              # Database files (SQL)
    ├── schema.sql
    ├── migrations/
    │   └── 001_migrate_tables_to_userservice_schema.sql
    └── README.md

Hoặc đường dẫn đầy đủ:
backend/src/main/java/vn/careermate/userservice/database/
├── schema.sql                          # Schema chính (users, student_profiles, cvs, conversations, messages)
├── migrations/                         # Các migration scripts
│   └── 001_migrate_tables_to_userservice_schema.sql
└── README.md                          # Tài liệu này
```

## Các bảng trong userservice schema

1. **users** - Thông tin người dùng (sinh viên, nhà tuyển dụng, admin)
2. **oauth_providers** - Thông tin OAuth (Google, Facebook)
3. **student_profiles** - Hồ sơ sinh viên
4. **student_skills** - Kỹ năng của sinh viên
5. **cvs** - CV của sinh viên
6. **recruiter_profiles** - Hồ sơ nhà tuyển dụng
7. **conversations** - Cuộc trò chuyện
8. **messages** - Tin nhắn

## Cách sử dụng

### Tạo schema mới (nếu chưa có)

```bash
cd backend
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate_db -f src\main\java\vn\careermate\userservice\database\schema.sql
```

Hoặc từ thư mục gốc:
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate_db -f backend\src\main\java\vn\careermate\userservice\database\schema.sql
```

### Chạy migration

```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate_db -f backend\src\main\java\vn\careermate\userservice\database\migrations\001_migrate_tables_to_userservice_schema.sql
```

## Lưu ý

- Tất cả các bảng đều sử dụng schema `userservice` (không phải `public`)
- JPA entities phải có `@Table(schema = "userservice")` để trỏ đúng schema
- Foreign keys đến các bảng trong schemas khác (như `companies` trong `contentservice`) cần được xử lý cẩn thận
