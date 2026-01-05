# Sửa lỗi JWT Secret Key

## Vấn đề
Lỗi: "Illegal base64 character: '-'"
- JWT secret key trong `application.yml` không phải base64 hợp lệ
- Code đang cố decode base64 nhưng secret key là string thông thường

## Giải pháp
Đã tạo và cập nhật base64 secret key hợp lệ (32 bytes):
```
5Ug/98ITtqMrJqakx4zPmlUTDmqhqqsC2MNEfE4NZ4w=
```

## Thay đổi
File: `backend/src/main/resources/application.yml`
```yaml
jwt:
  secret: ${JWT_SECRET:5Ug/98ITtqMrJqakx4zPmlUTDmqhqqsC2MNEfE4NZ4w=}
```

## Cách áp dụng
1. **Dừng backend hiện tại** (Ctrl+C trong terminal)
2. **Khởi động lại backend**:
   ```bash
   cd backend
   .\start-with-maven.bat
   ```
3. **Đợi backend khởi động** (20-30 giây)
4. **Test lại đăng ký**

## Lưu ý
- Secret key này chỉ dùng cho development
- Trong production, nên dùng environment variable `JWT_SECRET`
- Không commit secret key thật lên Git

## Kiểm tra
Sau khi khởi động lại, test đăng ký:
- http://localhost/CareerMate/Web/register.html
- Nếu không còn lỗi "Illegal base64 character" = thành công! ✅

