/**
 * API Client for CareerMate Frontend
 * Tương thích với api-client.js hiện tại
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class CareerMateAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.loadTokens();
    
    // Setup axios instance
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Reload token from localStorage on each request
        this.loadTokens();
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
          // Log for profile endpoints
          if (config.url && config.url.includes('/students/profile')) {
            console.log('API Request - URL:', config.url);
            console.log('API Request - Token:', this.token.substring(0, 20) + '...');
          }
        } else {
          console.warn('No token found in localStorage');
          if (config.url && config.url.includes('/students/profile')) {
            console.error('API Request - Missing token for profile endpoint!');
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client.request(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  loadTokens() {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async refreshAccessToken() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken: this.refreshToken,
      });
      
      // Backend returns 'accessToken', not 'token'
      const token = response.data.accessToken || response.data.token;
      if (token) {
        this.token = token;
        localStorage.setItem('token', this.token);
        if (response.data.refreshToken) {
          this.refreshToken = response.data.refreshToken;
          localStorage.setItem('refreshToken', this.refreshToken);
        }
        return this.token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.token = null;
    this.refreshToken = null;
    window.location.href = '/login';
  }

  // Auth APIs
  async login(email, password) {
    const response = await this.client.post('/auth/login', { email, password });
    // Backend returns 'accessToken', not 'token'
    const token = response.data.accessToken || response.data.token;
    if (token) {
      this.token = token;
      this.refreshToken = response.data.refreshToken;
      localStorage.setItem('token', this.token);
      localStorage.setItem('refreshToken', this.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      console.log('Login successful. Token saved:', this.token.substring(0, 20) + '...');
    } else {
      console.error('Login response missing accessToken:', response.data);
    }
    return response.data;
  }

  async register(userData) {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  // Student APIs
  async getJobs(page = 0, size = 10) {
    // Use searchJobs with empty filters to get all jobs
    return this.searchJobs('', '', page, size);
  }

  async searchJobs(keyword = '', location = '', page = 0, size = 10) {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (location) params.append('location', location);
    params.append('page', page);
    params.append('size', size);
    
    const response = await this.client.get(`/students/jobs?${params}`);
    return response.data;
  }

  async getJobById(jobId) {
    const response = await this.client.get(`/students/jobs/${jobId}`);
    return response.data;
  }

  async applyForJob(jobId, cvId, coverLetter) {
    const params = new URLSearchParams();
    params.append('jobId', jobId);
    if (cvId) params.append('cvId', cvId);
    if (coverLetter) params.append('coverLetter', coverLetter);
    
    const response = await this.client.post(`/students/applications?${params}`);
    return response.data;
  }

  async getApplications(page = 0, size = 10) {
    const response = await this.client.get(`/students/applications?page=${page}&size=${size}`);
    return response.data;
  }

  async getStudentProfile(forceRefresh = false) {
    try {
      if (!this.token) {
        throw new Error('No authentication token found. Please login first.');
      }
      console.log('Getting student profile with token:', this.token.substring(0, 20) + '...');
      // Add cache busting parameter if force refresh
      const url = forceRefresh 
        ? `/students/profile?t=${Date.now()}`
        : '/students/profile';
      const response = await this.client.get(url);
      console.log('=== PROFILE API RESPONSE ===');
      console.log('Full response:', response.data);
      console.log('Profile details:', {
        gender: response.data?.gender,
        address: response.data?.address,
        city: response.data?.city,
        university: response.data?.university,
        major: response.data?.major
      });
      
      // Check if response has error
      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting student profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      if (error.response?.status === 401) {
        // Try to refresh token
        try {
          console.log('Attempting to refresh token...');
          await this.refreshAccessToken();
          const response = await this.client.get('/students/profile');
          return response.data;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          this.logout();
          throw new Error('Session expired. Please login again.');
        }
      }
      
      // Return error object with message
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async updateStudentProfile(profileData) {
    try {
      console.log('Updating profile with data:', profileData);
      const response = await this.client.put('/students/profile', profileData);
      console.log('Update response:', response.data);
      
      // Check if response has error
      if (response.data && response.data.error) {
        throw new Error(response.data.error);
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      throw new Error(errorMessage);
    }
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/students/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Recruiter APIs
  async createJob(jobData, requiredSkills = [], optionalSkills = []) {
    const params = new URLSearchParams();
    requiredSkills.forEach(skill => params.append('requiredSkills', skill));
    optionalSkills.forEach(skill => params.append('optionalSkills', skill));
    
    const response = await this.client.post(`/recruiters/jobs?${params}`, jobData);
    return response.data;
  }

  async getMyJobs(page = 0, size = 10) {
    const response = await this.client.get(`/recruiters/jobs?page=${page}&size=${size}`);
    return response.data;
  }

  async getJobApplicants(jobId, page = 0, size = 10) {
    const response = await this.client.get(`/recruiters/jobs/${jobId}/applicants?page=${page}&size=${size}`);
    return response.data;
  }

  async updateApplicationStatus(applicationId, status, note = '') {
    const response = await this.client.put(`/recruiters/applications/${applicationId}`, {
      status,
      note,
    });
    return response.data;
  }

  // Company APIs
  async getMyCompany() {
    try {
      const response = await this.client.get('/recruiters/company');
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async createOrUpdateCompany(companyData) {
    const response = await this.client.post('/recruiters/company', companyData);
    return response.data;
  }

  // CV APIs
  async getCVs() {
    const response = await this.client.get('/students/cv');
    return response.data;
  }

  async deleteCV(cvId) {
    const response = await this.client.delete(`/students/cv/${cvId}`);
    return response.data;
  }

  // Articles APIs
  async getArticles(keyword = '', category = '', page = 0, size = 20) {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (category) params.append('category', category);
    params.append('page', page);
    params.append('size', size);
    const response = await this.client.get(`/articles?${params.toString()}`);
    return response.data;
  }

  async getArticle(articleId) {
    const response = await this.client.get(`/articles/${articleId}`);
    return response.data;
  }

  // Company APIs
  async getCompanies(page = 0, size = 20, keyword = '') {
    const params = new URLSearchParams();
    params.append('page', page);
    params.append('size', size);
    if (keyword) params.append('keyword', keyword);
    const response = await this.client.get(`/companies?${params.toString()}`);
    return response.data;
  }

  async getCompany(companyId) {
    const response = await this.client.get(`/companies/${companyId}`);
    return response.data;
  }

  async getCompanyRatings(companyId) {
    const response = await this.client.get(`/companies/${companyId}/ratings`);
    return response.data;
  }

  async submitCompanyRating(companyId, rating) {
    // Backend expects rating and reviewText as request params
    const params = new URLSearchParams();
    params.append('rating', rating.rating);
    if (rating.comment) params.append('reviewText', rating.comment);
    const response = await this.client.post(`/companies/${companyId}/ratings?${params.toString()}`);
    return response.data;
  }

  // CV Template APIs
  async getCVTemplates(category = '') {
    const params = category ? `?category=${category}` : '';
    const response = await this.client.get(`/cv-templates${params}`);
    return response.data;
  }

  async getFreeCVTemplates() {
    const response = await this.client.get('/cv-templates/free');
    return response.data;
  }

  async getCVTemplate(templateId) {
    const response = await this.client.get(`/cv-templates/${templateId}`);
    return response.data;
  }

  async createCVFromTemplate(templateId, cvData) {
    const response = await this.client.post(`/cv-templates/${templateId}/create-cv`, cvData);
    return response.data;
  }

  // Course APIs
  async getCourses(category = '') {
    try {
      const params = category ? `?category=${category}` : '';
      console.log('API: Getting courses from /courses' + params);
      const response = await this.client.get(`/courses${params}`);
      console.log('API: Courses response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting courses:', error);
      throw error;
    }
  }

  async getFreeCourses() {
    try {
      console.log('API: Getting free courses from /courses/free');
      const response = await this.client.get('/courses/free');
      console.log('API: Free courses response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting free courses:', error);
      throw error;
    }
  }

  async getCourse(courseId) {
    const response = await this.client.get(`/courses/${courseId}`);
    return response.data;
  }

  async enrollCourse(courseId) {
    const response = await this.client.post(`/courses/${courseId}/enroll`);
    return response.data;
  }

  async getMyEnrollments() {
    const response = await this.client.get('/courses/my-enrollments');
    return response.data;
  }

  async getEnrollment(enrollmentId) {
    const response = await this.client.get(`/courses/enrollments/${enrollmentId}`);
    return response.data;
  }

  // Course Content APIs
  async getCourseModules(courseId) {
    try {
      console.log('API: Getting course modules from /course-content/courses/' + courseId + '/modules');
      const response = await this.client.get(`/course-content/courses/${courseId}/modules`);
      console.log('API: Course modules response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting course modules:', error);
      throw error;
    }
  }

  async getModuleLessons(moduleId) {
    try {
      console.log('API: Getting module lessons from /course-content/modules/' + moduleId + '/lessons');
      const response = await this.client.get(`/course-content/modules/${moduleId}/lessons`);
      console.log('API: Module lessons response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting module lessons:', error);
      throw error;
    }
  }

  async getLesson(lessonId) {
    try {
      console.log('API: Getting lesson from /course-content/lessons/' + lessonId);
      const response = await this.client.get(`/course-content/lessons/${lessonId}`);
      console.log('API: Lesson response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting lesson:', error);
      throw error;
    }
  }

  async getEnrollmentProgress(enrollmentId) {
    try {
      console.log('API: Getting enrollment progress from /course-content/enrollments/' + enrollmentId + '/progress');
      const response = await this.client.get(`/course-content/enrollments/${enrollmentId}/progress`);
      console.log('API: Enrollment progress response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting enrollment progress:', error);
      throw error;
    }
  }

  async getLessonProgress(enrollmentId, lessonId) {
    try {
      console.log('API: Getting lesson progress from /course-content/enrollments/' + enrollmentId + '/lessons/' + lessonId + '/progress');
      const response = await this.client.get(`/course-content/enrollments/${enrollmentId}/lessons/${lessonId}/progress`);
      console.log('API: Lesson progress response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error getting lesson progress:', error);
      throw error;
    }
  }

  async updateLessonProgress(enrollmentId, lessonId, currentTimeSeconds, completed) {
    try {
      console.log('API: Updating lesson progress:', { enrollmentId, lessonId, currentTimeSeconds, completed });
      const body = {};
      if (currentTimeSeconds !== undefined) body.currentTimeSeconds = currentTimeSeconds;
      if (completed !== undefined) body.completed = completed;
      const response = await this.client.put(`/course-content/enrollments/${enrollmentId}/lessons/${lessonId}/progress`, body);
      console.log('API: Update lesson progress response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error updating lesson progress:', error);
      throw error;
    }
  }

  async markLessonComplete(enrollmentId, lessonId) {
    try {
      console.log('API: Marking lesson complete:', { enrollmentId, lessonId });
      const response = await this.client.post(`/course-content/enrollments/${enrollmentId}/lessons/${lessonId}/complete`);
      console.log('API: Mark lesson complete response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API Error marking lesson complete:', error);
      throw error;
    }
  }

  // Challenge APIs
  async getChallenges(category = '') {
    const params = category ? `?category=${category}` : '';
    const response = await this.client.get(`/challenges${params}`);
    return response.data;
  }

  async getChallenge(challengeId) {
    const response = await this.client.get(`/challenges/${challengeId}`);
    return response.data;
  }

  async joinChallenge(challengeId) {
    const response = await this.client.post(`/challenges/${challengeId}/join`);
    return response.data;
  }

  async completeChallenge(participationId) {
    const response = await this.client.post(`/challenges/participations/${participationId}/complete`);
    return response.data;
  }

  async getMyChallenges() {
    const response = await this.client.get('/challenges/my-participations');
    return response.data;
  }

  async getMyBadges() {
    const response = await this.client.get('/challenges/my-badges');
    return response.data;
  }

  // Package APIs
  async getPackages() {
    const response = await this.client.get('/packages');
    return response.data;
  }

  async getMySubscription() {
    const response = await this.client.get('/packages/my-subscription');
    return response.data;
  }

  async subscribePackage(packageId) {
    const response = await this.client.post(`/packages/${packageId}/subscribe`);
    return response.data;
  }

  async uploadCV(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/students/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadCV(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/students/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // AI Services
  async analyzeCV(cvId) {
    const response = await this.client.post(`/ai/cv/analyze/${cvId}`);
    return response.data;
  }

  async getJobMatching(jobId) {
    const response = await this.client.get(`/ai/jobs/${jobId}/matching`);
    return response.data;
  }

  async startMockInterview(jobId, cvId) {
    const response = await this.client.post('/ai/interview/start', { jobId, cvId });
    return response.data;
  }

  async getCareerRoadmap(currentSkills, targetRole) {
    const response = await this.client.post('/ai/career/roadmap', {
      currentSkills,
      targetRole,
    });
    return response.data;
  }

  async chatAI(message, context, role) {
    const response = await this.client.post('/ai/chat', {
      message,
      context,
      role,
    });
    return response.data;
  }
}

// Export singleton instance
const api = new CareerMateAPI();
export default api;

