import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [filterRole, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminUsers(filterRole || null, page, 10);
      setUsers(data.content || []);
      setTotalPages(data.totalPages || 0);
      setTotalElements(data.totalElements || 0);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    if (!confirm(`Bạn có chắc chắn muốn thay đổi trạng thái người dùng này?`)) return;
    
    try {
      await api.updateUserStatus(userId, newStatus);
      alert('Cập nhật trạng thái thành công!');
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể cập nhật trạng thái'));
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn XÓA VĨNH VIỄN người dùng này và toàn bộ thông tin liên quan? Hành động này không thể hoàn tác!')) return;
    
    try {
      await api.deleteUser(userId);
      alert('Đã xóa người dùng thành công!');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể xóa người dùng'));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      ACTIVE: 'bg-green-100 text-green-800',
      INACTIVE: 'bg-gray-100 text-gray-800',
      SUSPENDED: 'bg-yellow-100 text-yellow-800',
      DELETED: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ACTIVE: 'Hoạt động',
      INACTIVE: 'Không hoạt động',
      SUSPENDED: 'Tạm khóa',
      DELETED: 'Đã xóa'
    };
    return labels[status] || status;
  };

  const getRoleLabel = (role) => {
    const labels = {
      STUDENT: 'Sinh viên',
      RECRUITER: 'Nhà tuyển dụng',
      ADMIN: 'Quản trị viên',
      MENTOR: 'Mentor'
    };
    return labels[role] || role;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Đang tải người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Filter */}
      <div className="card p-6 mb-6 dark:bg-gray-900 dark:border-gray-800">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Lọc theo vai trò:</label>
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setPage(0);
            }}
            className="input-field dark:bg-gray-800 dark:text-white dark:border-gray-700"
          >
            <option value="">Tất cả</option>
            <option value="STUDENT">Sinh viên</option>
            <option value="RECRUITER">Nhà tuyển dụng</option>
            <option value="ADMIN">Quản trị viên</option>
            <option value="MENTOR">Mentor</option>
          </select>
          <div className="ml-auto text-sm text-gray-600 dark:text-gray-300">
            Tổng: {totalElements} người dùng
          </div>
        </div>
      </div>

      {/* Users Table */}
      {users.length === 0 ? (
        <div className="card p-12 text-center dark:bg-gray-900 dark:border-gray-800">
          <i className="fas fa-users text-gray-400 dark:text-gray-500 text-6xl mb-4"></i>
          <p className="text-gray-600 dark:text-gray-300 text-lg">Không có người dùng nào</p>
        </div>
      ) : (
        <div className="card overflow-hidden dark:bg-gray-900 dark:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Người dùng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl.startsWith('http') 
                              ? user.avatarUrl 
                              : `http://localhost:8080/api${user.avatarUrl}`}
                            alt={user.fullName}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                            <i className="fas fa-user text-gray-400 dark:text-gray-500"></i>
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.fullName}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)} dark:bg-green-800 dark:text-green-100 dark:bg-gray-800 dark:text-gray-100 dark:bg-yellow-800 dark:text-yellow-100 dark:bg-red-800 dark:text-red-100`}>
                        {getStatusLabel(user.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className="text-sm border border-gray-300 dark:border-gray-700 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                        >
                          <option value="ACTIVE">Hoạt động</option>
                          <option value="INACTIVE">Không hoạt động</option>
                          <option value="SUSPENDED">Tạm khóa</option>
                          <option value="DELETED">Xóa</option>
                        </select>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          title="Xóa vĩnh viễn"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Trang {page + 1} / {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="btn-secondary dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="btn-secondary dark:bg-gray-800 dark:text-white dark:border-gray-700 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
