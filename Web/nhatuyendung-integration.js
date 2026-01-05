/**
 * Recruiter Dashboard Integration
 * Tích hợp nhatuyendung.html với backend API
 */

// Helper functions
function formatCurrency(amount, currency = 'VND') {
    if (!amount) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: currency || 'VND'
    }).format(amount);
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
}

// Get or create API client instance
// This will be the main api instance for this page
// Use window.api to avoid conflicts - don't declare var api here
if (typeof window !== 'undefined' && !window.api && typeof CareerMateAPI !== 'undefined') {
    window.api = new CareerMateAPI();
}

// Check authentication
if (typeof checkAuth === 'function' && !checkAuth()) {
    // Redirect will happen
}

// Load recruiter data - use different variable name to avoid conflict
let recruiterUser;
if (typeof getCurrentUser === 'function') {
    recruiterUser = getCurrentUser();
    if (recruiterUser) {
        // Update UI with user info
        const userNameEl = document.getElementById('userName');
        if (userNameEl) userNameEl.textContent = recruiterUser.fullName || recruiterUser.email;
    }
}

// Load recruiter dashboard data
async function loadRecruiterDashboard() {
    if (!window.api) {
        console.error('API client not initialized');
        return;
    }
    
    try {
        // Load my jobs
        const jobsData = await window.api.getMyJobs(0, 10);
        updateJobsList(jobsData.content || []);

        // Load stats
        const stats = {
            activeJobs: jobsData.content?.filter(j => j.status === 'ACTIVE').length || 0,
            totalApplicants: 0, // Will be calculated from jobs
            upcomingInterviews: 0,
            successfulHires: 0
        };

        // Calculate total applicants
        for (const job of jobsData.content || []) {
            try {
                const applicants = await window.api.getJobApplicants(job.id, 0, 1);
                stats.totalApplicants += applicants.totalElements || 0;
            } catch (e) {
                console.error('Error loading applicants for job:', job.id, e);
            }
        }

        updateStats(stats);
    } catch (error) {
        console.error('Error loading recruiter dashboard:', error);
        
        // Handle recruiter profile not found
        if (error.message && error.message.includes('Recruiter profile not found')) {
            console.warn('Recruiter profile not found. User may need to create a recruiter profile.');
            // Show message to user
            const statsContainer = document.querySelector('#dashboard .grid');
            if (statsContainer) {
                statsContainer.innerHTML = `
                    <div class="col-span-full bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                        <i class="fas fa-exclamation-triangle text-yellow-600 text-3xl mb-3"></i>
                        <h3 class="text-lg font-semibold text-yellow-800 mb-2">Chưa có hồ sơ nhà tuyển dụng</h3>
                        <p class="text-sm text-yellow-700 mb-4">Bạn cần tạo hồ sơ nhà tuyển dụng trước khi sử dụng các chức năng này.</p>
                        <a href="recruiter-profile.html" class="inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition">
                            <i class="fas fa-user-plus mr-2"></i>Tạo hồ sơ ngay
                        </a>
                    </div>
                `;
            }
        }
    }
}

function updateStats(stats) {
    const statsElements = {
        activeJobs: document.getElementById('activeJobsCount'),
        totalApplicants: document.getElementById('totalApplicantsCount'),
        upcomingInterviews: document.getElementById('upcomingInterviewsCount'),
        successfulHires: document.getElementById('successfulHiresCount')
    };

    if (statsElements.activeJobs) statsElements.activeJobs.textContent = stats.activeJobs;
    if (statsElements.totalApplicants) statsElements.totalApplicants.textContent = stats.totalApplicants;
    if (statsElements.upcomingInterviews) statsElements.upcomingInterviews.textContent = stats.upcomingInterviews;
    if (statsElements.successfulHires) statsElements.successfulHires.textContent = stats.successfulHires;
}

function updateJobsList(jobs) {
    const jobsContainer = document.getElementById('myJobsList');
    if (!jobsContainer) return;

    if (jobs.length === 0) {
        jobsContainer.innerHTML = '<div class="text-center p-8 text-gray-500">Chưa có tin tuyển dụng nào</div>';
        return;
    }

    jobsContainer.innerHTML = jobs.map(job => `
        <div class="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition">
            <div class="flex flex-col sm:flex-row items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                    <div class="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h4 class="font-semibold text-gray-900 text-sm sm:text-base">${job.title}</h4>
                        <span class="px-2 py-1 bg-${job.status === 'ACTIVE' ? 'green' : 'yellow'}-100 text-${job.status === 'ACTIVE' ? 'green' : 'yellow'}-700 text-xs font-medium rounded whitespace-nowrap">
                            ${getJobStatusText(job.status)}
                        </span>
                    </div>
                    <p class="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                        ${job.location} • ${formatCurrency(job.minSalary, job.currency)} • Hết hạn: ${formatDate(job.expiresAt)}
                    </p>
                    <p class="text-xs text-gray-500">${job.applicationsCount || 0} ứng viên</p>
                </div>
                <div class="flex gap-2 sm:ml-4">
                    <button onclick="viewJobApplicants('${job.id}')" class="px-2 sm:px-3 py-1 text-blue-600 hover:bg-blue-50 rounded text-sm">
                        <i class="fas fa-users"></i>
                    </button>
                    <button onclick="editJob('${job.id}')" class="px-2 sm:px-3 py-1 text-gray-600 hover:bg-gray-50 rounded text-sm">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function getJobStatusText(status) {
    const statusMap = {
        'DRAFT': 'Nháp',
        'PENDING': 'Chờ duyệt',
        'ACTIVE': 'Đang tuyển',
        'CLOSED': 'Đã đóng',
        'REJECTED': 'Từ chối'
    };
    return statusMap[status] || status;
}

// Post new job
async function postNewJob(jobData) {
    if (!api) {
        alert('API client chưa được khởi tạo');
        return;
    }
    
    try {
        const requiredSkills = jobData.requiredSkills ? jobData.requiredSkills.split(',').map(s => s.trim()) : [];
        const optionalSkills = jobData.optionalSkills ? jobData.optionalSkills.split(',').map(s => s.trim()) : [];
        
        const job = await window.api.createJob(jobData, requiredSkills, optionalSkills);
        alert('Đăng tin thành công! Đang chờ duyệt từ admin.');
        loadRecruiterDashboard();
        return job;
    } catch (error) {
        alert('Lỗi: ' + (error.message || 'Không thể đăng tin'));
        throw error;
    }
}

// View job applicants
async function viewJobApplicants(jobId) {
    if (!api) {
        alert('API client chưa được khởi tạo');
        return;
    }
    
    try {
        const applicants = await window.api.getJobApplicants(jobId, 0, 50);
        // Show applicants in modal or navigate to applicants tab
        showTab('applicants');
        loadJobApplicants(jobId);
    } catch (error) {
        alert('Lỗi: ' + (error.message || 'Không thể tải danh sách ứng viên'));
    }
}

// Load job applicants
async function loadJobApplicants(jobId) {
    if (!api) {
        console.error('API client not initialized');
        return;
    }
    
    try {
        const applicants = await window.api.getJobApplicants(jobId, 0, 50);
        updateApplicantsKanban(applicants.content || []);
    } catch (error) {
        console.error('Error loading applicants:', error);
    }
}

function updateApplicantsKanban(applicants) {
    // Update kanban columns with applicants
    const columns = {
        new: applicants.filter(a => a.status === 'PENDING'),
        viewed: applicants.filter(a => a.status === 'VIEWED'),
        interview: applicants.filter(a => a.status === 'INTERVIEW'),
        offered: applicants.filter(a => a.status === 'OFFERED')
    };

    // Update each column
    updateKanbanColumn('new', columns.new);
    updateKanbanColumn('viewed', columns.viewed);
    updateKanbanColumn('interview', columns.interview);
    updateKanbanColumn('offered', columns.offered);
}

function updateKanbanColumn(columnId, applicants) {
    const column = document.querySelector(`[data-column="${columnId}"]`);
    if (!column) return;

    const container = column.querySelector('.space-y-2, .space-y-3') || column;
    container.innerHTML = applicants.map(app => `
        <div class="bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer">
            <div class="flex justify-between items-start mb-2 gap-2">
                <h4 class="font-semibold text-gray-900 text-sm sm:text-base flex-1">${app.studentName || 'Ứng viên'}</h4>
                <span class="text-xs font-bold text-green-600 bg-green-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-green-100">
                    ${app.matchScore || 0}%
                </span>
            </div>
            <p class="text-xs text-gray-500 mb-2 sm:mb-3">${app.appliedAt ? formatDate(app.appliedAt) : ''}</p>
            <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                <span class="text-xs text-gray-400">${formatDate(app.appliedAt)}</span>
                <div class="flex gap-1">
                    <button onclick="viewApplication('${app.id}')" class="p-1 hover:bg-gray-100 rounded text-gray-500 text-xs sm:text-sm" title="Xem CV">
                        <i class="fas fa-file-pdf"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('') || '<div class="text-center text-gray-400 text-xs">Chưa có ứng viên</div>';
}

// Update application status
async function updateApplicationStatus(applicationId, status, notes = '') {
    try {
        await window.api.updateApplicationStatus(applicationId, status, notes);
        alert('Cập nhật trạng thái thành công!');
        loadRecruiterDashboard();
    } catch (error) {
        alert('Lỗi: ' + (error.message || 'Không thể cập nhật'));
    }
}

// Schedule interview
async function scheduleInterview(applicationId, interviewTime) {
    try {
        await window.api.scheduleInterview(applicationId, interviewTime);
        alert('Đã lên lịch phỏng vấn!');
        loadRecruiterDashboard();
    } catch (error) {
        alert('Lỗi: ' + (error.message || 'Không thể lên lịch'));
    }
}

// Initialize on page load - but don't auto-load dashboard
// Dashboard will be loaded by nhatuyendung.html when tab is shown
// This prevents duplicate loading and errors

// Export functions
if (typeof window !== 'undefined') {
    window.loadRecruiterDashboard = loadRecruiterDashboard;
    window.postNewJob = postNewJob;
    window.viewJobApplicants = viewJobApplicants;
    window.updateApplicationStatus = updateApplicationStatus;
    window.scheduleInterview = scheduleInterview;
}

