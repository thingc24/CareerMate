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
      const jobs = await api.getJobs(0, 6);
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

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <i className="fas fa-briefcase text-blue-600 text-xl"></i>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Đơn ứng tuyển</p>
          <p className="text-3xl font-bold text-gray-900">{stats.applications}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <i className="fas fa-file-pdf text-green-600 text-xl"></i>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">CV đã tải</p>
          <p className="text-3xl font-bold text-gray-900">{stats.cvs}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <i className="fas fa-trophy text-purple-600 text-xl"></i>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-1">Thách thức hoàn thành</p>
          <p className="text-3xl font-bold text-gray-900">{stats.challenges}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Link
          to="/student/jobs"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition"
        >
          <i className="fas fa-search text-3xl text-blue-500 mb-3"></i>
          <p className="font-semibold text-gray-900">Tìm việc làm</p>
        </Link>
        <Link
          to="/student/cv"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition"
        >
          <i className="fas fa-file-upload text-3xl text-green-500 mb-3"></i>
          <p className="font-semibold text-gray-900">Tải CV</p>
        </Link>
        <Link
          to="/student/applications"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition"
        >
          <i className="fas fa-clipboard-list text-3xl text-purple-500 mb-3"></i>
          <p className="font-semibold text-gray-900">Đơn ứng tuyển</p>
        </Link>
        <Link
          to="/student/profile"
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition"
        >
          <i className="fas fa-user text-3xl text-orange-500 mb-3"></i>
          <p className="font-semibold text-gray-900">Hồ sơ</p>
        </Link>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Việc làm gợi ý</h2>
          <Link to="/student/jobs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Xem tất cả →
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : recentJobs.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Chưa có việc làm nào</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentJobs.map((job) => (
              <Link
                key={job.id}
                to={`/student/jobs/${job.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{job.company?.name || 'Công ty'}</p>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span><i className="fas fa-map-marker-alt mr-1"></i>{job.location}</span>
                  <span><i className="fas fa-dollar-sign mr-1"></i>
                    {formatCurrency(job.minSalary, job.currency)}
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
