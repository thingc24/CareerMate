import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function StudentLayout({ children }) {
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
            <Link to="/student/dashboard" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-semibold shadow-sm">
                CM
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-tight text-slate-900">
                  CareerMate
                </span>
                <span className="text-xs text-slate-500">
                  Student Portal
                </span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 text-sm font-medium">
            <Link
              to="/student/dashboard"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/student/dashboard')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-home text-sm" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/student/jobs"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/student/jobs')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-briefcase text-sm" />
              <span>Việc làm</span>
            </Link>
            <Link
              to="/student/applications"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/student/applications')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-file-signature text-sm" />
              <span>Đơn ứng tuyển</span>
            </Link>
            <Link
              to="/student/cv"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/student/cv')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-file-alt text-sm" />
              <span>CV của tôi</span>
            </Link>
            <Link
              to="/student/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/student/profile')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-user text-sm" />
              <span>Hồ sơ cá nhân</span>
            </Link>
          </nav>

          <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <span className="font-medium text-slate-700 truncate max-w-[10rem]">
                  {user?.fullName || user?.email}
                </span>
                <span className="text-slate-400">Sinh viên</span>
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
          {/* Top bar (mobile & page title area) */}
          <header className="md:hidden h-16 px-4 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm">
            <Link to="/student/dashboard" className="text-lg font-semibold text-slate-900">
              CareerMate
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-slate-600 border border-slate-200 rounded-full px-3 py-1"
            >
              Đăng xuất
            </button>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

