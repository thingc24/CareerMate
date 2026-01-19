# Job-Service Refactoring Status

## ✅ Đã hoàn thành:

### 1. Cấu trúc thư mục ✅
- ✅ Đã sửa cấu trúc thư mục giống user-service
- ✅ Không còn lồng nhau quá nhiều

### 2. Entity Refactoring ✅
- ✅ **Job.java**: Đã thay `RecruiterProfile` → `UUID recruiterId`, `Company` → `UUID companyId`
- ✅ **Application.java**: Đã thay `StudentProfile` → `UUID studentId`, `CV` → `UUID cvId`
- ✅ **SavedJob.java**: Đã thay `StudentProfile` → `UUID studentId`

## ⏳ Đang refactor:

### 3. Service Refactoring (In Progress)
- ⏳ **JobService**: Cần comment các methods phức tạp và thay dependencies
  - `createJob()` - Cần `RecruiterProfileService` và `ContentServiceClient`
  - `getMyJobs()` - Cần `RecruiterProfileService`
  - `getJob()` - Cần `UserRepository` để check owner
  - `searchJobs()` - OK, chỉ dùng repository

- ⏳ **ApplicationService**: Cần comment các methods phức tạp
  - `applyForJob()` - Cần `StudentProfileRepository`, `CVRepository`
  - `getApplications()` - Cần `StudentProfileRepository`
  - `getCurrentStudentProfile()` - Cần implement với Feign Client

## 📋 Next Steps:

1. Comment các methods phức tạp trong JobService
2. Comment các methods phức tạp trong ApplicationService
3. Thêm TODO comments
4. Update imports để loại bỏ cross-service dependencies
