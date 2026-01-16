import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChatWidget from '../components/ChatWidget';
import NotificationBell from '../components/NotificationBell';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col bg-white/90 backdrop-blur border-r border-slate-200 shadow-sm">
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-semibold shadow-sm">
                CM
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-slate-900">
                  CareerMate
                </span>
                <span className="text-xs text-slate-500">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 text-sm font-medium">
            <Link
              to="/admin/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/dashboard')
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-tachometer-alt text-sm" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/admin/users"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/users')
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-users-cog text-sm" />
              <span>Quản lý người dùng</span>
            </Link>
            <Link
              to="/admin/jobs"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/jobs')
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-briefcase text-sm" />
              <span>Quản lý tin tuyển dụng</span>
            </Link>
            <Link
              to="/admin/articles"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/articles')
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-newspaper text-sm" />
              <span>Quản lý bài viết</span>
            </Link>
            <Link
              to="/admin/articles/create"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/articles/create')
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-plus text-sm" />
              <span>Đăng bài viết</span>
            </Link>
            <Link
              to="/admin/cv-templates"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/cv-templates')
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-file-alt text-sm" />
              <span>Quản lý CV Templates</span>
            </Link>
            <Link
              to="/admin/packages"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/packages')
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-box text-sm" />
              <span>Quản lý Gói Dịch Vụ</span>
            </Link>
            <Link
              to="/admin/analytics"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin/analytics')
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-chart-bar text-sm" />
              <span>Phân Tích & Báo Cáo</span>
            </Link>
          </nav>

          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-medium text-slate-700 truncate max-w-[10rem]">
                  {user?.email}
                </span>
                <span className="text-slate-400">Quản trị viên</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                <i className="fas fa-sign-out-alt" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main area */}
        <div className="flex-1 flex flex-col">
          <header className="h-16 px-4 md:px-6 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm">
            <div className="md:hidden">
              <Link to="/admin/dashboard" className="text-lg font-semibold text-slate-900">
                CareerMate Admin
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
            </div>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">{children}</div>
          </main>
        </div>
      </div>
      <ChatWidget role="ADMIN" />
    </div>
  );
}

