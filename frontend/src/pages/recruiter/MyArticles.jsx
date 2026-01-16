import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import ArticleCard from '../../components/ArticleCard';

export default function MyArticles() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'my', 'admin'

  useEffect(() => {
    loadArticles();
  }, [page, filter]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      let data;
      
      if (filter === 'my') {
        // Lấy bài viết của tôi
        data = await api.getMyArticles(page, 10);
        setArticles(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else {
        // Lấy tất cả bài viết (cho filter 'all' và 'admin')
        data = await api.getArticles('', '', page, 20); // Lấy nhiều hơn để có đủ dữ liệu filter
        
        if (filter === 'admin') {
          // Filter chỉ bài viết của admin
          const adminArticles = (data.content || []).filter(
            article => article.author && article.author.role === 'ADMIN'
          );
          setArticles(adminArticles);
          
          // Để tính pagination chính xác, cần lấy tổng số admin articles
          // Tạm thời dùng ước lượng dựa trên số lượng hiện tại
          setTotalElements(adminArticles.length * data.totalPages); // Ước lượng
          setTotalPages(Math.ceil((adminArticles.length * data.totalPages) / 10));
        } else {
          // Filter 'all' - hiển thị tất cả
          setArticles(data.content || []);
          setTotalPages(data.totalPages || 0);
          setTotalElements(data.totalElements || 0);
        }
      }
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(0); // Reset về trang đầu khi đổi filter
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      DRAFT: { label: 'Bản nháp', class: 'bg-gray-100 text-gray-700' },
      PENDING: { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-700' },
      PUBLISHED: { label: 'Đã xuất bản', class: 'bg-green-100 text-green-700' },
      REJECTED: { label: 'Đã từ chối', class: 'bg-red-100 text-red-700' },
    };
    const statusInfo = statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">Bài viết</h1>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600">
            Tổng cộng: {totalElements} bài viết
          </p>
        </div>
        <button
          onClick={() => navigate('/recruiter/articles/create')}
          className="btn-primary flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          <span>Đăng bài viết mới</span>
        </button>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-slate-700">Lọc theo:</label>
        <select
          value={filter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="all">Tất cả</option>
          <option value="my">Bài viết của tôi</option>
          <option value="admin">Bài viết của admin</option>
        </select>
      </div>

      {/* Articles List */}
      {articles.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="fas fa-newspaper text-6xl text-slate-300 mb-4"></i>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            {filter === 'my' && 'Chưa có bài viết nào'}
            {filter === 'admin' && 'Chưa có bài viết của admin'}
            {filter === 'all' && 'Chưa có bài viết nào'}
          </h2>
          <p className="text-slate-600 mb-6">
            {filter === 'my' && 'Bắt đầu chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng!'}
            {filter === 'admin' && 'Hiện tại chưa có bài viết nào từ admin.'}
            {filter === 'all' && 'Chưa có bài viết nào được đăng trên hệ thống.'}
          </p>
          {filter === 'my' && (
            <button
              onClick={() => navigate('/recruiter/articles/create')}
              className="btn-primary"
            >
              <i className="fas fa-plus mr-2"></i>
              Đăng bài viết đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((article) => (
            <div key={article.id} className="card p-6">
              {/* Article Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(article.status)}
                    {article.category && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {article.category}
                      </span>
                    )}
                    {article.author && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        {article.author.role === 'ADMIN' ? 'Admin' : 'Nhà tuyển dụng'}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>
                      <i className="fas fa-calendar mr-1"></i>
                      {formatDate(article.createdAt)}
                    </span>
                    {article.publishedAt && (
                      <span>
                        <i className="fas fa-check-circle mr-1"></i>
                        Xuất bản: {formatDate(article.publishedAt)}
                      </span>
                    )}
                    <span>
                      <i className="fas fa-eye mr-1"></i>
                      {article.viewsCount || 0} lượt xem
                    </span>
                    <span>
                      <i className="fas fa-comments mr-1"></i>
                      {article.commentsCount || 0} bình luận
                    </span>
                  </div>
                </div>
              </div>

              {/* Article Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                <button
                  onClick={() => navigate(`/articles/${article.id}`)}
                  className="btn-secondary text-sm"
                >
                  <i className="fas fa-eye mr-2"></i>
                  Xem chi tiết
                </button>
                {article.status === 'PUBLISHED' && (
                  <button
                    onClick={() => {
                      // Scroll to comments section
                      const element = document.getElementById(`article-${article.id}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="btn-secondary text-sm"
                  >
                    <i className="fas fa-comments mr-2"></i>
                    Xem bình luận
                  </button>
                )}
              </div>

              {/* Article Card with Comments (for published articles) */}
              {article.status === 'PUBLISHED' && (
                <div id={`article-${article.id}`} className="mt-4 pt-4 border-t border-slate-200">
                  <ArticleCard 
                    article={article} 
                    onUpdate={loadArticles}
                    showFullComments={true}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="px-4 py-2 text-slate-700">
            Trang {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}
