import { useState, useEffect, useRef } from 'react';
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
    const scrollPosition = window.scrollY;
    loadArticles().then(() => {
      // Restore scroll position after loading
      window.scrollTo(0, scrollPosition);
    });
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
      DRAFT: { label: 'Bản nháp', class: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300' },
      PENDING: { label: 'Chờ duyệt', class: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-300' },
      PUBLISHED: { label: 'Đã xuất bản', class: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300' },
      REJECTED: { label: 'Đã từ chối', class: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border border-red-300' },
    };
    const statusInfo = statusMap[status] || { label: status, class: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300' };
    return (
      <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${statusInfo.class}`}>
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
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
          <p className="mt-4 text-slate-600 dark:text-gray-300 font-medium">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 p-6 rounded-xl border-2 border-emerald-200 dark:border-gray-700 shadow-lg">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
              <i className="fas fa-newspaper text-xl"></i>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                Tổng cộng: <span className="text-emerald-600 dark:text-emerald-400">{totalElements}</span> bài viết
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Quản lý và theo dõi bài viết của bạn
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate('/recruiter/articles/create')}
          className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-semibold flex items-center gap-2"
        >
          <i className="fas fa-plus"></i>
          <span>Đăng bài viết mới</span>
        </button>
      </div>

      {/* Enhanced Filter */}
      <div className="card p-5 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-blue-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <i className="fas fa-filter text-blue-600 dark:text-blue-400"></i>
            <label className="text-sm font-bold text-gray-900 dark:text-white">Lọc theo:</label>
          </div>
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="px-5 py-3 border-2 border-blue-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-900 font-medium shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <option value="all">Tất cả</option>
            <option value="my">Bài viết của tôi</option>
            <option value="admin">Bài viết của admin</option>
          </select>
        </div>
      </div>

      {/* Articles List */}
      {articles.length === 0 ? (
        <div className="card p-16 text-center shadow-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 mb-6">
            <i className="fas fa-newspaper text-emerald-500 text-5xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {filter === 'my' && 'Chưa có bài viết nào'}
            {filter === 'admin' && 'Chưa có bài viết của admin'}
            {filter === 'all' && 'Chưa có bài viết nào'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
            {filter === 'my' && 'Bắt đầu chia sẻ kiến thức và kinh nghiệm của bạn với cộng đồng!'}
            {filter === 'admin' && 'Hiện tại chưa có bài viết nào từ admin.'}
            {filter === 'all' && 'Chưa có bài viết nào được đăng trên hệ thống.'}
          </p>
          {filter === 'my' && (
            <button
              onClick={() => navigate('/recruiter/articles/create')}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-semibold"
            >
              <i className="fas fa-plus mr-2"></i>
              Đăng bài viết đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {articles.map((article, index) => (
            <div 
              key={article.id} 
              className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900 rounded-xl shadow-lg p-6 border-2 border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-1 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Article Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    {getStatusBadge(article.status)}
                    {article.category && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200 shadow-sm">
                        {article.category.replace('_', ' ')}
                      </span>
                    )}
                    {article.author && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 shadow-sm">
                        {article.author.role === 'ADMIN' ? 'Admin' : 'Nhà tuyển dụng'}
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300 flex-wrap">
                    <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                      <i className="fas fa-calendar text-emerald-600"></i>
                      {formatDate(article.createdAt)}
                    </span>
                    {article.publishedAt && (
                      <span className="flex items-center gap-1 bg-green-100 px-3 py-1.5 rounded-full text-green-700">
                        <i className="fas fa-check-circle"></i>
                        Xuất bản: {formatDate(article.publishedAt)}
                      </span>
                    )}
                    <span className="flex items-center gap-1 bg-blue-100 px-3 py-1.5 rounded-full text-blue-700">
                      <i className="fas fa-eye"></i>
                      {article.viewsCount || 0} lượt xem
                    </span>
                    <span className="flex items-center gap-1 bg-purple-100 px-3 py-1.5 rounded-full text-purple-700">
                      <i className="fas fa-comments"></i>
                      {article.commentsCount || 0} bình luận
                    </span>
                  </div>
                </div>
              </div>

              {/* Article Actions */}
              <div className="flex items-center gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => navigate(`/articles/${article.id}`)}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-semibold text-sm flex items-center gap-2"
                >
                  <i className="fas fa-eye"></i>
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
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-semibold text-sm flex items-center gap-2"
                  >
                    <i className="fas fa-comments"></i>
                    Xem bình luận
                  </button>
                )}
              </div>

              {/* Article Card with Comments (for published articles) */}
              {article.status === 'PUBLISHED' && (
                <div id={`article-${article.id}`} className="mt-4 pt-4 border-t-2 border-gray-200">
                  <ArticleCard 
                    article={article} 
                    onUpdate={async () => {
                      const scrollPosition = window.scrollY;
                      await loadArticles();
                      window.scrollTo(0, scrollPosition);
                    }}
                    showFullComments={true}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-semibold text-gray-700 hover:text-emerald-600"
          >
            <i className="fas fa-chevron-left"></i>
            <span>Trước</span>
          </button>
          <div className="flex items-center gap-2">
            {[...Array(totalPages)].slice(Math.max(0, page - 2), Math.min(totalPages, page + 3)).map((_, i) => {
              const pageNum = Math.max(0, page - 2) + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-5 py-2.5 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-semibold text-gray-700 hover:text-emerald-600"
          >
            <span>Sau</span>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}
