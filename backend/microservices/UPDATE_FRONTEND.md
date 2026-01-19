# Cập nhật Frontend cho Microservices

## Thay đổi API Base URL

Frontend hiện tại đang gọi trực tiếp backend. Với microservices, cần gọi qua API Gateway.

### Cập nhật `frontend/src/services/api.js`

**Trước:**
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

**Sau (không đổi vì Gateway cũng chạy trên 8080):**
```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

**Lưu ý:** API Gateway đã được cấu hình để route tất cả requests đến các services tương ứng, nên frontend không cần thay đổi gì về URL. Tất cả requests sẽ tự động được route đúng.

## Kiểm tra Routes trong API Gateway

API Gateway đã được cấu hình với các routes:
- `/api/users/**` → user-service
- `/api/jobs/**` → job-service
- `/api/articles/**` → content-service
- `/api/courses/**`, `/api/challenges/**` → learning-service
- `/api/admin/**` → admin-service
- `/api/notifications/**` → notification-service
- `/api/ai/**` → ai-service

Frontend không cần thay đổi gì vì các endpoints vẫn giữ nguyên.
