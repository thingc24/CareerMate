import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications(page, 20);
      if (page === 0) {
        setNotifications(data.content || []);
      } else {
        setNotifications(prev => [...prev, ...(data.content || [])]);
      }
      setHasMore(!data.last);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await api.markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, status: 'READ' } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'READ' }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (notification.status === 'UNREAD') {
      await handleMarkAsRead(notification.id);
    }

    // Navigate to related page
    if (notification.linkUrl) {
      // Xử lý linkUrl - có thể có query params
      const url = notification.linkUrl;
      if (url.includes('?')) {
        // Có query params - tách path và search
        const [path, search] = url.split('?');
        navigate({ pathname: path, search: `?${search}` });
      } else {
        // Không có query params - navigate bình thường
        navigate(url);
      }
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ARTICLE_APPROVED':
        return 'fas fa-check-circle text-green-500';
      case 'ARTICLE_REJECTED':
        return 'fas fa-times-circle text-red-500';
      case 'ARTICLE_PENDING':
        return 'fas fa-clock text-yellow-500';
      case 'JOB_APPROVED':
        return 'fas fa-check-circle text-green-500';
      case 'JOB_REJECTED':
        return 'fas fa-times-circle text-red-500';
      case 'JOB_PENDING':
        return 'fas fa-clock text-yellow-500';
      case 'NEW_APPLICATION':
        return 'fas fa-user-plus text-blue-500';
      case 'APPLICATION_STATUS_CHANGED':
        return 'fas fa-sync-alt text-yellow-500';
      case 'INTERVIEW_SCHEDULED':
        return 'fas fa-calendar-check text-purple-500';
      case 'NEW_COMMENT':
        return 'fas fa-comment text-indigo-500';
      case 'NEW_REACTION':
        return 'fas fa-heart text-pink-500';
      case 'JOB_RECOMMENDATION':
        return 'fas fa-star text-orange-500';
      default:
        return 'fas fa-bell text-slate-500';
    }
  };

  const formatDate = (dateString) => {
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
    return date.toLocaleDateString('vi-VN');
  };

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:border dark:border-gray-800 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thông báo</h1>
              <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">
                {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả đã đọc'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading && notifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:border dark:border-gray-800 p-12 text-center">
              <i className="fas fa-spinner fa-spin text-3xl text-slate-400 dark:text-gray-500 mb-4"></i>
              <p className="text-slate-500 dark:text-gray-400">Đang tải thông báo...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:border dark:border-gray-800 p-12 text-center">
              <i className="fas fa-bell-slash text-4xl text-slate-300 dark:text-gray-600 mb-4"></i>
              <p className="text-slate-500 dark:text-gray-300 text-lg">Chưa có thông báo nào</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white dark:bg-gray-900 rounded-lg shadow-sm dark:border dark:border-gray-800 p-4 cursor-pointer hover:shadow-md transition-all ${
                  notification.status === 'UNREAD'
                    ? 'border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-gray-800'
                    : 'border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <i className={`${getNotificationIcon(notification.type)} text-2xl`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                          {notification.title}
                        </h3>
                        {notification.message && (
                          <p className="text-sm text-slate-600 dark:text-gray-300 mb-2">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-slate-400 dark:text-gray-500">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                      {notification.status === 'UNREAD' && (
                        <div className="flex-shrink-0">
                          <span className="inline-block w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Load More */}
          {hasMore && !loading && notifications.length > 0 && (
            <div className="text-center pt-4">
              <button
                onClick={() => setPage(prev => prev + 1)}
                className="px-6 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-800 border border-slate-200 dark:border-gray-800 rounded-lg transition-colors"
              >
                Tải thêm
              </button>
            </div>
          )}

          {loading && notifications.length > 0 && (
            <div className="text-center py-4">
              <i className="fas fa-spinner fa-spin text-slate-400 dark:text-gray-500"></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
