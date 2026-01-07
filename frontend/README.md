# CareerMate Frontend (ReactJS)

Frontend application cho CareerMate được xây dựng với ReactJS và Vite.

## 🚀 Cài đặt và Chạy

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình environment
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Sửa `VITE_API_BASE_URL` nếu cần:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. Chạy development server
```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## 📁 Cấu trúc thư mục

```
src/
├── components/      # Reusable components
├── pages/           # Page components
│   ├── auth/       # Login, Register
│   ├── student/    # Student pages
│   ├── recruiter/  # Recruiter pages
│   └── admin/      # Admin pages
├── layouts/         # Layout components
├── contexts/        # React contexts (Auth, etc.)
├── services/        # API services
└── utils/           # Utility functions
```

## 🛠️ Technologies

- **React 18**: UI library
- **React Router**: Routing
- **Axios**: HTTP client
- **Tailwind CSS**: Styling
- **Vite**: Build tool

## 📝 Notes

- Frontend này đang trong quá trình migration từ HTML/JS thuần
- Các pages đang được phát triển dần
- API client tương thích với backend hiện tại

