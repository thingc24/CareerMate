import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function StudentDashboard() {
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

  const StatCard = ({ icon, label, value, gradient, delay = 0 }) => (
    <div 
      className="card card-hover p-6 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`h-14 w-14 rounded-xl ${gradient} flex items-center justify-center shadow-lg`}>
          <i className={`${icon} text-white text-xl`}></i>
        </div>
        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
      </div>
      <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
      <p className="text-4xl font-bold gradient-text">{value}</p>
    </div>
  );

  const QuickActionCard = ({ to, icon, label, gradient, delay = 0 }) => (
    <Link
      to={to}
      className="card card-hover p-6 text-center group animate-scale-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`inline-flex h-16 w-16 rounded-2xl ${gradient} items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
        <i className={`${icon} text-white text-2xl`}></i>
      </div>
      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{label}</p>
    </Link>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Chào mừng trở lại! 👋
        </h1>
        <p className="text-lg text-gray-600">
          Quản lý sự nghiệp của bạn một cách thông minh
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon="fas fa-briefcase"
          label="Đơn ứng tuyển"
          value={stats.applications}
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          delay={0}
        />
        <StatCard
          icon="fas fa-file-pdf"
          label="CV đã tải"
          value={stats.cvs}
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          delay={100}
        />
        <StatCard
          icon="fas fa-trophy"
          label="Thách thức hoàn thành"
          value={stats.challenges}
          gradient="bg-gradient-to-br from-purple-500 to-pink-600"
          delay={200}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionCard
            to="/student/jobs"
            icon="fas fa-search"
            label="Tìm việc làm"
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
            delay={0}
          />
          <QuickActionCard
            to="/student/cv"
            icon="fas fa-file-upload"
            label="Tải CV"
            gradient="bg-gradient-to-br from-green-500 to-teal-600"
            delay={50}
          />
          <QuickActionCard
            to="/student/roadmap"
            icon="fas fa-route"
            label="Lộ trình"
            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
            delay={150}
          />
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Việc làm gợi ý</h2>
            <p className="text-gray-600 mt-1">Các cơ hội việc làm phù hợp với bạn</p>
          </div>
          <Link 
            to="/student/jobs" 
            className="btn-secondary flex items-center gap-2"
          >
            Xem tất cả
            <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
          </div>
        ) : recentJobs.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex h-20 w-20 rounded-full bg-gray-100 items-center justify-center mb-4">
              <i className="fas fa-briefcase text-gray-400 text-3xl"></i>
            </div>
            <p className="text-gray-600 font-medium">Chưa có việc làm nào</p>
            <Link to="/student/jobs" className="text-blue-600 hover:text-blue-700 font-medium mt-2 inline-block">
              Khám phá việc làm ngay →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentJobs.map((job, index) => (
              <Link
                key={job.id}
                to={`/student/jobs/${job.id}`}
                className="card card-hover p-5 group animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{job.company?.name || 'Công ty'}</p>
                  </div>
                  <span className="badge badge-success ml-2 flex-shrink-0">
                    {job.status === 'ACTIVE' ? 'Đang tuyển' : 'Đã đóng'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-map-marker-alt text-gray-400 mr-2 w-4"></i>
                    <span className="truncate">{job.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <i className="fas fa-dollar-sign text-gray-400 mr-2 w-4"></i>
                    <span>{formatCurrency(job.minSalary, job.currency)}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    <i className="far fa-clock mr-1"></i>
                    {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                  <span className="text-blue-600 text-sm font-medium group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Xem chi tiết
                    <i className="fas fa-arrow-right text-xs"></i>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
