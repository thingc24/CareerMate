# Hướng dẫn chọn Model Gemini API

## Models được khuyến nghị

Dựa trên danh sách models có sẵn, đây là các models tốt nhất cho dự án:

### 1. **gemini-2.5-flash** ⭐ (Khuyến nghị)
- **Status**: Stable version
- **Mô tả**: Mid-size multimodal model, hỗ trợ lên đến 1 triệu tokens
- **Đặc điểm**: 
  - Hỗ trợ thinking mode
  - Input: 1,048,576 tokens
  - Output: 65,536 tokens
- **Phù hợp cho**: Ứng dụng chat, xử lý văn bản dài

### 2. **gemini-2.0-flash-001**
- **Status**: Stable version (January 2025)
- **Mô tả**: Fast and versatile multimodal model
- **Đặc điểm**:
  - Input: 1,048,576 tokens
  - Output: 8,192 tokens
- **Phù hợp cho**: Ứng dụng cần tốc độ cao

### 3. **gemini-flash-latest**
- **Status**: Latest release
- **Mô tả**: Luôn là phiên bản mới nhất của Gemini Flash
- **Đặc điểm**:
  - Hỗ trợ thinking mode
  - Input: 1,048,576 tokens
  - Output: 65,536 tokens
- **Phù hợp cho**: Khi muốn dùng features mới nhất

### 4. **gemini-2.5-pro**
- **Status**: Stable version (June 17th, 2025)
- **Mô tả**: Model mạnh nhất, ổn định
- **Đặc điểm**:
  - Hỗ trợ thinking mode
  - Input: 1,048,576 tokens
  - Output: 65,536 tokens
- **Phù hợp cho**: Tasks phức tạp, cần độ chính xác cao

## Cách thay đổi model

### Trong file `Web/gemini-proxy.php`:

Tìm dòng:
```php
$model = 'gemini-2.5-flash';
```

Thay đổi thành model bạn muốn, ví dụ:
```php
$model = 'gemini-2.0-flash-001';  // Hoặc model khác
```

### Trong các file HTML (fallback):

Trong `Web/sinhvien.html` và `Web/nhatuyendung.html`, tìm dòng:
```javascript
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
```

Thay `gemini-2.5-flash` bằng model bạn muốn.

## Models đã deprecated (KHÔNG dùng)

- ❌ `gemini-pro` - Không còn trong danh sách
- ❌ `gemini-1.5-flash` - Đã bị ngừng hỗ trợ
- ❌ `gemini-1.5-pro` - Đã bị ngừng hỗ trợ

## Lưu ý về Rate Limits

- **Free tier**: Có giới hạn số lượng requests/ngày
- **gemini-2.5-flash**: Có thể có giới hạn cao hơn
- **gemini-2.0-flash**: Thường có giới hạn cao hơn vì là model cũ hơn

## Test model

Sử dụng file `test-proxy.php` để test model trước khi dùng:
1. Mở: `http://localhost/CareerMate/Chat AI/test-proxy.php`
2. Nhập API key
3. Nhập tên model (ví dụ: `gemini-2.5-flash`)
4. Click "Test Proxy"

---

**Model hiện tại đang dùng**: `gemini-2.5-flash` ✅

