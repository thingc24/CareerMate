import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

export default function ChatWidget({ role = 'STUDENT' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Initialize with welcome message based on role
    const welcomeMessages = {
      STUDENT: 'Xin chào! Tôi là Career AI Coach. Tôi có thể giúp bạn:\n\n• Phân tích CV (upload file PDF)\n• Tư vấn nghề nghiệp\n• Đề xuất kỹ năng cần phát triển\n• Luyện tập phỏng vấn\n• Tạo lộ trình nghề nghiệp',
      RECRUITER: 'Xin chào! Tôi là AI Assistant cho Nhà tuyển dụng. Tôi có thể giúp bạn:\n\n• Tìm ứng viên phù hợp\n• Phân tích CV ứng viên\n• Đề xuất câu hỏi phỏng vấn\n• Đánh giá ứng viên',
      ADMIN: 'Xin chào! Tôi là AI Assistant cho Admin. Tôi có thể giúp bạn:\n\n• Phân tích dữ liệu hệ thống\n• Đề xuất cải thiện\n• Hỗ trợ quản lý người dùng\n• Báo cáo và thống kê',
    };

    setMessages([
      {
        role: 'assistant',
        content: welcomeMessages[role] || welcomeMessages.STUDENT,
      },
    ]);
  }, [role]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
        alert('Chỉ chấp nhận file PDF');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File không được vượt quá 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadCV = async () => {
    if (!selectedFile) return;

    try {
      setUploadingCV(true);
      const userMessage = {
        role: 'user',
        content: `Đã upload CV: ${selectedFile.name}`,
        file: selectedFile.name,
      };
      setMessages((prev) => [...prev, userMessage]);

      // Upload CV
      const cv = await api.uploadCV(selectedFile);
      
      // Analyze CV
      const analysis = await api.analyzeCV(cv.id);
      
      const assistantMessage = {
        role: 'assistant',
        content: `✅ Đã phân tích CV của bạn!\n\n📊 Điểm số: ${analysis.score || analysis.overallScore || 'N/A'}/100\n\n${analysis.summary || 'CV của bạn có tiềm năng nhưng cần cải thiện một số điểm.'}\n\n💡 Gợi ý:\n${(analysis.suggestions || []).slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nXem chi tiết tại trang CV của bạn.`,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: '❌ Lỗi: ' + (error.response?.data?.message || 'Không thể phân tích CV. Vui lòng thử lại.'),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setUploadingCV(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Use api service to ensure token is properly handled
      const token = localStorage.getItem('token');
      if (!token) {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('Chưa đăng nhập. Vui lòng đăng nhập lại.');
        }
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      // Use api.client to ensure proper headers and interceptors
      const response = await api.client.post('/ai/chat', {
        message: userMessage.content,
        context: role.toLowerCase(),
        role: role,
      });

      // Response is already parsed by axios
      const data = response.data;
      const aiResponse = data.response || data.message || 'Xin lỗi, tôi không thể trả lời ngay bây giờ.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponse,
        },
      ]);
    } catch (error) {
      console.error('Error calling AI chat:', error);
      
      // Get error message
      let errorMessage = error.message || 'Không thể kết nối với server';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Fallback response based on role
      const fallbackMessages = {
        STUDENT: 'Cảm ơn bạn đã hỏi! Hiện tại dịch vụ AI đang gặp sự cố. Bạn có thể:\n\n• Upload CV để phân tích\n• Hỏi về kỹ năng cần phát triển\n• Hỏi về lộ trình nghề nghiệp\n\nVui lòng thử lại sau.',
        RECRUITER: 'Cảm ơn bạn đã hỏi! Hiện tại dịch vụ AI đang gặp sự cố. Tôi có thể giúp bạn tìm ứng viên phù hợp hoặc phân tích CV. Vui lòng thử lại sau.',
        ADMIN: 'Cảm ơn bạn đã hỏi! Hiện tại dịch vụ AI đang gặp sự cố. Tôi có thể hỗ trợ bạn quản lý hệ thống và phân tích dữ liệu. Vui lòng thử lại sau.',
      };

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: fallbackMessages[role] || `Xin lỗi, có lỗi xảy ra: ${errorMessage}. Vui lòng thử lại sau.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = {
    STUDENT: [
      'Làm thế nào để cải thiện CV?',
      'Tôi nên học kỹ năng gì cho ngành IT?',
      'Lộ trình phát triển sự nghiệp như thế nào?',
    ],
    RECRUITER: [
      'Làm thế nào để tìm ứng viên phù hợp?',
      'Câu hỏi phỏng vấn hay cho vị trí này?',
      'Đánh giá ứng viên như thế nào?',
    ],
    ADMIN: [
      'Thống kê người dùng hiện tại?',
      'Cách quản lý nội dung tốt hơn?',
      'Báo cáo hoạt động hệ thống?',
    ],
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center"
        aria-label="Mở chat AI"
        title="Chat AI"
      >
        {isOpen ? (
          <>
            <i className="fas fa-times text-xl"></i>
            <span className="sr-only">Đóng chat</span>
          </>
        ) : (
          <>
            <i className="fas fa-robot text-xl"></i>
            <span className="sr-only">Mở chat AI</span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <i className="fas fa-robot text-sm"></i>
              </div>
              <div>
                <h3 className="font-semibold">
                  {role === 'STUDENT' && 'Career AI Coach'}
                  {role === 'RECRUITER' && 'Recruiter AI Assistant'}
                  {role === 'ADMIN' && 'Admin AI Assistant'}
                </h3>
                <p className="text-xs text-white/80">Đang hoạt động</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  {msg.file && (
                    <div className="mb-2 text-xs opacity-80">
                      <i className="fas fa-file-pdf mr-1"></i>
                      {msg.file}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* CV Upload (Student only) */}
          {role === 'STUDENT' && (
            <div className="px-4 pt-2 border-t border-gray-200">
              {selectedFile ? (
                <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <i className="fas fa-file-pdf text-red-600"></i>
                      <span className="text-xs text-gray-700 truncate">{selectedFile.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-gray-500 hover:text-gray-700 ml-2"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </div>
                  <button
                    onClick={handleUploadCV}
                    disabled={uploadingCV}
                    className="w-full mt-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {uploadingCV ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-1"></i>Đang phân tích...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-upload mr-1"></i>Phân tích CV
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <label className="block">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-file-pdf text-red-600"></i>
                    Upload CV PDF để phân tích
                  </button>
                </label>
              )}
            </div>
          )}

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2">
              <p className="text-xs text-gray-500 mb-2">Câu hỏi nhanh:</p>
              <div className="flex flex-col gap-1">
                {(quickQuestions[role] || []).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="text-left px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                title="Gửi tin nhắn"
              >
                {loading ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    <span className="sr-only">Gửi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

