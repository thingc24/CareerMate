import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ArticleManagement() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('PENDING');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonAction, setReasonAction] = useState(null); // 'hide', 'delete'
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    loadArticles();
  }, [filterStatus, page]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = filterStatus === 'PENDING' 
        ? await api.getPendingArticles(page)
        : await api.getAllArticles(filterStatus, page);
      setArticles(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (articleId) => {
    if (!confirm('Bạn có chắc chắn muốn duyệt bài viết này?')) return;
    
    try {
      await api.approveArticle(articleId);
      alert('Bài viết đã được duyệt thành công!');
      loadArticles();
    } catch (error) {
      console.error('Error approving article:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể duyệt bài viết'));
    }
  };

  const handleReject = async (articleId) => {
    if (!confirm('Bạn có chắc chắn muốn từ chối bài viết này?')) return;
    
    try {
      await api.rejectArticle(articleId);
      alert('Bài viết đã bị từ chối!');
      loadArticles();
    } catch (error) {
      console.error('Error rejecting article:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể từ chối bài viết'));
    }
  };

  const handleHide = (articleId) => {
    setSelectedArticleId(articleId);
    setReasonAction('hide');
    setReason('');
    setShowReasonModal(true);
  };

  const handleUnhide = async (articleId) => {
    if (!confirm('Bạn có chắc chắn muốn hiện lại bài viết này?')) return;
    
    try {
      await api.unhideArticle(articleId);
      alert('Đã hiện lại bài viết thành công!');
      loadArticles();
    } catch (error) {
      console.error('Error unhiding article:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể hiện lại bài viết'));
    }
  };

  const handleDelete = (articleId) => {
    setSelectedArticleId(articleId);
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
        await api.hideArticle(selectedArticleId, reason);
        alert('Đã ẩn bài viết thành công!');
      } else if (reasonAction === 'delete') {
        if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN bài viết này? Hành động này không thể hoàn tác!')) {
          setShowReasonModal(false);
          return;
        }
        await api.deleteArticle(selectedArticleId, reason);
        alert('Đã xóa bài viết thành công!');
      }
      setShowReasonModal(false);
      setReason('');
      setSelectedArticleId(null);
      setReasonAction(null);
      loadArticles();
    } catch (error) {
      console.error('Error performing action:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể thực hiện thao tác'));
    }
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

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'badge-warning',
      PUBLISHED: 'badge-success',
      REJECTED: 'badge-danger',
      DRAFT: 'badge-secondary'
    };
    return badges[status] || 'badge-secondary';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Chờ duyệt',
      PUBLISHED: 'Đã xuất bản',
      REJECTED: 'Đã từ chối',
      DRAFT: 'Bản nháp'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
        </div>
        <button
          onClick={() => navigate('/admin/articles/create')}
          className="btn-primary dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          <i className="fas fa-plus mr-2"></i>
          Đăng bài viết
        </button>
      </div>

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
            <option value="PENDING">Chờ duyệt</option>
            <option value="PUBLISHED">Đã xuất bản</option>
            <option value="REJECTED">Đã từ chối</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="">Tất cả</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      {articles.length === 0 ? (
        <div className="card p-12 text-center dark:bg-gray-900 dark:border-gray-800">
          <i className="fas fa-newspaper text-gray-400 dark:text-gray-500 text-6xl mb-4"></i>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Không có bài viết nào</p>
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
                    Tác giả
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
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {article.thumbnailUrl && (
                          <img
                            src={article.thumbnailUrl.startsWith('http') 
                              ? article.thumbnailUrl 
                              : `http://localhost:8080/api${article.thumbnailUrl}`}
                            alt={article.title}
                            className="w-16 h-16 object-cover rounded-lg mr-4 dark:border-gray-700"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                            {article.title}
                          </div>
                          {article.excerpt && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                              {article.excerpt}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {article.author?.fullName || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {article.author?.role || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusBadge(article.status)} dark:bg-yellow-800 dark:text-yellow-100 dark:bg-green-800 dark:text-green-100 dark:bg-red-800 dark:text-red-100 dark:bg-gray-800 dark:text-gray-100`}>
                        {getStatusLabel(article.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(article.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/student/articles/${article.id}`)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {article.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(article.id)}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                              title="Duyệt"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              onClick={() => handleReject(article.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                              title="Từ chối"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        )}
                        {article.hidden ? (
                          <button
                            onClick={() => handleUnhide(article.id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 ml-2"
                            title="Hiện lại"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleHide(article.id)}
                            className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300 ml-2"
                            title="Ẩn"
                          >
                            <i className="fas fa-eye-slash"></i>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(article.id)}
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
              {reasonAction === 'hide' ? 'Ẩn bài viết' : 'Xóa bài viết'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {reasonAction === 'hide' 
                ? 'Vui lòng nhập lý do ẩn bài viết này. Lý do sẽ được gửi đến tác giả.'
                : 'Vui lòng nhập lý do xóa bài viết này. Lý do sẽ được gửi đến tác giả.'}
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
                  setSelectedArticleId(null);
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
