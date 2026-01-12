# Hướng Dẫn Chạy SQL Script Trong CMD

## Cách 1: Chạy file batch tự động (Khuyến nghị)

1. Mở CMD trong thư mục CareerMate
2. Chạy lệnh:
```cmd
TAO_DATABASE_CMD.bat
```
3. Nhập password khi được hỏi: `Aa1234`

## Cách 2: Chạy từng lệnh thủ công

### Bước 1: Tạo database
```cmd
cd "C:\Program Files\PostgreSQL\18\bin"
psql.exe -h 127.0.0.1 -p 5432 -U postgres -d postgres -f "C:\xampp\htdocs\CareerMate\TAO_DATABASE.sql"
```

### Bước 2: Tạo các bảng chức năng sinh viên
```cmd
psql.exe -h 127.0.0.1 -p 5432 -U postgres -d careermate_db -f "C:\xampp\htdocs\CareerMate\TAO_BANG_CHUC_NANG_SINH_VIEN.sql"
```

### Bước 3: Tạo các bảng Quiz
```cmd
psql.exe -h 127.0.0.1 -p 5432 -U postgres -d careermate_db -f "C:\xampp\htdocs\CareerMate\backend\database\quiz_schema.sql"
```

## Cách 3: Chạy trực tiếp từ thư mục CareerMate

Nếu đã thêm PostgreSQL vào PATH:

```cmd
cd C:\xampp\htdocs\CareerMate

REM Tạo database
psql -h 127.0.0.1 -p 5432 -U postgres -d postgres -f TAO_DATABASE.sql

REM Tạo bảng chức năng sinh viên
psql -h 127.0.0.1 -p 5432 -U postgres -d careermate_db -f TAO_BANG_CHUC_NANG_SINH_VIEN.sql

REM Tạo bảng Quiz
psql -h 127.0.0.1 -p 5432 -U postgres -d careermate_db -f backend\database\quiz_schema.sql
```

## Lưu ý:

1. **Password**: Khi chạy lệnh, hệ thống sẽ hỏi password. Nhập: `Aa1234`

2. **Nếu muốn tránh nhập password mỗi lần**, tạo file `.pgpass`:
   - Tạo file: `C:\Users\<YourUsername>\.pgpass`
   - Nội dung: `127.0.0.1:5432:*:postgres:Aa1234`
   - Set permission: `icacls "%USERPROFILE%\.pgpass" /inheritance:r /grant "%USERNAME%:R"`

3. **Kiểm tra kết nối**:
```cmd
psql -h 127.0.0.1 -p 5432 -U postgres -d careermate_db -c "\dt"
```

4. **Nếu gặp lỗi "database does not exist"**, chạy Bước 1 trước để tạo database.

5. **Nếu gặp lỗi "relation already exists"**, bảng đã tồn tại, có thể bỏ qua hoặc xóa bảng cũ.
