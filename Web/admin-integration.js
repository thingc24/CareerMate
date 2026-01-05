/**
 * Admin Dashboard Integration
 * Tích hợp admin.html với backend API
 */

// Check authentication and admin role
if (!checkAuth()) {
    // Redirect will happen
}

const currentUser = getCurrentUser();
if (currentUser && currentUser.role !== 'ADMIN') {
    alert('Bạn không có quyền truy cập trang này');
    window.location.href = currentUser.role === 'RECRUITER' ? 'nhatuyendung.html' : 'sinhvien.html';
}

// Load admin dashboard data
async function loadAdminDashboard() {
    try {
        // Load users
        const usersData = await api.getAllUsers(0, 10);
        updateUsersTable(usersData.content || []);

        // Load pending jobs
        const pendingJobsData = await api.getPendingJobs(0, 10);
        updatePendingJobs(pendingJobsData.content || []);

        // Load stats
        const stats = {
            totalUsers: usersData.totalElements || 0,
            totalJobs: 0, // Need to calculate
            totalApplications: 0,
            pendingApprovals: pendingJobsData.totalElements || 0
        };

        updateAdminStats(stats);
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
    }
}

function updateAdminStats(stats) {
    const statsElements = {
        totalUsers: document.getElementById('totalUsersCount'),
        totalJobs: document.getElementById('totalJobsCount'),
        totalApplications: document.getElementById('totalApplicationsCount'),
        pendingApprovals: document.getElementById('pendingApprovalsCount')
    };

    if (statsElements.totalUsers) statsElements.totalUsers.textContent = stats.totalUsers.toLocaleString('vi-VN');
    if (statsElements.totalJobs) statsElements.totalJobs.textContent = stats.totalJobs.toLocaleString('vi-VN');
    if (statsElements.totalApplications) statsElements.totalApplications.textContent = stats.totalApplications.toLocaleString('vi-VN');
    if (statsElements.pendingApprovals) statsElements.pendingApprovals.textContent = stats.pendingApprovals;
}

function updateUsersTable(users) {
    const tbody = document.querySelector('#usersTable tbody');
    if (!tbody) return;

    tbody.innerHTML = users.map(user => `
        <tr class="hover:bg-gray-50">
            <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2 sm:gap-3">
                    <div class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                        ${getInitials(user.fullName)}
                    </div>
                    <div>
                        <p class="font-medium text-gray-900 text-sm sm:text-base">${user.fullName}</p>
                        <p class="text-xs text-gray-500">ID: #${user.id.substring(0, 8)}</p>
                    </div>
                </div>
            </td>
            <td class="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                <span class="px-2 py-1 bg-${getRoleColor(user.role)}-100 text-${getRoleColor(user.role)}-700 text-xs font-medium rounded">
                    ${getRoleText(user.role)}
                </span>
            </td>
            <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden md:table-cell">${user.email}</td>
            <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 bg-${user.status === 'ACTIVE' ? 'green' : 'red'}-100 text-${user.status === 'ACTIVE' ? 'green' : 'red'}-700 text-xs font-medium rounded">
                    ${getStatusText(user.status)}
                </span>
            </td>
            <td class="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 hidden lg:table-cell">${formatDate(user.createdAt)}</td>
            <td class="px-3 sm:px-6 py-4 whitespace-nowrap">
                <div class="flex gap-2">
                    <button onclick="editUser('${user.id}')" class="text-blue-600 hover:text-blue-700 p-1" title="Chỉnh sửa">
                        <i class="fas fa-edit text-sm sm:text-base"></i>
                    </button>
                    <button onclick="updateUserStatus('${user.id}', '${user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'}')" class="text-${user.status === 'ACTIVE' ? 'orange' : 'green'}-600 hover:text-${user.status === 'ACTIVE' ? 'orange' : 'green'}-700 p-1" title="${user.status === 'ACTIVE' ? 'Khóa' : 'Kích hoạt'}">
                        <i class="fas fa-${user.status === 'ACTIVE' ? 'ban' : 'check'} text-sm sm:text-base"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePendingJobs(jobs) {
    const container = document.getElementById('pendingJobsList');
    if (!container) return;

    container.innerHTML = jobs.map(job => `
        <div class="p-6 hover:bg-gray-50 transition">
            <div class="flex items-start justify-between">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h4 class="font-semibold text-gray-900">${job.title}</h4>
                        <span class="px-2 py-1 bg-${job.type === 'Tin tuyển dụng' ? 'blue' : 'yellow'}-100 text-${job.type === 'Tin tuyển dụng' ? 'blue' : 'yellow'}-700 text-xs font-medium rounded">${job.type || 'Tin tuyển dụng'}</span>
                    </div>
                    <p class="text-sm text-gray-600 mb-3">Công ty: ${job.company?.name || 'N/A'} • Ngày đăng: ${formatDate(job.createdAt)}</p>
                    <p class="text-sm text-gray-500">${job.description?.substring(0, 100)}...</p>
                </div>
                <div class="flex gap-2 ml-4">
                    <button onclick="approveJob('${job.id}')" class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition">
                        <i class="fas fa-check mr-1"></i>Duyệt
                    </button>
                    <button onclick="rejectJob('${job.id}')" class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition">
                        <i class="fas fa-times mr-1"></i>Từ chối
                    </button>
                    <button onclick="viewJob('${job.id}')" class="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('') || '<div class="p-6 text-center text-gray-500">Không có tin nào chờ duyệt</div>';
}

// Approve job
async function approveJob(jobId) {
    if (!confirm('Bạn có chắc muốn duyệt tin tuyển dụng này?')) return;
    
    try {
        await api.approveJob(jobId);
        alert('Đã duyệt tin tuyển dụng!');
        loadAdminDashboard();
    } catch (error) {
        alert('Lỗi: ' + (error.message || 'Không thể duyệt tin'));
    }
}

// Reject job
async function rejectJob(jobId) {
    if (!confirm('Bạn có chắc muốn từ chối tin tuyển dụng này?')) return;
    
    try {
        await api.rejectJob(jobId);
        alert('Đã từ chối tin tuyển dụng!');
        loadAdminDashboard();
    } catch (error) {
        alert('Lỗi: ' + (error.message || 'Không thể từ chối tin'));
    }
}

// Update user status
async function updateUserStatus(userId, status) {
    try {
        await api.updateUserStatus(userId, status);
        alert('Cập nhật trạng thái thành công!');
        loadAdminDashboard();
    } catch (error) {
        alert('Lỗi: ' + (error.message || 'Không thể cập nhật'));
    }
}

function getInitials(name) {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function getRoleText(role) {
    const roleMap = {
        'STUDENT': 'Sinh viên',
        'RECRUITER': 'Nhà tuyển dụng',
        'ADMIN': 'Admin',
        'MENTOR': 'Mentor'
    };
    return roleMap[role] || role;
}

function getRoleColor(role) {
    const colorMap = {
        'STUDENT': 'blue',
        'RECRUITER': 'green',
        'ADMIN': 'red',
        'MENTOR': 'purple'
    };
    return colorMap[role] || 'gray';
}

function getStatusText(status) {
    const statusMap = {
        'ACTIVE': 'Hoạt động',
        'INACTIVE': 'Không hoạt động',
        'SUSPENDED': 'Đã khóa',
        'DELETED': 'Đã xóa'
    };
    return statusMap[status] || status;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadAdminDashboard();
});

// Export functions
if (typeof window !== 'undefined') {
    window.loadAdminDashboard = loadAdminDashboard;
    window.approveJob = approveJob;
    window.rejectJob = rejectJob;
    window.updateUserStatus = updateUserStatus;
}

