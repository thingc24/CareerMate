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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Tìm kiếm công ty</h1>
        <p className="text-lg text-gray-600">Khám phá các công ty hàng đầu và đánh giá của nhân viên</p>
      </div>

      {/* Search */}
      <div className="card p-6 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm công ty..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary">
            <i className="fas fa-search mr-2"></i>
            Tìm kiếm
          </button>
        </form>
      </div>

      {/* Companies Grid */}
      {companies.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="fas fa-building text-gray-400 text-6xl mb-4"></i>
          <p className="text-gray-600 text-lg">Không tìm thấy công ty nào</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {companies.map((company) => (
              <Link
                key={company.id}
                to={`/student/companies/${company.id}`}
                className="card p-6 hover:shadow-lg transition-all duration-300 group"
              >
                {company.logoUrl && (
                  <div className="mb-4 flex justify-center">
                    <img
                      src={company.logoUrl.startsWith('http') 
                        ? company.logoUrl 
                        : `http://localhost:8080/api${company.logoUrl}`}
                      alt={company.name}
                      className="h-20 w-20 object-contain"
                    />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {company.name}
                </h3>
                {company.industry && (
                  <p className="text-sm text-gray-600 mb-2">
                    <i className="fas fa-industry mr-2"></i>
                    {company.industry}
                  </p>
                )}
                {company.location && (
                  <p className="text-sm text-gray-600 mb-4">
                    <i className="fas fa-map-marker-alt mr-2"></i>
                    {company.location}
                  </p>
                )}
                {company.averageRating && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <i
                          key={i}
                          className={`fas fa-star ${
                            i < Math.floor(company.averageRating)
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        ></i>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {company.averageRating.toFixed(1)}
                    </span>
                    {company.ratingsCount > 0 && (
                      <span className="text-sm text-gray-500">
                        ({company.ratingsCount} đánh giá)
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-4 text-sm text-blue-600 group-hover:text-blue-700">
                  Xem chi tiết <i className="fas fa-arrow-right ml-1"></i>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary disabled:opacity-50"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <span className="px-4 py-2 text-gray-700">
                Trang {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="btn-secondary disabled:opacity-50"
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
