import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function PostJob() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    jobType: 'FULL_TIME',
    experienceLevel: '',
    minSalary: '',
    maxSalary: '',
    expiresAt: '',
    requiredSkills: '',
    optionalSkills: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const requiredSkills = formData.requiredSkills
        .split(',')
        .map(s => s.trim())
        .filter(s => s);
      
      const optionalSkills = formData.optionalSkills
        .split(',')
        .map(s => s.trim())
        .filter(s => s);

      const jobData = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        location: formData.location,
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel || null,
        minSalary: formData.minSalary ? parseFloat(formData.minSalary) * 1000000 : null,
        maxSalary: formData.maxSalary ? parseFloat(formData.maxSalary) * 1000000 : null,
        currency: 'VND',
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
      };

      await api.createJob(jobData, requiredSkills, optionalSkills);
      alert('Đăng tin thành công! Tin đăng đang chờ duyệt từ admin.');
      navigate('/recruiter/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Không thể đăng tin';
      
      if (errorMessage.includes('company')) {
        const shouldCreate = confirm(
          'Bạn chưa có thông tin công ty.\n\n' +
          'Bạn cần tạo thông tin công ty trước khi đăng tin tuyển dụng.\n\n' +
          'Bấm OK để chuyển đến trang tạo thông tin công ty.'
        );
        if (shouldCreate) {
          navigate('/recruiter/company');
        }
      } else {
        alert('Lỗi: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Đăng tin tuyển dụng mới</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề công việc *
          </label>
          <input
            type="text"
            name="title"
            required
            placeholder="VD: Backend Developer (Java/Spring Boot)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Địa điểm *</label>
            <select
              name="location"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.location}
              onChange={handleChange}
            >
              <option value="">Chọn địa điểm</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Khác">Khác</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mức lương (triệu VND)</label>
            <div className="flex gap-2">
              <input
                type="number"
                name="minSalary"
                placeholder="Từ"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.minSalary}
                onChange={handleChange}
              />
              <input
                type="number"
                name="maxSalary"
                placeholder="Đến"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.maxSalary}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kinh nghiệm yêu cầu</label>
          <select
            name="experienceLevel"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.experienceLevel}
            onChange={handleChange}
          >
            <option value="">Không yêu cầu</option>
            <option value="ENTRY">Fresher / Entry Level</option>
            <option value="JUNIOR">Junior (1-2 năm)</option>
            <option value="MID">Mid Level (2-5 năm)</option>
            <option value="SENIOR">Senior (Trên 5 năm)</option>
            <option value="LEAD">Lead</option>
            <option value="EXPERT">Expert</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Loại công việc</label>
          <select
            name="jobType"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.jobType}
            onChange={handleChange}
          >
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Hợp đồng</option>
            <option value="INTERNSHIP">Thực tập</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả công việc *</label>
          <textarea
            name="description"
            rows="6"
            required
            placeholder="Mô tả chi tiết về công việc, trách nhiệm..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Yêu cầu ứng viên</label>
          <textarea
            name="requirements"
            rows="4"
            placeholder="Các yêu cầu cụ thể về trình độ, kỹ năng..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.requirements}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kỹ năng yêu cầu (phân cách bằng dấu phẩy) *
          </label>
          <input
            type="text"
            name="requiredSkills"
            required
            placeholder="VD: Java, Spring Boot, MySQL"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.requiredSkills}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-500 mt-1">Các kỹ năng bắt buộc ứng viên phải có</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Kỹ năng ưu tiên (tùy chọn)</label>
          <input
            type="text"
            name="optionalSkills"
            placeholder="VD: Docker, Kubernetes, AWS"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.optionalSkills}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-500 mt-1">Các kỹ năng sẽ được ưu tiên nhưng không bắt buộc</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hết hạn</label>
            <input
              type="date"
              name="expiresAt"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.expiresAt}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Đang đăng tin...' : 'Đăng tin ngay'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/recruiter/dashboard')}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
