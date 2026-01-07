import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Profile() {
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
    currentStatus: 'STUDENT',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentProfile();
      if (data) {
        setProfile({
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          address: data.address || '',
          city: data.city || '',
          country: data.country || 'Việt Nam',
          university: data.university || '',
          major: data.major || '',
          graduationYear: data.graduationYear || '',
          gpa: data.gpa || '',
          bio: data.bio || '',
          linkedinUrl: data.linkedinUrl || '',
          githubUrl: data.githubUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          currentStatus: data.currentStatus || 'STUDENT',
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage('');
      await api.updateStudentProfile(profile);
      setMessage('Cập nhật hồ sơ thành công!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Lỗi: ' + (error.response?.data?.message || 'Không thể cập nhật hồ sơ'));
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Hồ sơ cá nhân
        </h1>
        <p className="text-lg text-gray-600">
          Quản lý thông tin cá nhân và học vấn của bạn
        </p>
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
