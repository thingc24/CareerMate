import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function RecruiterDashboard() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    newApplications: 0,
    upcomingInterviews: 0,
    successfulHires: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsData = await api.getRecruiterDashboardStats();
      setStats(statsData);
      
      // Load recent jobs
      const jobsData = await api.getMyJobs(0, 5);
      setRecentJobs(jobsData.content || jobsData || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">Tổng quan hoạt động tuyển dụng</p>
        </div>
        <Link to="/recruiter/post-job" className="btn-primary">
          <i className="fas fa-plus mr-2"></i>
          Đăng tin tuyển dụng
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border-l-4 border-blue-500 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Tin đang tuyển</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.activeJobs}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <i className="fas fa-briefcase text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border-l-4 border-green-500 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Ứng viên mới</h3>
              <p className="text-3xl font-bold text-green-600">{stats.newApplications}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <i className="fas fa-user-plus text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border-l-4 border-purple-500 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Phỏng vấn sắp tới</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.upcomingInterviews}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <i className="fas fa-calendar-check text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border-l-4 border-orange-500 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Đã tuyển thành công</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.successfulHires}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <i className="fas fa-check-circle text-orange-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tin tuyển dụng gần đây</h2>
          <Link to="/recruiter/applicants" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
            Xem tất cả <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        </div>
        {recentJobs.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-briefcase text-gray-400 dark:text-gray-500 text-4xl mb-4"></i>
            <p className="text-gray-600 dark:text-gray-300">Chưa có tin tuyển dụng nào</p>
            <Link to="/recruiter/post-job" className="btn-primary mt-4 inline-block">
              Đăng tin đầu tiên
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{job.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                      <span><i className="fas fa-map-marker-alt mr-1"></i>{job.location || 'N/A'}</span>
                      <span><i className="fas fa-dollar-sign mr-1"></i>
                        {job.minSalary && job.maxSalary 
                          ? `${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()} VND`
                          : 'Thỏa thuận'}
                      </span>
                      <span className={`badge ${
                        job.status === 'ACTIVE' ? 'badge-success' :
                        job.status === 'PENDING' ? 'badge-warning' :
                        'badge-secondary'
                      }`}>
                        {job.status === 'ACTIVE' ? 'Đang tuyển' :
                         job.status === 'PENDING' ? 'Chờ duyệt' :
                         job.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{job.description}</p>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <Link
                      to={`/recruiter/applicants?jobId=${job.id}`}
                      className="btn-secondary text-sm"
                    >
                      <i className="fas fa-users mr-1"></i>
                      Xem ứng viên ({job.applicationsCount || 0})
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

