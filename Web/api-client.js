/**
 * CareerMate API Client
 * JavaScript client để gọi backend API
 */

const API_BASE_URL = 'http://localhost:8080/api';

class CareerMateAPI {
    constructor() {
        this.token = localStorage.getItem('accessToken');
        this.refreshToken = localStorage.getItem('refreshToken');
    }

    // Helper methods
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (includeAuth && this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    async request(url, options = {}) {
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(`${API_BASE_URL}${url}`, config);
            
            // Handle 401 - Token expired
            if (response.status === 401) {
                const refreshed = await this.refreshAccessToken();
                if (refreshed) {
                    config.headers['Authorization'] = `Bearer ${this.token}`;
                    return fetch(`${API_BASE_URL}${url}`, config);
                } else {
                    this.logout();
                    throw new Error('Session expired. Please login again.');
                }
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'Unknown error' }));
                throw new Error(error.message || `HTTP ${response.status}`);
            }

            return response;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    async refreshAccessToken() {
        if (!this.refreshToken) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken })
            });

            if (response.ok) {
                const data = await response.json();
                this.setTokens(data.accessToken, data.refreshToken);
                return true;
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
        }
        return false;
    }

    setTokens(accessToken, refreshToken) {
        this.token = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    }

    logout() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }

    // Authentication APIs
    async register(userData) {
        // Register doesn't need auth token
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Registration failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        this.setTokens(data.accessToken, data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user || data));
        return data;
    }

    async login(email, password) {
        // Login doesn't need auth token
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Login failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        this.setTokens(data.accessToken, data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user || data));
        return data;
    }

    // Student APIs
    async getStudentProfile() {
        const response = await this.request('/students/profile');
        return response.json();
    }

    async updateStudentProfile(profile) {
        const response = await this.request('/students/profile', {
            method: 'PUT',
            body: JSON.stringify(profile)
        });
        return response.json();
    }

    async uploadCV(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/students/cv/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Upload failed' }));
            throw new Error(error.message);
        }

        return response.json();
    }

    async getCVs() {
        const response = await this.request('/students/cv');
        return response.json();
    }

    async getCV(cvId) {
        const cvs = await this.getCVs();
        return Array.isArray(cvs) ? cvs.find(cv => cv.id === cvId) : null;
    }

    async getProfile() {
        const response = await this.request('/students/profile');
        return response.json();
    }

    async updateProfile(profileData) {
        const response = await this.request('/students/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        return response.json();
    }

    async searchJobs(keyword = '', location = '', page = 0, size = 10) {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        if (keyword) params.append('keyword', keyword);
        if (location) params.append('location', location);

        const response = await this.request(`/students/jobs?${params}`);
        return response.json();
    }

    async getJob(jobId) {
        const response = await this.request(`/students/jobs/${jobId}`);
        return response.json();
    }

    async applyForJob(jobId, cvId = null, coverLetter = '') {
        const params = new URLSearchParams({ jobId: jobId.toString() });
        if (cvId) params.append('cvId', cvId.toString());
        if (coverLetter) params.append('coverLetter', coverLetter);

        const response = await this.request(`/students/applications?${params}`, {
            method: 'POST'
        });
        return response.json();
    }

    async getApplications(page = 0, size = 10) {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        const response = await this.request(`/students/applications?${params}`);
        return response.json();
    }

    // Recruiter APIs
    async createJob(jobData, requiredSkills = [], optionalSkills = []) {
        const params = new URLSearchParams();
        requiredSkills.forEach(skill => params.append('requiredSkills', skill));
        optionalSkills.forEach(skill => params.append('optionalSkills', skill));

        const response = await this.request(`/recruiters/jobs?${params}`, {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
        return response.json();
    }

    async getMyJobs(page = 0, size = 10) {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        const response = await this.request(`/recruiters/jobs?${params}`);
        return response.json();
    }

    async getJobApplicants(jobId, page = 0, size = 10) {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        const response = await this.request(`/recruiters/jobs/${jobId}/applicants?${params}`);
        return response.json();
    }

    async updateApplicationStatus(applicationId, status, notes = '') {
        const params = new URLSearchParams({
            status: status,
            notes: notes
        });
        const response = await this.request(`/recruiters/applications/${applicationId}/status?${params}`, {
            method: 'PUT'
        });
        return response.json();
    }

    async scheduleInterview(applicationId, interviewTime) {
        const params = new URLSearchParams({
            interviewTime: interviewTime
        });
        const response = await this.request(`/recruiters/applications/${applicationId}/interview?${params}`, {
            method: 'POST'
        });
        return response.json();
    }

    // Recruiter Profile APIs
    async getRecruiterProfile() {
        const response = await this.request('/recruiters/profile');
        return response.json();
    }

    async updateRecruiterProfile(profileData) {
        const response = await this.request('/recruiters/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        return response.json();
    }

    // Company APIs
    async getMyCompany() {
        const response = await this.request('/recruiters/company');
        if (response.status === 404) {
            return null;
        }
        return response.json();
    }

    async createOrUpdateCompany(companyData) {
        const response = await this.request('/recruiters/company', {
            method: 'POST',
            body: JSON.stringify(companyData)
        });
        return response.json();
    }

    // Admin APIs
    async getAllUsers(page = 0, size = 10) {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        const response = await this.request(`/admin/users?${params}`);
        return response.json();
    }

    async updateUserStatus(userId, status) {
        const params = new URLSearchParams({ status: status });
        const response = await this.request(`/admin/users/${userId}/status?${params}`, {
            method: 'PUT'
        });
        return response.json();
    }

    async getPendingJobs(page = 0, size = 10) {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        const response = await this.request(`/admin/jobs/pending?${params}`);
        return response.json();
    }

    async approveJob(jobId) {
        const response = await this.request(`/admin/jobs/${jobId}/approve`, {
            method: 'POST'
        });
        return response.json();
    }

    async rejectJob(jobId) {
        const response = await this.request(`/admin/jobs/${jobId}/reject`, {
            method: 'POST'
        });
        return response.json();
    }

    // Quiz APIs
    async getQuizzes(category = null) {
        const params = category ? `?category=${category}` : '';
        const response = await this.request(`/students/quizzes${params}`);
        return response.json();
    }

    async getQuiz(quizId) {
        const response = await this.request(`/students/quizzes/${quizId}`);
        return response.json();
    }

    async startQuiz(quizId) {
        const response = await this.request(`/students/quizzes/${quizId}/start`, {
            method: 'POST'
        });
        return response.json();
    }

    async submitQuiz(attemptId, answers) {
        const response = await this.request(`/students/quizzes/attempts/${attemptId}/submit`, {
            method: 'POST',
            body: JSON.stringify(answers)
        });
        return response.json();
    }

    async getMyQuizAttempts() {
        const response = await this.request('/students/quizzes/attempts');
        return response.json();
    }

    // Career Roadmap APIs
    async generateRoadmap(careerGoal, currentLevel = 'BEGINNER', targetLevel = 'ADVANCED') {
        const params = new URLSearchParams({
            careerGoal: careerGoal,
            currentLevel: currentLevel
        });
        if (targetLevel) params.append('targetLevel', targetLevel);
        const response = await this.request(`/students/roadmap/generate?${params}`, {
            method: 'POST'
        });
        return response.json();
    }

    async getMyRoadmap() {
        try {
            const response = await this.request('/students/roadmap');
            const data = await response.json();
            // Backend returns single roadmap or list, normalize to list
            return Array.isArray(data) ? data : (data ? [data] : []);
        } catch (error) {
            // If 404, return empty array
            if (error.message.includes('404')) {
                return [];
            }
            throw error;
        }
    }

    async getCareerRoadmaps() {
        return this.getMyRoadmap();
    }

    async generateCareerRoadmap(data) {
        return this.generateRoadmap(data.careerGoal, data.currentLevel, data.targetLevel);
    }

    async updateRoadmapProgress(roadmapId, progressPercentage) {
        const params = new URLSearchParams({
            progressPercentage: progressPercentage.toString()
        });
        const response = await this.request(`/students/roadmap/${roadmapId}/progress?${params}`, {
            method: 'PUT'
        });
        return response.json();
    }

    // Mock Interview APIs
    async startMockInterview(jobId, studentProfile = null) {
        const body = studentProfile ? { profile: studentProfile } : {};
        const response = await this.request(`/students/mock-interview/start/${jobId}`, {
            method: 'POST',
            body: JSON.stringify(body)
        });
        return response.json();
    }

    async evaluateInterviewAnswer(question, answer, jobContext) {
        const response = await this.request('/students/mock-interview/evaluate', {
            method: 'POST',
            body: JSON.stringify({ question, answer, jobContext })
        });
        return response.json();
    }

    // Course APIs
    async getCourses(category = null) {
        const params = category ? `?category=${category}` : '';
        const response = await this.request(`/courses${params}`);
        return response.json();
    }

    async getFreeCourses() {
        const response = await this.request('/courses/free');
        return response.json();
    }

    async getCourse(courseId) {
        const response = await this.request(`/courses/${courseId}`);
        return response.json();
    }

    async enrollInCourse(courseId) {
        const response = await this.request(`/courses/${courseId}/enroll`, {
            method: 'POST'
        });
        return response.json();
    }

    async getMyEnrollments() {
        const response = await this.request('/courses/my-enrollments');
        return response.json();
    }

    async updateCourseProgress(enrollmentId, progressPercentage) {
        const params = new URLSearchParams({
            progressPercentage: progressPercentage.toString()
        });
        const response = await this.request(`/courses/enrollments/${enrollmentId}/progress?${params}`, {
            method: 'PUT'
        });
        return response.json();
    }

    // Challenge APIs
    async getChallenges(category = null) {
        const params = category ? `?category=${category}` : '';
        const response = await this.request(`/challenges${params}`);
        return response.json();
    }

    async getChallenge(challengeId) {
        const response = await this.request(`/challenges/${challengeId}`);
        return response.json();
    }

    async joinChallenge(challengeId) {
        const response = await this.request(`/challenges/${challengeId}/join`, {
            method: 'POST'
        });
        return response.json();
    }

    async completeChallenge(participationId) {
        const response = await this.request(`/challenges/participations/${participationId}/complete`, {
            method: 'POST'
        });
        return response.json();
    }

    async getMyParticipations() {
        const response = await this.request('/challenges/my-participations');
        return response.json();
    }

    // Article APIs
    async getArticles(keyword = '', category = '', page = 0, size = 10) {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        if (keyword) params.append('keyword', keyword);
        if (category) params.append('category', category);
        const response = await this.request(`/articles?${params}`);
        return response.json();
    }

    async getArticle(articleId) {
        const response = await this.request(`/articles/${articleId}`);
        return response.json();
    }

    // CV Template APIs
    async getCVTemplates(category = null) {
        const params = category ? `?category=${category}` : '';
        const response = await this.request(`/cv-templates${params}`);
        return response.json();
    }

    async getFreeCVTemplates() {
        const response = await this.request('/cv-templates/free');
        return response.json();
    }

    async getPremiumCVTemplates() {
        const response = await this.request('/cv-templates/premium');
        return response.json();
    }

    async getCVTemplate(templateId) {
        const response = await this.request(`/cv-templates/${templateId}`);
        return response.json();
    }

    // Company APIs
    async getCompanies(page = 0, size = 10) {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        const response = await this.request(`/companies?${params}`);
        return response.json();
    }

    async getTopCompanies(limit = 10) {
        const params = new URLSearchParams({ limit: limit.toString() });
        const response = await this.request(`/companies/top?${params}`);
        return response.json();
    }

    async getCompany(companyId) {
        const response = await this.request(`/companies/${companyId}`);
        return response.json();
    }

    async getCompanyRatings(companyId) {
        const response = await this.request(`/companies/${companyId}/ratings`);
        return response.json();
    }

    async getCompanyAverageRating(companyId) {
        const response = await this.request(`/companies/${companyId}/rating/average`);
        return response.json();
    }

    async rateCompany(companyId, rating, reviewText = '') {
        const params = new URLSearchParams({
            rating: rating.toString(),
            reviewText: reviewText
        });
        const response = await this.request(`/companies/${companyId}/ratings?${params}`, {
            method: 'POST'
        });
        return response.json();
    }

    // Package APIs
    async getPackages() {
        const response = await this.request('/packages');
        return response.json();
    }

    async getMySubscription() {
        const response = await this.request('/packages/my-subscription');
        return response.json();
    }

    async subscribeToPackage(packageId) {
        const response = await this.request(`/packages/${packageId}/subscribe`, {
            method: 'POST'
        });
        return response.json();
    }
}

// Export singleton instance
const api = new CareerMateAPI();

// Export class for custom instances
if (typeof window !== 'undefined') {
    window.CareerMateAPI = CareerMateAPI;
    window.api = api;
}

