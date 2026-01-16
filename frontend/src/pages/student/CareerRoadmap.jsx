import { useState } from 'react';
import api from '../../services/api';

export default function CareerRoadmap() {
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [formData, setFormData] = useState({
    currentSkills: '',
    targetRole: '',
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.currentSkills || !formData.targetRole) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const data = await api.getCareerRoadmap(formData.currentSkills, formData.targetRole);
      setRoadmap(data);
    } catch (error) {
      console.error('Error generating roadmap:', error);
      alert('Lỗi: ' + (error.response?.data?.error || error.message || 'Không thể tạo lộ trình'));
    } finally {
      setLoading(false);
    }
  };

  const popularRoles = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'UI/UX Designer',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      {!roadmap ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kỹ năng hiện tại của bạn (phân cách bằng dấu phẩy)
              </label>
              <textarea
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: JavaScript, React, Node.js, Python..."
                value={formData.currentSkills}
                onChange={(e) => setFormData({ ...formData, currentSkills: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vị trí mục tiêu
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                placeholder="Ví dụ: Senior Full Stack Developer"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                required
              />
              <div className="flex flex-wrap gap-2">
                {popularRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetRole: role })}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>Đang tạo lộ trình...
                </>
              ) : (
                <>
                  <i className="fas fa-route mr-2"></i>Tạo lộ trình
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Roadmap Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 border border-blue-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lộ trình của bạn</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Vị trí mục tiêu</p>
                <p className="text-lg font-semibold text-gray-900">{formData.targetRole}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Kỹ năng hiện tại</p>
                <p className="text-lg font-semibold text-gray-900">{formData.currentSkills}</p>
              </div>
            </div>
          </div>

          {/* Roadmap Summary */}
          {roadmap.summary && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <i className="fas fa-info-circle mr-2 text-blue-600"></i>Tóm tắt lộ trình
              </h3>
              <p className="text-gray-700">{roadmap.summary}</p>
              {roadmap.timeline && (
                <p className="text-sm text-gray-600 mt-2">
                  <i className="fas fa-calendar-alt mr-1"></i>Thời gian ước tính: <strong>{roadmap.timeline}</strong>
                </p>
              )}
            </div>
          )}

          {/* Roadmap Steps */}
          {roadmap.steps && roadmap.steps.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                <i className="fas fa-route mr-2 text-blue-600"></i>Các bước thực hiện
              </h2>
              {roadmap.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6 relative hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {step.title || `Bước ${idx + 1}`}
                      </h3>
                      
                      {/* Description */}
                      {step.description && (
                        <div className="mb-4">
                          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                            {step.description}
                          </p>
                        </div>
                      )}
                      
                      {/* Skills */}
                      {step.skills && step.skills.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            <i className="fas fa-code mr-1 text-blue-600"></i>Kỹ năng cần học:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {step.skills.map((skill, skillIdx) => (
                              <span
                                key={skillIdx}
                                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200 font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Resources */}
                      {step.resources && step.resources.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            <i className="fas fa-book mr-1 text-green-600"></i>Tài nguyên học tập:
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                            {step.resources.map((resource, resIdx) => (
                              <li key={resIdx}>{resource}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Projects */}
                      {step.projects && step.projects.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            <i className="fas fa-project-diagram mr-1 text-purple-600"></i>Đề xuất project:
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                            {step.projects.map((project, projIdx) => (
                              <li key={projIdx}>{project}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Milestones */}
                      {step.milestones && step.milestones.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">
                            <i className="fas fa-flag-checkered mr-1 text-orange-600"></i>Mốc quan trọng:
                          </h4>
                          <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm">
                            {step.milestones.map((milestone, mileIdx) => (
                              <li key={mileIdx}>{milestone}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Duration */}
                      {step.duration && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600">
                            <i className="fas fa-clock mr-1 text-gray-500"></i>
                            <span className="font-semibold">Thời gian ước tính:</span> {step.duration}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Connector line */}
                  {idx < roadmap.steps.length - 1 && (
                    <div className="absolute left-7 top-20 w-0.5 h-6 bg-gradient-to-b from-blue-300 to-blue-100"></div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-gray-700">
                  {JSON.stringify(roadmap, null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          {/* Skills Gap */}
          {roadmap.skillsGap && roadmap.skillsGap.length > 0 && (
            <div className="bg-yellow-50 rounded-lg shadow-sm border border-yellow-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                <i className="fas fa-exclamation-triangle mr-2 text-yellow-600"></i>Kỹ năng còn thiếu
              </h3>
              <div className="flex flex-wrap gap-2">
                {roadmap.skillsGap.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full border border-yellow-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Recommended Courses */}
          {roadmap.recommendedCourses && roadmap.recommendedCourses.length > 0 && (
            <div className="bg-green-50 rounded-lg shadow-sm border border-green-200 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                <i className="fas fa-graduation-cap mr-2 text-green-600"></i>Khóa học đề xuất
              </h3>
              <div className="space-y-2">
                {roadmap.recommendedCourses.map((course, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <i className="fas fa-check-circle text-green-600 mt-1"></i>
                    <div>
                      <p className="text-gray-900 font-medium">{course.name || course}</p>
                      {course.platform && (
                        <p className="text-sm text-gray-600">Nền tảng: {course.platform}</p>
                      )}
                      {course.url && (
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Xem khóa học →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setRoadmap(null)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            <i className="fas fa-redo mr-2"></i>Tạo lộ trình mới
          </button>
        </div>
      )}
    </div>
  );
}

