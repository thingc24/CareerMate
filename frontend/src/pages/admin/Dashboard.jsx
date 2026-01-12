import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
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

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">Không thể tải dữ liệu dashboard</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Tổng người dùng',
      value: stats.totalUsers,
      icon: 'fa-users',
      color: 'blue',
      link: '/admin/users',
      detail: `${stats.totalStudents} sinh viên, ${stats.totalRecruiters} nhà tuyển dụng, ${stats.totalAdmins} admin`
    },
    {
      title: 'Tin tuyển dụng',
      value: stats.totalJobs,
      icon: 'fa-briefcase',
      color: 'green',
      link: '/admin/jobs',
      detail: `${stats.activeJobs} đang hoạt động, ${stats.pendingJobs} chờ duyệt`
    },
    {
      title: 'Đơn ứng tuyển',
      value: stats.totalApplications,
      icon: 'fa-file-alt',
      color: 'purple',
      link: null,
      detail: 'Tổng số đơn ứng tuyển'
    },
    {
      title: 'Công ty',
      value: stats.totalCompanies,
      icon: 'fa-building',
      color: 'orange',
      link: null,
      detail: 'Tổng số công ty đã đăng ký'
    },
    {
      title: 'Bài viết',
      value: stats.totalArticles,
      icon: 'fa-newspaper',
      color: 'indigo',
      link: '/admin/articles',
      detail: `${stats.publishedArticles} đã xuất bản, ${stats.pendingArticles} chờ duyệt`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-lg text-gray-600">Tổng quan hệ thống CareerMate</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div
            key={index}
            className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer ${
              card.link ? 'hover:scale-105' : ''
            }`}
            onClick={() => card.link && navigate(card.link)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                <i className={`fas ${card.icon} text-${card.color}-600 text-2xl`}></i>
              </div>
              {card.link && (
                <i className="fas fa-arrow-right text-gray-400"></i>
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{card.title}</h3>
            <p className="text-4xl font-bold text-gray-900 mb-2">{card.value.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{card.detail}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/jobs?status=PENDING')}
            className="flex items-center gap-3 p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition"
          >
            <i className="fas fa-clock text-yellow-600 text-xl"></i>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Duyệt tin tuyển dụng</div>
              <div className="text-sm text-gray-500">{stats.pendingJobs} tin chờ duyệt</div>
            </div>
          </button>
          <button
            onClick={() => navigate('/admin/articles?status=PENDING')}
            className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition"
          >
            <i className="fas fa-newspaper text-blue-600 text-xl"></i>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Duyệt bài viết</div>
              <div className="text-sm text-gray-500">{stats.pendingArticles} bài chờ duyệt</div>
            </div>
          </button>
          <button
            onClick={() => navigate('/admin/users')}
            className="flex items-center gap-3 p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition"
          >
            <i className="fas fa-users-cog text-purple-600 text-xl"></i>
            <div className="text-left">
              <div className="font-semibold text-gray-900">Quản lý người dùng</div>
              <div className="text-sm text-gray-500">{stats.totalUsers} người dùng</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
