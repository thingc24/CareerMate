# Kế Hoạch Tách Database Riêng Cho Từng Service

## 🎯 Mục Tiêu

Tách database `careermate_db` thành các database riêng cho từng service:
- `careermate_user_db` - User Service (Văn Tân)
- `careermate_job_db` - Job Service (Ngọc Thi)
- `careermate_ai_db` - AI Service (Anh Vũ)
- `careermate_content_db` - Content Service (Hiệu Hiệu)
- `careermate_learning_db` - Learning Service (Bảo Hân)

## 📋 Cách 1: Multiple Datasources (Trong cùng Spring Boot App)

### Ưu điểm:
- Vẫn chạy trong cùng một application
- Dễ deploy (chỉ cần deploy một app)
- Có thể share transactions giữa các services (nếu cần)

### Nhược điểm:
- Phức tạp hơn về cấu hình
- Phải quản lý nhiều EntityManagerFactory
- Các service vẫn còn coupling qua shared codebase

### Các bước thực hiện:

#### Bước 1: Tạo các database mới trong PostgreSQL

```sql
-- Tạo các database mới
CREATE DATABASE careermate_user_db;
CREATE DATABASE careermate_job_db;
CREATE DATABASE careermate_ai_db;
CREATE DATABASE careermate_content_db;
CREATE DATABASE careermate_learning_db;

-- Grant permissions (nếu cần)
GRANT ALL PRIVILEGES ON DATABASE careermate_user_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE careermate_job_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE careermate_ai_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE careermate_content_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE careermate_learning_db TO postgres;
```

#### Bước 2: Cấu hình Multiple Datasources trong `application.yml`

```yaml
spring:
  datasource:
    user-service:
      url: jdbc:postgresql://localhost:5432/careermate_user_db
      username: ${DB_USERNAME:postgres}
      password: ${DB_PASSWORD:Aa1234}
      driver-class-name: org.postgresql.Driver
    
    job-service:
      url: jdbc:postgresql://localhost:5432/careermate_job_db
      username: ${DB_USERNAME:postgres}
      password: ${DB_PASSWORD:Aa1234}
      driver-class-name: org.postgresql.Driver
    
    ai-service:
      url: jdbc:postgresql://localhost:5432/careermate_ai_db
      username: ${DB_USERNAME:postgres}
      password: ${DB_PASSWORD:Aa1234}
      driver-class-name: org.postgresql.Driver
    
    content-service:
      url: jdbc:postgresql://localhost:5432/careermate_content_db
      username: ${DB_USERNAME:postgres}
      password: ${DB_PASSWORD:Aa1234}
      driver-class-name: org.postgresql.Driver
    
    learning-service:
      url: jdbc:postgresql://localhost:5432/careermate_learning_db
      username: ${DB_USERNAME:postgres}
      password: ${DB_PASSWORD:Aa1234}
      driver-class-name: org.postgresql.Driver
  
  jpa:
    user-service:
      hibernate:
        ddl-auto: update
      show-sql: false
      properties:
        hibernate:
          dialect: org.hibernate.dialect.PostgreSQLDialect
    
    job-service:
      hibernate:
        ddl-auto: update
      show-sql: false
      properties:
        hibernate:
          dialect: org.hibernate.dialect.PostgreSQLDialect
    
    # ... tương tự cho các services khác
```

#### Bước 3: Tạo các DataSource Configurations

Cần tạo các config classes:
- `UserServiceDataSourceConfig.java`
- `JobServiceDataSourceConfig.java`
- `AIServiceDataSourceConfig.java`
- `ContentServiceDataSourceConfig.java`
- `LearningServiceDataSourceConfig.java`

Mỗi config sẽ define:
- `@Primary` datasource cho service đó
- EntityManagerFactory riêng
- TransactionManager riêng

#### Bước 4: Annotate Entities với @Table(schema) hoặc tách package

Mỗi service chỉ scan entities của mình.

## 📋 Cách 2: Tách Thành Các Ứng Dụng Riêng Biệt (True Microservices)

### Ưu điểm:
- Thực sự độc lập (true microservices)
- Mỗi service có thể deploy riêng
- Dễ scale từng service
- Có thể dùng các công nghệ khác nhau cho từng service

### Nhược điểm:
- Cần API Gateway để route requests
- Cần Service Discovery (Eureka, Consul)
- Cần quản lý inter-service communication
- Phức tạp hơn về deployment và monitoring

### Các bước thực hiện:

1. Tách thành 5 projects riêng biệt:
   - `user-service/`
   - `job-service/`
   - `ai-service/`
   - `content-service/`
   - `learning-service/`

2. Mỗi project có:
   - `pom.xml` riêng
   - `application.yml` riêng với database riêng
   - Main Application class riêng

3. Tạo API Gateway để route requests

4. Sử dụng Feign Client hoặc RestTemplate để giao tiếp giữa các services

## 🤔 Khuyến Nghị

**Hiện tại (microservices-like trong monolith):**
- ✅ **Nên giữ shared database** vì:
  - Đơn giản hơn để phát triển
  - Dễ quản lý migrations
  - Không cần phức tạp về multiple datasources
  - Các services vẫn có thể tách code cleanly

**Khi nào nên tách database riêng:**
- Khi cần scale riêng từng service
- Khi cần độc lập hoàn toàn về database
- Khi sẵn sàng chuyển sang true microservices architecture

**Nếu muốn tách ngay bây giờ:**
- Nên chọn **Cách 1** (Multiple Datasources) vì:
  - Vẫn giữ được cấu trúc hiện tại
  - Không cần thay đổi quá nhiều code
  - Có thể migrate từng service một
