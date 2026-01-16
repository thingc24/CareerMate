import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'my'

  useEffect(() => {
    if (activeTab === 'all') {
      loadCourses();
    } else {
      loadMyEnrollments();
    }
  }, [selectedCategory, showFreeOnly, activeTab]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      let data;
      if (showFreeOnly) {
        console.log('Loading free courses...');
        data = await api.getFreeCourses();
        console.log('Free courses loaded:', data);
      } else {
        console.log('Loading all courses, category:', selectedCategory);
        data = await api.getCourses(selectedCategory);
        console.log('All courses loaded:', data);
      }
      // Filter free courses if checkbox is checked
      if (showFreeOnly && Array.isArray(data)) {
        data = data.filter(course => !course.isPremium);
        console.log('Filtered free courses:', data);
      }
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading courses:', error);
      console.error('Error details:', error.response?.data || error.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyEnrollments = async () => {
    try {
      setLoading(true);
      const data = await api.getMyEnrollments();
      setMyEnrollments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await api.enrollCourse(courseId);
      alert('Đã đăng ký khóa học thành công!');
      loadMyEnrollments();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể đăng ký khóa học'));
    }
  };

  const categories = [
    { value: '', label: 'Tất cả' },
    { value: 'TECHNICAL', label: 'Kỹ thuật' },
    { value: 'SOFT_SKILLS', label: 'Kỹ năng mềm' },
    { value: 'CAREER', label: 'Nghề nghiệp' },
    { value: 'INTERVIEW', label: 'Phỏng vấn' },
  ];

  if (loading && courses.length === 0 && myEnrollments.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  const displayCourses = activeTab === 'all' ? courses : myEnrollments.map(e => e.course);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tất cả khóa học
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'my'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Khóa học của tôi ({myEnrollments.length})
        </button>
      </div>

      {/* Filters - Only show for 'all' tab */}
      {activeTab === 'all' && (
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
                disabled={showFreeOnly}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showFreeOnly}
                onChange={(e) => setShowFreeOnly(e.target.checked)}
                className="w-5 h-5 text-blue-600 rounded"
              />
              <span className="text-gray-700">Chỉ hiển thị khóa học miễn phí</span>
            </label>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {displayCourses.length === 0 ? (
        <div className="card p-12 text-center">
          <i className="fas fa-graduation-cap text-gray-400 text-6xl mb-4"></i>
          <p className="text-gray-600 text-lg">
            {activeTab === 'all' ? 'Không tìm thấy khóa học nào' : 'Bạn chưa đăng ký khóa học nào'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCourses.map((course) => (
            <div
              key={course.id}
              className="card p-6 hover:shadow-lg transition-all duration-300"
            >
              {course.thumbnailUrl && (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img
                    src={course.thumbnailUrl.startsWith('http') 
                      ? course.thumbnailUrl 
                      : `http://localhost:8080/api${course.thumbnailUrl}`}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
              )}
              <div className="mb-2 flex items-center justify-between">
                <span className="badge badge-info text-xs">
                  {categories.find(c => c.value === course.category)?.label || course.category}
                </span>
                {course.isFree ? (
                  <span className="badge badge-success text-xs">Miễn phí</span>
                ) : (
                  <span className="badge badge-warning text-xs">
                    {course.price ? `${course.price} VND` : 'Premium'}
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
              {course.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                {course.durationHours && (
                  <span>
                    <i className="fas fa-clock mr-1"></i>
                    {course.durationHours} giờ
                  </span>
                )}
              </div>
              {activeTab === 'all' ? (
                <button
                  onClick={() => handleEnroll(course.id)}
                  className="btn-primary w-full"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Đăng ký
                </button>
              ) : (
                <Link
                  to={`/student/courses/${course.id}`}
                  className="btn-primary w-full text-center"
                >
                  <i className="fas fa-play mr-2"></i>
                  Tiếp tục học
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
