# Hướng Dẫn Tổ Chức Lại Backend - User Service (Văn Tân)

## 🎯 Mục Tiêu

Tổ chức lại code trong `backend/` thành cấu trúc microservice. User Service cho Văn Tân sẽ nằm trong:
```
backend/src/main/java/vn/careermate/user-service/
```

## 📋 Bước 1: Tạo Cấu Trúc Thư Mục

Trong `backend/src/main/java/vn/careermate/`, tạo folder:
```
user-service/
├── model/
├── repository/
├── service/
├── controller/
├── config/
└── dto/
```

**Cách tạo:**
1. Right-click vào `backend/src/main/java/vn/careermate/`
2. New → Package
3. Tên: `user-service.model`, `user-service.repository`, `user-service.service`, `user-service.controller`, `user-service.config`, `user-service.dto`

## 📋 Bước 2: Di Chuyển Models

### Files cần di chuyển:
1. `backend/src/main/java/vn/careermate/model/User.java`
   → `backend/src/main/java/vn/careermate/user-service/model/User.java`

2. `backend/src/main/java/vn/careermate/model/StudentProfile.java`
   → `backend/src/main/java/vn/careermate/user-service/model/StudentProfile.java`

3. `backend/src/main/java/vn/careermate/model/RecruiterProfile.java`
   → `backend/src/main/java/vn/careermate/user-service/model/RecruiterProfile.java`

### Sau khi di chuyển, update package:
- `package vn.careermate.model;` → `package vn.careermate.user.service.model;`

### Lưu ý trong StudentProfile:
- Giữ `@OneToMany` với `StudentSkill`, `CV`, `Application` (vì cần tham chiếu)
- Hoặc comment lại nếu muốn tách hoàn toàn

### Lưu ý trong RecruiterProfile:
- Giữ `@ManyToOne Company` (vì cần tham chiếu)
- Hoặc đổi thành `companyId` (UUID) nếu muốn tách hoàn toàn

## 📋 Bước 3: Di Chuyển Repositories

### Files cần di chuyển:
1. `backend/src/main/java/vn/careermate/repository/UserRepository.java`
   → `backend/src/main/java/vn/careermate/user-service/repository/UserRepository.java`

2. `backend/src/main/java/vn/careermate/repository/StudentProfileRepository.java`
   → `backend/src/main/java/vn/careermate/user-service/repository/StudentProfileRepository.java`

3. `backend/src/main/java/vn/careermate/repository/RecruiterProfileRepository.java`
   → `backend/src/main/java/vn/careermate/user-service/repository/RecruiterProfileRepository.java`

### Sau khi di chuyển, update:
- Package: `package vn.careermate.repository;` → `package vn.careermate.user.service.repository;`
- Imports: `import vn.careermate.model.*;` → `import vn.careermate.user.service.model.*;`

## 📋 Bước 4: Di Chuyển Services

### Files cần di chuyển:
1. `backend/src/main/java/vn/careermate/service/AuthService.java`
   → `backend/src/main/java/vn/careermate/user-service/service/AuthService.java`

2. `backend/src/main/java/vn/careermate/service/UserDetailsServiceImpl.java`
   → `backend/src/main/java/vn/careermate/user-service/service/UserDetailsServiceImpl.java`

3. Extract profile methods từ `StudentService.java` → tạo `StudentProfileService.java`
4. Extract profile methods từ `RecruiterService.java` → tạo `RecruiterProfileService.java`

### Sau khi di chuyển, update:
- Package: `package vn.careermate.service;` → `package vn.careermate.user.service.service;`
- Imports: Update tất cả imports sang package mới

## 📋 Bước 5: Di Chuyển Controllers

### Files cần di chuyển:
1. `backend/src/main/java/vn/careermate/controller/AuthController.java`
   → `backend/src/main/java/vn/careermate/user-service/controller/AuthController.java`

2. Extract profile endpoints từ `StudentController.java` → tạo `StudentProfileController.java`
3. Extract profile endpoints từ `RecruiterController.java` → tạo `RecruiterProfileController.java`

4. Extract user management từ `AdminController.java` → tạo `UserController.java` (optional)

### Sau khi di chuyển, update:
- Package: `package vn.careermate.controller;` → `package vn.careermate.user.service.controller;`
- Imports: Update tất cả imports sang package mới
- RequestMapping: Giữ nguyên `/api/auth/**`, `/api/students/profile/**`, `/api/recruiters/profile/**`

## 📋 Bước 6: Di Chuyển Configs

### Files cần di chuyển:
1. `backend/src/main/java/vn/careermate/config/JwtService.java`
   → `backend/src/main/java/vn/careermate/user-service/config/JwtService.java`

2. `backend/src/main/java/vn/careermate/config/SecurityConfig.java`
   → `backend/src/main/java/vn/careermate/user-service/config/SecurityConfig.java`

3. `backend/src/main/java/vn/careermate/config/JwtAuthenticationFilter.java`
   → `backend/src/main/java/vn/careermate/user-service/config/JwtAuthenticationFilter.java`

### Lưu ý:
- `SecurityConfig.java` và `JwtAuthenticationFilter.java` có thể giữ ở `config/` root (vì dùng chung cho tất cả services)
- Hoặc di chuyển vào `user-service/config/` nếu muốn mỗi service có config riêng

### Sau khi di chuyển, update:
- Package: `package vn.careermate.config;` → `package vn.careermate.user.service.config;`
- Imports: Update tất cả imports sang package mới

## 📋 Bước 7: Di Chuyển DTOs

### Files cần di chuyển:
1. `backend/src/main/java/vn/careermate/dto/AuthRequest.java`
   → `backend/src/main/java/vn/careermate/user-service/dto/AuthRequest.java`

2. `backend/src/main/java/vn/careermate/dto/AuthResponse.java`
   → `backend/src/main/java/vn/careermate/user-service/dto/AuthResponse.java`

3. `backend/src/main/java/vn/careermate/dto/RegisterRequest.java`
   → `backend/src/main/java/vn/careermate/user-service/dto/RegisterRequest.java`

4. `backend/src/main/java/vn/careermate/dto/UserInfo.java`
   → `backend/src/main/java/vn/careermate/user-service/dto/UserInfo.java`

5. `backend/src/main/java/vn/careermate/dto/StudentProfileDTO.java` (nếu có)
   → `backend/src/main/java/vn/careermate/user-service/dto/StudentProfileDTO.java`

6. `backend/src/main/java/vn/careermate/dto/RecruiterProfileDTO.java` (nếu có)
   → `backend/src/main/java/vn/careermate/user-service/dto/RecruiterProfileDTO.java`

### Sau khi di chuyển, update:
- Package: `package vn.careermate.dto;` → `package vn.careermate.user.service.dto;`

## 📋 Bước 8: Find & Replace Packages

Sau khi di chuyển tất cả files, bạn cần thay thế package names trong **TẤT CẢ** files của user-service:

### Trong IDE (IntelliJ IDEA / VS Code):
1. **IntelliJ IDEA:**
   - Ctrl+Shift+R (Find & Replace in Files)
   - Scope: Files in `user-service/`
   - Find: `package vn.careermate.model;`
   - Replace: `package vn.careermate.user.service.model;`
   - Repeat cho tất cả packages

2. **VS Code:**
   - Ctrl+Shift+H (Find & Replace in Files)
   - Files to include: `**/user-service/**/*.java`
   - Find & Replace tương tự

### Packages cần thay thế:
1. `package vn.careermate.model;` → `package vn.careermate.user.service.model;`
2. `package vn.careermate.repository;` → `package vn.careermate.user.service.repository;`
3. `package vn.careermate.service;` → `package vn.careermate.user.service.service;`
4. `package vn.careermate.controller;` → `package vn.careermate.user.service.controller;`
5. `package vn.careermate.config;` → `package vn.careermate.user.service.config;`
6. `package vn.careermate.dto;` → `package vn.careermate.user.service.dto;`

### Imports cần thay thế:
1. `import vn.careermate.model.*;` → `import vn.careermate.user.service.model.*;`
2. `import vn.careermate.repository.*;` → `import vn.careermate.user.service.repository.*;`
3. `import vn.careermate.service.*;` → `import vn.careermate.user.service.service.*;`
4. `import vn.careermate.controller.*;` → `import vn.careermate.user.service.controller.*;`
5. `import vn.careermate.config.*;` → `import vn.careermate.user.service.config.*;`
6. `import vn.careermate.dto.*;` → `import vn.careermate.user.service.dto.*;`

## 📋 Bước 9: Update CareerMateApplication.java

File `CareerMateApplication.java` ở root sẽ scan tất cả packages:

```java
package vn.careermate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication(scanBasePackages = {
    "vn.careermate.user.service",
    "vn.careermate.job.service",      // Sẽ làm sau
    "vn.careermate.ai.service",       // Sẽ làm sau
    "vn.careermate.content.service",  // Sẽ làm sau
    "vn.careermate.learning.service", // Sẽ làm sau
    "vn.careermate.common",           // Common code
    "vn.careermate.config"            // Shared configs (nếu giữ ở root)
})
@EnableJpaAuditing
public class CareerMateApplication {
    public static void main(String[] args) {
        SpringApplication.run(CareerMateApplication.class, args);
    }
}
```

## ✅ Checklist Công Việc

### Models
- [ ] Di chuyển `User.java` vào `user-service/model/`
- [ ] Di chuyển `StudentProfile.java` vào `user-service/model/`
- [ ] Di chuyển `RecruiterProfile.java` vào `user-service/model/`
- [ ] Update package names

### Repositories
- [ ] Di chuyển `UserRepository.java` vào `user-service/repository/`
- [ ] Di chuyển `StudentProfileRepository.java` vào `user-service/repository/`
- [ ] Di chuyển `RecruiterProfileRepository.java` vào `user-service/repository/`
- [ ] Update package names và imports

### Services
- [ ] Di chuyển `AuthService.java` vào `user-service/service/`
- [ ] Di chuyển `UserDetailsServiceImpl.java` vào `user-service/service/`
- [ ] Extract `StudentProfileService.java` từ `StudentController`
- [ ] Extract `RecruiterProfileService.java` từ `RecruiterController`
- [ ] Update package names và imports

### Controllers
- [ ] Di chuyển `AuthController.java` vào `user-service/controller/`
- [ ] Extract `StudentProfileController.java` từ `StudentController`
- [ ] Extract `RecruiterProfileController.java` từ `RecruiterController`
- [ ] Update package names và imports

### Configs
- [ ] Di chuyển `JwtService.java` vào `user-service/config/` (hoặc giữ ở `config/`)
- [ ] Di chuyển `SecurityConfig.java` vào `user-service/config/` (hoặc giữ ở `config/`)
- [ ] Di chuyển `JwtAuthenticationFilter.java` vào `user-service/config/` (hoặc giữ ở `config/`)
- [ ] Update package names và imports

### DTOs
- [ ] Di chuyển `AuthRequest.java` vào `user-service/dto/`
- [ ] Di chuyển `AuthResponse.java` vào `user-service/dto/`
- [ ] Di chuyển `RegisterRequest.java` vào `user-service/dto/`
- [ ] Di chuyển `UserInfo.java` vào `user-service/dto/`
- [ ] Update package names

### Application Config
- [ ] Update `CareerMateApplication.java` để scan `user-service` package

### Testing
- [ ] Test register endpoint
- [ ] Test login endpoint
- [ ] Test profile endpoints
- [ ] Test với frontend

## 🎯 Kết Quả Cuối Cùng

Sau khi hoàn thành, cấu trúc sẽ là:

```
backend/src/main/java/vn/careermate/
├── user-service/          # ✅ Văn Tân - ĐÃ TỔ CHỨC
│   ├── model/
│   │   ├── User.java
│   │   ├── StudentProfile.java
│   │   └── RecruiterProfile.java
│   ├── repository/
│   ├── service/
│   ├── controller/
│   ├── config/
│   └── dto/
├── job-service/           # ⏳ Ngọc Thi - SẼ LÀM SAU
├── ai-service/            # ⏳ Anh Vũ - SẼ LÀM SAU
├── content-service/       # ⏳ Hiệu Hiệu - SẼ LÀM SAU
├── learning-service/      # ⏳ Bảo Hân - SẼ LÀM SAU
├── model/                 # ⏳ Các models còn lại (chưa di chuyển)
├── repository/            # ⏳ Các repositories còn lại
├── service/               # ⏳ Các services còn lại
├── controller/            # ⏳ Các controllers còn lại
├── config/                # ⏳ Shared configs (nếu có)
├── dto/                   # ⏳ Các DTOs còn lại
└── CareerMateApplication.java
```

## 🚀 Sau Khi Hoàn Thành

1. Test service hoạt động bình thường
2. Test với frontend
3. Tiếp tục tổ chức các services khác (Ngọc Thi, Anh Vũ, Hiệu Hiệu, Bảo Hân)
4. Sau khi tất cả services được tổ chức, có thể tách thành các modules riêng (optional)
