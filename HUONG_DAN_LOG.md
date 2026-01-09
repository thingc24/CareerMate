# Hướng Dẫn Xem và Quản Lý Log

## 📋 Tổng Quan

Backend CareerMate tự động ghi log vào file: `backend/logs/careermate.log`

Log được rotate tự động:
- Mỗi file log tối đa: 10MB
- Giữ lại: 30 file log cũ
- Format: `careermate.log.YYYY-MM-DD.N.gz`

## 🚀 Các Script Xem Log

### 1. Xem Log Cơ Bản

```powershell
# Xem 50 dòng cuối (mặc định)
.\XEM_LOG.ps1

# Xem 100 dòng cuối
.\XEM_LOG.ps1 -Lines 100

# Xem 200 dòng cuối
.\XEM_LOG.ps1 -Lines 200
```

### 2. Theo Dõi Log Real-Time

```powershell
# Theo dõi log mới (tương tự tail -f)
.\XEM_LOG_THEO_DOI.ps1

# Hoặc dùng XEM_LOG với -Follow
.\XEM_LOG.ps1 -Follow
```

**Lưu ý:** Nhấn `Ctrl+C` để dừng theo dõi.

### 3. Xem Chỉ Lỗi

```powershell
# Xem chỉ lỗi và exceptions
.\XEM_LOG_ERROR.ps1

# Hoặc dùng XEM_LOG với -Error
.\XEM_LOG.ps1 -Error
```

### 4. Lọc Log Theo Keyword

```powershell
# Lọc log chứa từ "CV"
.\XEM_LOG.ps1 -Filter "CV"

# Lọc log chứa "ERROR" hoặc "Exception"
.\XEM_LOG.ps1 -Filter "ERROR|Exception"

# Lọc log chứa "StudentController"
.\XEM_LOG.ps1 -Filter "StudentController"
```

### 5. Tìm Kiếm Trong Log

```powershell
# Tìm kiếm từ "CV" trong 500 dòng cuối
.\TIM_KIEM_LOG.ps1 -Keyword "CV"

# Tìm kiếm "uploadCV"
.\TIM_KIEM_LOG.ps1 -Keyword "uploadCV"

# Tìm kiếm "404" hoặc "Not Found"
.\TIM_KIEM_LOG.ps1 -Keyword "404"
```

### 6. Xóa Log Cũ

```powershell
# Xóa các file log cũ (giữ lại log hiện tại)
.\XOA_LOG_CU.ps1
```

Script sẽ:
- Liệt kê các file log cũ
- Hỏi xác nhận trước khi xóa
- Xóa các file `.log.YYYY-MM-DD.N` và `.gz`

## 📊 Mức Độ Log

Log được phân loại theo mức độ:

- **ERROR** (Đỏ) - Lỗi nghiêm trọng
- **WARN** (Vàng) - Cảnh báo
- **INFO** (Xanh) - Thông tin
- **DEBUG** (Xám) - Debug

## 🔍 Các Trường Hợp Sử Dụng

### Debug lỗi upload CV:
```powershell
.\XEM_LOG.ps1 -Filter "uploadCV|CV|FileStorage"
```

### Debug lỗi authentication:
```powershell
.\XEM_LOG.ps1 -Filter "Authentication|JWT|401|403"
```

### Xem tất cả lỗi gần đây:
```powershell
.\XEM_LOG_ERROR.ps1 -Lines 200
```

### Theo dõi request real-time:
```powershell
.\XEM_LOG_THEO_DOI.ps1
# Sau đó thực hiện action trong app để xem log
```

### Tìm kiếm lỗi cụ thể:
```powershell
.\TIM_KIEM_LOG.ps1 -Keyword "NoSuchFileException"
.\TIM_KIEM_LOG.ps1 -Keyword "500"
.\TIM_KIEM_LOG.ps1 -Keyword "OpenRouter"
```

## 📁 Vị Trí Log

- **Log file chính:** `backend/logs/careermate.log`
- **Log cũ:** `backend/logs/careermate.log.YYYY-MM-DD.N.gz`

## 💡 Tips

1. **Khi debug lỗi:**
   - Chạy `.\XEM_LOG_THEO_DOI.ps1` trong một terminal
   - Thực hiện action gây lỗi trong app
   - Xem log real-time để thấy lỗi ngay lập tức

2. **Khi tìm lỗi cũ:**
   - Dùng `.\TIM_KIEM_LOG.ps1` với keyword liên quan
   - Tăng `-Lines` nếu cần tìm trong log cũ hơn

3. **Khi log file quá lớn:**
   - Dùng `.\XOA_LOG_CU.ps1` để xóa log cũ
   - Hoặc xóa thủ công các file `.gz` trong `backend/logs/`

4. **Khi cần xem log của một chức năng cụ thể:**
   - Dùng `-Filter` với tên controller/service
   - Ví dụ: `.\XEM_LOG.ps1 -Filter "StudentController"`

## ⚠️ Lưu Ý

- Log file có thể rất lớn nếu backend chạy lâu
- Nên xóa log cũ định kỳ để tiết kiệm dung lượng
- Log file được rotate tự động, không cần lo về kích thước
- Nếu không thấy log, kiểm tra backend đã chạy chưa
