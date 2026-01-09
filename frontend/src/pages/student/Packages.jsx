import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
    loadMySubscription();
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
      console.error('Error loading subscription:', error);
    }
  };

  const handleSubscribe = async (packageId) => {
    if (!window.confirm('Bạn có chắc muốn đăng ký gói này?')) {
      return;
    }
    try {
      await api.subscribePackage(packageId);
      alert('Đăng ký thành công!');
      loadMySubscription();
      loadPackages();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể đăng ký gói'));
    }
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Gói dịch vụ</h1>
        <p className="text-lg text-gray-600">Nâng cấp tài khoản để trải nghiệm đầy đủ tính năng</p>
      </div>

      {/* Current Subscription */}
      {mySubscription && (
        <div className="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Gói hiện tại</h2>
              <p className="text-gray-700">
                {mySubscription.package?.name || 'Gói Premium'}
              </p>
              {mySubscription.expiresAt && (
                <p className="text-sm text-gray-600 mt-1">
                  Hết hạn: {new Date(mySubscription.expiresAt).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
            <span className="badge badge-success text-lg px-4 py-2">
              Đang hoạt động
            </span>
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
            const isSubscribed = mySubscription?.package?.id === pkg.id;
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
                  {pkg.price && (
                    <span className="text-gray-600">
                      /{pkg.durationMonths || 1} tháng
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
                  disabled={isSubscribed}
                  className={`w-full ${
                    isSubscribed ? 'btn-secondary' : 'btn-primary'
                  }`}
                >
                  {isSubscribed ? (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Đã đăng ký
                    </>
                  ) : (
                    <>
                      <i className="fas fa-shopping-cart mr-2"></i>
                      Đăng ký ngay
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
