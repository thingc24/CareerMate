/**
 * Authentication Helper
 * Kiểm tra authentication và redirect nếu cần
 */

function checkAuth() {
    const token = localStorage.getItem('accessToken');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
        return JSON.parse(userStr);
    } catch (e) {
        return null;
    }
}

function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatCurrency(amount, currency = 'VND') {
    if (!amount) return 'Thỏa thuận';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ' + currency;
}

function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="flex items-center justify-center p-4"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';
    }
}

function showError(message, container) {
    if (container) {
        container.innerHTML = `<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">${message}</div>`;
    }
}

function showSuccess(message, container) {
    if (container) {
        container.innerHTML = `<div class="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">${message}</div>`;
    }
}

// Export
if (typeof window !== 'undefined') {
    window.checkAuth = checkAuth;
    window.getCurrentUser = getCurrentUser;
    window.logout = logout;
    window.formatDate = formatDate;
    window.formatCurrency = formatCurrency;
    window.showLoading = showLoading;
    window.showError = showError;
    window.showSuccess = showSuccess;
}

