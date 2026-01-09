import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf') && 
          !file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
        alert('Chỉ chấp nhận file PDF, DOCX hoặc DOC');
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
      console.log('Uploading CV file:', selectedFile.name);
      const response = await api.uploadCV(selectedFile);
      console.log('CV upload response:', response);
      
      if (response && response.id) {
        alert('✅ Tải CV thành công!');
        setSelectedFile(null);
        const fileInput = document.getElementById('cvFileInput');
        if (fileInput) fileInput.value = '';
        // Reload CVs list after successful upload
        await loadCVs();
      } else {
        throw new Error('Không nhận được phản hồi từ server');
      }
    } catch (error) {
      console.error('CV upload error:', error);
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      'Không thể tải CV. Vui lòng thử lại.';
      alert('❌ Lỗi: ' + errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const handleDeleteCV = async (cvId, fileName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa CV "${fileName || 'này'}"?`)) {
      return;
    }

    try {
      await api.deleteCV(cvId);
      alert('✅ Đã xóa CV thành công!');
      await loadCVs();
    } catch (error) {
      console.error('Error deleting CV:', error);
      const errorMsg = error.response?.data?.error || 
                      error.response?.data?.message || 
                      error.message || 
                      'Không thể xóa CV. Vui lòng thử lại.';
      alert('❌ Lỗi: ' + errorMsg);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Quản lý CV</h1>
          <p className="text-lg text-gray-600">Tải lên và quản lý CV của bạn</p>
        </div>
        <button
          onClick={() => document.getElementById('cvFileInput')?.click()}
          className="btn-primary"
        >
          <i className="fas fa-upload mr-2"></i>
          Tải CV mới
        </button>
      </div>

      <input
        id="cvFileInput"
        type="file"
        accept=".pdf,.docx,.doc"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Upload Preview */}
      {selectedFile && (
        <div className="card p-6 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <i className="fas fa-file-pdf text-white text-2xl"></i>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'PDF/DOCX'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary"
              >
                {uploading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Đang tải...
                  </>
                ) : (
                  <>
                    <i className="fas fa-upload mr-2"></i>
                    Tải lên
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  const fileInput = document.getElementById('cvFileInput');
                  if (fileInput) fileInput.value = '';
                }}
                className="btn-secondary"
              >
                <i className="fas fa-times mr-2"></i>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CV List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-6 w-1/3 mb-4"></div>
              <div className="skeleton h-4 w-1/4 mb-2"></div>
              <div className="skeleton h-4 w-1/2"></div>
            </div>
          ))}
        </div>
      ) : cvs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="inline-flex h-24 w-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 items-center justify-center mb-6">
            <i className="fas fa-file-pdf text-gray-400 text-4xl"></i>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Bạn chưa có CV nào</h3>
          <p className="text-gray-600 mb-6">Tải lên CV đầu tiên để bắt đầu ứng tuyển</p>
          <button
            onClick={() => document.getElementById('cvFileInput')?.click()}
            className="btn-primary"
          >
            <i className="fas fa-upload mr-2"></i>
            Tải CV đầu tiên
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {cvs.map((cv, index) => (
            <div
              key={cv.id}
              className="card card-hover p-6 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <i className="fas fa-file-pdf text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {cv.fileName || `CV ${cv.id?.substring(0, 8) || 'Unknown'}`}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center">
                        <i className="far fa-calendar text-gray-400 mr-2"></i>
                        {formatDate(cv.createdAt)}
                      </span>
                      {cv.fileSize && (
                        <span className="flex items-center">
                          <i className="fas fa-weight text-gray-400 mr-2"></i>
                          {formatFileSize(cv.fileSize)}
                        </span>
                      )}
                      {cv.isDefault && (
                        <span className="badge badge-info">
                          <i className="fas fa-star mr-1"></i>
                          Mặc định
                        </span>
                      )}
                    </div>
                    {cv.aiScore && (
                      <div className="mt-2">
                        <span className="text-sm font-medium text-gray-700">Điểm AI: </span>
                        <span className={`text-sm font-bold ${
                          cv.aiScore >= 80 ? 'text-green-600' :
                          cv.aiScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {cv.aiScore}/100
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/student/cv/${cv.id}/analysis`}
                    className="btn-secondary"
                  >
                    <i className="fas fa-chart-line mr-2"></i>
                    Phân tích AI
                  </Link>
                  {cv.fileUrl && (
                    <a
                      href={(() => {
                        if (cv.fileUrl.startsWith('http')) {
                          return cv.fileUrl;
                        }
                        // Use /api prefix because context-path is /api
                        // If fileUrl already starts with /api, use as is, otherwise add it
                        if (cv.fileUrl.startsWith('/api')) {
                          return `http://localhost:8080${cv.fileUrl}`;
                        }
                        return `http://localhost:8080/api${cv.fileUrl}`;
                      })()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      onClick={(e) => {
                        console.log('Opening CV file:', cv.fileUrl);
                        let fullUrl;
                        if (cv.fileUrl.startsWith('http')) {
                          fullUrl = cv.fileUrl;
                        } else if (cv.fileUrl.startsWith('/api')) {
                          fullUrl = `http://localhost:8080${cv.fileUrl}`;
                        } else {
                          fullUrl = `http://localhost:8080/api${cv.fileUrl}`;
                        }
                        console.log('Full URL:', fullUrl);
                      }}
                    >
                      <i className="fas fa-eye mr-2"></i>
                      Xem
                    </a>
                  )}
                  <button
                    onClick={() => handleDeleteCV(cv.id, cv.fileName)}
                    className="btn-danger"
                    title="Xóa CV"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
