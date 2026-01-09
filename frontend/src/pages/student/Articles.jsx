import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadArticles();
  }, [selectedCategory, searchKeyword]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await api.getArticles(searchKeyword, selectedCategory);
      setArticles(data.content || data || []);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: 'Tất cả' },
    { value: 'CAREER', label: 'Nghề nghiệp' },
    { value: 'SKILLS', label: 'Kỹ năng' },
    { value: 'INTERVIEW', label: 'Phỏng vấn' },
    { value: 'CV', label: 'CV & Resume' },
    { value: 'JOB_SEARCH', label: 'Tìm việc' },
  ];

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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bài viết</h1>
        <p className="text-lg text-gray-600">Kiến thức và kinh nghiệm nghề nghiệp</p>
      </div>

      {/* Search and Filter */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="fas fa-newspaper text-gray-400 text-6xl mb-4"></i>
          <p className="text-gray-600 text-lg">Không tìm thấy bài viết nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              to={`/student/articles/${article.id}`}
              className="card p-6 hover:shadow-lg transition-all duration-300 group"
            >
              {article.thumbnailUrl && (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img
                    src={article.thumbnailUrl.startsWith('http') 
                      ? article.thumbnailUrl 
                      : `http://localhost:8080/api${article.thumbnailUrl}`}
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="mb-2">
                <span className="badge badge-info text-xs">
                  {categories.find(c => c.value === article.category)?.label || article.category}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {article.excerpt || article.summary || (article.content ? article.content.substring(0, 150) + '...' : '')}
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatDate(article.publishedAt || article.createdAt)}</span>
                <span className="group-hover:text-blue-600 transition-colors">
                  Đọc thêm <i className="fas fa-arrow-right ml-1"></i>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
