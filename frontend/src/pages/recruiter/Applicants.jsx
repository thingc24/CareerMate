import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function Applicants() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    const jobIdFromUrl = searchParams.get('jobId');
    if (jobIdFromUrl) {
      setSelectedJobId(jobIdFromUrl);
    }
  }, [searchParams]);

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
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex items-center justify-between mb-6">
        <select
          className="px-4 py-2 bg-white dark:bg-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-lg"
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
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Mới ứng tuyển <span className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full ml-1">
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
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">Chưa có ứng viên</p>
              )}
            </div>
          </div>

          {/* Viewed */}
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold text-blue-700 dark:text-blue-400 mb-4">
              Đã xem <span className="bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded-full ml-1">
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
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">Chưa có ứng viên</p>
              )}
            </div>
          </div>

          {/* Interview */}
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold text-purple-700 dark:text-purple-400 mb-4">
              Phỏng vấn <span className="bg-purple-100 dark:bg-gray-800 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded-full ml-1">
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
                <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-4">Chưa có ứng viên</p>
              )}
            </div>
          </div>

          {/* Offered */}
          <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-semibold text-green-700 dark:text-green-400 mb-4">
              Đã Offer <span className="bg-green-100 dark:bg-gray-800 text-green-700 dark:text-green-300 text-xs px-2 py-1 rounded-full ml-1">
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
  const [showDetails, setShowDetails] = useState(false);
  const studentName = applicant.student?.fullName || applicant.studentName || 'Ứng viên';
  const initials = studentName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  const matchScore = applicant.matchScore ? parseFloat(applicant.matchScore) : 0;
  const scoreColor = matchScore >= 80 ? 'green' : matchScore >= 60 ? 'yellow' : 'gray';

  const getScoreBadgeClass = () => {
    if (matchScore >= 80) return 'bg-green-100 text-green-700 border-green-300';
    if (matchScore >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    return 'bg-gray-100 text-gray-700 border-gray-300';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 text-sm">{studentName}</h4>
          {applicant.student?.user?.email && (
            <p className="text-xs text-gray-500">{applicant.student.user.email}</p>
          )}
        </div>
        {matchScore > 0 && (
          <div className={`text-xs font-bold px-2 py-1 rounded border ${getScoreBadgeClass()}`}>
            {matchScore.toFixed(0)}%
          </div>
        )}
      </div>
      
      <p className="text-xs text-gray-500 mb-2">
        <i className="fas fa-calendar mr-1"></i>
        {formatDate(applicant.appliedAt)}
      </p>

      {applicant.aiNotes && (
        <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded mb-2">
          <i className="fas fa-robot mr-1"></i>
          <span className="font-medium">AI Notes:</span> {applicant.aiNotes.substring(0, 100)}...
        </div>
      )}

      <div className="flex gap-1 mt-2">
        {applicant.cv && (
          <button
            onClick={() => {
              // Build full URL for CV file
              let cvUrl = applicant.cv.fileUrl;
              if (cvUrl && !cvUrl.startsWith('http')) {
                if (cvUrl.startsWith('/api')) {
                  cvUrl = `http://localhost:8080${cvUrl}`;
                } else {
                  cvUrl = `http://localhost:8080/api${cvUrl}`;
                }
              }
              window.open(cvUrl, '_blank');
            }}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-600 text-xs border border-gray-300"
            title="Xem CV"
          >
            <i className={`fas fa-file-${applicant.cv.fileType === 'text/html' ? 'code' : 'pdf'} mr-1`}></i>
            CV
          </button>
        )}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-1.5 hover:bg-gray-100 rounded text-blue-600 text-xs border border-blue-300"
          title="Chi tiết"
        >
          <i className={`fas fa-${showDetails ? 'chevron-up' : 'chevron-down'} mr-1`}></i>
          {showDetails ? 'Ẩn' : 'Chi tiết'}
        </button>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange('SHORTLISTED')}
              className="flex-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              <i className="fas fa-star mr-1"></i>
              Shortlist
            </button>
            <button
              onClick={() => onStatusChange('INTERVIEW')}
              className="flex-1 text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
            >
              <i className="fas fa-calendar-check mr-1"></i>
              Phỏng vấn
            </button>
            <button
              onClick={() => onStatusChange('OFFERED')}
              className="flex-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
            >
              <i className="fas fa-hand-holding-usd mr-1"></i>
              Offer
            </button>
            <button
              onClick={() => onStatusChange('REJECTED')}
              className="flex-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              <i className="fas fa-times mr-1"></i>
              Từ chối
            </button>
          </div>
          {applicant.coverLetter && (
            <div className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
              <p className="font-medium mb-1">Thư xin việc:</p>
              <p className="line-clamp-3">{applicant.coverLetter}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
