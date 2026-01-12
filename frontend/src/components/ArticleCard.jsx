import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function ArticleCard({ article, onUpdate }) {
  const navigate = useNavigate();
  const [reactionCounts, setReactionCounts] = useState({});
  const [myReaction, setMyReaction] = useState(null);
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState(null);

  useEffect(() => {
    loadReactions();
    loadAuthorInfo();
  }, [article.id]);

  const loadReactions = async () => {
    try {
      const counts = await api.getArticleReactionCounts(article.id);
      setReactionCounts(counts);
      
      try {
        const myReactionData = await api.getMyArticleReaction(article.id);
        setMyReaction(myReactionData);
      } catch (error) {
        setMyReaction(null);
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  };

  const loadAuthorInfo = async () => {
    try {
      const authorDisplayName = await api.getAuthorDisplayName(article.id);
      setAuthorName(authorDisplayName);
      
      // Get author avatar
      if (article.author) {
        if (article.author.avatarUrl) {
          setAuthorAvatar(article.author.avatarUrl.startsWith('http') 
            ? article.author.avatarUrl 
            : `http://localhost:8080/api${article.author.avatarUrl}`);
        }
      }
    } catch (error) {
      console.error('Error loading author info:', error);
      if (article.author) {
        setAuthorName(article.author.fullName || 'Người dùng');
      }
    }
  };

  const loadComments = async () => {
    try {
      const data = await api.getArticleComments(article.id);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleReaction = async (reactionType) => {
    try {
      await api.toggleArticleReaction(article.id, reactionType);
      await loadReactions();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      await api.createArticleComment(article.id, newComment, replyingTo);
      setNewComment('');
      setReplyingTo(null);
      await loadComments();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error creating comment:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể bình luận'));
    }
  };

  const handleReply = async (parentCommentId) => {
    if (!replyContent.trim()) return;
    try {
      await api.createArticleComment(article.id, replyContent, parentCommentId);
      setReplyContent('');
      setReplyingTo(null);
      await loadComments();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error replying:', error);
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể trả lời'));
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

  const getTotalReactions = () => {
    return Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  };

  const getReactionEmoji = (type) => {
    const emojis = {
      LIKE: '👍',
      LOVE: '❤️',
      HAHA: '😂',
      WOW: '😮',
      SAD: '😢',
      ANGRY: '😠'
    };
    return emojis[type] || '👍';
  };

  const handleAuthorClick = async () => {
    if (article.author && article.author.role === 'RECRUITER') {
      try {
        // Get recruiter profile to find company
        const recruiterProfile = await api.getRecruiterByUserId(article.author.id);
        if (recruiterProfile && recruiterProfile.company) {
          // Navigate to company detail
          navigate(`/student/companies/${recruiterProfile.company.id}`);
        } else {
          // If no company, show recruiter info or navigate to companies list
          alert(`Nhà tuyển dụng: ${authorName}\nChưa có thông tin công ty.`);
        }
      } catch (error) {
        console.error('Error loading recruiter info:', error);
        // Fallback: navigate to companies list
        navigate('/student/companies');
      }
    } else if (article.author && article.author.role === 'ADMIN') {
      // Admin - maybe show admin info or do nothing
      alert(`Admin: ${authorName}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md mb-4">
      {/* Header with Avatar and Author Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAuthorClick}
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                {authorName.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
          <div className="flex-1">
            <button
              onClick={handleAuthorClick}
              className="text-left hover:underline"
            >
              <h3 className="font-semibold text-gray-900">{authorName}</h3>
            </button>
            <p className="text-xs text-gray-500">{formatDate(article.publishedAt || article.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 
          className="text-lg font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600"
          onClick={() => navigate(`/student/articles/${article.id}`)}
        >
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-gray-700 mb-3 line-clamp-3">{article.excerpt}</p>
        )}
        {article.thumbnailUrl && (
          <img
            src={article.thumbnailUrl.startsWith('http') 
              ? article.thumbnailUrl 
              : `http://localhost:8080/api${article.thumbnailUrl}`}
            alt={article.title}
            className="w-full rounded-lg mb-3 cursor-pointer"
            onClick={() => navigate(`/student/articles/${article.id}`)}
          />
        )}
      </div>

      {/* Reactions Count */}
      {getTotalReactions() > 0 && (
        <div className="px-4 pb-2 flex items-center gap-2 text-sm text-gray-600">
          <div className="flex -space-x-1">
            {Object.entries(reactionCounts)
              .filter(([_, count]) => count > 0)
              .slice(0, 3)
              .map(([type, _]) => (
                <span key={type} className="text-lg">{getReactionEmoji(type)}</span>
              ))}
          </div>
          <span>{getTotalReactions()}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="flex items-center justify-around">
          <button
            onClick={() => handleReaction('LIKE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              myReaction?.reactionType === 'LIKE' 
                ? 'bg-blue-100 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg">{getReactionEmoji('LIKE')}</span>
            <span className="font-medium">Thích</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onMouseEnter={showComments ? null : loadComments}
          >
            <i className="fas fa-comment"></i>
            <span className="font-medium">Bình luận</span>
            {article.commentsCount > 0 && (
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {article.commentsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Reaction Picker (on hover) */}
      <div className="px-4 pb-2 hidden group-hover:block">
        <div className="flex items-center gap-1 bg-white rounded-full shadow-lg p-1">
          {['LIKE', 'LOVE', 'HAHA', 'WOW', 'SAD', 'ANGRY'].map((type) => (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              className="text-2xl hover:scale-125 transition-transform"
              title={type}
            >
              {getReactionEmoji(type)}
            </button>
          ))}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          {/* Comment Input */}
          <div className="mb-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Viết bình luận..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleComment}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Gửi
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-lg p-3">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                    {comment.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-2">
                      <p className="font-semibold text-sm text-gray-900">
                        {comment.user?.fullName || 'Người dùng'}
                      </p>
                      <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>{formatDate(comment.createdAt)}</span>
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="hover:text-blue-600"
                      >
                        Trả lời
                      </button>
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment.id && (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleReply(comment.id)}
                          placeholder="Viết phản hồi..."
                          className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                          onClick={() => handleReply(comment.id)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Gửi
                        </button>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-2 ml-4 space-y-2 border-l-2 border-gray-200 pl-3">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                              {reply.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg p-2">
                                <p className="font-semibold text-xs text-gray-900">
                                  {reply.user?.fullName || 'Người dùng'}
                                </p>
                                <p className="text-gray-700 text-xs">{reply.content}</p>
                              </div>
                              <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
