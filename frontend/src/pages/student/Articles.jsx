import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ArticleCard from '../../components/ArticleCard';

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

      {/* Articles Feed (Facebook style) */}
      {articles.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="fas fa-newspaper text-gray-400 text-6xl mb-4"></i>
          <p className="text-gray-600 text-lg">Không tìm thấy bài viết nào</p>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto space-y-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onUpdate={() => loadArticles()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
