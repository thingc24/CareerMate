# Hướng dẫn Test Gemini API Models

## Cách 1: Sử dụng PowerShell Script (Khuyên dùng)

1. Mở PowerShell trong thư mục project root
2. Chạy script:
   ```powershell
   .\TEST_GEMINI_MODELS.ps1
   ```
3. Nhập API key khi được hỏi
4. Script sẽ test tất cả các model và hiển thị kết quả

## Cách 2: Sử dụng Java Tester

1. Compile và chạy:
   ```bash
   cd backend
   javac -cp "target/classes;target/dependency/*" src/main/java/vn/careermate/util/GeminiModelTester.java
   java -cp "target/classes;target/dependency/*" vn.careermate.util.GeminiModelTester
   ```

## Cách 3: Test trực tiếp với cURL

```bash
# Test với gemini-pro
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello, test"
      }]
    }]
  }'

# Test với gemini-1.5-pro
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello, test"
      }]
    }]
  }'

# Test với gemini-1.5-flash
curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Hello, test"
      }]
    }]
  }'
```

## Các Model được test:

1. `gemini-pro` - Model cơ bản
2. `gemini-1.5-pro` - Model mới, mạnh hơn
3. `gemini-1.5-flash` - Model nhanh, chi phí thấp
4. `gemini-1.5-pro-latest` - Latest version của 1.5-pro
5. `gemini-1.5-flash-latest` - Latest version của 1.5-flash
6. `gemini-pro-latest` - Latest version của pro

## Sau khi test:

- Script sẽ hiển thị model nào hoạt động
- Cập nhật model name trong `application.yml` với model đã test thành công
- Restart backend để áp dụng thay đổi

