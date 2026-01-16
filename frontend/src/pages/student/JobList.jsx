import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadJobs();
  }, [page, searchTerm, location]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await api.searchJobs(searchTerm, location, page, 10);
      setJobs(data.content || data || []);
      setTotalPages(data.totalPages || 0);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency = 'VND') => {
    if (!amount) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND'
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    loadJobs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Tìm Việc Làm
        </h1>
        <p className="text-lg text-gray-600">
          Khám phá cơ hội nghề nghiệp phù hợp với bạn
        </p>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="card p-6 mb-8 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <div className="relative">
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Tìm kiếm việc làm, công ty, kỹ năng..."
                  className="input-field pl-12 pr-4 py-3 bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="md:col-span-4">
              <div className="relative">
                <i className="fas fa-map-marker-alt absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                <select
                  className="input-field pl-12 pr-10 appearance-none w-full py-3 bg-white border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                >
                  <option value="">Tất cả địa điểm</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Cần Thơ">Cần Thơ</option>
                  <option value="Hải Phòng">Hải Phòng</option>
                </select>
                <i className="fas fa-chevron-down absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
              </div>
            </div>
            <div className="md:col-span-3">
              <button type="submit" className="btn-primary w-full">
                <i className="fas fa-search mr-2"></i>
                Tìm kiếm
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Results Count */}
      {!loading && jobs.length > 0 && (
        <div className="mb-4">
          <p className="text-gray-600">
            Tìm thấy <span className="font-semibold text-gray-900">{jobs.length}</span> việc làm
          </p>
        </div>
      )}

      {/* Job List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-6 w-1/3 mb-4"></div>
              <div className="skeleton h-4 w-1/4 mb-2"></div>
              <div className="skeleton h-4 w-1/2"></div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-16 text-center shadow-lg">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
            <i className="fas fa-briefcase text-blue-500 text-5xl"></i>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy việc làm nào</h3>
          <p className="text-gray-600 mb-6">Thử thay đổi từ khóa hoặc bộ lọc tìm kiếm</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setLocation('');
              setPage(0);
            }}
            className="btn-secondary"
          >
            <i className="fas fa-redo mr-2"></i>
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, index) => (
            <Link
              key={job.id}
              to={`/student/jobs/${job.id}`}
              className="card p-6 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 transition-all duration-300 block group border-2 border-transparent hover:border-blue-200 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 font-medium mb-3">
                        {job.company?.name || 'Công ty'}
                      </p>
                    </div>
                    <span className={`badge ${job.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'} ml-4 flex-shrink-0`}>
                      {job.status === 'ACTIVE' ? 'Đang tuyển' : 'Đã đóng'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center">
                      <i className="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-dollar-sign text-gray-400 mr-2"></i>
                      {formatCurrency(job.minSalary, job.currency)}
                      {job.maxSalary && ` - ${formatCurrency(job.maxSalary, job.currency)}`}
                    </span>
                    <span className="flex items-center">
                      <i className="far fa-clock text-gray-400 mr-2"></i>
                      {formatDate(job.createdAt)}
                    </span>
                  </div>
                  
                  {job.description && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {job.description.substring(0, 150)}...
                    </p>
                  )}
                  
                  {job.requiredSkills && job.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 5).map((skill, idx) => (
                        <span
                          key={idx}
                          className="badge badge-info"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 5 && (
                        <span className="badge bg-gray-100 text-gray-600">
                          +{job.requiredSkills.length - 5} khác
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex lg:flex-col items-center lg:items-end gap-3 lg:ml-6">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/student/jobs/${job.id}`;
                    }}
                    className="btn-primary whitespace-nowrap"
                  >
                    <i className="fas fa-paper-plane mr-2"></i>
                    Ứng tuyển
                  </button>
                  <button className="btn-secondary whitespace-nowrap">
                    <i className="far fa-heart mr-2"></i>
                    Lưu
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
          >
            <i className="fas fa-chevron-left mr-2"></i>
            Trước
          </button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page > totalPages - 4) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    page === pageNum
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600'
                  }`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-blue-500 hover:text-blue-600 transition-colors font-medium"
          >
            Sau
            <i className="fas fa-chevron-right ml-2"></i>
          </button>
        </div>
      )}
    </div>
  );
}
