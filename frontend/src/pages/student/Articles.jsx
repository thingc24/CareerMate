import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ArticleCard from '../../components/ArticleCard';

export default function Articles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const debounceTimerRef = useRef(null);
  const containerRef = useRef(null);

  // Debounce search keyword
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 500); // 500ms debounce
    
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchKeyword]);

  useEffect(() => {
    const scrollPosition = window.scrollY;
    loadArticles().then(() => {
      // Restore scroll position after loading
      window.scrollTo(0, scrollPosition);
    });
  }, [selectedCategory, debouncedKeyword]);

  const loadArticles = async () => {
    try {
      setLoading(true);
      const data = await api.getArticles(debouncedKeyword, selectedCategory);
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
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Enhanced Search and Filter */}
      <div className="card p-6 mb-8 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung, tên nhà tuyển dụng..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="input-field flex-1 pl-12 pr-4 py-3 bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <div className="md:w-64">
            <div className="relative">
              <i className="fas fa-filter absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field w-full pl-12 pr-4 py-3 bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Feed (Facebook style) */}
      {articles.length === 0 ? (
        <div className="card p-16 text-center shadow-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
            <i className="fas fa-newspaper text-blue-500 text-5xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài viết nào</h3>
          <p className="text-gray-600">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
        </div>
      ) : (
        <div ref={containerRef} className="max-w-2xl mx-auto space-y-4">
          {articles.map((article, index) => (
            <div
              key={article.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <ArticleCard
                article={article}
                onUpdate={async () => {
                  const scrollPosition = window.scrollY;
                  await loadArticles();
                  window.scrollTo(0, scrollPosition);
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
