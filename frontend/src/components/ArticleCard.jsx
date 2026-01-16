import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CompanyDetailModal from './CompanyDetailModal';

// Component for rendering nested replies recursively
function ReplyComment({ reply, onReply, replyingTo, setReplyingTo, replyContent, setReplyContent, formatDate, depth = 0 }) {
  const maxDepth = 10; // Prevent infinite nesting in UI (safety limit)
  const hasNestedReplies = reply.replies && reply.replies.length > 0;

  const replyUserName = reply.user?.fullName || 'Người dùng';
  const replyAvatarUrl = reply.user?.avatarUrl;
  const replyInitials = replyUserName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  
  // Construct full avatar URL
  let fullReplyAvatarUrl = null;
  if (replyAvatarUrl) {
    if (replyAvatarUrl.startsWith('http')) {
      fullReplyAvatarUrl = replyAvatarUrl;
    } else if (replyAvatarUrl.startsWith('/api')) {
      fullReplyAvatarUrl = `http://localhost:8080${replyAvatarUrl}`;
    } else {
      fullReplyAvatarUrl = `http://localhost:8080/api${replyAvatarUrl}`;
    }
  }

  return (
    <div className="flex gap-2">
      <div className="flex-shrink-0">
        {fullReplyAvatarUrl ? (
          <img
            src={fullReplyAvatarUrl}
            alt={replyUserName}
            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md ring-1 ring-gray-200"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold shadow-md ring-1 ring-gray-200 ${fullReplyAvatarUrl ? 'hidden' : ''}`}>
          {replyInitials}
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-3 border border-green-200">
          <p className="font-bold text-xs text-gray-900 mb-1">
            {replyUserName}
          </p>
          <p className="text-gray-700 text-xs leading-relaxed">{reply.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <i className="fas fa-clock"></i>
          <span>{formatDate(reply.createdAt)}</span>
          {depth < maxDepth && (
            <button
              onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
              className="hover:text-blue-600 hover:font-semibold transition-all flex items-center gap-1"
            >
              <i className="fas fa-reply text-xs"></i>
              Trả lời
            </button>
          )}
        </div>

        {/* Reply Input */}
        {replyingTo === reply.id && depth < maxDepth && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onReply(reply.id)}
              placeholder="Viết phản hồi..."
              className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            />
            <button
              onClick={() => onReply(reply.id)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm font-semibold"
            >
              Gửi
            </button>
          </div>
        )}

        {/* Nested Replies - Recursive rendering */}
        {hasNestedReplies && depth < maxDepth && (
          <div className="mt-3 ml-4 space-y-3 border-l-4 border-teal-300 pl-4">
            {reply.replies.map((nestedReply) => (
              <ReplyComment
                key={nestedReply.id}
                reply={nestedReply}
                onReply={onReply}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                formatDate={formatDate}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ArticleCard({ article, onUpdate, showFullComments = false }) {
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
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [recruiterProfile, setRecruiterProfile] = useState(null);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    loadReactions();
    loadAuthorInfo();
    if (showFullComments) {
      loadComments();
      setShowComments(true);
    }
    
    // Also try to load company logo if author is RECRUITER (priority over user avatar)
    if (article.author && article.author.role === 'RECRUITER') {
      // Try to load company logo immediately if possible
      // The full logic is in loadAuthorInfo, but this provides immediate display
      api.getRecruiterByUserId(article.author.id).then(profile => {
        if (profile?.company?.logoUrl) {
          const logoUrl = profile.company.logoUrl.startsWith('http') 
            ? profile.company.logoUrl 
            : `http://localhost:8080/api${profile.company.logoUrl}`;
          setAuthorAvatar(logoUrl);
          if (profile.company.name) {
            setAuthorName(profile.company.name);
          }
        } else if (article.author.avatarUrl) {
          // Fallback to user avatar if no company logo
          const avatarUrl = article.author.avatarUrl.startsWith('http') 
            ? article.author.avatarUrl 
            : `http://localhost:8080/api${article.author.avatarUrl}`;
          setAuthorAvatar(avatarUrl);
        }
      }).catch(() => {
        // If API fails, fallback to author avatar
        if (article.author.avatarUrl) {
          const avatarUrl = article.author.avatarUrl.startsWith('http') 
            ? article.author.avatarUrl 
            : `http://localhost:8080/api${article.author.avatarUrl}`;
          setAuthorAvatar(avatarUrl);
        }
      });
    } else if (article.author && article.author.avatarUrl) {
      // For non-recruiters, use author avatar directly
      const avatarUrl = article.author.avatarUrl.startsWith('http') 
        ? article.author.avatarUrl 
        : `http://localhost:8080/api${article.author.avatarUrl}`;
      setAuthorAvatar(avatarUrl);
    }
  }, [article.id, showFullComments, article.author]);

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
      
      // Get author avatar - for RECRUITER, prioritize company logo over user avatar
      if (article.author) {
        // If author is RECRUITER, try to get company logo first
        if (article.author.role === 'RECRUITER') {
          try {
            const profile = await api.getRecruiterByUserId(article.author.id);
            if (profile?.company?.logoUrl) {
              // Use company logo instead of recruiter avatar
              const logoUrl = profile.company.logoUrl.startsWith('http') 
                ? profile.company.logoUrl 
                : `http://localhost:8080/api${profile.company.logoUrl}`;
              setAuthorAvatar(logoUrl);
              // Also update author name to company name if available
              if (profile.company.name) {
                setAuthorName(profile.company.name);
              }
              return; // Exit early if we have company logo
            }
          } catch (err) {
            console.error('Error loading recruiter/company info:', err);
          }
        }
        
        // Fallback: use author avatar (for STUDENT or if company logo not available)
        if (article.author.avatarUrl) {
          const avatarUrl = article.author.avatarUrl.startsWith('http') 
            ? article.author.avatarUrl 
            : `http://localhost:8080/api${article.author.avatarUrl}`;
          setAuthorAvatar(avatarUrl);
          return; // Exit early if we have avatar
        }
        
        // If no avatarUrl in article.author, try to get from user profile (for non-recruiter)
        try {
          if (article.author.role === 'STUDENT') {
            const profile = await api.getStudentProfile?.();
            if (profile?.user?.avatarUrl) {
              const avatarUrl = profile.user.avatarUrl.startsWith('http') 
                ? profile.user.avatarUrl 
                : `http://localhost:8080/api${profile.user.avatarUrl}`;
              setAuthorAvatar(avatarUrl);
            }
          }
        } catch (err) {
          console.error('Error loading user avatar:', err);
        }
      }
    } catch (error) {
      console.error('Error loading author info:', error);
      if (article.author) {
        setAuthorName(article.author.fullName || 'Người dùng');
        // Try to get avatar from article.author directly
        if (article.author.avatarUrl) {
          const avatarUrl = article.author.avatarUrl.startsWith('http') 
            ? article.author.avatarUrl 
            : `http://localhost:8080/api${article.author.avatarUrl}`;
          setAuthorAvatar(avatarUrl);
        }
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
        const profile = await api.getRecruiterByUserId(article.author.id);
        if (profile && profile.company) {
          setRecruiterProfile(profile);
          setCompany(profile.company);
          setShowCompanyModal(true);
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
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-lg mb-6 border-2 border-gray-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Header with Avatar and Author Info */}
      <div className="p-5 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={handleAuthorClick}
            className="flex-shrink-0 hover:opacity-80 transition-opacity transform hover:scale-110"
          >
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-gray-100"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-gray-100 ${authorAvatar ? 'hidden' : ''}`}>
              {authorName?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>
          <div className="flex-1">
            <button
              onClick={handleAuthorClick}
              className="text-left hover:underline group"
            >
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{authorName}</h3>
            </button>
            <div className="flex items-center gap-2 mt-1">
              <i className="fas fa-clock text-xs text-gray-400"></i>
              <p className="text-xs text-gray-500">{formatDate(article.publishedAt || article.createdAt)}</p>
              {article.category && (
                <>
                  <span className="text-xs text-gray-300">•</span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">
                    {article.category.replace('_', ' ')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 bg-gradient-to-br from-white to-gray-50">
        <h2 
          className="text-xl font-bold text-gray-900 mb-3 cursor-pointer hover:text-blue-600 transition-colors line-clamp-2 group"
          onClick={() => navigate(`/student/articles/${article.id}`)}
        >
          {article.title}
          <i className="fas fa-external-link-alt ml-2 text-xs text-gray-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></i>
        </h2>
        {article.excerpt && (
          <p className="text-gray-700 mb-4 line-clamp-3 leading-relaxed">{article.excerpt}</p>
        )}
        {article.thumbnailUrl && (
          <div className="relative overflow-hidden rounded-xl mb-4 border-2 border-gray-100 group cursor-pointer" onClick={() => navigate(`/student/articles/${article.id}`)}>
            <img
              src={article.thumbnailUrl.startsWith('http') 
                ? article.thumbnailUrl 
                : `http://localhost:8080/api${article.thumbnailUrl}`}
              alt={article.title}
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        )}
      </div>

      {/* Reactions Count */}
      {getTotalReactions() > 0 && (
        <div className="px-5 pb-3 flex items-center gap-2 text-sm">
          <div className="flex -space-x-1">
            {Object.entries(reactionCounts)
              .filter(([_, count]) => count > 0)
              .slice(0, 3)
              .map(([type, _]) => (
                <span key={type} className="text-lg transform hover:scale-125 transition-transform">{getReactionEmoji(type)}</span>
              ))}
          </div>
          <span className="font-semibold text-gray-700">{getTotalReactions()}</span>
          {comments.length > 0 && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-gray-600">
                <i className="fas fa-comment mr-1"></i>
                {comments.length}
              </span>
            </>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="px-5 py-3 border-t border-gray-200 bg-white">
        <div className="flex items-center justify-around gap-2">
          <button
            onClick={() => handleReaction('LIKE')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 flex-1 justify-center ${
              myReaction?.reactionType === 'LIKE' 
                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 shadow-md transform scale-105' 
                : 'text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm'
            }`}
          >
            <span className="text-xl">{getReactionEmoji('LIKE')}</span>
            <span className="font-semibold">Thích</span>
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all duration-200 flex-1 justify-center text-gray-600 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-sm ${
              showComments ? 'bg-gradient-to-r from-gray-100 to-gray-200' : ''
            }`}
            onMouseEnter={showComments ? null : loadComments}
          >
            <i className="fas fa-comment text-lg"></i>
            <span className="font-semibold">Bình luận</span>
            {article.commentsCount > 0 && (
              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
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
        <div className="px-5 py-4 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-white">
          {/* Comment Input */}
          <div className="mb-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Viết bình luận..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              />
              <button
                onClick={handleComment}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 font-semibold"
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Gửi
              </button>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {comments.map((comment) => {
              const commentUserName = comment.user?.fullName || 'Người dùng';
              const commentAvatarUrl = comment.user?.avatarUrl;
              const commentInitials = commentUserName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
              
              // Construct full avatar URL
              let fullCommentAvatarUrl = null;
              if (commentAvatarUrl) {
                if (commentAvatarUrl.startsWith('http')) {
                  fullCommentAvatarUrl = commentAvatarUrl;
                } else if (commentAvatarUrl.startsWith('/api')) {
                  fullCommentAvatarUrl = `http://localhost:8080${commentAvatarUrl}`;
                } else {
                  fullCommentAvatarUrl = `http://localhost:8080/api${commentAvatarUrl}`;
                }
              }
              
              return (
              <div key={comment.id} className="bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-blue-200 transition-all shadow-sm">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    {fullCommentAvatarUrl ? (
                      <img
                        src={fullCommentAvatarUrl}
                        alt={commentUserName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-gray-100"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-gray-100 ${fullCommentAvatarUrl ? 'hidden' : ''}`}>
                      {commentInitials}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 border border-gray-200">
                      <p className="font-bold text-sm text-gray-900 mb-1">
                        {commentUserName}
                      </p>
                      <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <i className="fas fa-clock"></i>
                      <span>{formatDate(comment.createdAt)}</span>
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="hover:text-blue-600 hover:font-semibold transition-all flex items-center gap-1"
                      >
                        <i className="fas fa-reply text-xs"></i>
                        Trả lời
                      </button>
                    </div>

                    {/* Reply Input */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleReply(comment.id)}
                          placeholder="Viết phản hồi..."
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
                        />
                        <button
                          onClick={() => handleReply(comment.id)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105 text-sm font-semibold"
                        >
                          Gửi
                        </button>
                      </div>
                    )}

                    {/* Replies - Support unlimited nested levels */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-3 ml-4 space-y-3 border-l-4 border-blue-300 pl-4">
                        {comment.replies.map((reply) => (
                          <ReplyComment 
                            key={reply.id} 
                            reply={reply} 
                            onReply={handleReply}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            replyContent={replyContent}
                            setReplyContent={setReplyContent}
                            formatDate={formatDate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Company Detail Modal */}
      <CompanyDetailModal
        isOpen={showCompanyModal}
        onClose={() => {
          setShowCompanyModal(false);
          setRecruiterProfile(null);
          setCompany(null);
        }}
        company={company}
        recruiter={recruiterProfile}
        recruiterUser={article.author}
      />
    </div>
  );
}
