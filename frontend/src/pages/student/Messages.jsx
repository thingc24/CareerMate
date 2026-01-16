import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import UserInfoModal from '../../components/UserInfoModal';

export default function Messages() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversationUnreadCounts, setConversationUnreadCounts] = useState({});
  const [lastMessages, setLastMessages] = useState({}); // Store last message for each conversation
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    loadConversations();
    loadUnreadCount();
    
    // Poll for new messages every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      if (selectedConversation) {
        loadMessages(selectedConversation.id);
      }
      loadUnreadCount();
      loadConversations();
    }, 5000);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [selectedConversation]);

  // Check URL params for conversationId and auto-select conversation
  useEffect(() => {
    const conversationId = searchParams.get('conversationId');
    if (conversationId && conversations.length > 0) {
      const conversation = conversations.find(c => c.id === conversationId);
      if (conversation && (!selectedConversation || selectedConversation.id !== conversationId)) {
        setSelectedConversation(conversation);
        // Remove query param after selecting
        setSearchParams({});
      }
    }
  }, [conversations, searchParams, selectedConversation, setSearchParams]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

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

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const data = await api.getMyConversations();
      setConversations(data || []);
      
      // Load last message for each conversation to show preview
      const lastMsgs = {};
      const counts = {};
      for (const conv of data || []) {
        try {
          // Load last message (only 1 message, most recent)
          const messages = await api.getMessages(conv.id, 0, 1);
          if (messages && messages.length > 0) {
            // Get the last message (most recent)
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && lastMsg.content) {
              const preview = lastMsg.content.length > 50 
                ? lastMsg.content.substring(0, 50) + '...' 
                : lastMsg.content;
              lastMsgs[conv.id] = preview;
            }
          }
          
          // Load unread count
          const unread = await api.getUnreadCountForConversation?.(conv.id) || 0;
          counts[conv.id] = unread;
        } catch (e) {
          console.error(`Error loading data for conversation ${conv.id}:`, e);
          counts[conv.id] = 0;
        }
      }
      setLastMessages(lastMsgs);
      setConversationUnreadCounts(counts);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const data = await api.getMessages(conversationId, 0, 100);
      setMessages(data || []);
      // Mark as read
      try {
        await api.markConversationAsRead(conversationId);
        await loadUnreadCount();
        setConversationUnreadCounts(prev => ({ ...prev, [conversationId]: 0 }));
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await api.getUnreadCount();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleConversationClick = async (conversation) => {
    setSelectedConversation(conversation);
    await loadMessages(conversation.id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !selectedConversation) return;

    const content = input;
    setInput('');
    setLoading(true);

    try {
      await api.sendMessage(selectedConversation.id, content);
      await loadMessages(selectedConversation.id);
      
      // Update last message preview immediately
      const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;
      setLastMessages(prev => ({ ...prev, [selectedConversation.id]: preview }));
      
      await loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể gửi tin nhắn'));
      setInput(content);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conversation) => {
    if (!conversation || !user) return null;
    if (conversation.participant1?.id === user.id) {
      return conversation.participant2;
    }
    return conversation.participant1;
  };

  const getLastMessagePreview = async (conversationId) => {
    try {
      const msgs = await api.getMessages(conversationId, 0, 1);
      if (msgs && msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        const preview = lastMsg.content || '';
        return preview.length > 50 ? preview.substring(0, 50) + '...' : preview;
      }
    } catch (e) {
      // Ignore
    }
    return '';
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
    if (!selectedConversation) return;
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ tin nhắn trong cuộc trò chuyện này?')) {
      return;
    }

    try {
      await api.deleteAllMessages(selectedConversation.id);
      setMessages([]);
      setLastMessages(prev => ({ ...prev, [selectedConversation.id]: '' }));
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
      <div className="card p-0 overflow-hidden flex-1 flex shadow-lg">
        {/* Conversations List - Left Side */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-white">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-comments text-blue-600"></i>
              Tin nhắn
            </h2>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {unreadCount} tin nhắn chưa đọc
                </span>
              </p>
            )}
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loadingConversations ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
                <p className="mt-2 text-gray-600 text-sm">Đang tải...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <i className="fas fa-comments text-gray-400 text-5xl mb-3"></i>
                <p className="text-gray-600 text-sm font-medium">Chưa có cuộc trò chuyện nào</p>
                <p className="text-gray-500 text-xs mt-1">Bắt đầu trò chuyện với nhà tuyển dụng ngay!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {conversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  if (!otherUser) return null;
                  const isSelected = selectedConversation?.id === conversation.id;
                  const unreadCount = conversationUnreadCounts[conversation.id] || 0;
                  const avatarUrl = getAvatarUrl(otherUser.avatarUrl);
                  
                  return (
                    <button
                      key={conversation.id}
                      onClick={() => handleConversationClick(conversation)}
                      className={`w-full p-4 hover:bg-gray-50 transition-all text-left relative ${
                        isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt={otherUser.fullName}
                              className="w-14 h-14 rounded-full object-cover shadow-md border-2 border-white"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg shadow-md ${avatarUrl ? 'hidden' : ''}`}>
                            {otherUser.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-semibold text-gray-900 truncate text-base">
                              {otherUser.fullName || 'Người dùng'}
                            </p>
                            {conversation.lastMessageAt && (
                              <span className="text-xs text-gray-500 whitespace-nowrap">
                                {formatDate(conversation.lastMessageAt)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {lastMessages[conversation.id] || 'Chưa có tin nhắn'}
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
        <div className="flex-1 flex flex-col bg-gray-50">
          {!selectedConversation ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <i className="fas fa-comments text-gray-300 text-7xl mb-4"></i>
                <p className="text-gray-500 text-lg font-medium">Chọn cuộc trò chuyện để bắt đầu</p>
                <p className="text-gray-400 text-sm mt-2">Nhắn tin với nhà tuyển dụng ngay!</p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages Header */}
              <div className="border-b border-gray-200 p-4 bg-white shadow-sm">
                {(() => {
                  const otherUser = getOtherUser(selectedConversation);
                  if (!otherUser) return null;
                  const avatarUrl = getAvatarUrl(otherUser.avatarUrl);
                  return (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={otherUser.fullName}
                            className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-white"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-md ${avatarUrl ? 'hidden' : ''}`}>
                          {otherUser.fullName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-lg">
                            {otherUser.fullName || 'Người dùng'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {otherUser.role === 'RECRUITER' ? 'Nhà tuyển dụng' : 'Sinh viên'}
                          </p>
                        </div>
                      </div>
                      <div className="relative" ref={menuRef}>
                        <button
                          onClick={() => setShowMenu(!showMenu)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
                        >
                          <i className="fas fa-ellipsis-v"></i>
                        </button>
                        {showMenu && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={handleViewProfile}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <i className="fas fa-user"></i>
                              <span>Xem thông tin cá nhân</span>
                            </button>
                            <button
                              onClick={handleDeleteMessages}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <i className="fas fa-comment-dots text-gray-300 text-4xl mb-3"></i>
                    <p className="text-gray-500 text-sm">Chưa có tin nhắn nào</p>
                    <p className="text-gray-400 text-xs mt-1">Bắt đầu cuộc trò chuyện ngay!</p>
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
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs flex-shrink-0">
                            {msg.sender?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm ${
                            isMyMessage
                              ? 'bg-blue-600 text-white rounded-br-md'
                              : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                          <div className={`text-xs mt-1.5 ${isMyMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                        {isMyMessage && (
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs flex-shrink-0">
                            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                {loading && (
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs flex-shrink-0"></div>
                    <div className="bg-white rounded-2xl px-4 py-2.5 border border-gray-200 rounded-bl-md">
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

              {/* Input */}
              <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
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
      {selectedConversation && (
        <UserInfoModal
          isOpen={showUserInfoModal}
          onClose={() => setShowUserInfoModal(false)}
          user={getOtherUser(selectedConversation)}
          userRole={getOtherUser(selectedConversation)?.role}
        />
      )}
    </div>
  );
}
