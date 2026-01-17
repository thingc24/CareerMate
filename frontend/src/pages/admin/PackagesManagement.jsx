import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function PackagesManagement() {
  const [packages, setPackages] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [approvedSubscriptions, setApprovedSubscriptions] = useState([]);
  const [subscriptionsHistory, setSubscriptionsHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('packages');
  const [subscriptionTab, setSubscriptionTab] = useState('pending'); // 'pending', 'approved', 'history'
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
    } else if (activeTab === 'subscriptions') {
      if (subscriptionTab === 'pending') {
        loadSubscriptions();
      } else if (subscriptionTab === 'approved') {
        loadApprovedSubscriptions();
      } else if (subscriptionTab === 'history') {
        loadSubscriptionsHistory();
      }
    }
  }, [activeTab, subscriptionTab]);

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
      const data = await api.getPendingSubscriptions(0, 100);
      // Handle both array and page response
      if (data.content) {
        setSubscriptions(data.content);
      } else if (Array.isArray(data)) {
        setSubscriptions(data);
      } else {
        setSubscriptions([]);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadApprovedSubscriptions = async () => {
    try {
      setLoading(true);
      const data = await api.getApprovedSubscriptions(0, 100);
      if (data.content) {
        setApprovedSubscriptions(data.content);
      } else if (Array.isArray(data)) {
        setApprovedSubscriptions(data);
      } else {
        setApprovedSubscriptions([]);
      }
    } catch (error) {
      console.error('Error loading approved subscriptions:', error);
      setApprovedSubscriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSubscriptionsHistory = async () => {
    try {
      setLoading(true);
      const data = await api.getSubscriptionsHistory(0, 100);
      if (data.content) {
        setSubscriptionsHistory(data.content);
      } else if (Array.isArray(data)) {
        setSubscriptionsHistory(data);
      } else {
        setSubscriptionsHistory([]);
      }
    } catch (error) {
      console.error('Error loading subscriptions history:', error);
      setSubscriptionsHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (subscriptionId) => {
    if (!window.confirm('Bạn có chắc muốn duyệt đăng ký này?')) return;
    
    try {
      await api.approveSubscription(subscriptionId);
      alert('Đã duyệt đăng ký thành công!');
      loadSubscriptions();
      if (subscriptionTab === 'approved') {
        loadApprovedSubscriptions();
      }
    } catch (error) {
      console.error('Error approving subscription:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể duyệt đăng ký'));
    }
  };

  const handleReject = async (subscriptionId) => {
    if (!window.confirm('Bạn có chắc muốn từ chối đăng ký này?')) return;
    
    try {
      await api.rejectSubscription(subscriptionId);
      alert('Đã từ chối đăng ký!');
      loadSubscriptions();
      if (subscriptionTab === 'history') {
        loadSubscriptionsHistory();
      }
    } catch (error) {
      console.error('Error rejecting subscription:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể từ chối đăng ký'));
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
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      ACTIVE: 'bg-blue-100 text-blue-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Đang chờ duyệt',
      APPROVED: 'Đã duyệt',
      REJECTED: 'Đã từ chối',
      ACTIVE: 'Đang hoạt động',
      EXPIRED: 'Hết hạn',
      CANCELLED: 'Đã hủy'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Quản lý Gói Dịch Vụ</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">Quản lý các gói dịch vụ và đăng ký</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('packages')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'packages'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
            }`}
          >
            Gói Dịch Vụ
          </button>
          <button
            onClick={() => {
              setActiveTab('subscriptions');
              setSubscriptionTab('pending');
            }}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              activeTab === 'subscriptions'
                ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
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
              className="btn-primary dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              <i className="fas fa-plus mr-2"></i>
              Tạo gói mới
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="card p-6 mb-6 dark:bg-gray-900 dark:border-gray-800">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {editingPackage ? 'Chỉnh sửa gói' : 'Tạo gói mới'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên gói *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input-field dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giá (VND) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="input-field dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Thời hạn (ngày) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.durationDays}
                      onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                      className="input-field dark:bg-gray-800 dark:text-white dark:border-gray-700"
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
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Kích hoạt</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tính năng (phân cách bằng dấu phẩy)</label>
                  <textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="input-field dark:bg-gray-800 dark:text-white dark:border-gray-700"
                    rows="3"
                    placeholder="Tính năng 1, Tính năng 2, Tính năng 3..."
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary dark:bg-blue-700 dark:hover:bg-blue-800">
                    {editingPackage ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingPackage(null);
                      resetForm();
                    }}
                    className="btn-secondary dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Packages List */}
          {packages.length === 0 ? (
            <div className="card p-12 text-center dark:bg-gray-900 dark:border-gray-800">
              <i className="fas fa-box text-gray-400 dark:text-gray-500 text-6xl mb-4"></i>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Không có gói nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <div key={pkg.id} className="card p-6 dark:bg-gray-900 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                    {!pkg.isActive && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100">
                        Không hoạt động
                      </span>
                    )}
                  </div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {pkg.price?.toLocaleString('vi-VN')} VND
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Thời hạn: {pkg.durationDays} ngày</p>
                  {pkg.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{pkg.description}</p>
                  )}
                  {pkg.features && pkg.features.length > 0 && (
                    <ul className="text-sm text-gray-600 dark:text-gray-300 mb-4 space-y-1">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <i className="fas fa-check text-green-500 dark:text-green-400"></i>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(pkg)}
                      className="flex-1 btn-secondary text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700"
                    >
                      <i className="fas fa-edit mr-2"></i>Chỉnh sửa
                    </button>
                    <button
                      onClick={() => handleDelete(pkg.id)}
                      className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition text-sm"
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
        <>
          {/* Sub-tabs for subscriptions */}
          <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <button
                onClick={() => setSubscriptionTab('pending')}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  subscriptionTab === 'pending'
                    ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                Đang chờ duyệt
              </button>
              <button
                onClick={() => setSubscriptionTab('approved')}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  subscriptionTab === 'approved'
                    ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                Đã duyệt
              </button>
              <button
                onClick={() => setSubscriptionTab('history')}
                className={`px-4 py-2 font-medium border-b-2 transition ${
                  subscriptionTab === 'history'
                    ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white'
                }`}
              >
                Lịch sử duyệt
              </button>
            </div>
          </div>

          {/* Pending Subscriptions */}
          {subscriptionTab === 'pending' && (
            <>
              {subscriptions.length === 0 ? (
                <div className="card p-12 text-center dark:bg-gray-900 dark:border-gray-800">
                  <i className="fas fa-inbox text-gray-400 dark:text-gray-500 text-6xl mb-4"></i>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">Không có yêu cầu đăng ký đang chờ duyệt</p>
                </div>
              ) : (
            <div className="card overflow-hidden dark:bg-gray-900 dark:border-gray-800">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Người dùng</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Gói</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ngày yêu cầu</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {subscriptions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {sub.user?.fullName || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {sub.user?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">{sub.packageEntity?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(sub.status)} dark:bg-yellow-800 dark:text-yellow-100 dark:bg-green-800 dark:text-green-100 dark:bg-red-800 dark:text-red-100 dark:bg-blue-800 dark:text-blue-100 dark:bg-gray-800 dark:text-gray-100`}>
                            {getStatusText(sub.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(sub.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          {sub.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApprove(sub.id)}
                                className="px-3 py-1 bg-green-600 dark:bg-green-700 text-white rounded hover:bg-green-700 dark:hover:bg-green-800 transition text-sm"
                                title="Duyệt"
                              >
                                <i className="fas fa-check mr-1"></i>
                                Duyệt
                              </button>
                              <button
                                onClick={() => handleReject(sub.id)}
                                className="px-3 py-1 bg-red-600 dark:bg-red-700 text-white rounded hover:bg-red-700 dark:hover:bg-red-800 transition text-sm"
                                title="Từ chối"
                              >
                                <i className="fas fa-times mr-1"></i>
                                Từ chối
                              </button>
                            </div>
                          )}
                          {sub.status !== 'PENDING' && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">Đã xử lý</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              )}
            </>
          )}

          {/* Approved Subscriptions */}
          {subscriptionTab === 'approved' && (
            <>
              {approvedSubscriptions.length === 0 ? (
                <div className="card p-12 text-center dark:bg-gray-900 dark:border-gray-800">
                  <i className="fas fa-check-circle text-gray-400 dark:text-gray-500 text-6xl mb-4"></i>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">Không có gói dịch vụ nào đã được duyệt</p>
                </div>
              ) : (
                <div className="card overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Người dùng</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Gói</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Bắt đầu</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kết thúc</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ngày duyệt</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {approvedSubscriptions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {sub.user?.fullName || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                {sub.user?.email || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">{sub.packageEntity?.name || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(sub.status)} dark:bg-yellow-800 dark:text-yellow-100 dark:bg-green-800 dark:text-green-100 dark:bg-red-800 dark:text-red-100 dark:bg-blue-800 dark:text-blue-100 dark:bg-gray-800 dark:text-gray-100`}>
                                {getStatusText(sub.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(sub.startDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(sub.endDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(sub.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Subscriptions History */}
          {subscriptionTab === 'history' && (
            <>
              {subscriptionsHistory.length === 0 ? (
                <div className="card p-12 text-center dark:bg-gray-900 dark:border-gray-800">
                  <i className="fas fa-history text-gray-400 dark:text-gray-500 text-6xl mb-4"></i>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">Chưa có lịch sử đăng ký</p>
                </div>
              ) : (
                <div className="card overflow-hidden dark:bg-gray-900 dark:border-gray-800">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Người dùng</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Gói</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Trạng thái</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Bắt đầu</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Kết thúc</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ngày yêu cầu</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        {subscriptionsHistory.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {sub.user?.fullName || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                {sub.user?.email || 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white">{sub.packageEntity?.name || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(sub.status)} dark:bg-yellow-800 dark:text-yellow-100 dark:bg-green-800 dark:text-green-100 dark:bg-red-800 dark:text-red-100 dark:bg-blue-800 dark:text-blue-100 dark:bg-gray-800 dark:text-gray-100`}>
                                {getStatusText(sub.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(sub.startDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(sub.endDate)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                              {formatDate(sub.createdAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
