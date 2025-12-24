# Hướng dẫn chạy CareerMate trên XAMPP

## Bước 1: Cài đặt XAMPP

1. Tải XAMPP từ: https://www.apachefriends.org/
2. Cài đặt XAMPP (chọn Apache và MySQL nếu cần)
3. Khởi động XAMPP Control Panel

## Bước 2: Copy project vào XAMPP

1. Mở thư mục XAMPP (thường là `C:\xampp\` hoặc `D:\xampp\`)
2. Copy toàn bộ thư mục `CareerMate` vào `C:\xampp\htdocs\`
   - Kết quả: `C:\xampp\htdocs\CareerMate\Web\`

## Bước 3: Khởi động Apache

1. Mở XAMPP Control Panel
2. Click nút **Start** ở dòng Apache
3. Đợi đến khi status chuyển sang màu xanh (Running)

## Bước 4: Kiểm tra file proxy

1. Mở trình duyệt
2. Truy cập: `http://localhost/CareerMate/Web/gemini-proxy.php`
3. Nếu thấy lỗi JSON hoặc thông báo lỗi là bình thường (vì chưa có request)
4. Nếu thấy "Method not allowed" hoặc lỗi tương tự = file hoạt động tốt

## Bước 5: Mở trang web

### Trang Sinh viên:
```
http://localhost/CareerMate/Web/sinhvien.html
```

### Trang Nhà tuyển dụng:
```
http://localhost/CareerMate/Web/nhatuyendung.html
```

### Trang Admin:
```
http://localhost/CareerMate/Web/admin.html
```

## Bước 6: Kiểm tra Chat AI

1. Mở một trong các trang (sinhvien.html hoặc nhatuyendung.html)
2. Click vào nút chat ở góc dưới bên phải
3. Gửi một tin nhắn thử
4. Nếu AI trả lời = thành công! ✅

## Xử lý lỗi thường gặp

### Lỗi 1: "Cannot connect to API"
- **Nguyên nhân**: Proxy không hoạt động, API key sai, hoặc model API đã lỗi thời
- **Giải pháp**: 
  1. Kiểm tra Apache đã chạy chưa
  2. Kiểm tra file `gemini-proxy.php` có trong thư mục `Web/` không
  3. Kiểm tra API key trong file HTML (xem `Web/HUONG_DAN_API_KEY.md`)
  4. Đảm bảo đang sử dụng model `gemini-1.5-flash` (đã được cập nhật)

### Lỗi 2: "404 Not Found"
- **Nguyên nhân**: Đường dẫn sai
- **Giải pháp**: 
  - Đảm bảo thư mục là `C:\xampp\htdocs\CareerMate\Web\`
  - Kiểm tra URL: `http://localhost/CareerMate/Web/sinhvien.html`

### Lỗi 3: "CORS Error"
- **Nguyên nhân**: Đang mở file trực tiếp (file://) thay vì qua localhost
- **Giải pháp**: 
  - Luôn mở qua `http://localhost/...`
  - Không double-click file HTML

### Lỗi 4: "API key invalid" hoặc "Cannot connect to API"
- **Nguyên nhân**: API key không đúng, hết hạn, hoặc chưa được cập nhật
- **Giải pháp**: 
  1. Lấy API key mới tại: **https://aistudio.google.com/apikey**
  2. Mở file `Web/sinhvien.html` và `Web/nhatuyendung.html`
  3. Tìm dòng: `const GEMINI_API_KEY = '...'`
  4. Thay thế API key cũ bằng API key mới
  5. Lưu file và refresh trang
  6. Xem chi tiết tại: `Web/HUONG_DAN_API_KEY.md`

## Cấu trúc thư mục sau khi setup

```
C:\xampp\htdocs\CareerMate\
├── Web\
│   ├── admin.html
│   ├── nhatuyendung.html
│   ├── sinhvien.html
│   ├── gemini-proxy.php
│   └── HUONG_DAN_API_KEY.md
├── Chat AI\
│   ├── gemini-proxy.js
│   └── gemini-proxy.php
└── HUONG_DAN_XAMPP.md
```

## Lưu ý quan trọng

1. **Luôn chạy Apache** trước khi mở trang web
2. **Sử dụng localhost** không phải file://
3. **Kiểm tra port**: Nếu port 80 bị chiếm, đổi port trong XAMPP
4. **API key**: Giữ bí mật, không commit lên Git công khai

## Test nhanh

1. Mở: `http://localhost/CareerMate/Web/sinhvien.html`
2. Click nút chat (góc dưới phải)
3. Gửi: "Xin chào"
4. Nếu AI trả lời = OK! ✅

---

**Chúc bạn thành công!** 🎉

