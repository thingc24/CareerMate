# Hướng dẫn chạy Database cho Nhà Tuyển Dụng

## File SQL: `backend/database/recruiter_complete_schema.sql`

Script này bổ sung các bảng và chức năng còn thiếu cho đầy đủ chức năng nhà tuyển dụng.

## Các bảng được tạo mới:

1. **interviews** - Lưu lịch phỏng vấn chi tiết
2. **recruiter_notes** - Ghi chú của recruiter về ứng viên
3. **saved_candidates** - Danh sách ứng viên yêu thích
4. **job_views** - Theo dõi lượt xem job
5. **company_followers** - Sinh viên theo dõi công ty
6. **recruiter_statistics** - Cache thống kê dashboard
7. **recruiter_notifications** - Thông báo cho recruiter
8. **recruiter_activity_logs** - Log hoạt động (audit trail)
9. **candidate_search_history** - Lịch sử tìm kiếm ứng viên

## Cách chạy:

### Cách 1: Sử dụng psql (Khuyến nghị)

```cmd
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5432 -U postgres -d careermate_db -f backend\database\recruiter_complete_schema.sql
```

### Cách 2: Sử dụng pgAdmin

1. Mở pgAdmin
2. Kết nối đến database `careermate_db`
3. Click chuột phải vào database → Query Tool
4. Mở file `backend/database/recruiter_complete_schema.sql`
5. Chạy script (F5)

### Cách 3: Copy-paste vào Query Tool

1. Mở file `backend/database/recruiter_complete_schema.sql`
2. Copy toàn bộ nội dung
3. Paste vào Query Tool trong pgAdmin
4. Chạy (F5)

## Lưu ý:

- Script sử dụng `CREATE TABLE IF NOT EXISTS` nên an toàn chạy nhiều lần
- Script sẽ tự động thêm các cột còn thiếu vào bảng `articles` (reactions_count, comments_count)
- Các trigger và view sẽ được tạo tự động
- Nếu có lỗi, kiểm tra log trong pgAdmin hoặc terminal

## Kiểm tra sau khi chạy:

```sql
-- Kiểm tra các bảng đã được tạo
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'interviews', 
    'recruiter_notes', 
    'saved_candidates', 
    'job_views',
    'company_followers',
    'recruiter_statistics',
    'recruiter_notifications',
    'recruiter_activity_logs',
    'candidate_search_history'
)
ORDER BY table_name;

-- Kiểm tra các view
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name IN (
    'recruiter_candidate_summary',
    'recruiter_job_statistics'
);
```

## Các chức năng được hỗ trợ:

✅ Lịch phỏng vấn chi tiết (loại, thời gian, địa điểm, link meeting)
✅ Ghi chú về ứng viên
✅ Lưu ứng viên yêu thích
✅ Theo dõi lượt xem job
✅ Thống kê dashboard (cache)
✅ Thông báo cho recruiter
✅ Log hoạt động (audit trail)
✅ Lịch sử tìm kiếm ứng viên
✅ Views hỗ trợ query nhanh
