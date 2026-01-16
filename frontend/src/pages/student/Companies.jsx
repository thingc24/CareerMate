import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadCompanies();
  }, [page, searchKeyword]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const data = await api.getCompanies(page, 12, searchKeyword);
      setCompanies(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadCompanies();
  };

  if (loading && companies.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải danh sách công ty...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Tìm Công Ty
        </h1>
        <p className="text-lg text-gray-600">
          Khám phá các công ty hàng đầu và cơ hội nghề nghiệp
        </p>
      </div>

      {/* Enhanced Search */}
      <div className="card p-6 mb-8 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên công ty, ngành nghề..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="input-field flex-1 pl-12 pr-4 py-3 bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>
          <button type="submit" className="btn-primary px-8">
            <i className="fas fa-search mr-2"></i>
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Companies Grid */}
      {companies.length === 0 ? (
        <div className="card p-16 text-center shadow-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
            <i className="fas fa-building text-blue-500 text-5xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy công ty nào</h3>
          <p className="text-gray-600">Thử tìm kiếm với từ khóa khác hoặc xem tất cả công ty</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {companies.map((company, index) => (
              <Link
                key={company.id}
                to={`/student/companies/${company.id}`}
                className="card p-6 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 transition-all duration-300 group border-2 border-transparent hover:border-blue-200 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {/* Company Logo */}
                {company.logoUrl ? (
                  <div className="mb-4 flex justify-center">
                    <div className="relative">
                      <img
                        src={company.logoUrl.startsWith('http') 
                          ? company.logoUrl 
                          : `http://localhost:8080/api${company.logoUrl}`}
                        alt={company.name}
                        className="h-24 w-24 object-contain rounded-lg border-2 border-gray-100 group-hover:border-blue-300 transition-all duration-300 p-2 bg-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 flex justify-center">
                    <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-gray-100 group-hover:border-blue-300 transition-all">
                      <i className="fas fa-building text-blue-500 text-3xl"></i>
                    </div>
                  </div>
                )}

                {/* Company Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {company.name}
                </h3>

                {/* Industry */}
                {company.industry && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600">
                      <i className="fas fa-industry text-xs"></i>
                    </div>
                    <span className="text-sm text-gray-600">{company.industry}</span>
                  </div>
                )}

                {/* Location */}
                {company.headquarters && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600">
                      <i className="fas fa-map-marker-alt text-xs"></i>
                    </div>
                    <span className="text-sm text-gray-600">{company.headquarters}</span>
                  </div>
                )}

                {/* Rating Section */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <i
                            key={i}
                            className={`fas fa-star text-base ${
                              i < Math.floor(company.averageRating || 0)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            } transition-colors`}
                          ></i>
                        ))}
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {company.averageRating ? company.averageRating.toFixed(1) : '0.0'}
                      </span>
                    </div>
                    {company.ratingsCount > 0 && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {company.ratingsCount} đánh giá
                      </span>
                    )}
                  </div>
                </div>

                {/* View Details CTA */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                    <span>Xem chi tiết</span>
                    <i className="fas fa-arrow-right ml-2 transform group-hover:translate-x-1 transition-transform"></i>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Enhanced Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-3">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                <i className="fas fa-chevron-left"></i>
                <span>Trước</span>
              </button>
              <div className="flex items-center gap-2">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      page === i
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
              >
                <span>Sau</span>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
