import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      // Navigate based on user role
      if (data.user.role === 'STUDENT') {
        navigate('/student/dashboard');
      } else if (data.user.role === 'RECRUITER') {
        navigate('/recruiter/dashboard');
      } else if (data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
        {/* Left side: intro */}
        <div className="hidden md:flex flex-col text-slate-100 space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-slate-800/70 px-4 py-1 text-xs font-medium text-slate-200 ring-1 ring-slate-700/70">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-semibold">
              CM
            </span>
            <span>Nền tảng định hướng và kết nối việc làm cho sinh viên</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
            Chào mừng đến với{' '}
            <span className="text-blue-400">CareerMate</span>
          </h1>
          <p className="text-sm lg:text-base text-slate-300 max-w-md">
            Quản lý CV, theo dõi đơn ứng tuyển và khám phá các cơ hội việc làm phù hợp với lộ trình sự nghiệp của bạn.
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-center gap-2">
              <i className="fas fa-check-circle text-emerald-400" />
              <span>Bảng điều khiển trực quan cho sinh viên, nhà tuyển dụng, admin.</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fas fa-check-circle text-emerald-400" />
              <span>Tích hợp AI gợi ý công việc và phân tích CV.</span>
            </li>
            <li className="flex items-center gap-2">
              <i className="fas fa-check-circle text-emerald-400" />
              <span>Theo dõi trạng thái ứng tuyển rõ ràng, dễ quan sát.</span>
            </li>
          </ul>
        </div>

        {/* Right side: form */}
        <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-slate-200 px-6 py-7 sm:px-8 sm:py-8">
          <div className="space-y-2 mb-6 text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              Đăng nhập tài khoản
            </h2>
            <p className="text-sm text-slate-500">
              Nhập email và mật khẩu để tiếp tục.
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
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  placeholder="nhapemail@truong.edu.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  autoComplete="current-password"
                  required
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>

            <p className="text-center text-xs sm:text-sm text-slate-500">
              Chưa có tài khoản?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Đăng ký ngay
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

