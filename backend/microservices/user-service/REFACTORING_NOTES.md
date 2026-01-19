# Refactoring Notes - User Service

## Methods cần refactor để dùng Feign Clients

### StudentService:
- `searchJobs()` - Dùng `JobServiceClient.searchJobs()`
- `getJob()` - Dùng `JobServiceClient.getJobById()`
- `applyToJob()` - Dùng `JobServiceClient.applyToJob()` (cần tạo endpoint)
- `getMyApplications()` - Dùng `JobServiceClient.getApplicationsByStudent()`
- `withdrawApplication()` - Dùng `JobServiceClient.withdrawApplication()` (cần tạo endpoint)
- `saveJob()` - Dùng `JobServiceClient.saveJob()`
- `getSavedJobs()` - Dùng `JobServiceClient.getSavedJobsByStudent()`
- `unsaveJob()` - Dùng `JobServiceClient.unsaveJob()`
- `getAIChatConversations()` - Dùng `AIServiceClient.getChatConversations()`
- `createAIChatConversation()` - Dùng `AIServiceClient.createChatConversation()` (cần tạo endpoint)
- `getAIChatMessages()` - Dùng `AIServiceClient.getChatMessages()`
- `sendAIChatMessage()` - Dùng `AIServiceClient.sendChatMessage()` (cần tạo endpoint)
- `getJobRecommendations()` - Dùng `AIServiceClient.getJobRecommendations()`
- `markRecommendationViewed()` - Dùng `AIServiceClient.markRecommendationViewed()` (cần tạo endpoint)

### RecruiterService:
- `getMyJobs()` - Dùng `JobServiceClient.getJobsByRecruiter()`
- `getApplicationsForJob()` - Dùng `JobServiceClient.getApplicationsForJob()` (cần tạo endpoint)
- `updateApplicationStatus()` - Dùng `JobServiceClient.updateApplicationStatus()` (cần tạo endpoint)
- `getCompany()` - Dùng `ContentServiceClient.getCompanyById()`

### RecruiterProfileService:
- `updateProfile()` - Cần fetch Company từ `ContentServiceClient` khi cần

### CVService:
- `uploadCV()` - AI analysis đã được sửa để dùng `AIServiceClient`
- `createCVFromTemplate()` - Cần fetch template từ `LearningServiceClient`

## Approach hiện tại:
1. Comment các methods phức tạp có cross-service dependencies
2. Thêm TODO notes
3. Giữ lại các methods cơ bản hoạt động độc lập
4. Implement Feign Client calls khi các services khác đã sẵn sàng
