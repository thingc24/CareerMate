# Hướng dẫn lấy Gemini API Key

## Bước 1: Truy cập Google AI Studio

1. Mở trình duyệt và truy cập: **https://aistudio.google.com/apikey**
2. Đăng nhập bằng tài khoản Google của bạn

## Bước 2: Tạo API Key mới

1. Click vào nút **"Create API Key"** (Tạo API Key)
2. Chọn project hoặc tạo project mới
3. Copy API key được tạo (có dạng: `AIzaSy...`)

## Bước 3: Cập nhật API Key trong code

Mở các file sau và thay thế API key cũ bằng API key mới:

### File 1: `Web/sinhvien.html`
- Tìm dòng: `const GEMINI_API_KEY = 'YOUR_API_KEY_HERE';`
- Thay `YOUR_API_KEY_HERE` bằng API key mới của bạn

### File 2: `Web/nhatuyendung.html`
- Tìm dòng: `const GEMINI_API_KEY = 'YOUR_API_KEY_HERE';`
- Thay `YOUR_API_KEY_HERE` bằng API key mới của bạn

## Bước 4: Kiểm tra API Key hoạt động

1. Mở trang web: `http://localhost/CareerMate/Web/sinhvien.html`
2. Click vào icon chat ở góc dưới bên phải
3. Gửi một tin nhắn thử: "Xin chào"
4. Nếu AI trả lời = API key hoạt động tốt! ✅

## Xử lý lỗi thường gặp

### Lỗi: "API key invalid" hoặc "PERMISSION_DENIED"
- **Nguyên nhân**: API key không đúng hoặc chưa kích hoạt
- **Giải pháp**: 
  1. Kiểm tra lại API key đã copy đúng chưa
  2. Đảm bảo API key chưa bị xóa hoặc vô hiệu hóa
  3. Tạo API key mới nếu cần

### Lỗi: "API key not found"
- **Nguyên nhân**: API key chưa được tạo hoặc đã bị xóa
- **Giải pháp**: Tạo API key mới theo hướng dẫn ở trên

### Lỗi: "Quota exceeded"
- **Nguyên nhân**: Đã vượt quá giới hạn sử dụng miễn phí
- **Giải pháp**: 
  1. Đợi đến tháng sau (quota reset mỗi tháng)
  2. Hoặc nâng cấp lên gói trả phí

## Lưu ý quan trọng

⚠️ **KHÔNG** commit API key lên Git công khai!
- API key là thông tin bí mật
- Nếu đã commit nhầm, hãy xóa ngay và tạo key mới
- Sử dụng file `.gitignore` để bỏ qua các file chứa API key

## Thông tin về Gemini API

- **Model hiện tại**: `gemini-2.5-flash` (stable version)
- **Giới hạn miễn phí**: Có giới hạn số lượng requests/ngày
- **Tài liệu**: https://ai.google.dev/docs

---

**Chúc bạn thành công!** 🎉

