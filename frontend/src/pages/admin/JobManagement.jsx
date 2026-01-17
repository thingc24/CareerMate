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
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonAction, setReasonAction] = useState(null); // 'hide', 'delete'
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [reason, setReason] = useState('');

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

  const handleHide = (jobId) => {
    setSelectedJobId(jobId);
    setReasonAction('hide');
    setReason('');
    setShowReasonModal(true);
  };

  const handleUnhide = async (jobId) => {
    if (!confirm('Bạn có chắc chắn muốn hiện lại tin tuyển dụng này?')) return;
    
    try {
      await api.unhideJob(jobId);
      alert('Đã hiện lại tin tuyển dụng thành công!');
      loadJobs();
    } catch (error) {
      console.error('Error unhiding job:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể hiện lại tin tuyển dụng'));
    }
  };

  const handleDelete = (jobId) => {
    setSelectedJobId(jobId);
    setReasonAction('delete');
    setReason('');
    setShowReasonModal(true);
  };

  const handleConfirmAction = async () => {
    if (!reason.trim()) {
      alert('Vui lòng nhập lý do!');
      return;
    }

    try {
      if (reasonAction === 'hide') {
        await api.hideJob(selectedJobId, reason);
        alert('Đã ẩn tin tuyển dụng thành công!');
      } else if (reasonAction === 'delete') {
        if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN tin tuyển dụng này? Hành động này không thể hoàn tác!')) {
          setShowReasonModal(false);
          return;
        }
        await api.deleteJob(selectedJobId, reason);
        alert('Đã xóa tin tuyển dụng thành công!');
      }
      setShowReasonModal(false);
      setReason('');
      setSelectedJobId(null);
      setReasonAction(null);
      loadJobs();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể thực hiện thao tác'));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      CLOSED: 'bg-blue-100 text-blue-800',
      REJECTED: 'bg-red-100 text-red-800',
      HIDDEN: 'bg-gray-800 text-gray-100'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      DRAFT: 'Bản nháp',
      PENDING: 'Chờ duyệt',
      ACTIVE: 'Đang hoạt động',
      CLOSED: 'Đã đóng',
      REJECTED: 'Đã từ chối',
      HIDDEN: 'Đã ẩn'
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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Đang tải tin tuyển dụng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Filter */}
      <div className="card p-6 mb-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lọc theo trạng thái:</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
            className="input-field dark:bg-gray-800 dark:text-white dark:border-gray-700"
          >
            <option value="">Tất cả</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="CLOSED">Đã đóng</option>
            <option value="REJECTED">Đã từ chối</option>
            <option value="HIDDEN">Đã ẩn</option>
            <option value="DRAFT">Bản nháp</option>
          </select>
          <div className="ml-auto text-sm text-gray-600 dark:text-gray-300">
            Tổng: {totalElements} tin tuyển dụng
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      {jobs.length === 0 ? (
        <div className="card p-12 text-center dark:bg-gray-900 dark:border-gray-800">
          <i className="fas fa-briefcase text-gray-400 dark:text-gray-500 text-6xl mb-4"></i>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Không có tin tuyển dụng nào</p>
        </div>
      ) : (
        <div className="card overflow-hidden dark:bg-gray-900 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Công ty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Địa điểm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{job.title}</div>
                      {job.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                          {job.description.substring(0, 100)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{job.company?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{job.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(job.status)} dark:bg-gray-800 dark:text-gray-100 dark:bg-yellow-800 dark:text-yellow-100 dark:bg-green-800 dark:text-green-100 dark:bg-blue-800 dark:text-blue-100 dark:bg-red-800 dark:text-red-100`}>
                        {getStatusLabel(job.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/student/jobs/${job.id}`)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {job.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(job.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                              title="Duyệt"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              onClick={() => handleReject(job.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              title="Từ chối"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        )}
                        {job.hidden ? (
                          <button
                            onClick={() => handleUnhide(job.id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 ml-2"
                            title="Hiện lại"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleHide(job.id)}
                            className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 ml-2"
                            title="Ẩn"
                          >
                            <i className="fas fa-eye-slash"></i>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 ml-2"
                          title="Xóa vĩnh viễn"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Trang {page + 1} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn-secondary dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-secondary dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 w-full max-w-md dark:border dark:border-gray-800">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {reasonAction === 'hide' ? 'Ẩn tin tuyển dụng' : 'Xóa tin tuyển dụng'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {reasonAction === 'hide' 
                ? 'Vui lòng nhập lý do ẩn tin tuyển dụng này. Lý do sẽ được gửi đến nhà tuyển dụng.'
                : 'Vui lòng nhập lý do xóa tin tuyển dụng này. Lý do sẽ được gửi đến nhà tuyển dụng.'}
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              rows="4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setReason('');
                  setSelectedJobId(null);
                  setReasonAction(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-lg text-white ${
                  reasonAction === 'delete' 
                    ? 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800'
                    : 'bg-orange-600 dark:bg-orange-700 hover:bg-orange-700 dark:hover:bg-orange-800'
                }`}
              >
                {reasonAction === 'hide' ? 'Ẩn' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
