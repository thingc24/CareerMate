import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function CVUpload() {
  const [cvs, setCvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = async () => {
    try {
      setLoading(true);
      const data = await api.getCVs();
      setCvs(data || []);
    } catch (error) {
      console.error('Error loading CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.docx')) {
        alert('Chỉ chấp nhận file PDF hoặc DOCX');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File không được vượt quá 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Vui lòng chọn file');
      return;
    }

    try {
      setUploading(true);
      await api.uploadCV(selectedFile);
      alert('Tải CV thành công!');
      setSelectedFile(null);
      document.getElementById('cvFileInput').value = '';
      loadCVs();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể tải CV'));
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async (cvId) => {
    try {
      const analysis = await api.analyzeCV(cvId);
      // Show analysis results in modal or navigate to analysis page
      alert(`Điểm số CV: ${analysis.score || 'N/A'}\nĐang phân tích...`);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || 'Không thể phân tích CV'));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý CV</h1>
        <button
          onClick={() => document.getElementById('cvFileInput').click()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <i className="fas fa-upload mr-2"></i>Tải CV mới
        </button>
      </div>

      <input
        id="cvFileInput"
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={handleFileSelect}
      />

      {selectedFile && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">{selectedFile.name}</p>
              <p className="text-sm text-blue-700">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {uploading ? 'Đang tải...' : 'Tải lên'}
              </button>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  document.getElementById('cvFileInput').value = '';
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      ) : cvs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <i className="fas fa-file-pdf text-6xl text-gray-400 mb-4"></i>
          <p className="text-gray-600 mb-4">Bạn chưa có CV nào</p>
          <button
            onClick={() => document.getElementById('cvFileInput').click()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <i className="fas fa-upload mr-2"></i>Tải CV đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cvs.map((cv) => (
            <div
              key={cv.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-red-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-file-pdf text-3xl text-red-600"></i>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {cv.name || `CV ${cv.id.substring(0, 8)}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Tải lên: {formatDate(cv.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAnalyze(cv.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    <i className="fas fa-chart-line mr-2"></i>Phân tích AI
                  </button>
                  {cv.fileUrl && (
                    <a
                      href={cv.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <i className="fas fa-eye mr-2"></i>Xem
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
