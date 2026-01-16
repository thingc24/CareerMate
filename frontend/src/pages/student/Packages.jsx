import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
    loadMySubscription();
    loadMySubscriptions();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const data = await api.getPackages();
      setPackages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMySubscription = async () => {
    try {
      const data = await api.getMySubscription();
      setMySubscription(data);
    } catch (error) {
      // Not having a subscription is OK
      setMySubscription(null);
    }
  };

  const loadMySubscriptions = async () => {
    try {
      const data = await api.getMySubscriptions();
      setMySubscriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading my subscriptions:', error);
    }
  };

  const handleSubscribe = async (packageId) => {
    if (!window.confirm('Bạn có chắc muốn đăng ký gói này? Yêu cầu sẽ được gửi đến admin để duyệt.')) {
      return;
    }
    try {
      await api.requestSubscription(packageId);
      alert('Yêu cầu đăng ký đã được gửi! Vui lòng chờ admin duyệt. Bạn sẽ nhận được thông báo khi có kết quả.');
      loadMySubscriptions();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message || 'Không thể gửi yêu cầu đăng ký gói'));
    }
  };

  const getSubscriptionStatus = (pkgId) => {
    const sub = mySubscriptions.find(s => s.packageEntity?.id === pkgId);
    if (!sub) return null;
    return sub.status;
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải gói dịch vụ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Current Subscription */}
      {mySubscription && (
        <div className="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Gói đang hoạt động</h2>
              <p className="text-gray-700">
                {mySubscription.packageEntity?.name || mySubscription.package?.name || 'Gói Premium'}
              </p>
              {mySubscription.endDate && (
                <p className="text-sm text-gray-600 mt-1">
                  Hết hạn: {new Date(mySubscription.endDate).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
            <span className="badge badge-success text-lg px-4 py-2">
              Đang hoạt động
            </span>
          </div>
        </div>
      )}

      {/* My Subscriptions List */}
      {mySubscriptions.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Lịch sử đăng ký của tôi</h2>
          <div className="space-y-3">
            {mySubscriptions.map((sub) => {
              const statusColors = {
                PENDING: 'bg-yellow-100 text-yellow-800',
                APPROVED: 'bg-green-100 text-green-800',
                REJECTED: 'bg-red-100 text-red-800',
                ACTIVE: 'bg-blue-100 text-blue-800',
                EXPIRED: 'bg-gray-100 text-gray-800',
                CANCELLED: 'bg-gray-100 text-gray-800'
              };
              const statusTexts = {
                PENDING: 'Đang chờ duyệt',
                APPROVED: 'Đã được duyệt',
                REJECTED: 'Bị từ chối',
                ACTIVE: 'Đang hoạt động',
                EXPIRED: 'Hết hạn',
                CANCELLED: 'Đã hủy'
              };
              return (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{sub.packageEntity?.name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">
                      {sub.startDate && `Từ ${new Date(sub.startDate).toLocaleDateString('vi-VN')}`}
                      {sub.endDate && ` đến ${new Date(sub.endDate).toLocaleDateString('vi-VN')}`}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusColors[sub.status] || 'bg-gray-100 text-gray-800'}`}>
                    {statusTexts[sub.status] || sub.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Packages Grid */}
      {packages.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="fas fa-box text-gray-400 text-6xl mb-4"></i>
          <p className="text-gray-600 text-lg">Không có gói dịch vụ nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const isSubscribed = mySubscription?.packageEntity?.id === pkg.id || mySubscription?.package?.id === pkg.id;
            const subscriptionStatus = getSubscriptionStatus(pkg.id);
            const hasPendingRequest = subscriptionStatus === 'PENDING';
            const isPremium = pkg.name?.toUpperCase().includes('PREMIUM') || pkg.isPremium;

            return (
              <div
                key={pkg.id}
                className={`card p-6 hover:shadow-lg transition-all duration-300 ${
                  isPremium ? 'border-2 border-blue-500' : ''
                }`}
              >
                {isPremium && (
                  <div className="text-center mb-4">
                    <span className="badge badge-info">Phổ biến</span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-blue-600">
                    {formatCurrency(pkg.price)}
                  </span>
                  {pkg.price && pkg.price > 0 && (
                    <span className="text-gray-600">
                      /{pkg.durationDays ? Math.ceil(pkg.durationDays / 30) : 1} tháng
                    </span>
                  )}
                  {(!pkg.price || pkg.price === 0) && (
                    <span className="text-sm text-gray-600 ml-2">
                      / {pkg.durationDays || 30} ngày
                    </span>
                  )}
                </div>
                {pkg.description && (
                  <p className="text-gray-600 mb-6">{pkg.description}</p>
                )}
                <div className="space-y-3 mb-6">
                  {pkg.features && Array.isArray(pkg.features) && pkg.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <i className="fas fa-check text-green-500 mt-1"></i>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleSubscribe(pkg.id)}
                  disabled={isSubscribed || hasPendingRequest}
                  className={`w-full ${
                    isSubscribed ? 'btn-secondary' : hasPendingRequest ? 'bg-yellow-500 hover:bg-yellow-600' : 'btn-primary'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Đã đăng ký
                    </>
                  ) : hasPendingRequest ? (
                    <>
                      <i className="fas fa-clock mr-2"></i>
                      Đang chờ duyệt
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Gửi yêu cầu đăng ký
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
