import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import UserInfoModal from '../../components/UserInfoModal';

export default function Messages() {
  const { user } = useAuth();
  const [recruiters, setRecruiters] = useState([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRecruiters, setLoadingRecruiters] = useState(false);
  const [lastMessages, setLastMessages] = useState({});
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    loadRecruiters();
    
    // Poll for new messages every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      if (conversation) {
        loadMessages(conversation.id);
      }
      loadRecruiters();
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [conversation]);

  useEffect(() => {
    if (conversation) {
      loadMessages(conversation.id);
    }
  }, [conversation]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadRecruiters = async () => {
    try {
      setLoadingRecruiters(true);
      const data = await api.getAllRecruiters();
      setRecruiters(data || []);
      
      // Load conversations for each recruiter
      const conversations = await api.getAdminConversations();
      const lastMsgs = {};
      
      for (const recruiter of data || []) {
        // Find conversation with this recruiter
        const conv = conversations?.find(c => 
          (c.participant1?.id === recruiter.id || c.participant2?.id === recruiter.id)
        );
        
        if (conv) {
          try {
            const msgs = await api.getAdminMessages(conv.id, 0, 1);
            if (msgs && msgs.length > 0) {
              const lastMsg = msgs[msgs.length - 1];
              if (lastMsg && lastMsg.content) {
                const preview = lastMsg.content.length > 50 
                  ? lastMsg.content.substring(0, 50) + '...' 
                  : lastMsg.content;
                lastMsgs[recruiter.id] = preview;
              }
            }
          } catch (e) {
            // Ignore
          }
        }
      }
      setLastMessages(lastMsgs);
    } catch (error) {
      console.error('Error loading recruiters:', error);
    } finally {
      setLoadingRecruiters(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await api.getAdminMessages(conversationId, 0, 100);
      setMessages(data || []);
      
      // Update last message preview
      if (data && data.length > 0) {
        const lastMsg = data[data.length - 1];
        if (lastMsg && lastMsg.content && selectedRecruiter) {
          const preview = lastMsg.content.length > 50 
            ? lastMsg.content.substring(0, 50) + '...' 
            : lastMsg.content;
          setLastMessages(prev => ({ ...prev, [selectedRecruiter.id]: preview }));
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleRecruiterClick = async (recruiter) => {
    setSelectedRecruiter(recruiter);
    try {
      // Get or create conversation with this recruiter
      const conv = await api.getOrCreateAdminConversation(recruiter.id);
      setConversation(conv);
      await loadMessages(conv.id);
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể tạo cuộc trò chuyện'));
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !conversation) return;

    const content = input;
    setInput('');
    setLoading(true);

    try {
      await api.sendAdminMessage(conversation.id, content);
      await loadMessages(conversation.id);
      
      // Update last message preview immediately
      if (selectedRecruiter) {
        const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;
        setLastMessages(prev => ({ ...prev, [selectedRecruiter.id]: preview }));
      }
      
      await loadRecruiters();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể gửi tin nhắn'));
      setInput(content);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) return null;
    if (avatarUrl.startsWith('http')) return avatarUrl;
    return `http://localhost:8080/api${avatarUrl}`;
  };

  const handleViewProfile = () => {
    setShowUserInfoModal(true);
    setShowMenu(false);
  };

  const handleDeleteMessages = async () => {
    if (!conversation) return;
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ tin nhắn trong cuộc trò chuyện này?')) {
      return;
    }

    try {
      await api.deleteAllMessages(conversation.id);
      setMessages([]);
      if (selectedRecruiter) {
        setLastMessages(prev => ({ ...prev, [selectedRecruiter.id]: '' }));
      }
      alert('Đã xóa toàn bộ tin nhắn');
    } catch (error) {
      console.error('Error deleting messages:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể xóa tin nhắn'));
    } finally {
      setShowMenu(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 h-[calc(100vh-120px)] flex flex-col">
      <div className="card p-0 overflow-hidden flex-1 flex shadow-lg dark:bg-gray-900 dark:border-gray-800">
        {/* Recruiters List - Left Side */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <i className="fas fa-comments text-indigo-600 dark:text-indigo-400"></i>
              Nhắn tin với nhà tuyển dụng
            </h2>
          </div>

          {/* Recruiters */}
          <div className="flex-1 overflow-y-auto">
            {loadingRecruiters ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 dark:border-gray-700 border-t-indigo-600 dark:border-t-indigo-500"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">Đang tải...</p>
              </div>
            ) : recruiters.length === 0 ? (
              <div className="p-8 text-center">
                <i className="fas fa-users text-gray-400 dark:text-gray-500 text-5xl mb-3"></i>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Chưa có nhà tuyển dụng nào</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {recruiters.map((recruiter) => {
                  const isSelected = selectedRecruiter?.id === recruiter.id;
                  const avatarUrl = getAvatarUrl(recruiter.avatarUrl);
                  
                  return (
                    <button
                      key={recruiter.id}
                      onClick={() => handleRecruiterClick(recruiter)}
                      className={`w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-left relative ${
                        isSelected ? 'bg-indigo-50 dark:bg-gray-800 border-l-4 border-indigo-600 dark:border-indigo-500' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={recruiter.fullName}
                              className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-white dark:border-gray-700"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg shadow-md ${avatarUrl ? 'hidden' : ''}`}>
                            {recruiter.fullName?.charAt(0).toUpperCase() || 'R'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-semibold text-gray-900 dark:text-white truncate text-base">
                              {recruiter.fullName || 'Nhà tuyển dụng'}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                            {lastMessages[recruiter.id] || 'Chưa có tin nhắn'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Messages - Right Side */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
          {!selectedRecruiter || !conversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-comments text-gray-300 dark:text-gray-600 text-7xl mb-4"></i>
                <p className="text-gray-500 dark:text-gray-300 text-lg font-medium">Chọn nhà tuyển dụng để bắt đầu</p>
                <p className="text-gray-400 dark:text-gray-400 text-sm mt-2">Nhắn tin với nhà tuyển dụng ngay!</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Header */}
              <div className="border-b border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 shadow-sm">
                {(() => {
                  const avatarUrl = getAvatarUrl(selectedRecruiter.avatarUrl);
                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={selectedRecruiter.fullName}
                            className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-white dark:border-gray-700"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold shadow-md ${avatarUrl ? 'hidden' : ''}`}>
                          {selectedRecruiter.fullName?.charAt(0).toUpperCase() || 'R'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white text-lg">
                            {selectedRecruiter.fullName || 'Nhà tuyển dụng'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Nhà tuyển dụng</p>
                        </div>
                      </div>
                      <div className="relative" ref={menuRef}>
                        <button
                          onClick={() => setShowMenu(!showMenu)}
                          className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition"
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        {showMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                            <button
                              onClick={handleViewProfile}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                            >
                              <i className="fas fa-user"></i>
                              <span>Xem thông tin nhà tuyển dụng</span>
                            </button>
                            <button
                              onClick={handleDeleteMessages}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                            >
                              <i className="fas fa-trash"></i>
                              <span>Xóa toàn bộ tin nhắn</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 dark:bg-gray-900">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-comment-dots text-gray-300 dark:text-gray-600 text-4xl mb-3"></i>
                    <p className="text-gray-500 dark:text-gray-300 text-sm">Chưa có tin nhắn nào</p>
                    <p className="text-gray-400 dark:text-gray-400 text-xs mt-1">Bắt đầu cuộc trò chuyện ngay!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMyMessage = msg.sender?.id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'} items-end gap-2`}
                      >
                        {!isMyMessage && (
                          <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-white text-xs flex-shrink-0">
                            {msg.sender?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                            isMyMessage
                              ? 'bg-indigo-600 dark:bg-indigo-700 text-white rounded-br-md'
                              : 'bg-white dark:bg-gray-800 dark:text-white text-gray-900 border border-gray-200 dark:border-gray-700 rounded-bl-md'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                          <div className={`text-xs mt-1.5 ${isMyMessage ? 'text-indigo-100 dark:text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                        {isMyMessage && (
                          <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-700 flex items-center justify-center text-white text-xs flex-shrink-0">
                            {user?.fullName?.charAt(0).toUpperCase() || 'A'}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                {loading && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-white text-xs flex-shrink-0"></div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-bl-md">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        <span className="font-medium">Gửi</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {/* User Info Modal */}
      {selectedRecruiter && (
        <UserInfoModal
          isOpen={showUserInfoModal}
          onClose={() => setShowUserInfoModal(false)}
          user={selectedRecruiter}
          userRole="RECRUITER"
        />
      )}
    </div>
  );
}
