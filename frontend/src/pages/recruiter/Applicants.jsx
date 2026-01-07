import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function Applicants() {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (selectedJobId) {
      loadApplicants(selectedJobId);
    }
  }, [selectedJobId]);

  const loadJobs = async () => {
    try {
      const data = await api.getMyJobs(0, 100);
      const jobsList = data.content || data || [];
      setJobs(jobsList);
      if (jobsList.length > 0) {
        setSelectedJobId(jobsList[0].id);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApplicants = async (jobId) => {
    try {
      setLoading(true);
      const data = await api.getJobApplicants(jobId, 0, 100);
      setApplicants(data.content || data || []);
    } catch (error) {
      console.error('Error loading applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (applicationId, status) => {
    try {
      await api.updateApplicationStatus(applicationId, status, '');
      loadApplicants(selectedJobId);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể cập nhật'));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-gray-100 text-gray-700',
      VIEWED: 'bg-blue-100 text-blue-700',
      INTERVIEW: 'bg-purple-100 text-purple-700',
      OFFERED: 'bg-green-100 text-green-700',
      ACCEPTED: 'bg-green-100 text-green-700',
      REJECTED: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Mới ứng tuyển',
      VIEWED: 'Đã xem',
      INTERVIEW: 'Phỏng vấn',
      OFFERED: 'Đã Offer',
      ACCEPTED: 'Đã chấp nhận',
      REJECTED: 'Từ chối',
    };
    return texts[status] || status;
  };

  const columns = {
    new: applicants.filter(a => a.status === 'PENDING'),
    viewed: applicants.filter(a => a.status === 'VIEWED'),
    interview: applicants.filter(a => a.status === 'INTERVIEW'),
    offered: applicants.filter(a => a.status === 'OFFERED' || a.status === 'ACCEPTED'),
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý ứng viên</h1>
        <select
          className="px-4 py-2 border border-gray-300 rounded-lg"
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
        >
          <option value="">Chọn tin tuyển dụng</option>
          {jobs.map(job => (
            <option key={job.id} value={job.id}>{job.title}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* New Applicants */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 mb-4">
              Mới ứng tuyển <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full ml-1">
                {columns.new.length}
              </span>
            </h3>
            <div className="space-y-3">
              {columns.new.map(app => (
                <ApplicantCard
                  key={app.id}
                  applicant={app}
                  onStatusChange={(status) => updateStatus(app.id, status)}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                />
              ))}
              {columns.new.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Chưa có ứng viên</p>
              )}
            </div>
          </div>

          {/* Viewed */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-blue-700 mb-4">
              Đã xem <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full ml-1">
                {columns.viewed.length}
              </span>
            </h3>
            <div className="space-y-3">
              {columns.viewed.map(app => (
                <ApplicantCard
                  key={app.id}
                  applicant={app}
                  onStatusChange={(status) => updateStatus(app.id, status)}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                />
              ))}
              {columns.viewed.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Chưa có ứng viên</p>
              )}
            </div>
          </div>

          {/* Interview */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-purple-700 mb-4">
              Phỏng vấn <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full ml-1">
                {columns.interview.length}
              </span>
            </h3>
            <div className="space-y-3">
              {columns.interview.map(app => (
                <ApplicantCard
                  key={app.id}
                  applicant={app}
                  onStatusChange={(status) => updateStatus(app.id, status)}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                />
              ))}
              {columns.interview.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Chưa có ứng viên</p>
              )}
            </div>
          </div>

          {/* Offered */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-semibold text-green-700 mb-4">
              Đã Offer <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full ml-1">
                {columns.offered.length}
              </span>
            </h3>
            <div className="space-y-3">
              {columns.offered.map(app => (
                <ApplicantCard
                  key={app.id}
                  applicant={app}
                  onStatusChange={(status) => updateStatus(app.id, status)}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                />
              ))}
              {columns.offered.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-4">Chưa có ứng viên</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicantCard({ applicant, onStatusChange, formatDate, getStatusColor }) {
  const studentName = applicant.student?.fullName || applicant.studentName || 'Ứng viên';
  const initials = studentName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  const matchScore = applicant.matchScore || 0;
  const scoreColor = matchScore >= 80 ? 'green' : matchScore >= 60 ? 'yellow' : 'gray';

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-900 text-sm flex-1">{studentName}</h4>
        <span className={`text-xs font-bold text-${scoreColor}-600 bg-${scoreColor}-50 px-2 py-1 rounded`}>
          {matchScore}%
        </span>
      </div>
      <p className="text-xs text-gray-500 mb-2">{formatDate(applicant.appliedAt)}</p>
      <div className="flex gap-1 mt-2">
        {applicant.cv && (
          <button
            onClick={() => window.open(applicant.cv.fileUrl, '_blank')}
            className="p-1 hover:bg-gray-100 rounded text-gray-500 text-xs"
            title="Xem CV"
          >
            <i className="fas fa-file-pdf"></i>
          </button>
        )}
        <button
          className="p-1 hover:bg-gray-100 rounded text-blue-500 text-xs"
          title="Chi tiết"
        >
          <i className="fas fa-eye"></i>
        </button>
      </div>
    </div>
  );
}
