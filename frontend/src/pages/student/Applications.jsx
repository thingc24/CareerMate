import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
  });

  useEffect(() => {
    loadApplications();
  }, [page]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getApplications(page, 10);
      setApplications(data.content || data || []);
      setTotalPages(data.totalPages || 0);
      
      // Calculate stats
      const all = data.content || data || [];
      setStats({
        total: data.totalElements || all.length,
        pending: all.filter(a => a.status === 'PENDING').length,
        accepted: all.filter(a => a.status === 'ACCEPTED').length,
        rejected: all.filter(a => a.status === 'REJECTED').length,
      });
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDING: { label: 'Đang chờ', class: 'badge-warning' },
      ACCEPTED: { label: 'Đã chấp nhận', class: 'badge-success' },
      REJECTED: { label: 'Đã từ chối', class: 'bg-red-100 text-red-700' },
      WITHDRAWN: { label: 'Đã hủy', class: 'bg-gray-100 text-gray-700' },
    };
    const statusInfo = statusMap[status] || { label: status, class: 'badge-info' };
    return (
      <span className={`badge ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const StatCard = ({ icon, label, value, gradient, delay = 0 }) => (
    <div 
      className="card card-hover p-6 animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`h-12 w-12 rounded-xl ${gradient} flex items-center justify-center shadow-lg`}>
          <i className={`${icon} text-white text-xl`}></i>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">{label}</p>
      <p className="text-3xl font-bold gradient-text dark:text-white">{value}</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon="fas fa-briefcase"
          label="Tổng đơn"
          value={stats.total}
          gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          delay={0}
        />
        <StatCard
          icon="fas fa-clock"
          label="Đang chờ"
          value={stats.pending}
          gradient="bg-gradient-to-br from-yellow-500 to-orange-600"
          delay={100}
        />
        <StatCard
          icon="fas fa-check-circle"
          label="Đã chấp nhận"
          value={stats.accepted}
          gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          delay={200}
        />
        <StatCard
          icon="fas fa-times-circle"
          label="Đã từ chối"
          value={stats.rejected}
          gradient="bg-gradient-to-br from-red-500 to-pink-600"
          delay={300}
        />
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-6 w-1/3 mb-4"></div>
              <div className="skeleton h-4 w-1/4 mb-2"></div>
              <div className="skeleton h-4 w-1/2"></div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="inline-flex h-24 w-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 items-center justify-center mb-6">
            <i className="fas fa-briefcase text-blue-500 text-4xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa có đơn ứng tuyển nào</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Bắt đầu tìm việc và ứng tuyển ngay hôm nay!</p>
          <Link to="/student/jobs" className="btn-primary inline-flex items-center">
            <i className="fas fa-search mr-2"></i>
            Tìm việc làm
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application, index) => (
            <div
              key={application.id}
              className="card card-hover p-6 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <Link
                        to={`/student/jobs/${application.job?.id || application.jobId}`}
                        className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2 block"
                      >
                        {application.job?.title || 'Việc làm'}
                      </Link>
                      <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
                        {application.job?.company?.name || 'Công ty'}
                      </p>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
                    <span className="flex items-center">
                      <i className="fas fa-calendar text-gray-400 dark:text-gray-500 mr-2"></i>
                      Ứng tuyển: {formatDate(application.appliedAt)}
                    </span>
                    {application.job?.location && (
                      <span className="flex items-center">
                        <i className="fas fa-map-marker-alt text-gray-400 dark:text-gray-500 mr-2"></i>
                        {application.job.location}
                      </span>
                    )}
                    {application.cv && (
                      <span className="flex items-center">
                        <i className="fas fa-file-pdf text-gray-400 dark:text-gray-500 mr-2"></i>
                        CV đã sử dụng
                      </span>
                    )}
                  </div>

                  {application.coverLetter && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thư xin việc:</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{application.coverLetter}</p>
                    </div>
                  )}

                  {application.note && (
                    <div className={`rounded-lg p-4 ${
                      application.status === 'ACCEPTED' 
                        ? 'bg-green-50 border border-green-200' 
                        : application.status === 'REJECTED'
                        ? 'bg-red-50 border border-red-200'
                        : 'bg-gray-50 border border-gray-200'
                    }`}>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {application.status === 'ACCEPTED' ? 'Phản hồi từ nhà tuyển dụng:' : 'Ghi chú:'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{application.note}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex lg:flex-col items-center lg:items-end gap-3">
                  <Link
                    to={`/student/jobs/${application.job?.id || application.jobId}`}
                    className="btn-secondary whitespace-nowrap"
                  >
                    <i className="fas fa-eye mr-2"></i>
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 bg-white dark:bg-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            <i className="fas fa-chevron-left mr-2"></i>
            Trước
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'bg-white dark:bg-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 bg-white dark:bg-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
          >
            Sau
            <i className="fas fa-chevron-right ml-2"></i>
          </button>
        </div>
      )}
    </div>
  );
}
