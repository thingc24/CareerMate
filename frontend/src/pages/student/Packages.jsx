import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Packages() {
  const [packages, setPackages] = useState([]);
  const [mySubscription, setMySubscription] = useState(null);
  const [mySubscriptions, setMySubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [pkgs, sub, subs] = await Promise.all([
        api.getPackages().catch(() => []),
        api.getMySubscription().catch(() => null),
        api.getMySubscriptions().catch(() => [])
      ]);
      setPackages(Array.isArray(pkgs) ? pkgs : []);
      setMySubscription(sub);
      setMySubscriptions(Array.isArray(subs) ? subs : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (packageId) => {
    if (!window.confirm('Bạn có chắc muốn đăng ký gói này?')) return;
    try {
      await api.requestSubscription(packageId);
      alert('Đã gửi yêu cầu đăng ký!');
      loadData();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể đăng ký'));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusColor = (status) => {
    const map = {
      ACTIVE: 'bg-green-100 text-green-700 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      EXPIRED: 'bg-gray-100 text-gray-500 border-gray-200',
      REJECTED: 'bg-red-100 text-red-700 border-red-200'
    };
    return map[status] || 'bg-gray-100 text-gray-700';
  };

  const featuresList = [
    { name: 'Tạo CV không giới hạn', free: false, pro: true, premium: true },
    { name: 'Mẫu CV cao cấp', free: false, pro: true, premium: true },
    { name: 'AI Phân tích CV chi tiết', free: false, pro: true, premium: true },
    { name: 'AI Luyện tập phỏng vấn', free: false, pro: false, premium: true },
    { name: 'Đẩy bài đăng tuyển dụng', free: false, pro: false, premium: true },
    { name: 'Huy hiệu hồ sơ nổi bật', free: false, pro: false, premium: true },
    { name: 'Hỗ trợ 24/7', free: false, pro: true, premium: true },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // No mock data - rely on API
  const displayPackages = packages;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">

      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
          Nâng cấp sự nghiệp của bạn
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Mở khóa toàn bộ tiềm năng với các gói dịch vụ cao cấp. Đầu tư cho tương lai ngay hôm nay.
        </p>

        {/* Billing Toggle */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>Tháng</span>
          <button
            onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-8 rounded-full bg-gray-200 dark:bg-gray-700 p-1 relative transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6' : ''}`}></div>
          </button>
          <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
            Năm <span className="text-xs text-green-500 font-bold ml-1">-20%</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {displayPackages.map((pkg, idx) => {
          const isActive = mySubscription?.packageEntity?.id === pkg.id;
          const isPopular = pkg.name === 'Pro' || pkg.name === 'Premium'; // Mock logic for visual
          const isPremium = pkg.name === 'Premium';

          return (
            <div
              key={pkg.id}
              className={`relative rounded-3xl p-8 transition-all duration-300 transform hover:-translate-y-2 ${isPopular
                ? 'bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl border-2 border-gray-700 scale-105 z-10'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl'
                }`}
            >
              {isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg tracking-wider uppercase">
                  Phổ biến nhất
                </div>
              )}

              <h3 className={`text-xl font-bold mb-2 ${isPopular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {pkg.name}
              </h3>
              <p className={`text-sm mb-6 ${isPopular ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                {pkg.description}
              </p>

              <div className="mb-8">
                <span className="text-4xl font-extrabold">
                  {pkg.price === 0 ? 'Miễn phí' : formatCurrency(pkg.price)}
                </span>
                {pkg.price > 0 && <span className={`text-sm ${isPopular ? 'text-gray-400' : 'text-gray-500'}`}>/tháng</span>}
              </div>

              <button
                onClick={() => handleSubscribe(pkg.id)}
                disabled={isActive}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 ${isActive
                  ? 'bg-green-500 text-white cursor-default'
                  : isPopular
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                  }`}
              >
                {isActive ? 'Đang sử dụng' : pkg.price === 0 ? 'Bắt đầu miễn phí' : 'Đăng ký ngay'}
              </button>

              <div className="mt-8 space-y-4">
                <p className={`text-xs font-bold uppercase tracking-wider ${isPopular ? 'text-gray-400' : 'text-gray-500'}`}>
                  Tính năng
                </p>
                <ul className="space-y-3">
                  {pkg.features?.map((ft, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isPopular ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        }`}>
                        <i className="fas fa-check text-xs"></i>
                      </div>
                      <span className={`text-sm ${isPopular ? 'text-gray-300' : 'text-gray-600 dark:text-gray-300'}`}>
                        {ft}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Comparison Table */}
      <div className="mt-20">
        <h2 className="text-2xl font-bold text-center mb-10 dark:text-white">So sánh chi tiết tính năng</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-tl-xl text-gray-500 font-medium text-sm">Tính năng</th>
                <th className="p-4 border-b dark:border-gray-700 text-center font-bold dark:text-white">Free</th>
                <th className="p-4 border-b dark:border-gray-700 text-center font-bold text-blue-600">Pro</th>
                <th className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-tr-xl text-center font-bold text-purple-600">Premium</th>
              </tr>
            </thead>
            <tbody>
              {featuresList.map((feature, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b dark:border-gray-800 last:border-0">
                  <td className="p-4 text-sm font-medium text-gray-700 dark:text-gray-300">{feature.name}</td>
                  <td className="p-4 text-center">
                    {feature.free ? <i className="fas fa-check-circle text-green-500"></i> : <i className="fas fa-minus text-gray-300"></i>}
                  </td>
                  <td className="p-4 text-center">
                    {feature.pro ? <i className="fas fa-check-circle text-green-500"></i> : <i className="fas fa-minus text-gray-300"></i>}
                  </td>
                  <td className="p-4 text-center">
                    {feature.premium ? <i className="fas fa-check-circle text-purple-500 text-lg shadow-purple-500/20 drop-shadow-sm"></i> : <i className="fas fa-minus text-gray-300"></i>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ or Trust Badges could go here */}
    </div>
  );
}
