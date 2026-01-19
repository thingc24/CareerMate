# Methods đã được comment trong User-Service

## StudentService - Methods đã comment:
1. ✅ `searchJobs()` - Line 245
2. ✅ `getJob()` - Line 273  
3. ✅ `applyForJob()` - Line 294
4. ✅ `checkApplication()` - Line 356
5. ✅ `getApplications()` - Line 389
6. ⏳ `saveJob()` - Line 472 (đã sửa nhưng file có thể đã thay đổi)
7. ⏳ `getSavedJobs()` - Line 496
8. ⏳ `deleteSavedJob()` - Line 505
9. ⏳ `isJobSaved()` - Line 510
10. ⏳ `getChatConversations()` - Line 519
11. ⏳ `createChatConversation()` - Line 528
12. ⏳ `getChatMessages()` - Line 538
13. ⏳ `saveChatMessage()` - Line 543
14. ⏳ `getJobRecommendations()` - Line 558
15. ⏳ `markRecommendationAsViewed()` - Line 567
16. ⏳ `markRecommendationAsApplied()` - Line 576
17. ⏳ `getUnviewedRecommendations()` - Line 583

## Cần comment tiếp:
- Tất cả methods sử dụng `savedJobRepository`
- Tất cả methods sử dụng `aiChatConversationRepository`
- Tất cả methods sử dụng `aiChatMessageRepository`
- Tất cả methods sử dụng `jobRecommendationRepository`

## RecruiterService - Cần comment:
- `getMyJobs()`
- `getApplicationsForJob()`
- `updateApplicationStatus()`
- `getCompany()`

## RecruiterProfileService - Cần kiểm tra:
- Methods sử dụng `CompanyRepository`
