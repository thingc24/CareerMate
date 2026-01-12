import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CompanyEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    websiteUrl: '',
    address: '',
    city: '',
    country: 'Việt Nam',
    description: '',
    companySize: '',
    industry: '',
    foundedYear: '',
    logoUrl: '',
  });

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
      setLoading(true);
      setMessage('');
      const company = await api.getMyCompany();
      if (company) {
        // Parse headquarters
        const headquarters = company.headquarters || '';
        let address = headquarters;
        let city = '';
        let country = 'Việt Nam';
        
        if (headquarters.includes(',')) {
          const parts = headquarters.split(',').map(s => s.trim());
          address = parts[0] || '';
          city = parts[1] || '';
          country = parts[2] || 'Việt Nam';
        }

        setFormData({
          name: company.name || '',
          websiteUrl: company.websiteUrl || '',
          address,
          city,
          country,
          description: company.description || '',
          companySize: company.companySize || '',
          industry: company.industry || '',
          foundedYear: company.foundedYear ? String(company.foundedYear) : '',
          logoUrl: company.logoUrl || '',
        });

        if (company.logoUrl) {
          setLogoPreview(getLogoUrl(company.logoUrl));
        }
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error loading company info:', error);
        setMessage('Lỗi: ' + (error.response?.data?.message || 'Không thể tải thông tin'));
      }
    } finally {
      setLoading(false);
    }
  };

  const getLogoUrl = (logoUrl) => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl;
    if (logoUrl.startsWith('/api')) {
      return `http://localhost:8080${logoUrl}`;
    }
    return `http://localhost:8080/api${logoUrl}`;
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Lỗi: Chỉ chấp nhận file ảnh');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Lỗi: Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setUploadingLogo(true);
      setMessage('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload logo
      const response = await api.uploadCompanyLogo(file);
      if (response && response.logoUrl) {
        setFormData(prev => ({ ...prev, logoUrl: response.logoUrl }));
        setLogoPreview(getLogoUrl(response.logoUrl));
        setMessage('Cập nhật logo thành công!');
        
        // Trigger company reload
        window.dispatchEvent(new CustomEvent('companyUpdated'));
        
        setTimeout(() => {
          loadCompanyInfo();
        }, 500);
      } else {
        setMessage('Cập nhật logo thành công!');
        window.dispatchEvent(new CustomEvent('companyUpdated'));
        setTimeout(() => {
          loadCompanyInfo();
        }, 500);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Lỗi: ' + (error.response?.data?.error || 'Không thể tải logo lên'));
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      
      const headquarters = [formData.address, formData.city, formData.country]
        .filter(Boolean)
        .join(', ');

      const companyData = {
        name: formData.name,
        websiteUrl: formData.websiteUrl || null,
        headquarters: headquarters || formData.address || null,
        description: formData.description || null,
        companySize: formData.companySize || null,
        industry: formData.industry || null,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
        logoUrl: formData.logoUrl || null,
      };

      await api.createOrUpdateCompany(companyData);
      setMessage('Cập nhật thông tin công ty thành công!');
      
      // Trigger company reload
      window.dispatchEvent(new CustomEvent('companyUpdated'));
      
      setTimeout(() => {
        setMessage('');
        // Navigate to view page
        navigate('/recruiter/company/view', { 
          replace: true, 
          state: { refresh: Date.now() } 
        });
      }, 1500);
    } catch (error) {
      console.error('Error updating company:', error);
      setMessage('Lỗi: ' + (error.response?.data?.message || 'Không thể lưu thông tin'));
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/recruiter/company/view')}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Quay lại</span>
        </button>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          {formData.name ? 'Cập nhật thông tin công ty' : 'Tạo thông tin công ty'}
        </h1>
        <p className="text-lg text-gray-600">
          Chỉnh sửa thông tin và mô tả về công ty của bạn
        </p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl border-2 animate-slide-up ${
            message.includes('Lỗi')
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <i className={`fas ${message.includes('Lỗi') ? 'fa-exclamation-circle' : 'fa-check-circle'} text-xl`}></i>
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="card p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <i className="fas fa-image text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Logo công ty</h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover bg-white"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                    <i className="fas fa-building text-gray-400 text-4xl"></i>
                  </div>
                )}
                {uploadingLogo && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <i className="fas fa-upload"></i>
                  <span>{uploadingLogo ? 'Đang tải...' : 'Chọn logo'}</span>
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Chấp nhận: JPG, PNG, GIF (tối đa 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="card p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <i className="fas fa-building text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Thông tin cơ bản</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-building text-gray-400 mr-2"></i>
                  Tên công ty *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="input-field"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tên công ty"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-globe text-gray-400 mr-2"></i>
                  Website
                </label>
                <input
                  type="url"
                  name="websiteUrl"
                  className="input-field"
                  value={formData.websiteUrl}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  className="input-field"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Số nhà, đường..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-city text-gray-400 mr-2"></i>
                  Thành phố
                </label>
                <input
                  type="text"
                  name="city"
                  className="input-field"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Hà Nội, TP.HCM..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-flag text-gray-400 mr-2"></i>
                  Quốc gia
                </label>
                <input
                  type="text"
                  name="country"
                  className="input-field"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Company Details */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <i className="fas fa-info-circle text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Chi tiết công ty</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-users text-gray-400 mr-2"></i>
                  Quy mô nhân sự
                </label>
                <select
                  name="companySize"
                  className="input-field"
                  value={formData.companySize}
                  onChange={handleChange}
                >
                  <option value="">Chọn quy mô</option>
                  <option value="1-10">1-10 nhân viên</option>
                  <option value="11-50">11-50 nhân viên</option>
                  <option value="51-200">51-200 nhân viên</option>
                  <option value="201-500">201-500 nhân viên</option>
                  <option value="501-1000">501-1000 nhân viên</option>
                  <option value="1000+">Trên 1000 nhân viên</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-industry text-gray-400 mr-2"></i>
                  Lĩnh vực hoạt động
                </label>
                <input
                  type="text"
                  name="industry"
                  className="input-field"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="VD: Công nghệ thông tin"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-calendar text-gray-400 mr-2"></i>
                  Năm thành lập
                </label>
                <input
                  type="number"
                  name="foundedYear"
                  min="1900"
                  max="2024"
                  className="input-field"
                  value={formData.foundedYear}
                  onChange={handleChange}
                  placeholder="2020"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <i className="fas fa-file-alt text-gray-400 mr-2"></i>
                Mô tả công ty *
              </label>
              <textarea
                name="description"
                rows="6"
                required
                className="input-field resize-none"
                value={formData.description}
                onChange={handleChange}
                placeholder="Giới thiệu về công ty, lĩnh vực hoạt động, văn hóa công ty..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Lưu thay đổi
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/recruiter/company/view')}
              className="btn-secondary"
            >
              <i className="fas fa-times mr-2"></i>
              Hủy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
