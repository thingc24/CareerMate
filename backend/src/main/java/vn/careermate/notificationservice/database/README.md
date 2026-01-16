# Notification Service Database Schema

Thư mục này chứa tất cả các file SQL liên quan đến **Notification Service** trong kiến trúc microservices.

**Vị trí:** `backend/src/main/java/vn/careermate/notificationservice/database/`

## Cấu trúc

```
backend/src/main/java/vn/careermate/notificationservice/
├── model/                                 # Java entities
├── service/                               # Business logic
├── controller/                            # REST endpoints
├── repository/                            # Data access
└── database/                              # Database files (SQL)
    ├── schema.sql
    ├── migrations/
    └── README.md
```

## Các bảng trong notificationservice schema

1. **notifications** - Thông báo cho người dùng (sinh viên, nhà tuyển dụng, admin)

## Cách sử dụng

### Tạo schema mới (nếu chưa có)

```bash
cd backend
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate_db -f src\main\java\vn\careermate\notificationservice\database\schema.sql
```

Hoặc từ thư mục gốc:
```bash
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d careermate_db -f backend\src\main\java\vn\careermate\notificationservice\database\schema.sql
```

## Lưu ý

- Tất cả các bảng đều sử dụng schema `notificationservice` (không phải `public`)
- JPA entities phải có `@Table(schema = "notificationservice")` để trỏ đúng schema
- Foreign keys đến các bảng trong schemas khác (như `users` trong `userservice`) cần được xử lý cẩn thận
- `user_id` trong `notifications` table references `userservice.users(id)` (cross-schema reference)
