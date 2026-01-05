# CareerMate Backend API

Backend API cho hệ thống CareerMate - AI-Powered Job Companion Platform.

## Công nghệ sử dụng

- **Framework**: Spring Boot 3.2.0
- **Database**: PostgreSQL
- **Cache**: Redis
- **Security**: JWT, OAuth2
- **Build Tool**: Maven
- **Java Version**: 17

## Cấu trúc dự án

```
backend/
├── src/
│   ├── main/
│   │   ├── java/vn/careermate/
│   │   │   ├── config/          # Configuration classes
│   │   │   ├── controller/      # REST Controllers
│   │   │   ├── service/         # Business logic
│   │   │   ├── repository/       # Data access layer
│   │   │   ├── model/           # Entity models
│   │   │   ├── dto/             # Data Transfer Objects
│   │   │   ├── exception/       # Exception handlers
│   │   │   └── util/            # Utility classes
│   │   └── resources/
│   │       ├── application.yml  # Application configuration
│   │       └── application-dev.yml
│   └── test/                    # Test files
├── database/
│   └── schema.sql               # Database schema
└── pom.xml                      # Maven dependencies
```

## Yêu cầu hệ thống

- Java 17+
- Maven 3.8+
- PostgreSQL 14+
- Redis 6+ (optional, for caching)

## Cài đặt và chạy

### 1. Cài đặt PostgreSQL

```sql
CREATE DATABASE careermate_db;
CREATE USER careermate_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE careermate_db TO careermate_user;
```

### 2. Chạy database migration

```bash
psql -U careermate_user -d careermate_db -f database/schema.sql
```

### 3. Cấu hình environment variables

Tạo file `.env` hoặc set các biến môi trường:

```bash
export DB_USERNAME=careermate_user
export DB_PASSWORD=your_password
export JWT_SECRET=your-256-bit-secret-key-minimum-32-characters
export GEMINI_API_KEY=your_gemini_api_key
export REDIS_HOST=localhost
export REDIS_PORT=6379
```

### 4. Build và chạy ứng dụng

```bash
# Build
mvn clean install

# Chạy
mvn spring-boot:run

# Hoặc chạy JAR file
java -jar target/careermate-backend-1.0.0.jar
```

### 5. Kiểm tra API

- Swagger UI: http://localhost:8080/api/swagger-ui.html
- API Docs: http://localhost:8080/api/api-docs
- Health Check: http://localhost:8080/api/actuator/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/oauth2/google` - OAuth2 Google login

### Student APIs
- `GET /api/students/profile` - Lấy thông tin profile
- `PUT /api/students/profile` - Cập nhật profile
- `POST /api/students/cv/upload` - Upload CV
- `GET /api/students/cv` - Lấy danh sách CV
- `GET /api/students/jobs` - Tìm kiếm việc làm
- `POST /api/students/applications` - Ứng tuyển việc làm
- `GET /api/students/applications` - Lấy danh sách đơn ứng tuyển

### Recruiter APIs
- `POST /api/recruiters/jobs` - Đăng tin tuyển dụng
- `GET /api/recruiters/jobs` - Lấy danh sách tin đăng
- `GET /api/recruiters/applicants` - Lấy danh sách ứng viên
- `PUT /api/recruiters/applications/{id}/status` - Cập nhật trạng thái ứng viên

### Admin APIs
- `GET /api/admin/users` - Quản lý người dùng
- `GET /api/admin/jobs` - Quản lý tin tuyển dụng
- `GET /api/admin/reports` - Báo cáo thống kê
- `POST /api/admin/articles` - Tạo bài viết

## Security

- JWT Authentication cho tất cả protected endpoints
- OAuth2 support cho Google login
- Role-based access control (STUDENT, RECRUITER, ADMIN)
- Password encryption với BCrypt

## Database Schema

Xem file `database/schema.sql` để biết chi tiết về cấu trúc database.

## Development

### Chạy tests

```bash
mvn test
```

### Format code

```bash
mvn formatter:format
```

### Check code style

```bash
mvn checkstyle:check
```

## Deployment

### Build production JAR

```bash
mvn clean package -Pprod
```

### Docker

```bash
docker build -t careermate-backend .
docker run -p 8080:8080 careermate-backend
```

## License

Copyright © 2025 CareerMate. All rights reserved.

