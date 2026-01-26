import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function CVTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);

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
      // Simulate a bit of loading for the skeleton effect
      setTimeout(() => setLoading(false), 500);
    }
  };

  const categories = [
    { value: '', label: 'Tất cả', icon: 'fas fa-th-large' },
    { value: 'MODERN', label: 'Hiện đại', icon: 'fas fa-bolt' },
    { value: 'CLASSIC', label: 'Cổ điển', icon: 'fas fa-landmark' },
    { value: 'CREATIVE', label: 'Sáng tạo', icon: 'fas fa-palette' },
    { value: 'MINIMALIST', label: 'Tối giản', icon: 'fas fa-leaf' },
  ];

  const getGradient = (type) => {
    switch (type) {
      case 'MODERN': return 'from-blue-500 to-indigo-600';
      case 'CREATIVE': return 'from-purple-500 to-pink-500';
      case 'MINIMALIST': return 'from-gray-500 to-gray-700';
      default: return 'from-emerald-500 to-teal-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20">
      {/* Hero Section */}
      {/* Hero Section with Filter Bar */}
      <div className="relative bg-white dark:bg-gray-900 overflow-hidden mb-8 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 opacity-50"></div>
        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">

          <div className="flex flex-col items-center justify-center space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white text-center mb-4">
              Thư viện Mẫu CV
            </h1>

            {/* Premium Filter Bar */}
            <div className="w-full max-w-4xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10 rounded-3xl p-3 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-300 hover:bg-white/90 dark:hover:bg-gray-800/90 hover:shadow-blue-500/10 hover:scale-[1.01]">
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto p-1 custom-scrollbar">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${selectedCategory === cat.value
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                  >
                    <i className={`${cat.icon} ${selectedCategory === cat.value ? 'animate-pulse' : ''}`}></i>
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

              <label className="flex items-center gap-3 px-4 py-2 cursor-pointer group hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={showFreeOnly}
                    onChange={(e) => setShowFreeOnly(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors duration-300 ${showFreeOnly ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                  <div className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${showFreeOnly ? 'translate-x-5' : 'translate-x-0'}`}></div>
                </div>
                <span className={`text-sm font-medium transition-colors ${showFreeOnly ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  Miễn phí
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4">

        {/* Templates Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 h-[400px] animate-pulse">
                <div className="w-full h-[60%] bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-full"></div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-search text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Không tìm thấy mẫu CV phù hợp</h3>
            <p className="text-gray-500 dark:text-gray-400">Hãy thử thay đổi bộ lọc hoặc quay lại sau nhé.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((template) => (
              <div
                key={template.id}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 border border-gray-100 dark:border-gray-700 transition-all duration-500 transform hover:-translate-y-1"
                onMouseEnter={() => setHoveredTemplate(template.id)}
                onMouseLeave={() => setHoveredTemplate(null)}
              >
                {/* Image Section */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-900 group-hover:shadow-inner">
                  {template.previewImageUrl ? (
                    <img
                      src={template.previewImageUrl.startsWith('http')
                        ? template.previewImageUrl
                        : `http://localhost:8080/api${template.previewImageUrl}`}
                      alt={template.name}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}

                  {/* Fallback & Gradient Overlay */}
                  <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${getGradient(template.category)} ${template.previewImageUrl ? 'hidden' : 'flex'}`}>
                    <i className="fas fa-file-invoice text-6xl text-white opacity-80 mb-4 drop-shadow-lg"></i>
                    <span className="text-white font-bold text-lg tracking-wider opacity-90 uppercase">Mẫu CV</span>
                  </div>

                  {/* Dark overlay on hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold transform scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg flex items-center gap-2">
                      <i className="fas fa-eye"></i> Xem trước
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {template.isPremium && (
                      <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20 backdrop-blur-md flex items-center gap-1">
                        <i className="fas fa-crown text-[10px]"></i> PRO
                      </span>
                    )}
                    <span className="bg-black/50 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                      {categories.find(c => c.value === template.category)?.label || template.category}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 relative bg-white dark:bg-gray-800 z-10">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 h-10">
                    {template.description || 'Mẫu CV chuyên nghiệp được thiết kế giúp bạn nổi bật.'}
                  </p>

                  <Link
                    to={`/student/cv-templates/${template.id}`}
                    className="block w-full"
                  >
                    <button className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transform transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 group-btn">
                      Sử dụng mẫu này
                      <i className="fas fa-arrow-right group-btn-hover:translate-x-1 transition-transform"></i>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Styles for styling not available in Tailwind standard */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
