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

  useEffect(() => {
    loadJob();
    loadCVs();
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

  const handleApply = async () => {
    if (!selectedCV) {
      alert('Vui lòng chọn CV');
      return;
    }

    try {
      setApplying(true);
      await api.applyForJob(id, selectedCV, coverLetter);
      alert('Ứng tuyển thành công!');
      navigate('/student/applications');
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể ứng tuyển'));
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
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không tìm thấy việc làm</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate('/student/jobs')}
        className="mb-4 text-blue-600 hover:text-blue-700"
      >
        <i className="fas fa-arrow-left mr-2"></i>Quay lại
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{job.company?.name || 'Công ty'}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span><i className="fas fa-map-marker-alt mr-1"></i>{job.location}</span>
              <span><i className="fas fa-dollar-sign mr-1"></i>
                {formatCurrency(job.minSalary, job.currency)} - {formatCurrency(job.maxSalary, job.currency)}
              </span>
              <span><i className="fas fa-briefcase mr-1"></i>{job.jobType}</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
            {job.status === 'ACTIVE' ? 'Đang tuyển' : 'Đã đóng'}
          </span>
        </div>

        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Kỹ năng yêu cầu:</h3>
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Mô tả công việc</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Yêu cầu ứng viên</h2>
            <div className="prose max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{job.requirements || 'Không có yêu cầu cụ thể'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Ứng tuyển</h2>
            
            {cvs.length === 0 ? (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Bạn chưa có CV nào</p>
                <button
                  onClick={() => navigate('/student/cv')}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Tải CV ngay
                </button>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn CV
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedCV}
                    onChange={(e) => setSelectedCV(e.target.value)}
                  >
                    {cvs.map((cv) => (
                      <option key={cv.id} value={cv.id}>
                        {cv.name || `CV ${cv.id.substring(0, 8)}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thư xin việc (tùy chọn)
                  </label>
                  <textarea
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Viết thư xin việc của bạn..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                  />
                </div>

                <button
                  onClick={handleApply}
                  disabled={applying || !selectedCV}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {applying ? 'Đang gửi...' : 'Ứng tuyển ngay'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
