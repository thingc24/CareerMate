import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function RecruiterCompany() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
  });

  useEffect(() => {
    loadCompanyInfo();
  }, []);

  const loadCompanyInfo = async () => {
    try {
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
          foundedYear: company.foundedYear || '',
        });
      }
      // 404 is expected when recruiter doesn't have a company yet - no need to log
    } catch (error) {
      // Only log non-404 errors
      if (error.response?.status !== 404) {
        console.error('Error loading company info:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const headquarters = [formData.address, formData.city, formData.country]
        .filter(Boolean)
        .join(', ');

      const companyData = {
        name: formData.name,
        websiteUrl: formData.websiteUrl,
        headquarters: headquarters || formData.address,
        description: formData.description,
        companySize: formData.companySize,
        industry: formData.industry,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : null,
        logoUrl: null, // TODO: Handle logo upload
      };

      await api.createOrUpdateCompany(companyData);
      alert('Đã lưu thông tin công ty thành công!');
      setTimeout(() => {
        navigate('/recruiter/post-job');
      }, 1000);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể lưu thông tin'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Thông tin công ty</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên công ty *</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
            <input
              type="url"
              name="websiteUrl"
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.websiteUrl}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ *</label>
          <input
            type="text"
            name="address"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố</label>
            <input
              type="text"
              name="city"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quốc gia</label>
            <input
              type="text"
              name="country"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả công ty *</label>
          <textarea
            name="description"
            rows="6"
            required
            placeholder="Giới thiệu về công ty, lĩnh vực hoạt động, văn hóa công ty..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quy mô nhân sự</label>
            <select
              name="companySize"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Lĩnh vực hoạt động</label>
            <input
              type="text"
              name="industry"
              placeholder="VD: Công nghệ thông tin"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.industry}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Năm thành lập</label>
            <input
              type="number"
              name="foundedYear"
              min="1900"
              max="2024"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.foundedYear}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : 'Lưu thông tin'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recruiter/dashboard')}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
