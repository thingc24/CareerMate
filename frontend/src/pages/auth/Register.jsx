import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'STUDENT',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.register(formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-[0.9fr,1.1fr] gap-10 items-center">
        {/* Left: form */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-slate-200 px-6 py-7 sm:px-8 sm:py-8">
          <div className="space-y-2 mb-6 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Tạo tài khoản CareerMate
            </h2>
            <p className="text-sm text-slate-500">
              Chỉ mất vài bước để bạn bắt đầu quản lý hành trình nghề nghiệp.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  placeholder="nhapemail@truong.edu.vn"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  Mật khẩu
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  placeholder="Tối thiểu 8 ký tự, bao gồm chữ và số"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label htmlFor="role" className="block text-sm font-medium text-slate-700">
                  Vai trò
                </label>
                <select
                  id="role"
                  name="role"
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="STUDENT">Sinh viên</option>
                  <option value="RECRUITER">Nhà tuyển dụng</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>

            <p className="text-center text-xs sm:text-sm text-slate-500">
              Đã có tài khoản?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Đăng nhập
              </Link>
            </p>
          </form>
        </div>

        {/* Right: intro */}
        <div className="hidden md:flex flex-col text-slate-100 space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-800/70 px-4 py-1 text-xs font-medium text-slate-200 ring-1 ring-slate-700/70">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-semibold">
              CM
            </span>
            <span>Một tài khoản – ba vai trò: Sinh viên, Nhà tuyển dụng, Admin</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
            Bắt đầu hành trình sự nghiệp cùng{' '}
            <span className="text-blue-400">CareerMate</span>
          </h1>
          <p className="text-sm lg:text-base text-slate-300 max-w-md">
            Tạo hồ sơ, tải CV, theo dõi job và tương tác với nhà tuyển dụng một cách chuyên nghiệp hơn.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <i className="fas fa-star text-amber-400" />
              <span>Giao diện hiện đại, tập trung vào trải nghiệm người dùng.</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fas fa-shield-alt text-emerald-400" />
              <span>Bảo mật với JWT và phân quyền rõ ràng.</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fas fa-brain text-sky-400" />
              <span>Tích hợp AI hỗ trợ định hướng và đánh giá CV.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

