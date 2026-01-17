import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    position: '',
    department: '',
    phone: '',
    bio: '',
    fullName: '',
  });
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      // Load profile
      const profileData = await api.getRecruiterProfile();
      if (profileData) {
        setProfile({
          position: profileData.position || '',
          department: profileData.department || '',
          phone: profileData.phone || '',
          bio: profileData.bio || '',
          fullName: profileData.user?.fullName || user?.fullName || '',
        });
        
        // Set avatar from user info in response
        if (profileData.user?.avatarUrl) {
          setAvatarPreview(getAvatarUrl(profileData.user.avatarUrl));
        }
      }

      // Load company
      try {
        const companyData = await api.getMyCompany();
        setCompany(companyData);
      } catch (error) {
        // Company might not exist yet
        setCompany(null);
      }

      // Load stats
      try {
        const statsData = await api.getRecruiterDashboardStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading stats:', error);
      }

      // Set avatar preview from user
      if (user?.avatarUrl) {
        setAvatarPreview(getAvatarUrl(user.avatarUrl));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Lỗi: ' + (error.response?.data?.error || error.message || 'Không thể tải thông tin hồ sơ'));
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    if (avatarUrl.startsWith('/api')) {
      return `http://localhost:8080${avatarUrl}`;
    }
    return `http://localhost:8080/api${avatarUrl}`;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage('Chỉ chấp nhận file ảnh');
      setMessageType('error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Kích thước file không được vượt quá 5MB');
      setMessageType('error');
      return;
    }

    setUploadingAvatar(true);
    setMessage('');

    try {
      const result = await api.uploadRecruiterAvatar(file);
      if (result.avatarUrl) {
        setAvatarPreview(getAvatarUrl(result.avatarUrl));
        setMessage('Cập nhật ảnh đại diện thành công!');
        setMessageType('success');
        // Update user context if needed
        if (user) {
          user.avatarUrl = result.avatarUrl;
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage('Lỗi: ' + (error.response?.data?.error || 'Không thể tải ảnh lên'));
      setMessageType('error');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage('');
      
      // Update profile
      await api.updateRecruiterProfile({
        position: profile.position,
        department: profile.department,
        phone: profile.phone,
        bio: profile.bio
      });
      
      // Update fullName if changed
      if (profile.fullName && profile.fullName !== user?.fullName) {
        await api.updateUserFullName(profile.fullName);
        
        // Update user in localStorage and context if AuthContext supports it
        if (user) {
          const updatedUser = { ...user, fullName: profile.fullName };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          // Trigger window event to update AuthContext
          window.dispatchEvent(new CustomEvent('userUpdated', { detail: updatedUser }));
        }
      }
      
      setMessage('Cập nhật hồ sơ thành công!');
      setMessageType('success');
      setIsEditing(false);
      
      // Reload data to get latest
      await loadData();
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Lỗi: ' + (error.response?.data?.error || 'Không thể cập nhật hồ sơ'));
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadData(); // Reload to reset changes
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4">
      {/* Header */}
    

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          messageType === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
        }`}>
          <div className="flex items-center gap-2">
            <i className={`fas ${messageType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
            <span>{message}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden dark:border dark:border-gray-800">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`w-full h-full ${avatarPreview ? 'hidden' : 'flex'} items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-3xl font-bold`}
                    >
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'R'}
                    </div>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="absolute bottom-0 right-0 bg-white text-blue-600 rounded-full p-2 shadow-lg hover:bg-gray-100 transition disabled:opacity-50"
                    title="Thay đổi ảnh đại diện"
                  >
                    {uploadingAvatar ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-camera"></i>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{user?.fullName || 'Nhà tuyển dụng'}</h2>
                  <p className="text-blue-100">{user?.email || ''}</p>
                  {profile.position && (
                    <p className="text-blue-100 mt-1">
                      <i className="fas fa-briefcase mr-2"></i>
                      {profile.position}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              {!isEditing ? (
                <>
                  <div className="flex justify-end mb-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition flex items-center gap-2"
                    >
                      <i className="fas fa-edit"></i>
                      Chỉnh sửa
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Họ và tên</label>
                      <p className="text-gray-900 dark:text-white mt-1">{profile.fullName || user?.fullName || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Chức vụ</label>
                      <p className="text-gray-900 dark:text-white mt-1">{profile.position || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phòng ban</label>
                      <p className="text-gray-900 dark:text-white mt-1">{profile.department || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Số điện thoại</label>
                      <p className="text-gray-900 dark:text-white mt-1">{profile.phone || 'Chưa cập nhật'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Giới thiệu</label>
                      <p className="text-gray-900 dark:text-white mt-1 whitespace-pre-line">{profile.bio || 'Chưa cập nhật'}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Họ và tên <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={profile.fullName}
                        onChange={handleInputChange}
                        placeholder="Nhập họ và tên"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Chức vụ <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="position"
                        value={profile.position}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Trưởng phòng Tuyển dụng"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phòng ban
                      </label>
                      <input
                        type="text"
                        name="department"
                        value={profile.department}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: Phòng Nhân sự"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profile.phone}
                        onChange={handleInputChange}
                        placeholder="Ví dụ: 0123456789"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Giới thiệu
                      </label>
                      <textarea
                        name="bio"
                        value={profile.bio}
                        onChange={handleInputChange}
                        rows={5}
                        placeholder="Giới thiệu về bản thân..."
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          <span>Đang lưu...</span>
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          <span>Lưu thay đổi</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition disabled:opacity-50"
                    >
                      Hủy
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Company & Stats */}
        <div className="space-y-6">
          {/* Company Card */}
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden dark:border dark:border-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <i className="fas fa-building text-blue-600 dark:text-blue-400"></i>
                Thông tin công ty
              </h3>
            </div>
            <div className="p-6">
              {company ? (
                <>
                  <div className="text-center mb-4">
                    {company.logoUrl ? (
                      <img
                        src={getAvatarUrl(company.logoUrl)}
                        alt={company.name}
                        className="w-20 h-20 rounded-lg mx-auto object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-lg mx-auto bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl">
                        <i className="fas fa-building"></i>
                      </div>
                    )}
                    <h4 className="font-bold text-gray-900 dark:text-white mt-2">{company.name}</h4>
                    {company.industry && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{company.industry}</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate('/recruiter/company/view')}
                    className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-eye"></i>
                    Xem chi tiết
                  </button>
                </>
              ) : (
                <>
                  <div className="text-center py-4">
                    <i className="fas fa-building text-gray-400 dark:text-gray-500 text-4xl mb-3"></i>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Chưa có thông tin công ty</p>
                    <button
                      onClick={() => navigate('/recruiter/company/edit')}
                      className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-plus"></i>
                      Tạo thông tin công ty
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats Card */}
          {stats && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden dark:border dark:border-gray-800">
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <i className="fas fa-chart-bar text-green-600 dark:text-green-400"></i>
                  Thống kê
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                      <i className="fas fa-briefcase"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Việc làm đang hoạt động</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.activeJobs || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center text-white">
                      <i className="fas fa-file-alt"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Ứng viên mới</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.newApplications || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                      <i className="fas fa-calendar-check"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Phỏng vấn sắp tới</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.upcomingInterviews || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white">
                      <i className="fas fa-user-check"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Tuyển dụng thành công</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{stats.successfulHires || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
