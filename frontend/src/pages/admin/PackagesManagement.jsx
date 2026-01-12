import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function PackagesManagement() {
  const [packages, setPackages] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages');
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    durationDays: '',
    features: '',
    isActive: true
  });

  useEffect(() => {
    if (activeTab === 'packages') {
      loadPackages();
    } else {
      loadSubscriptions();
    }
  }, [activeTab]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminPackages();
      setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const packageData = {
        ...formData,
        price: parseFloat(formData.price),
        durationDays: parseInt(formData.durationDays),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      };
      
      if (editingPackage) {
        await api.updatePackage(editingPackage.id, packageData);
        alert('Cập nhật gói thành công!');
      } else {
        await api.createPackage(packageData);
        alert('Tạo gói thành công!');
      }
      setShowForm(false);
      setEditingPackage(null);
      resetForm();
      loadPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể lưu gói'));
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      price: pkg.price?.toString() || '',
      durationDays: pkg.durationDays?.toString() || '',
      features: pkg.features?.join(', ') || '',
      isActive: pkg.isActive !== undefined ? pkg.isActive : true
    });
    setShowForm(true);
  };

  const handleDelete = async (packageId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa gói này?')) return;
    
    try {
      await api.deletePackage(packageId);
      alert('Xóa gói thành công!');
      loadPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể xóa gói'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      durationDays: '',
      features: '',
      isActive: true
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Quản lý Gói Dịch Vụ</h1>
        <p className="text-lg text-gray-600">Quản lý các gói dịch vụ và đăng ký</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'packages'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Gói Dịch Vụ
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'subscriptions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng Ký
          </button>
        </div>
      </div>

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <>
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingPackage(null);
                resetForm();
              }}
              className="btn-primary"
            >
              <i className="fas fa-plus mr-2"></i>
              Tạo gói mới
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="card p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingPackage ? 'Chỉnh sửa gói' : 'Tạo gói mới'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tên gói *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Giá (VND) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Thời hạn (ngày) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Kích hoạt</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tính năng (phân cách bằng dấu phẩy)</label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder="Tính năng 1, Tính năng 2, Tính năng 3..."
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary">
                    {editingPackage ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPackage(null);
                      resetForm();
                    }}
                    className="btn-secondary"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Packages List */}
          {packages.length === 0 ? (
            <div className="card p-12 text-center">
              <i className="fas fa-box text-gray-400 text-6xl mb-4"></i>
              <p className="text-gray-600 text-lg">Không có gói nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                    {!pkg.isActive && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                        Không hoạt động
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mb-2">
                    {pkg.price?.toLocaleString('vi-VN')} VND
                  </p>
                  <p className="text-sm text-gray-500 mb-4">Thời hạn: {pkg.durationDays} ngày</p>
                  {pkg.description && (
                    <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                  )}
                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="text-sm text-gray-600 mb-4 space-y-1">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <i className="fas fa-check text-green-500"></i>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="flex-1 btn-secondary text-sm"
                    >
                      <i className="fas fa-edit mr-2"></i>Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người dùng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gói</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bắt đầu</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kết thúc</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {sub.user?.fullName || sub.user?.email || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{sub.packageEntity?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(sub.status)}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(sub.startDate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(sub.endDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
