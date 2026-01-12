import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function CompanyView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompany();
    
    // Listen for company updates
    const handleCompanyUpdate = () => {
      loadCompany();
    };
    window.addEventListener('companyUpdated', handleCompanyUpdate);
    
    return () => {
      window.removeEventListener('companyUpdated', handleCompanyUpdate);
    };
  }, [location.pathname, location.state?.refresh]);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const data = await api.getMyCompany();
      if (data) {
        setCompany(data);
      } else {
        // No company yet, redirect to edit to create one
        navigate('/recruiter/company/edit', { replace: true });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No company yet, redirect to edit to create one
        navigate('/recruiter/company/edit', { replace: true });
      } else {
        console.error('Error loading company:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getLogoUrl = () => {
    if (!company?.logoUrl) return null;
    if (company.logoUrl.startsWith('http')) return company.logoUrl;
    if (company.logoUrl.startsWith('/api')) {
      return `http://localhost:8080${company.logoUrl}`;
    }
    return `http://localhost:8080/api${company.logoUrl}`;
  };

  const parseHeadquarters = () => {
    if (!company?.headquarters) return { address: '', city: '', country: '' };
    const parts = company.headquarters.split(',').map(s => s.trim());
    return {
      address: parts[0] || '',
      city: parts[1] || '',
      country: parts[2] || 'Việt Nam'
    };
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải thông tin công ty...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <i className="fas fa-building text-yellow-600 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-yellow-900 mb-2">Chưa có thông tin công ty</h2>
          <p className="text-yellow-700 mb-4">Vui lòng tạo thông tin công ty để bắt đầu đăng tin tuyển dụng.</p>
          <button
            onClick={() => navigate('/recruiter/company/edit')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <i className="fas fa-plus mr-2"></i>
            Tạo thông tin công ty
          </button>
        </div>
      </div>
    );
  }

  const headquarters = parseHeadquarters();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/recruiter/dashboard')}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Quay lại</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Thông tin công ty</h1>
        <p className="text-lg text-gray-600">Thông tin và mô tả về công ty của bạn</p>
      </div>

      {/* Company Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Logo Section */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-center">
          <div className="relative inline-block">
            {getLogoUrl() ? (
              <img
                src={getLogoUrl()}
                alt="Company Logo"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white/20 flex items-center justify-center">
                <i className="fas fa-building text-white text-5xl"></i>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mt-4">
            {company.name}
          </h2>
          {company.industry && (
            <p className="text-blue-100 mt-1">{company.industry}</p>
          )}
        </div>

        {/* Company Information */}
        <div className="p-8 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i className="fas fa-info-circle text-blue-600"></i>
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tên công ty</p>
                <p className="text-gray-900 font-medium">{company.name}</p>
              </div>
              {company.websiteUrl && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Website</p>
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {company.websiteUrl}
                    <i className="fas fa-external-link-alt ml-2 text-xs"></i>
                  </a>
                </div>
              )}
              {headquarters.address && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                  <p className="text-gray-900 font-medium">{headquarters.address}</p>
                </div>
              )}
              {headquarters.city && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Thành phố</p>
                  <p className="text-gray-900 font-medium">{headquarters.city}</p>
                </div>
              )}
              {headquarters.country && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Quốc gia</p>
                  <p className="text-gray-900 font-medium">{headquarters.country}</p>
                </div>
              )}
              {company.companySize && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Quy mô nhân sự</p>
                  <p className="text-gray-900 font-medium">{company.companySize}</p>
                </div>
              )}
              {company.foundedYear && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Năm thành lập</p>
                  <p className="text-gray-900 font-medium">{company.foundedYear}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {company.description && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <i className="fas fa-file-alt text-purple-600"></i>
                Mô tả công ty
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{company.description}</p>
            </div>
          )}

          {/* Edit Button */}
          <div className="border-t pt-6">
            <button
              onClick={() => navigate('/recruiter/company/edit')}
              className="w-full btn-primary"
            >
              <i className="fas fa-edit mr-2"></i>
              Chỉnh sửa thông tin công ty
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
