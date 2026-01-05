# Database Status - CareerMate

## ✅ Database đã sẵn sàng!

### Containers đang chạy:
- ✅ **careermate-postgres** - PostgreSQL (port 5432)
- ✅ **careermate-redis** - Redis (port 6379)

### Database Info:
- **Database name**: `careermate_db`
- **Username**: `careermate_user`
- **Password**: `careermate_password`
- **Host**: `localhost`
- **Port**: `5432`

### Tables đã được tạo (27 tables):
1. users
2. oauth_providers
3. student_profiles
4. student_skills
5. cvs
6. cv_analyses
7. recruiter_profiles
8. companies
9. company_ratings
10. jobs
11. job_skills
12. applications
13. application_history
14. job_matches
15. courses
16. course_enrollments
17. challenges
18. challenge_participations
19. badges
20. student_badges
21. leaderboard
22. articles
23. cv_templates
24. packages
25. subscriptions
26. system_logs
27. system_settings

## 🔗 Connection String:
```
jdbc:postgresql://localhost:5432/careermate_db
```

## ✅ Backend có thể kết nối ngay!

Cấu hình trong `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/careermate_db
    username: careermate_user
    password: careermate_password
```

## 🚀 Next Steps:

1. **Chạy backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Test đăng ký/đăng nhập**:
   - Mở: http://localhost/CareerMate/Web/login.html
   - Thử đăng ký tài khoản mới
   - Hoặc đăng nhập nếu đã có tài khoản

## 📝 Useful Commands:

### Xem logs database:
```bash
docker logs careermate-postgres
```

### Kết nối vào database:
```bash
docker exec -it careermate-postgres psql -U careermate_user -d careermate_db
```

### Dừng database:
```bash
docker-compose down
```

### Khởi động lại:
```bash
docker-compose up -d postgres redis
```

---

**Database đã sẵn sàng! Bạn có thể chạy backend và test đăng nhập/đăng ký ngay!** ✅

