# DANH SÁCH BẢNG CSDL CHO CHỨC NĂNG SINH VIÊN

## 📋 Tổng quan

Tất cả các chức năng trong trang sinh viên đều có bảng riêng để lưu thông tin. Mỗi bảng hỗ trợ đầy đủ CRUD (Create, Read, Update, Delete).

---

## 🗂️ Các bảng đã tạo

### 1. **AI Chat Conversations** (Lịch sử chat AI)
**Bảng:** `ai_chat_conversations` và `ai_chat_messages`

**Chức năng:**
- Lưu lịch sử các cuộc trò chuyện với AI Career Coach
- Mỗi conversation có nhiều messages
- Hỗ trợ nhiều role: CAREER_COACH, CV_ADVISOR, INTERVIEW_PREP

**Models:**
- `AIChatConversation.java`
- `AIChatMessage.java`

**Repositories:**
- `AIChatConversationRepository.java`
- `AIChatMessageRepository.java`

**CRUD Operations:**
- ✅ Tạo conversation mới
- ✅ Lấy danh sách conversations của student
- ✅ Lấy tất cả messages trong một conversation
- ✅ Thêm message mới (USER hoặc AI)
- ✅ Xóa conversation (tự động xóa tất cả messages)
- ✅ Cập nhật conversation title, context

---

### 2. **Saved Jobs** (Công việc đã lưu)
**Bảng:** `saved_jobs`

**Chức năng:**
- Lưu các công việc mà sinh viên đã đánh dấu yêu thích
- Cho phép thêm ghi chú cho mỗi công việc
- Một sinh viên chỉ có thể lưu một job một lần (unique constraint)

**Model:**
- `SavedJob.java`

**Repository:**
- `SavedJobRepository.java`

**CRUD Operations:**
- ✅ Lưu job vào danh sách yêu thích
- ✅ Lấy danh sách jobs đã lưu
- ✅ Xóa job khỏi danh sách yêu thích
- ✅ Cập nhật notes cho saved job
- ✅ Kiểm tra job đã được lưu chưa

---

### 3. **Mock Interviews** (Phỏng vấn thử)
**Bảng:** `mock_interviews` và `mock_interview_questions`

**Chức năng:**
- Lưu lịch sử các buổi mock interview
- Lưu từng câu hỏi và câu trả lời
- Lưu feedback và điểm số từ AI
- Theo dõi trạng thái: NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED

**Models:**
- `MockInterview.java`
- `MockInterviewQuestion.java`

**Repositories:**
- `MockInterviewRepository.java`
- `MockInterviewQuestionRepository.java`

**CRUD Operations:**
- ✅ Tạo mock interview mới
- ✅ Lấy danh sách mock interviews của student
- ✅ Thêm câu hỏi vào interview
- ✅ Lưu câu trả lời của student
- ✅ Lưu AI feedback và điểm số
- ✅ Cập nhật trạng thái interview
- ✅ Xóa interview (tự động xóa tất cả questions)

---

### 4. **Job Recommendations** (Gợi ý việc làm)
**Bảng:** `job_recommendations`

**Chức năng:**
- Lưu các công việc được AI gợi ý cho sinh viên
- Lưu điểm match score (0-100)
- Lưu lý do tại sao job được gợi ý
- Theo dõi xem student đã xem/apply chưa

**Model:**
- `JobRecommendation.java`

**Repository:**
- `JobRecommendationRepository.java`

**CRUD Operations:**
- ✅ Tạo recommendation mới
- ✅ Lấy danh sách recommendations (sắp xếp theo match score)
- ✅ Đánh dấu đã xem (isViewed = true)
- ✅ Đánh dấu đã apply (isApplied = true)
- ✅ Lấy danh sách recommendations chưa xem
- ✅ Xóa recommendation

---

## 📊 Các bảng đã có sẵn (tham khảo)

### 1. **Student Profile**
- `student_profiles` - Thông tin profile sinh viên

### 2. **CV Management**
- `cvs` - CV đã upload
- `cv_templates` - Templates CV

### 3. **Job Applications**
- `applications` - Đơn ứng tuyển
- `application_history` - Lịch sử thay đổi đơn ứng tuyển

### 4. **Skills**
- `student_skills` - Kỹ năng của sinh viên

### 5. **Career Roadmap**
- `career_roadmaps` - Lộ trình phát triển sự nghiệp

### 6. **Quiz**
- `quizzes` - Quiz
- `quiz_questions` - Câu hỏi quiz
- `quiz_attempts` - Lần làm quiz
- `quiz_answers` - Câu trả lời quiz

### 7. **Learning**
- `courses` - Khóa học
- `course_enrollments` - Đăng ký khóa học

### 8. **Challenges**
- `challenges` - Thử thách
- `challenge_participations` - Tham gia thử thách

### 9. **Premium**
- `packages` - Gói premium
- `subscriptions` - Đăng ký gói premium

---

## 🔧 Cách sử dụng

### 1. Tạo bảng trong PostgreSQL

Chạy file SQL:
```sql
\i TAO_BANG_CHUC_NANG_SINH_VIEN.sql
```

Hoặc copy nội dung file `TAO_BANG_CHUC_NANG_SINH_VIEN.sql` và chạy trong pgAdmin.

### 2. Backend tự động tạo bảng

Nếu `application.yml` có cấu hình:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
```

Thì Spring Boot sẽ tự động tạo các bảng khi khởi động.

### 3. Sử dụng trong Code

**Ví dụ: Lưu job vào danh sách yêu thích**
```java
@Autowired
private SavedJobRepository savedJobRepository;

public SavedJob saveJob(UUID studentId, UUID jobId, String notes) {
    SavedJob savedJob = SavedJob.builder()
        .student(studentProfile)
        .job(job)
        .notes(notes)
        .build();
    return savedJobRepository.save(savedJob);
}
```

**Ví dụ: Lấy lịch sử chat**
```java
@Autowired
private AIChatConversationRepository conversationRepository;

public List<AIChatConversation> getChatHistory(UUID studentId) {
    return conversationRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
}
```

---

## 📝 Lưu ý quan trọng

1. **Cascade Delete:** Tất cả các bảng đều có `ON DELETE CASCADE`, khi xóa student profile sẽ tự động xóa tất cả dữ liệu liên quan.

2. **Indexes:** Tất cả foreign keys và các cột thường xuyên query đều có indexes để tối ưu hiệu suất.

3. **Timestamps:** Tất cả bảng đều có `created_at` và `updated_at` để theo dõi thời gian.

4. **Unique Constraints:** Các bảng như `saved_jobs` có unique constraint để tránh duplicate.

5. **JSON Fields:** Một số bảng sử dụng JSONB (PostgreSQL) để lưu dữ liệu phức tạp như `ai_feedback`, `roadmap_data`.

---

## ✅ Checklist

- [x] Tạo model cho AI Chat Conversations
- [x] Tạo model cho Saved Jobs
- [x] Tạo model cho Mock Interviews
- [x] Tạo model cho Job Recommendations
- [x] Tạo Repository cho tất cả models
- [x] Tạo file SQL script
- [ ] Tạo Service layer (sẽ làm tiếp)
- [ ] Tạo Controller layer (sẽ làm tiếp)
- [ ] Tạo API endpoints (sẽ làm tiếp)

---

## 🚀 Bước tiếp theo

1. Tạo Service layer cho các chức năng mới
2. Tạo Controller với REST API endpoints
3. Tích hợp vào frontend
4. Test các chức năng CRUD

---

**Tạo bởi:** CareerMate Development Team  
**Ngày:** 2026-01-07

