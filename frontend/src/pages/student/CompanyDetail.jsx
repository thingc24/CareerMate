import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    loadCompany();
    loadRatings();
  }, [id]);

  const loadCompany = async () => {
    try {
      setLoading(true);
      const data = await api.getCompany(id);
      setCompany(data);
    } catch (error) {
      console.error('Error loading company:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRatings = async () => {
    try {
      const data = await api.getCompanyRatings(id);
      setRatings(data.content || data || []);
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      await api.submitCompanyRating(id, ratingForm);
      alert('Cảm ơn bạn đã đánh giá!');
      setShowRatingForm(false);
      setRatingForm({ rating: 5, comment: '' });
      loadRatings();
      loadCompany();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể gửi đánh giá'));
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải thông tin công ty...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-12 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy công ty</h2>
          <Link to="/student/companies" className="btn-primary mt-4">
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/companies')}
        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
      >
        <i className="fas fa-arrow-left"></i>
        <span>Quay lại</span>
      </button>

      {/* Company Header */}
      <div className="card p-8 mb-6">
        <div className="flex items-start gap-6">
          {company.logoUrl && (
            <img
              src={company.logoUrl.startsWith('http') 
                ? company.logoUrl 
                : `http://localhost:8080/api${company.logoUrl}`}
              alt={company.name}
              className="w-32 h-32 object-contain"
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{company.name}</h1>
            {company.industry && (
              <p className="text-lg text-gray-600 mb-2">
                <i className="fas fa-industry mr-2"></i>
                {company.industry}
              </p>
            )}
            {company.location && (
              <p className="text-gray-600 mb-4">
                <i className="fas fa-map-marker-alt mr-2"></i>
                {company.location}
              </p>
            )}
            {company.averageRating && (
              <div className="flex items-center gap-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={`fas fa-star text-2xl ${
                        i < Math.floor(company.averageRating)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    ></i>
                  ))}
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {company.averageRating.toFixed(1)}
                </span>
                {company.ratingsCount > 0 && (
                  <span className="text-gray-600">
                    ({company.ratingsCount} đánh giá)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        {company.description && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-gray-700 leading-relaxed">{company.description}</p>
          </div>
        )}
      </div>

      {/* Rating Form */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Đánh giá công ty</h2>
          <button
            onClick={() => setShowRatingForm(!showRatingForm)}
            className="btn-primary"
          >
            {showRatingForm ? 'Hủy' : 'Viết đánh giá'}
          </button>
        </div>
        {showRatingForm && (
          <form onSubmit={handleSubmitRating} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Điểm đánh giá
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                    className={`text-3xl ${
                      star <= ratingForm.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    <i className="fas fa-star"></i>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nhận xét
              </label>
              <textarea
                value={ratingForm.comment}
                onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                className="input-field"
                rows="4"
                placeholder="Chia sẻ trải nghiệm của bạn..."
                required
              />
            </div>
            <button type="submit" className="btn-primary">
              <i className="fas fa-paper-plane mr-2"></i>
              Gửi đánh giá
            </button>
          </form>
        )}
      </div>

      {/* Ratings List */}
      <div className="card p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Đánh giá từ nhân viên ({ratings.length})
        </h2>
        {ratings.length === 0 ? (
          <p className="text-gray-600 text-center py-8">Chưa có đánh giá nào</p>
        ) : (
          <div className="space-y-6">
            {ratings.map((rating) => (
              <div key={rating.id} className="border-b pb-6 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {rating.student?.user?.fullName || 'Người dùng ẩn danh'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(rating.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star ${
                          i < rating.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      ></i>
                    ))}
                  </div>
                </div>
                {rating.reviewText && (
                  <p className="text-gray-700">{rating.reviewText}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
