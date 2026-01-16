import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ProfileEdit() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    country: 'Việt Nam',
    university: '',
    major: '',
    graduationYear: '',
    gpa: '',
    bio: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    avatarUrl: '',
    currentStatus: 'STUDENT',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [message, setMessage] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setMessage('');
      // Force refresh to get latest data from database
      const data = await api.getStudentProfile(true);
      console.log('ProfileEdit - Loaded data from server:', data);
      if (data && !data.error) {
        const newProfile = {
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || 'Vietnam',
          university: data.university || '',
          major: data.major || '',
          graduationYear: data.graduationYear ? String(data.graduationYear) : '',
          gpa: data.gpa ? String(data.gpa) : '',
          bio: data.bio || '',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          avatarUrl: data.avatarUrl || '',
          currentStatus: data.currentStatus || 'STUDENT',
        };
        console.log('ProfileEdit - Setting profile state:', newProfile);
        setProfile(newProfile);
        if (data.avatarUrl) {
          setAvatarPreview(getAvatarUrl(data.avatarUrl));
        }
      } else if (data?.error) {
        setMessage('Lỗi: ' + data.error);
        console.error('Profile API error:', data.error);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Không thể tải thông tin hồ sơ';
      setMessage('Lỗi: ' + errorMsg);
      
      // If 401, redirect to login
      if (error.response?.status === 401) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    // Add /api prefix because context-path is /api
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
      setMessage('Lỗi: Chỉ chấp nhận file ảnh');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage('Lỗi: Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      setMessage('');

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload avatar
      const response = await api.uploadAvatar(file);
      if (response && response.avatarUrl) {
        // Update profile state with new avatar URL
        setProfile(prev => ({ ...prev, avatarUrl: response.avatarUrl }));
        // Update preview
        setAvatarPreview(getAvatarUrl(response.avatarUrl));
        setMessage('Cập nhật ảnh đại diện thành công!');
        
        // Trigger avatar reload in StudentLayout
        window.dispatchEvent(new CustomEvent('avatarUpdated', { 
          detail: { avatarUrl: response.avatarUrl } 
        }));
        
        // Reload profile to get updated data
        setTimeout(() => {
          loadProfile();
        }, 500);
      } else {
        setMessage('Cập nhật ảnh đại diện thành công!');
        // Trigger avatar reload anyway
        window.dispatchEvent(new CustomEvent('avatarUpdated'));
        // Reload profile anyway
        setTimeout(() => {
          loadProfile();
        }, 500);
      }
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Lỗi: ' + (error.response?.data?.error || 'Không thể tải ảnh lên'));
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      
      // Prepare data - convert empty strings to null for optional fields
      const profileData = {
        dateOfBirth: profile.dateOfBirth && profile.dateOfBirth.trim() !== '' ? profile.dateOfBirth : null,
        gender: profile.gender && profile.gender.trim() !== '' ? profile.gender : null,
        address: profile.address && profile.address.trim() !== '' ? profile.address : null,
        city: profile.city && profile.city.trim() !== '' ? profile.city : null,
        country: profile.country && profile.country.trim() !== '' ? profile.country : 'Vietnam',
        university: profile.university && profile.university.trim() !== '' ? profile.university : null,
        major: profile.major && profile.major.trim() !== '' ? profile.major : null,
        graduationYear: profile.graduationYear && profile.graduationYear.toString().trim() !== '' 
          ? parseInt(profile.graduationYear) : null,
        gpa: profile.gpa && profile.gpa.toString().trim() !== '' 
          ? parseFloat(profile.gpa) : null,
        bio: profile.bio && profile.bio.trim() !== '' ? profile.bio : null,
        linkedinUrl: profile.linkedinUrl && profile.linkedinUrl.trim() !== '' ? profile.linkedinUrl : null,
        githubUrl: profile.githubUrl && profile.githubUrl.trim() !== '' ? profile.githubUrl : null,
        portfolioUrl: profile.portfolioUrl && profile.portfolioUrl.trim() !== '' ? profile.portfolioUrl : null,
        avatarUrl: profile.avatarUrl && profile.avatarUrl.trim() !== '' ? profile.avatarUrl : null,
        currentStatus: profile.currentStatus && profile.currentStatus.trim() !== '' ? profile.currentStatus : 'STUDENT',
      };
      
      console.log('Sending profile update:', profileData);
      console.log('Profile data details:', {
        gender: profileData.gender,
        address: profileData.address,
        city: profileData.city,
        university: profileData.university,
        major: profileData.major
      });
      
      const response = await api.updateStudentProfile(profileData);
      console.log('Profile update response:', response);
      
      if (response && response.error) {
        throw new Error(response.error);
      }
      
      setMessage(response.message || 'Cập nhật hồ sơ thành công!');
      
      // Update state immediately with response data
      if (response && !response.error) {
        console.log('Updating profile state with response:', response);
        setProfile({
          dateOfBirth: response.dateOfBirth || '',
          gender: response.gender || '',
          address: response.address || '',
          city: response.city || '',
          country: response.country || 'Vietnam',
          university: response.university || '',
          major: response.major || '',
          graduationYear: response.graduationYear ? String(response.graduationYear) : '',
          gpa: response.gpa ? String(response.gpa) : '',
          bio: response.bio || '',
          linkedinUrl: response.linkedinUrl || '',
          githubUrl: response.githubUrl || '',
          portfolioUrl: response.portfolioUrl || '',
          avatarUrl: response.avatarUrl || '',
          currentStatus: response.currentStatus || 'STUDENT',
        });
        if (response.avatarUrl) {
          setAvatarPreview(getAvatarUrl(response.avatarUrl));
        }
      }
      
      // Force reload from server to ensure we have latest data
      console.log('Reloading profile from server after update...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms for backend to finish
      const freshData = await api.getStudentProfile(true); // Force refresh with cache busting
      console.log('Fresh profile data after update:', freshData);
      
      if (freshData && !freshData.error) {
        // Update state with fresh data
        setProfile({
          dateOfBirth: freshData.dateOfBirth || '',
          gender: freshData.gender || '',
          address: freshData.address || '',
          city: freshData.city || '',
          country: freshData.country || 'Vietnam',
          university: freshData.university || '',
          major: freshData.major || '',
          graduationYear: freshData.graduationYear ? String(freshData.graduationYear) : '',
          gpa: freshData.gpa ? String(freshData.gpa) : '',
          bio: freshData.bio || '',
          linkedinUrl: freshData.linkedinUrl || '',
          githubUrl: freshData.githubUrl || '',
          portfolioUrl: freshData.portfolioUrl || '',
          avatarUrl: freshData.avatarUrl || '',
          currentStatus: freshData.currentStatus || 'STUDENT',
        });
        if (freshData.avatarUrl) {
          setAvatarPreview(getAvatarUrl(freshData.avatarUrl));
        }
        console.log('Profile state updated with fresh data');
      }
      
      setTimeout(() => {
        setMessage('');
        // Navigate to view page with refresh state to force reload
        navigate('/student/profile/view', { 
          replace: true, 
          state: { refresh: Date.now() } 
        });
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response data:', error.response?.data);
      const errorMessage = error.message || error.response?.data?.error || 'Không thể cập nhật hồ sơ';
      setMessage('Lỗi: ' + errorMessage);
      
      // If 401, redirect to login
      if (error.response?.status === 401) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  // Show error state if profile failed to load
  if (!profile || Object.keys(profile).length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <i className="fas fa-exclamation-circle text-red-600 text-4xl mb-4"></i>
          <h2 className="text-xl font-bold text-red-900 mb-2">Không thể tải hồ sơ</h2>
          <p className="text-red-700 mb-4">{message || 'Vui lòng đăng nhập lại hoặc thử lại sau.'}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={loadProfile}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <i className="fas fa-redo mr-2"></i>Thử lại
            </button>
            <button
              onClick={() => window.location.href = '/login'}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Đăng nhập lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/student/profile/view')}
          className="mb-4 text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Quay lại</span>
        </button>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-xl border-2 animate-slide-up ${
            message.includes('Lỗi')
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-green-50 border-green-200 text-green-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <i className={`fas ${message.includes('Lỗi') ? 'fa-exclamation-circle' : 'fa-check-circle'} text-xl`}></i>
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Avatar Upload */}
          <div className="card p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <i className="fas fa-image text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Ảnh đại diện</h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center">
                    <i className="fas fa-user text-gray-400 text-4xl"></i>
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
                >
                  <i className="fas fa-upload"></i>
                  <span>{uploadingAvatar ? 'Đang tải...' : 'Chọn ảnh'}</span>
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Chấp nhận: JPG, PNG, GIF (tối đa 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="card p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <i className="fas fa-user text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-calendar text-gray-400 mr-2"></i>
                  Ngày sinh
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profile.dateOfBirth}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-venus-mars text-gray-400 mr-2"></i>
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Số nhà, đường..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-city text-gray-400 mr-2"></i>
                  Thành phố
                </label>
                <input
                  type="text"
                  name="city"
                  value={profile.city}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Hà Nội, TP.HCM..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-flag text-gray-400 mr-2"></i>
                  Quốc gia
                </label>
                <input
                  type="text"
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Education */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <i className="fas fa-graduation-cap text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Học vấn</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-university text-gray-400 mr-2"></i>
                  Trường đại học
                </label>
                <input
                  type="text"
                  name="university"
                  value={profile.university}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Tên trường đại học"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-book text-gray-400 mr-2"></i>
                  Chuyên ngành
                </label>
                <input
                  type="text"
                  name="major"
                  value={profile.major}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Công nghệ thông tin, Kinh tế..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-calendar-check text-gray-400 mr-2"></i>
                  Năm tốt nghiệp
                </label>
                <input
                  type="number"
                  name="graduationYear"
                  value={profile.graduationYear}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="2024"
                  min="2000"
                  max="2100"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-star text-gray-400 mr-2"></i>
                  Điểm GPA
                </label>
                <input
                  type="number"
                  name="gpa"
                  value={profile.gpa}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="4"
                  className="input-field"
                  placeholder="3.5"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <i className="fas fa-file-alt text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Giới thiệu</h2>
            </div>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows="5"
              className="input-field resize-none"
              placeholder="Giới thiệu về bản thân, kinh nghiệm, mục tiêu nghề nghiệp..."
            />
          </div>

          {/* Social Links */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <i className="fas fa-share-alt text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Liên kết mạng xã hội</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fab fa-linkedin text-blue-600 mr-2"></i>
                  LinkedIn
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={profile.linkedinUrl}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fab fa-github text-gray-900 mr-2"></i>
                  GitHub
                </label>
                <input
                  type="url"
                  name="githubUrl"
                  value={profile.githubUrl}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <i className="fas fa-globe text-blue-600 mr-2"></i>
                  Portfolio
                </label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={profile.portfolioUrl}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <i className="fas fa-info-circle text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Tình trạng hiện tại</h2>
            </div>
            <select
              name="currentStatus"
              value={profile.currentStatus}
              onChange={handleChange}
              className="input-field"
            >
              <option value="STUDENT">Sinh viên</option>
              <option value="GRADUATED">Đã tốt nghiệp</option>
              <option value="JOB_SEEKING">Đang tìm việc</option>
              <option value="EMPLOYED">Đang làm việc</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '500ms' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1"
            >
              {saving ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Đang lưu...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Lưu thay đổi
                </>
              )}
            </button>
            <button
              type="button"
              onClick={loadProfile}
              className="btn-secondary"
            >
              <i className="fas fa-redo mr-2"></i>
              Hủy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
