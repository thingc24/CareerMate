# Methods đã được comment trong Job-Service

## JobService - Methods đã comment:
1. ✅ `createJob()` - Cần refactor để dùng UserServiceClient và ContentServiceClient
2. ✅ `getMyJobs()` - Cần refactor để dùng UserServiceClient
3. ⏳ `getJob()` - Đã sửa một phần, cần hoàn thiện check owner với UserServiceClient
4. ✅ `searchJobs()` - OK, chỉ dùng repository

## ApplicationService - Cần comment:
- ⏳ `applyForJob()` - Cần `StudentProfileRepository`, `CVRepository`
- ⏳ `getApplications()` - Cần `StudentProfileRepository`
- ⏳ `getCurrentStudentProfile()` - Cần implement với Feign Client

## Cần làm tiếp:
1. Comment các methods trong ApplicationService
2. Thêm TODO comments
3. Update imports để loại bỏ cross-service dependencies
