import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function FindCandidates() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [matchingCandidates, setMatchingCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await api.getMyJobs(0, 100);
      const jobsList = data.content || data || [];
      setJobs(jobsList.filter(job => job.status === 'ACTIVE'));
      if (jobsList.length > 0) {
        setSelectedJobId(jobsList[0].id);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const handleFindCandidates = async () => {
    if (!selectedJobId) {
      alert('Vui lòng chọn tin tuyển dụng');
      return;
    }

    try {
      setSearching(true);
      const result = await api.findMatchingCandidates(selectedJobId);
      
      if (result.matchingCVs && result.matchingCVs.length > 0) {
        // Load candidate details from CV IDs
        // Note: This would need additional API endpoints to get student profiles from CV IDs
        setMatchingCandidates(result.matchingCVs);
      } else {
        setMatchingCandidates([]);
        alert('Không tìm thấy ứng viên phù hợp. Hệ thống sẽ sử dụng AI để tìm kiếm ứng viên dựa trên mô tả công việc.');
      }
    } catch (error) {
      console.error('Error finding candidates:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể tìm ứng viên'));
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Tìm ứng viên phù hợp</h1>
        <p className="text-lg text-gray-600">
          Sử dụng AI để tìm ứng viên phù hợp với mô tả công việc của bạn
        </p>
      </div>

      {/* Job Selection */}
      <div className="card p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn tin tuyển dụng
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="input-field"
          >
            <option value="">-- Chọn tin tuyển dụng --</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>
                {job.title} - {job.location || 'N/A'}
              </option>
            ))}
          </select>
        </div>

        {selectedJobId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            {(() => {
              const job = jobs.find(j => j.id === selectedJobId);
              return job ? (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">{job.description}</p>
                  {job.requirements && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Yêu cầu:</p>
                      <p className="text-sm text-gray-600">{job.requirements}</p>
                    </div>
                  )}
                </div>
              ) : null;
            })()}
          </div>
        )}

        <button
          onClick={handleFindCandidates}
          disabled={!selectedJobId || searching}
          className="btn-primary w-full"
        >
          {searching ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Đang tìm kiếm...
            </>
          ) : (
            <>
              <i className="fas fa-search mr-2"></i>
              Tìm ứng viên phù hợp
            </>
          )}
        </button>
      </div>

      {/* Results */}
      {matchingCandidates.length > 0 && (
        <div className="card p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Tìm thấy {matchingCandidates.length} ứng viên phù hợp
          </h2>
          <div className="space-y-4">
            {matchingCandidates.map((candidate, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  CV ID: {candidate}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  (Tính năng này cần thêm API để load chi tiết ứng viên từ CV ID)
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Message */}
      <div className="card p-6 bg-yellow-50 border border-yellow-200">
        <div className="flex items-start gap-3">
          <i className="fas fa-info-circle text-yellow-600 text-xl mt-1"></i>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Cách hoạt động</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
              <li>Hệ thống sẽ phân tích mô tả công việc và yêu cầu kỹ năng</li>
              <li>Sử dụng AI và Vector Database để tìm CV phù hợp nhất</li>
              <li>Kết quả được sắp xếp theo điểm matching từ cao đến thấp</li>
              <li>Bạn có thể xem chi tiết và liên hệ với ứng viên phù hợp</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
