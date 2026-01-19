import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';

export default function Challenges() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [challenges, setChallenges] = useState([]);
  const [myChallenges, setMyChallenges] = useState([]);
  const [myBadges, setMyBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all'); // 'all', 'my', 'badges'

  useEffect(() => {
    if (activeTab === 'all') {
      loadChallenges();
    } else if (activeTab === 'my') {
      loadMyChallenges();
    } else {
      loadMyBadges();
    }
  }, [selectedCategory, activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await api.getChallenges(selectedCategory);
      setChallenges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyChallenges = async () => {
    try {
      setLoading(true);
      const data = await api.getMyChallenges();
      setMyChallenges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading my challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyBadges = async () => {
    try {
      setLoading(true);
      const data = await api.getMyBadges();
      setMyBadges(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: '', label: 'Tất cả' },
    { value: 'SKILL', label: 'Kỹ năng' },
    { value: 'CAREER', label: 'Nghề nghiệp' },
    { value: 'CV', label: 'CV' },
    { value: 'INTERVIEW', label: 'Phỏng vấn' },
  ];

  if (loading && challenges.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Đang tải thử thách...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b dark:border-gray-800">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'all'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Tất cả thử thách
        </button>
        <button
          onClick={() => handleTabChange('my')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'my'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Thử thách của tôi
        </button>
        <button
          onClick={() => handleTabChange('badges')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'badges'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          Huy hiệu của tôi ({myBadges.length})
        </button>
      </div>

      {/* Badges Tab */}
      {activeTab === 'badges' ? (
        <div>
          {myBadges.length === 0 ? (
            <div className="card p-12 text-center dark:bg-gray-900 dark:border-gray-800">
              <i className="fas fa-medal text-gray-400 dark:text-gray-500 text-6xl mb-4"></i>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Bạn chưa có huy hiệu nào</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Hoàn thành thử thách để nhận huy hiệu!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {myBadges.map((badge) => (
                <div key={badge.id} className="card p-6 text-center dark:bg-gray-900 dark:border-gray-800">
                  {badge.iconUrl && (
                    <img
                      src={badge.iconUrl.startsWith('http') 
                        ? badge.iconUrl 
                        : `http://localhost:8080/api${badge.iconUrl}`}
                      alt={badge.name}
                      className="w-24 h-24 mx-auto mb-4"
                    />
                  )}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{badge.name}</h3>
                  {badge.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">{badge.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filters - Only for 'all' tab */}
          {activeTab === 'all' && (
            <div className="card p-6 mb-6 dark:bg-gray-900 dark:border-gray-800">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field md:w-64 dark:bg-gray-800 dark:text-white dark:border-gray-700"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Challenges Grid */}
          {(activeTab === 'all' ? challenges : myChallenges.map(c => c.challenge)).length === 0 ? (
            <div className="card p-12 text-center dark:bg-gray-900 dark:border-gray-800">
              <i className="fas fa-tasks text-gray-400 dark:text-gray-500 text-6xl mb-4"></i>
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                {activeTab === 'all' ? 'Không tìm thấy thử thách nào' : 'Bạn chưa tham gia thử thách nào'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(activeTab === 'all' ? challenges : myChallenges.map(c => c.challenge)).map((challenge) => {
                const participation = activeTab === 'my' 
                  ? myChallenges.find(c => c.challenge.id === challenge.id)
                  : null;
                
                return (
                  <div
                    key={challenge.id}
                    className="card p-6 hover:shadow-lg transition-all duration-300 dark:bg-gray-900 dark:border-gray-800"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="badge badge-info text-xs">
                        {categories.find(c => c.value === challenge.category)?.label || challenge.category}
                      </span>
                      {participation?.status === 'COMPLETED' && (
                        <span className="badge badge-success text-xs">
                          <i className="fas fa-check mr-1"></i>
                          Hoàn thành
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{challenge.title}</h3>
                    {challenge.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                        {challenge.description}
                      </p>
                    )}
                    {challenge.points && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <i className="fas fa-star text-yellow-500 dark:text-yellow-400 mr-1"></i>
                          {challenge.points} điểm
                        </span>
                      </div>
                    )}
                    {challenge.badge && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          <i className="fas fa-medal text-blue-500 dark:text-blue-400 mr-1"></i>
                          Huy hiệu: {challenge.badge.name}
                        </span>
                      </div>
                    )}
                    <Link
                      to={`/student/challenges/${challenge.id}`}
                      className="btn-primary w-full text-center"
                    >
                      {participation ? 'Xem chi tiết' : 'Tham gia'}
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
