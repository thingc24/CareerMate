import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function JobManagement() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState(searchParams.get('status') || '');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadJobs();
  }, [filterStatus, page]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminJobs(filterStatus || null, page, 10);
      setJobs(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    if (!confirm('Bạn có chắc chắn muốn duyệt tin tuyển dụng này?')) return;
    
    try {
      await api.approveJob(jobId);
      alert('Duyệt tin tuyển dụng thành công!');
      loadJobs();
    } catch (error) {
      console.error('Error approving job:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể duyệt tin tuyển dụng'));
    }
  };

  const handleReject = async (jobId) => {
    if (!confirm('Bạn có chắc chắn muốn từ chối tin tuyển dụng này?')) return;
    
    try {
      await api.rejectJob(jobId);
      alert('Từ chối tin tuyển dụng thành công!');
      loadJobs();
    } catch (error) {
      console.error('Error rejecting job:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể từ chối tin tuyển dụng'));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      CLOSED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      DRAFT: 'Bản nháp',
      PENDING: 'Chờ duyệt',
      ACTIVE: 'Đang hoạt động',
      CLOSED: 'Đã đóng',
      REJECTED: 'Đã từ chối'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải tin tuyển dụng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Quản lý tin tuyển dụng</h1>
        <p className="text-lg text-gray-600">Duyệt và quản lý tất cả tin tuyển dụng</p>
      </div>

      {/* Filter */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Lọc theo trạng thái:</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
            className="input-field"
          >
            <option value="">Tất cả</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="CLOSED">Đã đóng</option>
            <option value="REJECTED">Đã từ chối</option>
            <option value="DRAFT">Bản nháp</option>
          </select>
          <div className="ml-auto text-sm text-gray-600">
            Tổng: {totalElements} tin tuyển dụng
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      {jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="fas fa-briefcase text-gray-400 text-6xl mb-4"></i>
          <p className="text-gray-600 text-lg">Không có tin tuyển dụng nào</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Công ty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Địa điểm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      {job.description && (
                        <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                          {job.description.substring(0, 100)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.company?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{job.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(job.status)}`}>
                        {getStatusLabel(job.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/student/jobs/${job.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {job.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(job.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Duyệt"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              onClick={() => handleReject(job.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Từ chối"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Trang {page + 1} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
