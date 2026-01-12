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
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quản lý bài viết</h1>
          <p className="text-lg text-gray-600">Duyệt và quản lý bài viết từ nhà tuyển dụng</p>
        </div>
        <button
          onClick={() => navigate('/admin/articles/create')}
          className="btn-primary"
        >
          <i className="fas fa-plus mr-2"></i>
          Đăng bài viết
        </button>
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
        <div className="card p-12 text-center">
          <i className="fas fa-newspaper text-gray-400 text-6xl mb-4"></i>
          <p className="text-gray-600 text-lg">Không có bài viết nào</p>
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
                    Tác giả
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
                {articles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {article.thumbnailUrl && (
                          <img
                            src={article.thumbnailUrl.startsWith('http') 
                              ? article.thumbnailUrl 
                              : `http://localhost:8080/api${article.thumbnailUrl}`}
                            alt={article.title}
                            className="w-16 h-16 object-cover rounded-lg mr-4"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {article.title}
                          </div>
                          {article.excerpt && (
                            <div className="text-xs text-gray-500 line-clamp-1 mt-1">
                              {article.excerpt}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {article.author?.fullName || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {article.author?.role || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusBadge(article.status)}`}>
                        {getStatusLabel(article.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(article.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/student/articles/${article.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {article.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApprove(article.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Duyệt"
                            >
                              <i className="fas fa-check"></i>
                            </button>
                            <button
                              onClick={() => handleReject(article.id)}
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
