import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function CVTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory, showFreeOnly]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      let data;
      if (showFreeOnly) {
        data = await api.getFreeCVTemplates();
      } else {
        data = await api.getCVTemplates(selectedCategory);
      }
      setTemplates(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: 'Tất cả' },
    { value: 'MODERN', label: 'Hiện đại' },
    { value: 'CLASSIC', label: 'Cổ điển' },
    { value: 'CREATIVE', label: 'Sáng tạo' },
    { value: 'MINIMALIST', label: 'Tối giản' },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải mẫu CV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Mẫu CV</h1>
        <p className="text-lg text-gray-600">Chọn mẫu CV phù hợp và tạo CV của bạn</p>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
              disabled={showFreeOnly}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showFreeOnly}
              onChange={(e) => setShowFreeOnly(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded"
            />
            <span className="text-gray-700">Chỉ hiển thị mẫu miễn phí</span>
          </label>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="fas fa-file-alt text-gray-400 text-6xl mb-4"></i>
          <p className="text-gray-600 text-lg">Không tìm thấy mẫu CV nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="card p-6 hover:shadow-lg transition-all duration-300 group"
            >
              {template.previewImageUrl && (
                <div className="mb-4 overflow-hidden rounded-lg bg-gray-100">
                  <img
                    src={template.previewImageUrl.startsWith('http') 
                      ? template.previewImageUrl 
                      : `http://localhost:8080/api${template.previewImageUrl}`}
                    alt={template.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="mb-2 flex items-center justify-between">
                <span className="badge badge-info text-xs">
                  {categories.find(c => c.value === template.category)?.label || template.category}
                </span>
                {template.isPremium ? (
                  <span className="badge badge-warning text-xs">Premium</span>
                ) : (
                  <span className="badge badge-success text-xs">Miễn phí</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {template.name}
              </h3>
              {template.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {template.description}
                </p>
              )}
              <Link
                to={`/student/cv-templates/${template.id}`}
                className="btn-primary w-full text-center"
              >
                <i className="fas fa-edit mr-2"></i>
                Sử dụng mẫu này
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
