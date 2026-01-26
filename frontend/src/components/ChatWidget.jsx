import { useState, useRef, useEffect } from 'react';
import api from '../services/api';

export default function ChatWidget({ role = 'STUDENT' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Draggable state
  const [position, setPosition] = useState({ bottom: 24, right: 24 }); // Initial position in px from edge
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const buttonRef = useRef(null);

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

  // Handle global move/up events for smoother dragging
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault(); // Prevent text selection

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const deltaX = dragStart.x - clientX;
      const deltaY = dragStart.y - clientY;

      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        setHasMoved(true);
      }

      setPosition(prev => ({
        bottom: prev.bottom + deltaY,
        right: prev.right + deltaX
      }));

      setDragStart({ x: clientX, y: clientY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, dragStart]);


  const handleMouseDown = (e) => {
    // Only drag if left click
    if (e.type === 'mousedown' && e.button !== 0) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
    setHasMoved(false);
  };

  const handleButtonClick = (e) => {
    if (!hasMoved) {
      setIsOpen(!isOpen);
    }
  };

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

      const cv = await api.uploadCV(selectedFile);
      const analysis = await api.analyzeCV(cv.id);

      if (analysis.error) {
        const errorMessage = {
          role: 'assistant',
          content: `❌ Lỗi phân tích CV: ${analysis.error}\n\nVui lòng thử lại sau hoặc kiểm tra:\n• File CV có đúng định dạng PDF không\n• Kết nối mạng có ổn định không\n• Dịch vụ AI có đang hoạt động không`,
        };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const score = analysis.score || analysis.overallScore;
        const summary = analysis.summary || 'CV của bạn có tiềm năng nhưng cần cải thiện một số điểm.';
        const suggestions = analysis.suggestions || [];

        let content = `✅ Đã phân tích CV của bạn!\n\n`;
        content += score !== undefined ? `📊 Điểm số: ${score}/100\n\n` : `📊 Điểm số: Đang xử lý...\n\n`;
        content += `${summary}\n\n`;
        if (suggestions.length > 0) {
          content += `💡 Gợi ý:\n${suggestions.slice(0, 3).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n`;
        }
        content += `Xem chi tiết tại trang CV của bạn.`;

        setMessages((prev) => [...prev, { role: 'assistant', content }]);
      }
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: '❌ Lỗi: ' + (error.response?.data?.message || 'Không thể phân tích CV. Vui lòng thử lại.'),
      }]);
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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Chưa đăng nhập. Vui lòng đăng nhập lại.');

      const response = await api.client.post('/ai/chat', {
        message: userMessage.content,
        context: role.toLowerCase(),
        role: role,
      });

      const data = response.data;
      const aiResponse = data.response || data.message || 'Xin lỗi, tôi không thể trả lời ngay bây giờ.';
      setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error calling AI chat:', error);
      let errorMessage = error.message || 'Không thể kết nối với server';
      if (error.response?.data?.error) errorMessage = error.response.data.error;
      else if (error.response?.data?.message) errorMessage = error.response.data.message;

      const fallbackMessages = {
        STUDENT: 'Cảm ơn bạn đã hỏi! Hiện tại dịch vụ AI đang gặp sự cố. Bạn có thể:\n\n• Upload CV để phân tích\n• Hỏi về kỹ năng cần phát triển\n• Hỏi về lộ trình nghề nghiệp',
        RECRUITER: 'Cảm ơn bạn đã hỏi! Hiện tại dịch vụ AI đang gặp sự cố. Tôi có thể giúp bạn tìm ứng viên phù hợp hoặc phân tích CV.',
        ADMIN: 'Cảm ơn bạn đã hỏi! Hiện tại dịch vụ AI đang gặp sự cố. Tôi có thể hỗ trợ bạn quản lý hệ thống và phân tích dữ liệu.',
      };

      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: fallbackMessages[role] || `Xin lỗi, có lỗi xảy ra: ${errorMessage}. Vui lòng thử lại sau.`,
      }]);
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
      {/* Draggable Chat Button */}
      <div
        style={{
          position: 'fixed',
          bottom: `${position.bottom}px`,
          right: `${position.right}px`,
          touchAction: 'none', // Prevent scrolling on mobile while dragging
          zIndex: 50 // High z-index but below modal
        }}
        className={`${isDragging ? 'cursor-grabbing scale-105' : 'cursor-pointer hover:scale-110'} transition-transform duration-200`}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <button
          ref={buttonRef}
          onClick={handleButtonClick}
          // Remove onClick from here and handle in onMouseUp logic? 
          // Better: use handleButtonClick which checks 'hasMoved'
          className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg flex items-center justify-center hover:shadow-xl active:shadow-md"
          aria-label="Mở chat AI"
          title="Chat AI (Nhấn giữ để di chuyển)"
        >
          {isOpen ? (
            <i className="fas fa-times text-xl"></i>
          ) : (
            <i className="fas fa-robot text-xl"></i>
          )}
        </button>
      </div>

      {/* Chat Window - Anchored to button or fixed bottom right? 
          User asked to move button. Window usually stays fixed or follows button?
          If button moves up, window should open near it.
          Let's make window follow button but keep inside viewport.
      */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: `${position.bottom + 70}px`, // Open above button
            right: `${position.right}px`,
            zIndex: 50
          }}
          className="w-96 h-[500px] md:h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-scale-in origin-bottom-right"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <i className="fas fa-robot text-sm"></i>
              </div>
              <div>
                <h3 className="font-bold text-sm">Career AI Coach</h3>
                <p className="text-[10px] text-white/80 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role !== 'user' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] mr-2 mt-1 flex-shrink-0">
                    <i className="fas fa-robot"></i>
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                    }`}
                >
                  {msg.file && (
                    <div className="mb-2 pb-2 border-b border-white/20 flex items-center gap-2">
                      <i className="fas fa-file-pdf"></i>
                      <span className="font-medium truncate">{msg.file}</span>
                    </div>
                  )}
                  <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[10px] mr-2 mt-1 flex-shrink-0">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Actions Area */}
          <div className="p-3 bg-white border-t border-gray-100">
            {/* Quick Questions (Horizontal Scroll) */}
            {messages.length === 1 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1 custom-scrollbar hide-scrollbar">
                {(quickQuestions[role] || []).map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(q)}
                    className="whitespace-nowrap px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition border border-blue-100 flex-shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Upload CV - Compact */}
            {role === 'STUDENT' && !selectedFile && (
              <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition mb-2 border border-dashed border-gray-200">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                  <i className="fas fa-file-pdf"></i>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-700">Phân tích CV</p>
                  <p className="text-[10px] text-gray-500">Tải lên PDF để AI chấm điểm</p>
                </div>
                <i className="fas fa-arrow-right text-gray-400 text-xs"></i>
              </label>
            )}

            {/* Selected File Preview */}
            {selectedFile && (
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg border border-blue-100 mb-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <i className="fas fa-file-pdf text-red-500"></i>
                  <span className="text-xs font-medium truncate max-w-[150px]">{selectedFile.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleUploadCV}
                    disabled={uploadingCV}
                    className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploadingCV ? <i className="fas fa-spinner fa-spin"></i> : 'Gửi'}
                  </button>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm transition-all"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:bg-gray-300"
              >
                {loading ? <i className="fas fa-spinner fa-spin text-xs"></i> : <i className="fas fa-paper-plane text-xs"></i>}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
