import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải phân tích...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">Không thể tải dữ liệu phân tích</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Phân Tích & Báo Cáo</h1>
        <p className="text-lg text-gray-600">Thống kê và phân tích hệ thống</p>
      </div>

      {/* User Analytics */}
      <div className="card p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Phân Tích Người Dùng</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Người dùng mới (30 ngày)</p>
            <p className="text-3xl font-bold text-blue-600">{analytics.newUsersLast30Days}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Người dùng mới (7 ngày)</p>
            <p className="text-3xl font-bold text-green-600">{analytics.newUsersLast7Days}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Tổng người dùng</p>
            <p className="text-3xl font-bold text-purple-600">
              {Object.values(analytics.usersByRole || {}).reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </div>
        {analytics.usersByRole && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phân bố theo vai trò</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(analytics.usersByRole).map(([role, count]) => (
                <div key={role} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{role}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Job Analytics */}
      <div className="card p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Phân Tích Tin Tuyển Dụng</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Tin mới (30 ngày)</p>
            <p className="text-3xl font-bold text-blue-600">{analytics.newJobsLast30Days}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Tin mới (7 ngày)</p>
            <p className="text-3xl font-bold text-green-600">{analytics.newJobsLast7Days}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Tổng tin tuyển dụng</p>
            <p className="text-3xl font-bold text-purple-600">
              {Object.values(analytics.jobsByStatus || {}).reduce((a, b) => a + b, 0)}
            </p>
          </div>
        </div>
        {analytics.jobsByStatus && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phân bố theo trạng thái</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(analytics.jobsByStatus).map(([status, count]) => (
                <div key={status} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{status}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Application Analytics */}
      <div className="card p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Phân Tích Đơn Ứng Tuyển</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Đơn mới (30 ngày)</p>
            <p className="text-3xl font-bold text-blue-600">{analytics.newApplicationsLast30Days}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Đơn mới (7 ngày)</p>
            <p className="text-3xl font-bold text-green-600">{analytics.newApplicationsLast7Days}</p>
          </div>
        </div>
      </div>

      {/* Skills in Demand */}
      {analytics.topSkillsInDemand && analytics.topSkillsInDemand.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Kỹ Năng Được Yêu Cầu Nhiều Nhất</h2>
          <div className="space-y-2">
            {analytics.topSkillsInDemand.map((skill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-blue-600">#{index + 1}</span>
                  <span className="text-lg font-semibold text-gray-900">{skill.skillName}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Số tin tuyển dụng</p>
                  <p className="text-xl font-bold text-gray-900">{skill.jobCount}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
