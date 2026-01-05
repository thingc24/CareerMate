# Troubleshooting Guide - Đăng nhập/Đăng ký

## Các lỗi thường gặp và cách khắc phục

### 1. Lỗi "API client chưa được tải"
**Nguyên nhân**: Script `api-client.js` chưa load xong
**Giải pháp**: 
- Kiểm tra file `api-client.js` có tồn tại không
- Mở Developer Tools (F12) → Console để xem lỗi
- Đảm bảo script được load trước khi sử dụng

### 2. Lỗi CORS (Cross-Origin Resource Sharing)
**Nguyên nhân**: Backend chưa cho phép CORS từ frontend
**Giải pháp**:
- Kiểm tra `SecurityConfig.java` trong backend
- Đảm bảo có `@CrossOrigin(origins = "*")` hoặc cấu hình CORS đúng
- Backend phải chạy và accessible từ frontend

### 3. Lỗi "Network Error" hoặc "Failed to fetch"
**Nguyên nhân**: 
- Backend chưa chạy
- API_BASE_URL không đúng
- Firewall/Network blocking

**Giải pháp**:
- Kiểm tra backend có đang chạy không (http://localhost:8080)
- Kiểm tra `API_BASE_URL` trong `api-client.js` (mặc định: `http://localhost:8080/api`)
- Thử mở http://localhost:8080/api/auth/login trong browser để test

### 4. Lỗi 401 Unauthorized
**Nguyên nhân**: Token không hợp lệ hoặc đã hết hạn
**Giải pháp**:
- Xóa localStorage: `localStorage.clear()`
- Đăng nhập lại
- Kiểm tra JWT secret trong backend

### 5. Lỗi 400 Bad Request
**Nguyên nhân**: Dữ liệu gửi lên không đúng format
**Giải pháp**:
- Kiểm tra console để xem error message chi tiết
- Đảm bảo email format đúng
- Đảm bảo password đủ độ dài (tối thiểu 8 ký tự)
- Đảm bảo role được chọn (STUDENT hoặc RECRUITER)

### 6. Lỗi 500 Internal Server Error
**Nguyên nhân**: Lỗi từ phía backend
**Giải pháp**:
- Kiểm tra backend logs
- Kiểm tra database connection
- Kiểm tra các dependencies

## Cách debug

1. **Mở Developer Tools** (F12)
2. **Tab Console**: Xem JavaScript errors
3. **Tab Network**: Xem API requests/responses
4. **Kiểm tra localStorage**:
   ```javascript
   localStorage.getItem('accessToken')
   localStorage.getItem('user')
   ```

## Test API trực tiếp

### Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Test User","role":"STUDENT"}'
```

## Checklist

- [ ] Backend đang chạy (http://localhost:8080)
- [ ] Database đã được setup và chạy
- [ ] API_BASE_URL trong api-client.js đúng
- [ ] CORS đã được cấu hình trong backend
- [ ] Browser console không có lỗi JavaScript
- [ ] Network tab không có failed requests

## Liên hệ

Nếu vẫn gặp lỗi, vui lòng:
1. Chụp screenshot lỗi
2. Copy error message từ console
3. Mô tả các bước đã thực hiện

