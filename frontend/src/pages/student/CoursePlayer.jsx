import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CoursePlayer() {
  const { enrollmentId, lessonId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [enrollment, setEnrollment] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonProgress, setLessonProgress] = useState(null);
  const [allProgress, setAllProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchTime, setWatchTime] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(0);
  const progressIntervalRef = useRef(null);
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false); // Đã đạt điểm để qua bài tiếp theo

  useEffect(() => {
    loadData();
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [enrollmentId, lessonId]);

  useEffect(() => {
    if (currentLesson && enrollment) {
      startProgressTracking();
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [currentLesson, enrollment]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [enrollmentData, progressData] = await Promise.all([
        api.getEnrollment(enrollmentId),
        api.getEnrollmentProgress(enrollmentId)
      ]);
      
      setEnrollment(enrollmentData);
      setAllProgress(progressData);
      
      if (enrollmentData.course) {
        const modulesData = await api.getCourseModules(enrollmentData.course.id);
        // Load lessons for each module
        for (const module of modulesData) {
          if (module.id) {
            try {
              const lessons = await api.getModuleLessons(module.id);
              module.lessons = lessons;
            } catch (error) {
              console.error(`Error loading lessons for module ${module.id}:`, error);
              module.lessons = [];
            }
          }
        }
        setModules(modulesData);
        
        if (lessonId) {
          loadLesson(lessonId);
        } else if (modulesData.length > 0 && modulesData[0].lessons?.length > 0) {
          navigate(`/student/courses/${enrollmentData.course.id}/learn/${enrollmentId}/${modulesData[0].lessons[0].id}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error loading course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLesson = async (id) => {
    try {
      const lesson = await api.getLesson(id);
      setCurrentLesson(lesson);
      
      // Load progress first
      const progress = await api.getLessonProgress(enrollmentId, id);
      setLessonProgress(progress);
      
      if (progress?.lastPositionSeconds) {
        setCurrentPosition(progress.lastPositionSeconds);
      }
      
      // Reset quiz state when loading new lesson
      if (lesson.type === 'QUIZ') {
        try {
          const quizContent = JSON.parse(lesson.content || '{}');
          setQuizData(quizContent);
          setQuizAnswers({});
          setQuizSubmitted(false);
          setQuizScore(null);
          // Kiểm tra xem quiz đã pass chưa (dựa vào lesson progress)
          if (progress?.isCompleted) {
            // Nếu lesson đã completed, có nghĩa là quiz đã pass
            setQuizPassed(true);
          } else {
            setQuizPassed(false);
          }
        } catch (e) {
          console.error('Error parsing quiz content:', e);
          setQuizData(null);
          setQuizPassed(false);
        }
      } else {
        setQuizData(null);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);
        setQuizPassed(false);
      }
    } catch (error) {
      console.error('Error loading lesson:', error);
    }
  };

  const startProgressTracking = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(async () => {
      if (videoRef.current && !videoRef.current.paused) {
        const currentTime = Math.floor(videoRef.current.currentTime);
        const duration = Math.floor(videoRef.current.duration || 0);
        
        setWatchTime(currentTime);
        setCurrentPosition(currentTime);
        
        try {
          await api.updateLessonProgress(enrollmentId, currentLesson.id, currentTime, false);
        } catch (error) {
          console.error('Error updating progress:', error);
        }
      }
    }, 5000); // Update every 5 seconds
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentPosition(Math.floor(videoRef.current.currentTime));
    }
  };

  const handleMarkComplete = async () => {
    try {
      await api.markLessonComplete(enrollmentId, currentLesson.id);
      alert('Đã đánh dấu bài học hoàn thành!');
      loadData(); // Reload to update progress
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.error || 'Không thể đánh dấu hoàn thành'));
    }
  };

  const handleSubmitQuiz = () => {
    if (!quizData || !quizData.questions) return;
    
    let score = 0;
    quizData.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        score++;
      }
    });
    
    const totalQuestions = quizData.questions.length;
    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= 50; // Cần đạt 50% trở lên
    
    setQuizScore(score);
    setQuizSubmitted(true);
    setQuizPassed(passed);
    
    if (!passed) {
      alert(`Bạn đạt ${score}/${totalQuestions} câu (${Math.round(percentage)}%). Cần đạt ít nhất 50% để qua bài tiếp theo. Vui lòng làm lại!`);
    }
  };

  const getLessonProgressStatus = (lesson) => {
    const progress = allProgress.find(p => p.lesson?.id === lesson.id);
    return progress?.isCompleted || false;
  };

  const getNextLesson = () => {
    if (!modules.length || !currentLesson) return null;
    
    // Nếu là quiz và chưa pass, không cho phép qua bài tiếp theo
    if (currentLesson.type === 'QUIZ' && !quizPassed) {
      return null;
    }
    
    for (const module of modules) {
      if (!module.lessons) continue;
      const lessonIndex = module.lessons.findIndex(l => l.id === currentLesson.id);
      if (lessonIndex >= 0) {
        // Check if there's next lesson in same module
        if (lessonIndex < module.lessons.length - 1) {
          return module.lessons[lessonIndex + 1];
        }
        // Check next module
        const moduleIndex = modules.findIndex(m => m.id === module.id);
        if (moduleIndex < modules.length - 1 && modules[moduleIndex + 1].lessons?.length > 0) {
          return modules[moduleIndex + 1].lessons[0];
        }
      }
    }
    return null;
  };

  const handleNextLesson = () => {
    const next = getNextLesson();
    if (next) {
      navigate(`/student/courses/${enrollment.course.id}/learn/${enrollmentId}/${next.id}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  if (!enrollment || !currentLesson) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="card p-12 text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài học</h2>
          <button onClick={() => navigate('/student/courses')} className="btn-primary mt-4">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const completedLessons = allProgress.filter(p => p.isCompleted).length;
  const courseProgress = totalLessons > 0 ? (completedLessons / totalLessons * 100).toFixed(1) : 0;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Course Content */}
      <div className="w-80 bg-white border-r overflow-y-auto">
        <div className="p-4 border-b">
          <button
            onClick={() => navigate(`/student/courses/${enrollment.course.id}`)}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-2"
          >
            <i className="fas fa-arrow-left"></i>
            <span>Quay lại</span>
          </button>
          <h2 className="text-lg font-bold text-gray-900">{enrollment.course?.title}</h2>
          <div className="mt-2">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Tiến độ khóa học</span>
              <span>{courseProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${courseProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {modules.map((module, moduleIndex) => (
            <div key={module.id} className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Module {moduleIndex + 1}: {module.title}
              </h3>
              {module.lessons && module.lessons.length > 0 ? (
                <div className="space-y-1">
                  {module.lessons.map((lesson, lessonIndex) => {
                    const isCompleted = getLessonProgressStatus(lesson);
                    const isActive = currentLesson?.id === lesson.id;
                    
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => navigate(`/student/courses/${enrollment.course.id}/learn/${enrollmentId}/${lesson.id}`)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-100 text-blue-700 font-semibold'
                            : isCompleted
                            ? 'text-gray-700 hover:bg-gray-100'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isCompleted ? (
                            <i className="fas fa-check-circle text-green-500"></i>
                          ) : (
                            <i className="far fa-circle text-gray-400"></i>
                          )}
                          <span>{lessonIndex + 1}. {lesson.title}</span>
                          {lesson.durationMinutes && (
                            <span className="ml-auto text-xs text-gray-500">
                              {lesson.durationMinutes} phút
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Chưa có bài học</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Video/Content Area */}
        <div className="flex-1 bg-black overflow-y-auto">
          {currentLesson.type === 'VIDEO' && currentLesson.videoUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <video
                ref={videoRef}
                src={currentLesson.videoUrl}
                controls
                className="w-full h-full"
                onTimeUpdate={handleVideoTimeUpdate}
                onLoadedMetadata={() => {
                  if (videoRef.current && currentPosition > 0) {
                    videoRef.current.currentTime = currentPosition;
                  }
                }}
              />
            </div>
          ) : currentLesson.type === 'QUIZ' && quizData ? (
            <div className="max-w-4xl mx-auto p-8 text-white w-full min-h-full">
              <h1 className="text-3xl font-bold mb-6 sticky top-0 bg-black pb-4 z-10">{currentLesson.title}</h1>
              {!quizSubmitted ? (
                <div className="space-y-8">
                  {quizData.questions && quizData.questions.map((q, index) => (
                    <div key={q.id} className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
                      <div className="mb-4 pb-3 border-b border-gray-600">
                        <h3 className="text-xl font-semibold text-white">
                          Câu {index + 1}/{quizData.questions.length}: {q.question}
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {q.options.map((option, optIndex) => (
                          <label
                            key={optIndex}
                            className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${
                              quizAnswers[q.id] === optIndex
                                ? 'bg-blue-600'
                                : 'bg-gray-700 hover:bg-gray-600'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              value={optIndex}
                              checked={quizAnswers[q.id] === optIndex}
                              onChange={() => {
                                setQuizAnswers({ ...quizAnswers, [q.id]: optIndex });
                              }}
                              className="mr-3 w-5 h-5"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="sticky bottom-0 bg-black pt-6 pb-4 mt-8 border-t border-gray-700">
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(quizAnswers).length !== (quizData.questions?.length || 0)}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
                    >
                      {Object.keys(quizAnswers).length === (quizData.questions?.length || 0) 
                        ? 'Nộp bài' 
                        : `Đã trả lời ${Object.keys(quizAnswers).length}/${quizData.questions?.length || 0} câu`}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-600 rounded-lg p-6 text-center">
                    <h2 className="text-2xl font-bold mb-2">Kết quả bài kiểm tra</h2>
                    <p className="text-3xl font-bold">
                      {quizScore !== null ? `${quizScore}/${quizData.questions?.length || 0}` : 'Đang tính...'}
                    </p>
                    <p className="mt-2 text-lg">
                      {quizScore !== null && quizData.questions
                        ? `Tỷ lệ đúng: ${Math.round((quizScore / quizData.questions.length) * 100)}%`
                        : ''}
                    </p>
                  </div>
                  {quizData.questions && quizData.questions.map((q, index) => {
                    const userAnswer = quizAnswers[q.id];
                    const isCorrect = userAnswer === q.correctAnswer;
                    return (
                      <div
                        key={q.id}
                        className={`rounded-lg p-6 mb-6 ${
                          isCorrect ? 'bg-green-900 border-2 border-green-500' : 'bg-red-900 border-2 border-red-500'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-600">
                          <h3 className="text-xl font-semibold text-white">
                            Câu {index + 1}/{quizData.questions.length}: {q.question}
                          </h3>
                          {isCorrect ? (
                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                              Đúng
                            </span>
                          ) : (
                            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                              Sai
                            </span>
                          )}
                        </div>
                        <div className="space-y-2 mb-4">
                          {q.options.map((option, optIndex) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded ${
                                optIndex === q.correctAnswer
                                  ? 'bg-green-700 border-2 border-green-400'
                                  : optIndex === userAnswer && !isCorrect
                                  ? 'bg-red-700 border-2 border-red-400'
                                  : 'bg-gray-700'
                              }`}
                            >
                              {optIndex === q.correctAnswer && (
                                <span className="text-green-300 font-bold mr-2">✓ Đáp án đúng:</span>
                              )}
                              {optIndex === userAnswer && !isCorrect && (
                                <span className="text-red-300 font-bold mr-2">✗ Bạn chọn:</span>
                              )}
                              {option}
                            </div>
                          ))}
                        </div>
                        <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-800' : 'bg-red-800'}`}>
                          <p className="font-semibold mb-2">
                            {isCorrect ? 'Giải thích:' : 'Giải thích:'}
                          </p>
                          <p>
                            {isCorrect ? q.explanationCorrect : q.explanationWrong}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {quizPassed ? (
                    <div className="space-y-4">
                      <div className="bg-green-600 rounded-lg p-4 text-center">
                        <p className="text-white font-bold text-lg">
                          🎉 Chúc mừng! Bạn đã đạt điểm đủ để qua bài tiếp theo!
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await api.markLessonComplete(enrollmentId, currentLesson.id);
                            loadData(); // Reload to update progress
                            alert('Đã đánh dấu hoàn thành bài kiểm tra!');
                          } catch (error) {
                            console.error('Error marking lesson complete:', error);
                            alert('Lỗi: ' + (error.response?.data?.error || 'Không thể đánh dấu hoàn thành'));
                          }
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
                      >
                        Hoàn thành bài học
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-red-600 rounded-lg p-4 text-center">
                        <p className="text-white font-bold text-lg">
                          ❌ Bạn chưa đạt điểm đủ để qua bài tiếp theo!
                        </p>
                        <p className="text-white text-sm mt-2">
                          Cần đạt ít nhất 50% ({Math.ceil(quizData.questions.length * 0.5)}/{quizData.questions.length} câu đúng)
                        </p>
                        <p className="text-white text-sm mt-1">
                          Vui lòng xem lại các câu trả lời và làm lại bài kiểm tra!
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          // Reset quiz để làm lại
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                          setQuizScore(null);
                          setQuizPassed(false);
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors"
                      >
                        Làm lại bài kiểm tra
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-4xl mx-auto p-8 text-white">
              <h1 className="text-3xl font-bold mb-4">{currentLesson.title}</h1>
              {currentLesson.description && (
                <p className="text-lg mb-6 text-gray-300">{currentLesson.description}</p>
              )}
              {currentLesson.content && (
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: currentLesson.content }}
                />
              )}
            </div>
          )}
        </div>

        {/* Lesson Info & Controls */}
        <div className="bg-white border-t p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentLesson.title}</h1>
                {currentLesson.description && (
                  <p className="text-gray-600">{currentLesson.description}</p>
                )}
                {currentLesson.durationMinutes && (
                  <p className="text-sm text-gray-500 mt-2">
                    <i className="fas fa-clock mr-1"></i>
                    Thời lượng: {currentLesson.durationMinutes} phút
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {!lessonProgress?.isCompleted && (
                  <button
                    onClick={handleMarkComplete}
                    className="btn-primary"
                  >
                    <i className="fas fa-check mr-2"></i>
                    Đánh dấu hoàn thành
                  </button>
                )}
                {lessonProgress?.isCompleted && (
                  <span className="badge badge-success px-4 py-2">
                    <i className="fas fa-check-circle mr-2"></i>
                    Đã hoàn thành
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {currentLesson.type === 'VIDEO' && videoRef.current && (
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Tiến độ bài học</span>
                  <span>
                    {Math.floor(currentPosition / 60)}:{(currentPosition % 60).toString().padStart(2, '0')} / 
                    {videoRef.current.duration ? 
                      `${Math.floor(videoRef.current.duration / 60)}:${Math.floor(videoRef.current.duration % 60).toString().padStart(2, '0')}` 
                      : '--:--'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: videoRef.current.duration
                        ? `${(currentPosition / videoRef.current.duration) * 100}%`
                        : '0%'
                    }}
                  ></div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <button
                onClick={() => navigate(`/student/courses/${enrollment.course.id}`)}
                className="btn-secondary"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Về trang khóa học
              </button>
              {getNextLesson() ? (
                <button
                  onClick={handleNextLesson}
                  className="btn-primary"
                >
                  Bài tiếp theo
                  <i className="fas fa-arrow-right ml-2"></i>
                </button>
              ) : currentLesson?.type === 'QUIZ' && !quizPassed ? (
                <button
                  disabled
                  className="btn-primary opacity-50 cursor-not-allowed"
                  title="Cần đạt ít nhất 50% để qua bài tiếp theo"
                >
                  <i className="fas fa-lock mr-2"></i>
                  Cần đạt 50% để tiếp tục
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
