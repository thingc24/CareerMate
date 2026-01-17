import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileView() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    
    // Listen for avatar update events
    const handleAvatarUpdate = () => {
      console.log('ProfileView - Avatar update event received, reloading profile...');
      loadProfile();
    };
    
    window.addEventListener('avatarUpdated', handleAvatarUpdate);
    
    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate);
    };
  }, [location.pathname, location.state?.refresh]); // Reload when navigation occurs or refresh state changes

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Force fresh data by adding cache busting
      const data = await api.getStudentProfile(true);
      
      if (data && !data.error) {
        setProfile(data);
      } else if (data?.error) {
        console.error('Profile API error:', data.error);
        // Show error but don't crash
        setProfile(null);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      console.error('Error response:', error.response?.data);
      // If 401, redirect to login
      if (error.response?.status === 401) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = () => {
    if (profile?.avatarUrl) {
      // If it's a full URL, return as is, otherwise construct path
      let url;
      if (profile.avatarUrl.startsWith('http')) {
        url = profile.avatarUrl;
      } else {
        // Add /api prefix because context-path is /api
        if (profile.avatarUrl.startsWith('/api')) {
          url = `http://localhost:8080${profile.avatarUrl}`;
        } else {
          url = `http://localhost:8080/api${profile.avatarUrl}`;
        }
      }
      // Add cache busting timestamp to force reload
      return url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-red-600 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-red-900 mb-2">Không thể tải thông tin</h2>
          <p className="text-red-700 mb-4">Vui lòng đăng nhập lại hoặc thử lại sau.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Quay lại</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Avatar Section */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 text-center">
          <div className="relative inline-block">
            {getAvatarUrl() ? (
              <img
                src={getAvatarUrl()}
                alt="Avatar"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-white/20 flex items-center justify-center">
                <i className="fas fa-user text-white text-5xl"></i>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white mt-4">
            {user?.fullName || user?.email || 'Sinh viên'}
          </h2>
          <p className="text-blue-100 mt-1">
            {profile?.currentStatus === 'STUDENT' && 'Sinh viên'}
            {profile?.currentStatus === 'GRADUATED' && 'Đã tốt nghiệp'}
            {profile?.currentStatus === 'JOB_SEEKING' && 'Đang tìm việc'}
            {profile?.currentStatus === 'EMPLOYED' && 'Đang làm việc'}
          </p>
        </div>

        {/* Profile Information */}
        <div className="p-8 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <i className="fas fa-user-circle text-blue-600"></i>
              Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Ngày sinh</p>
                <p className="text-gray-900 dark:text-white font-medium">{formatDate(profile?.dateOfBirth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Giới tính</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {profile?.gender === 'MALE' && 'Nam'}
                  {profile?.gender === 'FEMALE' && 'Nữ'}
                  {profile?.gender === 'OTHER' && 'Khác'}
                  {!profile?.gender && 'Chưa cập nhật'}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Địa chỉ</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {profile?.address || 'Chưa cập nhật'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Thành phố</p>
                <p className="text-gray-900 dark:text-white font-medium">{profile?.city || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Quốc gia</p>
                <p className="text-gray-900 dark:text-white font-medium">{profile?.country || 'Việt Nam'}</p>
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <i className="fas fa-graduation-cap text-green-600"></i>
              Học vấn
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Trường đại học</p>
                <p className="text-gray-900 dark:text-white font-medium">{profile?.university || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Chuyên ngành</p>
                <p className="text-gray-900 dark:text-white font-medium">{profile?.major || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Năm tốt nghiệp</p>
                <p className="text-gray-900 dark:text-white font-medium">
                  {profile?.graduationYear || 'Chưa cập nhật'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">GPA</p>
                <p className="text-gray-900 dark:text-white font-medium">{profile?.gpa || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile?.bio && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="fas fa-file-alt text-purple-600"></i>
                Giới thiệu
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{profile.bio}</p>
            </div>
          )}

          {/* Social Links */}
          {(profile?.linkedinUrl || profile?.githubUrl || profile?.portfolioUrl) && (
            <div className="border-t pt-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="fas fa-share-alt text-indigo-600"></i>
                Liên kết mạng xã hội
              </h3>
              <div className="space-y-2">
                {profile?.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <i className="fab fa-linkedin"></i>
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile?.githubUrl && (
                  <a
                    href={profile.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    <i className="fab fa-github"></i>
                    <span>GitHub</span>
                  </a>
                )}
                {profile?.portfolioUrl && (
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <i className="fas fa-globe"></i>
                    <span>Portfolio</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="border-t p-6 bg-gray-50">
          <button
            onClick={() => navigate('/student/profile/edit')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
          >
            <i className="fas fa-edit"></i>
            <span>Cập nhật thông tin</span>
          </button>
        </div>
      </div>
    </div>
  );
}

