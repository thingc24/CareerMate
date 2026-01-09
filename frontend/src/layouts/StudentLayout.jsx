import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ChatWidget from '../components/ChatWidget';
import api from '../services/api';

export default function StudentLayout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    loadAvatar();
    
    // Listen for avatar update events
    const handleAvatarUpdate = () => {
      console.log('Avatar update event received, reloading avatar...');
      loadAvatar();
    };
    
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    
    // Reload avatar every 5 seconds to catch updates (or use event listener)
    const interval = setInterval(() => {
      loadAvatar();
    }, 5000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, []);

  const loadAvatar = async () => {
    try {
      // Force refresh to get latest avatar
      const data = await api.getStudentProfile(true);
      if (data && !data.error && data.avatarUrl) {
        let url;
        if (data.avatarUrl.startsWith('http')) {
          url = data.avatarUrl;
        } else {
          // Add /api prefix because context-path is /api
          if (data.avatarUrl.startsWith('/api')) {
            url = `http://localhost:8080${data.avatarUrl}`;
          } else {
            url = `http://localhost:8080/api${data.avatarUrl}`;
          }
        }
        // Add cache busting timestamp to force reload
        url = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
        console.log('Loading avatar URL:', url);
        setAvatarUrl(url);
      } else {
        // Clear avatar if not found
        setAvatarUrl(null);
      }
    } catch (error) {
      // Silently fail for avatar - not critical
      console.debug('Error loading avatar (non-critical):', error.message);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const getAvatarUrl = () => {
    if (avatarUrl) return avatarUrl;
    return null;
  };

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
                isActive('/student/cv') || location.pathname.startsWith('/student/cv/')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-file-alt text-sm" />
              <span>CV của tôi</span>
            </Link>
            <Link
              to="/student/roadmap"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/student/roadmap')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <i className="fas fa-route text-sm" />
              <span>Lộ trình nghề nghiệp</span>
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
          {/* Top bar with avatar */}
          <header className="h-16 px-4 md:px-6 flex items-center justify-between bg-white border-b border-slate-200 shadow-sm">
            <button
              onClick={() => navigate('/student/profile/view')}
              className="flex items-center gap-3 hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors"
            >
              {getAvatarUrl() ? (
                <img
                  src={getAvatarUrl()}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border-2 border-slate-200 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full border-2 border-slate-200 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <i className="fas fa-user text-white text-sm"></i>
                </div>
              )}
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-semibold text-slate-900">
                  {user?.fullName || user?.email || 'Sinh viên'}
                </span>
                <span className="text-xs text-slate-500">Xem hồ sơ</span>
              </div>
            </button>
            <div className="md:hidden">
              <Link to="/student/dashboard" className="text-lg font-semibold text-slate-900">
                CareerMate
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-slate-600 border border-slate-200 rounded-full px-3 py-1 hover:bg-slate-50 transition-colors"
            >
              <i className="fas fa-sign-out-alt md:hidden"></i>
              <span className="hidden md:inline">Đăng xuất</span>
            </button>
          </header>

          <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">{children}</div>
          </main>
        </div>
      </div>
      <ChatWidget role="STUDENT" />
    </div>
  );
}

