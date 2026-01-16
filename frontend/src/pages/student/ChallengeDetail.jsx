import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function ChallengeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [participation, setParticipation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState({
    answer: '',
    attachmentUrl: ''
  });

  useEffect(() => {
    loadChallenge();
    loadParticipation();
  }, [id]);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      const data = await api.getChallenge(id);
      setChallenge(data);
    } catch (error) {
      console.error('Error loading challenge:', error);
      if (error.response?.status === 404) {
        alert('Thử thách không tồn tại hoặc đã bị xóa.');
        navigate('/student/challenges');
      } else {
        alert('Lỗi khi tải thử thách: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  const loadParticipation = async () => {
    try {
      const data = await api.getMyChallenges();
      const myPart = data.find(p => p.challenge?.id === id);
      setParticipation(myPart);
    } catch (error) {
      console.error('Error loading participation:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.participateChallenge(id, submission);
      alert('Đã gửi bài làm thành công!');
      loadParticipation();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể gửi bài làm'));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải thử thách...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-12 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy thử thách</h2>
          <button onClick={() => navigate('/student/challenges')} className="btn-primary mt-4">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/challenges')}
        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
      >
        <i className="fas fa-arrow-left"></i>
        <span>Quay lại</span>
      </button>

      {/* Challenge Header */}
      <div className="card p-8 mb-6">
        <div className="mb-4">
          <span className="badge badge-info">{challenge.category}</span>
          {participation?.status === 'COMPLETED' && (
            <span className="badge badge-success ml-2">
              <i className="fas fa-check mr-1"></i>
              Đã hoàn thành
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{challenge.title}</h1>
        {challenge.description && (
          <p className="text-gray-700 leading-relaxed mb-4">{challenge.description}</p>
        )}
        <div className="flex items-center gap-6 text-sm text-gray-600">
        {challenge.difficulty && (
          <span>
            <i className="fas fa-signal mr-1"></i>
            Độ khó: {challenge.difficulty}
          </span>
        )}
          {challenge.badge && (
            <span>
              <i className="fas fa-medal text-blue-500 mr-1"></i>
              Huy hiệu: {challenge.badge.name}
            </span>
          )}
        </div>
      </div>

      {/* Challenge Instructions */}
      {challenge.instructions && (
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hướng dẫn</h2>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: challenge.instructions }}
          />
        </div>
      )}

      {/* Submission Form */}
      {participation?.status !== 'COMPLETED' && (
        <div className="card p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Nộp bài</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Câu trả lời / Bài làm
              </label>
              <textarea
                value={submission.answer}
                onChange={(e) => setSubmission({ ...submission, answer: e.target.value })}
                className="input-field"
                rows="10"
                placeholder="Nhập câu trả lời hoặc mô tả bài làm của bạn..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Link đính kèm (tùy chọn)
              </label>
              <input
                type="url"
                value={submission.attachmentUrl}
                onChange={(e) => setSubmission({ ...submission, attachmentUrl: e.target.value })}
                className="input-field"
                placeholder="https://..."
              />
            </div>
            <button type="submit" className="btn-primary">
              <i className="fas fa-paper-plane mr-2"></i>
              Gửi bài làm
            </button>
          </form>
        </div>
      )}

      {/* Participation Status */}
      {participation && (
        <div className="card p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Trạng thái</h2>
          <div className="space-y-2">
            <p>
              <span className="font-semibold">Trạng thái: </span>
              {participation.status === 'COMPLETED' && (
                <span className="badge badge-success">Đã hoàn thành</span>
              )}
              {participation.status === 'PENDING' && (
                <span className="badge badge-warning">Đang chờ đánh giá</span>
              )}
              {participation.status === 'IN_PROGRESS' && (
                <span className="badge badge-info">Đang làm</span>
              )}
            </p>
            {participation.submittedAt && (
              <p className="text-sm text-gray-600">
                Nộp lúc: {new Date(participation.submittedAt).toLocaleString('vi-VN')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
