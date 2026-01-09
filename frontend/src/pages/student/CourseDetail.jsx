import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourse();
    checkEnrollment();
  }, [id]);

  useEffect(() => {
    if (course) {
      loadModules();
      // Re-check enrollment after course is loaded
      checkEnrollment();
    }
  }, [course]);

  // Re-check enrollment when enrollment state might have changed
  useEffect(() => {
    if (course && !enrollment) {
      // Periodically check enrollment if not found
      const interval = setInterval(() => {
        checkEnrollment();
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [course, enrollment]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const data = await api.getCourse(id);
      setCourse(data);
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    try {
      const enrollments = await api.getMyEnrollments();
      const myEnrollment = enrollments.find(e => e.course?.id === id);
      setEnrollment(myEnrollment);
    } catch (error) {
      console.error('Error checking enrollment:', error);
    }
  };

  const loadModules = async () => {
    try {
      console.log('Loading modules for course:', id);
      const modulesData = await api.getCourseModules(id);
      console.log('Modules loaded:', modulesData);
      
      // Modules should already have lessons loaded (EAGER fetch)
      // But if not, load them separately
      for (const module of modulesData) {
        if (module.id && (!module.lessons || module.lessons.length === 0)) {
          try {
            console.log('Loading lessons for module:', module.id);
            const lessons = await api.getModuleLessons(module.id);
            module.lessons = lessons;
            console.log('Lessons loaded for module:', module.id, lessons);
          } catch (error) {
            console.error(`Error loading lessons for module ${module.id}:`, error);
            module.lessons = [];
          }
        } else {
          console.log('Module already has lessons:', module.id, module.lessons?.length || 0);
        }
      }
      setModules(modulesData);
      console.log('Final modules with lessons:', modulesData);
    } catch (error) {
      console.error('Error loading modules:', error);
      console.error('Error details:', error.response?.data || error.message);
      setModules([]);
    }
  };

  const handleEnroll = async () => {
    try {
      // Check if course is premium
      if (course.isPremium) {
        // For premium courses, check subscription first
        try {
          const subscription = await api.getMySubscription();
          if (!subscription || !subscription.isActive) {
            // No active subscription, redirect to packages page
            if (confirm('Khóa học này yêu cầu gói Premium. Bạn có muốn mua gói Premium không?')) {
              navigate('/student/packages');
            }
            return;
          }
        } catch (subError) {
          // No subscription found, redirect to packages
          if (confirm('Khóa học này yêu cầu gói Premium. Bạn có muốn mua gói Premium không?')) {
            navigate('/student/packages');
          }
          return;
        }
      }

      // Enroll in course
      const enrollmentData = await api.enrollCourse(id);
      console.log('Enrollment successful:', enrollmentData);
      
      // Reload enrollment to get updated state
      const updatedEnrollment = await checkEnrollment();
      const finalEnrollment = updatedEnrollment || enrollmentData;
      
      // For free courses, automatically navigate to learning
      if (!course.isPremium) {
        // Wait a bit for state to update, then navigate
        setTimeout(() => {
          if (modules.length > 0 && modules[0].lessons?.length > 0) {
            const enrollmentId = finalEnrollment?.id || enrollmentData?.id;
            if (enrollmentId) {
              navigate(`/student/courses/${id}/learn/${enrollmentId}/${modules[0].lessons[0].id}`);
            } else {
              // Fallback: reload page to get enrollment
              window.location.reload();
            }
          } else {
            // No modules yet, reload to get modules
            window.location.reload();
          }
        }, 300);
      } else {
        // For premium courses, just show success
        alert('Đã đăng ký khóa học thành công!');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      
      if (errorMessage.includes('Already enrolled') || errorMessage.includes('đã đăng ký')) {
        // Already enrolled, just reload enrollment
        alert('Bạn đã đăng ký khóa học này rồi!');
        await checkEnrollment();
      } else {
        alert('Lỗi: ' + errorMessage);
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card p-12 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy khóa học</h2>
          <button onClick={() => navigate('/student/courses')} className="btn-primary mt-4">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/student/courses')}
        className="mb-6 text-gray-600 hover:text-gray-900 flex items-center gap-2"
      >
        <i className="fas fa-arrow-left"></i>
        <span>Quay lại</span>
      </button>

      {/* Course Header */}
      <div className="card p-8 mb-6">
        {course.thumbnailUrl && (
          <div className="mb-6 rounded-lg overflow-hidden">
            <img
              src={course.thumbnailUrl.startsWith('http') 
                ? course.thumbnailUrl 
                : `http://localhost:8080/api${course.thumbnailUrl}`}
              alt={course.title}
              className="w-full h-64 object-cover"
            />
          </div>
        )}
        <div className="mb-4">
          <span className="badge badge-info">{course.category}</span>
          {!course.isPremium ? (
            <span className="badge badge-success ml-2">Miễn phí</span>
          ) : (
            <span className="badge badge-warning ml-2">
              {course.price ? `${course.price} VND` : 'Premium'}
            </span>
          )}
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
        {course.description && (
          <p className="text-gray-700 leading-relaxed mb-4">{course.description}</p>
        )}
        <div className="flex items-center gap-6 text-sm text-gray-600">
          {course.durationHours && (
            <span>
              <i className="fas fa-clock mr-1"></i>
              {course.durationHours} giờ
            </span>
          )}
        </div>
      </div>

      {/* Course Content */}
      {course.content && (
        <div className="card p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nội dung khóa học</h2>
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: course.content }}
          />
        </div>
      )}

      {/* Course Modules & Lessons */}
      {modules.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nội dung khóa học</h2>
          <div className="space-y-6">
            {modules.map((module, moduleIndex) => (
              <div key={module.id} className="border-l-4 border-blue-500 pl-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Module {moduleIndex + 1}: {module.title}
                </h3>
                {module.description && (
                  <p className="text-gray-600 mb-3">{module.description}</p>
                )}
                {module.lessons && module.lessons.length > 0 ? (
                  <div className="space-y-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div
                        key={lesson.id}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                          {lessonIndex + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{lesson.title}</p>
                          {lesson.durationMinutes && (
                            <p className="text-sm text-gray-500">
                              <i className="fas fa-clock mr-1"></i>
                              {lesson.durationMinutes} phút
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {lesson.type === 'VIDEO' && (
                            <span className="badge badge-info text-xs">
                              <i className="fas fa-video mr-1"></i>
                              Video
                            </span>
                          )}
                          {lesson.isPreview && (
                            <span className="badge badge-success text-xs">Xem trước</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Chưa có bài học</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enrollment */}
      <div className="card p-6">
        {enrollment ? (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Bạn đã đăng ký khóa học này</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2">
                  <span className="font-semibold">Trạng thái: </span>
                  <span className="badge badge-success">Đã đăng ký</span>
                </p>
                {enrollment.progressPercentage && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Tiến độ</span>
                      <span>{enrollment.progressPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${enrollment.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
              {modules.length > 0 && modules[0].lessons?.length > 0 && (
                <button
                  onClick={() => navigate(`/student/courses/${id}/learn/${enrollment.id}/${modules[0].lessons[0].id}`)}
                  className="btn-primary w-full"
                >
                  <i className="fas fa-play mr-2"></i>
                  Bắt đầu học
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {!course.isPremium ? 'Bắt đầu học ngay' : 'Đăng ký khóa học'}
            </h2>
            {!course.isPremium ? (
              <button onClick={handleEnroll} className="btn-primary w-full">
                <i className="fas fa-play mr-2"></i>
                Học ngay
              </button>
            ) : (
              <button onClick={handleEnroll} className="btn-primary w-full">
                <i className="fas fa-crown mr-2"></i>
                Đăng ký (Yêu cầu Premium)
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
