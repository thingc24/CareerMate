import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function ArticleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const data = await api.getArticle(id);
      setArticle(data);
    } catch (error) {
      console.error('Error loading article:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-12 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài viết</h2>
          <p className="text-gray-600 mb-6">Bài viết này không tồn tại hoặc đã bị xóa.</p>
          <Link to="/student/articles" className="btn-primary">
            <i className="fas fa-arrow-left mr-2"></i>
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/articles')}
        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
      >
        <i className="fas fa-arrow-left"></i>
        <span>Quay lại</span>
      </button>

      {/* Article Header */}
      <div className="card p-8 mb-6">
        <div className="mb-4">
          <span className="badge badge-info">
            {article.category}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>
            <i className="fas fa-calendar mr-2"></i>
            {formatDate(article.publishedAt || article.createdAt)}
          </span>
          {article.author && (
            <span>
              <i className="fas fa-user mr-2"></i>
              {article.author}
            </span>
          )}
        </div>
      </div>

      {/* Article Image */}
      {article.thumbnailUrl && (
        <div className="mb-6 rounded-lg overflow-hidden">
          <img
            src={article.thumbnailUrl.startsWith('http') 
              ? article.thumbnailUrl 
              : `http://localhost:8080/api${article.thumbnailUrl}`}
            alt={article.title}
            className="w-full h-96 object-cover"
          />
        </div>
      )}

      {/* Article Content */}
      <div className="card p-8">
        {article.content ? (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        ) : (
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {article.excerpt || 'Nội dung đang được cập nhật...'}
          </p>
        )}
      </div>

      {/* Related Articles */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bài viết liên quan</h2>
        <Link to="/student/articles" className="btn-secondary">
          <i className="fas fa-list mr-2"></i>
          Xem tất cả bài viết
        </Link>
      </div>
    </div>
  );
}
