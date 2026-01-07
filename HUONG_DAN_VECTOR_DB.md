# Hướng Dẫn Setup Vector DB (Weaviate)

## 📋 Yêu Cầu

Vector DB được sử dụng cho semantic job matching - tìm kiếm ứng viên phù hợp dựa trên ý nghĩa, không chỉ keywords.

## 🐳 Setup với Docker (Khuyến nghị)

### 1. Chạy Weaviate với Docker
```bash
docker run -d \
  --name weaviate \
  -p 8081:8080 \
  -e QUERY_DEFAULTS_LIMIT=25 \
  -e AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED=true \
  -e PERSISTENCE_DATA_PATH=/var/lib/weaviate \
  -v weaviate_data:/var/lib/weaviate \
  semitechnologies/weaviate:latest
```

### 2. Kiểm tra Weaviate đang chạy
Truy cập: `http://localhost:8081/v1/meta`

### 3. Cấu hình trong application.yml
```yaml
ai:
  vector-db:
    weaviate:
      url: http://localhost:8081
      enabled: true
```

## 🔧 Manual Setup

1. Download Weaviate từ: https://github.com/weaviate/weaviate/releases
2. Chạy Weaviate server
3. Cấu hình trong `application.yml`

## 📝 Usage

Vector DB sẽ tự động được sử dụng khi:
- Recruiter tìm ứng viên phù hợp
- Student tìm việc làm phù hợp
- AI job matching

## ⚠️ Lưu ý

- Vector DB là optional - hệ thống vẫn hoạt động nếu không có
- Cần tạo embeddings cho CVs và Jobs trước khi search
- Embeddings có thể tạo bằng Gemini API hoặc OpenAI API

