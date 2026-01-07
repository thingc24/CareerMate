/**
 * API Client for CareerMate Frontend
 * Tương thích với api-client.js hiện tại
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

class CareerMateAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
    
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
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
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

  async refreshAccessToken() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken: this.refreshToken,
      });
      
      if (response.data.token) {
        this.token = response.data.token;
        localStorage.setItem('token', this.token);
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
    if (response.data.token) {
      this.token = response.data.token;
      this.refreshToken = response.data.refreshToken;
      localStorage.setItem('token', this.token);
      localStorage.setItem('refreshToken', this.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  }

  async register(userData) {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  // Student APIs
  async getJobs(page = 0, size = 10) {
    const response = await this.client.get(`/jobs?page=${page}&size=${size}`);
    return response.data;
  }

  async searchJobs(keyword = '', location = '', page = 0, size = 10) {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (location) params.append('location', location);
    params.append('page', page);
    params.append('size', size);
    
    const response = await this.client.get(`/jobs?${params}`);
    return response.data;
  }

  async getJobById(jobId) {
    const response = await this.client.get(`/jobs/${jobId}`);
    return response.data;
  }

  async applyForJob(jobId, cvId, coverLetter) {
    const response = await this.client.post(`/students/jobs/${jobId}/apply`, {
      cvId,
      coverLetter,
    });
    return response.data;
  }

  async getApplications(page = 0, size = 10) {
    const response = await this.client.get(`/students/applications?page=${page}&size=${size}`);
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
  async uploadCV(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/students/cvs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async getCVs() {
    const response = await this.client.get('/students/cvs');
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
}

// Export singleton instance
const api = new CareerMateAPI();
export default api;

