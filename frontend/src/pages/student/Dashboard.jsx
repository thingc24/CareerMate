import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    cvs: 0,
    challenges: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load applications count
      const applications = await api.getApplications(0, 1);
      setStats(prev => ({ ...prev, applications: applications.totalElements || 0 }));

      // Load CVs count
      const cvs = await api.getCVs();
      setStats(prev => ({ ...prev, cvs: cvs.length || 0 }));

      // Load recent jobs
      const jobs = await api.searchJobs('', '', 0, 6);
      setRecentJobs(jobs.content || jobs || []);

    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'VND') => {
    if (!amount) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND'
    }).format(amount);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const StatCard = ({ icon, label, value, color, delay }) => (
    <div
      className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-default"
      style={{ animation: `slideUp 0.5s ease-out ${delay}ms backwards` }}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>

      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <i className={`${icon} text-xl text-${color}-600 dark:text-${color}-400`}></i>
        </div>

        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1 tracking-tight">
          {loading ? (
            <div className="h-9 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          ) : (
            value
          )}
        </h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </div>
  );

  const QuickAction = ({ to, icon, label, color, delay }) => (
    <Link
      to={to}
      className="flex flex-col items-center justify-center p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 group"
      style={{ animation: `scaleIn 0.3s ease-out ${delay}ms backwards` }}
    >
      <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center text-white text-xl shadow-lg mb-3 group-hover:scale-110 transition-transform duration-300`}>
        <i className={icon}></i>
      </div>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {label}
      </span>
    </Link>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden p-8 md:p-12 animate-fade-in shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse-soft"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium mb-4 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Student Portal v2.0
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              {greeting()}, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-white">
                Chúc bạn một ngày hiệu quả!
              </span>
            </h1>
            <p className="text-blue-100 text-lg max-w-xl">
              Đừng quên cập nhật CV và kiểm tra các cơ hội việc làm mới nhất nhé.
            </p>
            <div className="flex gap-4 mt-8">
              <Link to="/student/jobs" className="px-6 py-3 bg-white text-blue-600 font-bold rounded-xl shadow-xl hover:bg-blue-50 transform hover:scale-105 transition-all">
                Tìm việc ngay
              </Link>
              <Link to="/student/profile" className="px-6 py-3 bg-blue-700/50 text-white font-bold rounded-xl backdrop-blur-md border border-white/20 hover:bg-blue-700/70 transition-all">
                Cập nhật hồ sơ
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative w-48 h-48 mx-auto animate-float">
              <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-30 animate-pulse-soft"></div>
              {/* Check if user has avatar, if not show placeholder */}
              <div className="relative w-full h-full rounded-full border-4 border-white/20 overflow-hidden shadow-2xl bg-white">
                <img
                  src={user?.avatarUrl
                    ? (user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8080/api${user.avatarUrl}`)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Student')}&background=0D8ABC&color=fff&size=256`}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Student')}&background=0D8ABC&color=fff&size=256`;
                  }}
                />
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <i className="fas fa-crown text-white"></i>
              </div>
              <div className="absolute -bottom-2 -left-4 px-4 py-2 bg-white/90 backdrop-blur text-blue-600 font-bold rounded-xl shadow-lg text-sm whitespace-nowrap">
                Sinh viên năng động 🚀
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="fas fa-briefcase"
          label="Đơn ứng tuyển"
          value={stats.applications}
          color="blue"
          delay={100}
        />
        <StatCard
          icon="fas fa-file-alt"
          label="CV đã tạo"
          value={stats.cvs}
          color="purple"
          delay={200}
        />
        <StatCard
          icon="fas fa-trophy"
          label="Thách thức hoàn thành"
          value={stats.challenges}
          color="amber"
          delay={300}
        />
        <StatCard
          icon="fas fa-star"
          label="Điểm tích lũy"
          value="1,250"
          color="emerald"
          delay={400}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions & Recent Jobs */}
        <div className="lg:col-span-2 space-y-8">

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <i className="fas fa-bolt text-yellow-500"></i>
              Truy cập nhanh
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction to="/student/jobs" icon="fas fa-search" label="Tìm việc" color="blue" delay={0} />
              <QuickAction to="/student/cv-templates" icon="fas fa-file-invoice" label="Tạo CV" color="purple" delay={50} />
              <QuickAction to="/student/courses" icon="fas fa-graduation-cap" label="Học tập" color="emerald" delay={100} />
              <QuickAction to="/student/roadmap" icon="fas fa-route" label="Lộ trình" color="pink" delay={150} />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Việc làm mới nhất</h2>
              <Link to="/student/jobs" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Xem tất cả <i className="fas fa-arrow-right text-xs"></i>
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentJobs.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-briefcase text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">Chưa có việc làm nào phù hợp.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentJobs.map((job, index) => (
                  <Link
                    key={job.id}
                    to={`/student/jobs/${job.id}`}
                    className="flex items-center gap-4 p-4 rounded-xl border border-transparent hover:border-blue-100 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all duration-300 group"
                  >
                    <div className="w-16 h-16 rounded-xl bg-white p-2 shadow-sm border border-gray-100 flex items-center justify-center min-w-[4rem]">
                      {job.company?.logoUrl ? (
                        <img src={job.company.logoUrl} alt="" className="w-full h-full object-contain" />
                      ) : (
                        <i className="fas fa-building text-gray-300 text-2xl"></i>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-sm text-slate-500 truncate">{job.company?.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-map-marker-alt"></i> {job.location}
                        </span>
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <i className="fas fa-dollar-sign"></i> {formatCurrency(job.minSalary)}
                        </span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                      <i className="fas fa-chevron-right text-blue-500"></i>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Activity & Calendar */}
        <div className="space-y-8">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Trạng thái hồ sơ</h2>
            <div className="relative pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Hoàn thiện</span>
                <span className="text-sm font-bold text-blue-600">85%</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full w-[85%] animate-pulse"></div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-300">
                  <i className="fas fa-check-circle"></i>
                  <span>Thông tin cá nhân</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm text-green-700 dark:text-green-300">
                  <i className="fas fa-check-circle"></i>
                  <span>Kinh nghiệm & Kỹ năng</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm text-yellow-700 dark:text-yellow-300 cursor-pointer hover:bg-yellow-100 transition-colors">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>Chứng chỉ & Giải thưởng</span>
                  <i className="fas fa-arrow-right ml-auto text-xs"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-0 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
              <h2 className="text-xl font-bold mb-1">Gợi ý hôm nay</h2>
              <p className="text-purple-100 text-sm opacity-90">Dựa trên hồ sơ của bạn</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-fire text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Học ReactJS nâng cao</h4>
                    <p className="text-xs text-slate-500 mt-1">Khóa học đang hot tuần này</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-building text-xl"></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">VNG đang tuyển dụng</h4>
                    <p className="text-xs text-slate-500 mt-1">Phù hợp với kỹ năng của bạn</p>
                  </div>
                </div>
              </div>
              <button className="w-full mt-6 py-2.5 rounded-lg border border-purple-200 text-purple-600 font-semibold text-sm hover:bg-purple-50 transition-colors">
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
