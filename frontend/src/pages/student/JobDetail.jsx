import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [cvs, setCvs] = useState([]);
  const [selectedCV, setSelectedCV] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);

  useEffect(() => {
    loadJob();
    loadCVs();
    checkApplication();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const data = await api.getJobById(id);
      setJob(data);
    } catch (error) {
      console.error('Error loading job:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCVs = async () => {
    try {
      const data = await api.getCVs();
      setCvs(data || []);
      if (data && data.length > 0) {
        setSelectedCV(data[0].id);
      }
    } catch (error) {
      console.error('Error loading CVs:', error);
    }
  };

  const checkApplication = async () => {
    try {
      const data = await api.checkApplication(id);
      if (data.applied) {
        setHasApplied(true);
        setApplicationStatus(data.status);
      }
    } catch (error) {
      console.error('Error checking application:', error);
    }
  };

  const handleApply = async () => {
    if (!selectedCV && cvs.length > 0) {
      alert('Vui lòng chọn CV');
      return;
    }

    try {
      setApplying(true);
      await api.applyForJob(id, selectedCV || null, coverLetter);
      alert('Ứng tuyển thành công!');
      navigate('/student/applications');
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Không thể ứng tuyển';
      alert('Lỗi: ' + errorMessage);
      // If already applied, redirect to applications page
      if (errorMessage.includes('Already applied') || errorMessage.includes('đã ứng tuyển')) {
        setTimeout(() => navigate('/student/applications'), 1500);
      }
    } finally {
      setApplying(false);
    }
  };

  const formatCurrency = (amount, currency = 'VND') => {
    if (!amount) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: currency || 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải thông tin việc làm...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-12 text-center">
          <div className="inline-flex h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center mb-6">
            <i className="fas fa-briefcase text-gray-400 text-4xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy việc làm</h3>
          <p className="text-gray-600 mb-6">Việc làm này có thể đã bị xóa hoặc không tồn tại</p>
          <button
            onClick={() => navigate('/student/jobs')}
            className="btn-primary"
          >
            <i className="fas fa-arrow-left mr-2"></i>
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 animate-fade-in">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/jobs')}
        className="mb-6 text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
      >
        <i className="fas fa-arrow-left"></i>
        Quay lại danh sách việc làm
      </button>

      {/* Job Header */}
      <div className="card p-8 mb-6 animate-slide-up">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{job.title}</h1>
            <p className="text-2xl text-gray-600 mb-4 font-medium">{job.company?.name || 'Công ty'}</p>
            <div className="flex flex-wrap gap-4 text-base text-gray-600">
              <span className="flex items-center">
                <i className="fas fa-map-marker-alt text-gray-400 mr-2"></i>
                {job.location}
              </span>
              <span className="flex items-center">
                <i className="fas fa-dollar-sign text-gray-400 mr-2"></i>
                {formatCurrency(job.minSalary, job.currency)}
                {job.maxSalary && ` - ${formatCurrency(job.maxSalary, job.currency)}`}
              </span>
              <span className="flex items-center">
                <i className="fas fa-briefcase text-gray-400 mr-2"></i>
                {job.jobType || 'Full-time'}
              </span>
              {job.experienceLevel && (
                <span className="flex items-center">
                  <i className="fas fa-user-graduate text-gray-400 mr-2"></i>
                  {job.experienceLevel}
                </span>
              )}
            </div>
          </div>
          <span className={`badge ${job.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
            {job.status === 'ACTIVE' ? 'Đang tuyển' : 'Đã đóng'}
          </span>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Kỹ năng yêu cầu:</h3>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="badge badge-info"
                >
                  {skill.skillName || skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <i className="fas fa-file-alt text-white"></i>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Mô tả công việc</h2>
            </div>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.description}</p>
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div className="card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <i className="fas fa-clipboard-check text-white"></i>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Yêu cầu ứng viên</h2>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">{job.requirements}</p>
              </div>
            </div>
          )}
        </div>

        {/* Apply Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 sticky top-4 animate-slide-up" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <i className="fas fa-paper-plane text-white"></i>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Ứng tuyển</h2>
            </div>
            
            {hasApplied ? (
              <div className="text-center py-6">
                <div className="inline-flex h-16 w-16 rounded-full bg-green-100 items-center justify-center mb-4">
                  <i className="fas fa-check-circle text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Đã ứng tuyển</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Trạng thái: <span className="font-semibold">
                    {applicationStatus === 'PENDING' && 'Đang chờ'}
                    {applicationStatus === 'VIEWED' && 'Đã xem'}
                    {applicationStatus === 'SHORTLISTED' && 'Đã chọn'}
                    {applicationStatus === 'INTERVIEW' && 'Phỏng vấn'}
                    {applicationStatus === 'OFFERED' && 'Đã đề xuất'}
                    {applicationStatus === 'REJECTED' && 'Đã từ chối'}
                    {applicationStatus === 'WITHDRAWN' && 'Đã hủy'}
                    {!applicationStatus && 'Đang xử lý'}
                  </span>
                </p>
                <button
                  onClick={() => navigate('/student/applications')}
                  className="btn-secondary w-full"
                >
                  <i className="fas fa-list mr-2"></i>
                  Xem đơn ứng tuyển
                </button>
              </div>
            ) : cvs.length === 0 ? (
              <div className="text-center py-6">
                <div className="inline-flex h-16 w-16 rounded-full bg-gray-100 items-center justify-center mb-4">
                  <i className="fas fa-file-pdf text-gray-400 text-2xl"></i>
                </div>
                <p className="text-sm text-gray-600 mb-4">Bạn chưa có CV nào</p>
                <button
                  onClick={() => navigate('/student/cv')}
                  className="btn-primary w-full"
                >
                  <i className="fas fa-upload mr-2"></i>
                  Tải CV ngay
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-file-pdf text-gray-400 mr-2"></i>
                    Chọn CV
                  </label>
                  <select
                    className="input-field"
                    value={selectedCV}
                    onChange={(e) => setSelectedCV(e.target.value)}
                  >
                    {cvs.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.fileName || `CV ${cv.id?.substring(0, 8) || 'Unknown'}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-envelope text-gray-400 mr-2"></i>
                    Thư xin việc (tùy chọn)
                  </label>
                  <textarea
                    rows="5"
                    className="input-field resize-none"
                    placeholder="Viết thư xin việc của bạn..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleApply}
                  disabled={applying || !selectedCV}
                  className="btn-primary w-full"
                >
                  {applying ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane mr-2"></i>
                      Ứng tuyển ngay
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Job Info Card */}
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Thông tin việc làm</h3>
            <div className="space-y-3 text-sm">
              {job.createdAt && (
                <div className="flex items-center text-gray-600">
                  <i className="far fa-calendar text-gray-400 mr-3 w-5"></i>
                  <span>Đăng ngày: {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
              {job.expiresAt && (
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-clock text-gray-400 mr-3 w-5"></i>
                  <span>Hết hạn: {new Date(job.expiresAt).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
              {job.viewsCount !== undefined && (
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-eye text-gray-400 mr-3 w-5"></i>
                  <span>{job.viewsCount} lượt xem</span>
                </div>
              )}
              {job.applicationsCount !== undefined && (
                <div className="flex items-center text-gray-600">
                  <i className="fas fa-users text-gray-400 mr-3 w-5"></i>
                  <span>{job.applicationsCount} ứng viên</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
