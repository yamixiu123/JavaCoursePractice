/**
 * 前端 API 请求封装
 * 自动附加 JWT token，处理统一错误
 */

const API_BASE = resolveApiBase();

function resolveApiBase() {
    const customBase = window.__JAVAOJ_API_BASE__;
    if (typeof customBase === 'string' && customBase.trim()) {
        return customBase.replace(/\/+$/, '');
    }

    const { protocol, port } = window.location;

    // Vite 开发环境（使用 /api 代理）
    if (port === '5173') return '/api';
    // 与后端同源时
    if (port === '3000') return '/api';
    // file:// 打开页面时无法走代理，直接连本地后端
    if (protocol === 'file:') return 'http://127.0.0.1:3000/api';

    // 生产环境（含 Cloudflare/Nginx 反代）统一走同源 /api
    return '/api';
}

/**
 * 获取存储的 token
 * @returns {string|null}
 */
export function getToken() {
    return localStorage.getItem('javaoj_token');
}

/**
 * 获取当前用户信息
 * @returns {Object|null}
 */
export function getCurrentUser() {
    try {
        const data = localStorage.getItem('javaoj_user');
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

/**
 * 保存登录信息
 * @param {string} token
 * @param {Object} user
 */
export function saveAuth(token, user) {
    localStorage.setItem('javaoj_token', token);
    localStorage.setItem('javaoj_user', JSON.stringify(user));
}

/**
 * 清除登录信息
 */
export function clearAuth() {
    localStorage.removeItem('javaoj_token');
    localStorage.removeItem('javaoj_user');
}

/**
 * 是否已登录
 * @returns {boolean}
 */
export function isLoggedIn() {
    return !!getToken();
}

/**
 * 学生页面鉴权（未登录跳登录，管理员跳管理页）
 * @returns {Object|null}
 */
export function requireStudentAuth() {
    const user = getCurrentUser();
    if (!isLoggedIn() || !user) {
        clearAuth();
        window.location.href = '/login.html';
        return null;
    }

    if (user.role === 'admin') {
        window.location.href = '/admin.html';
        return null;
    }

    return user;
}

/**
 * 通用请求方法
 * @param {string} endpoint
 * @param {Object} options
 * @returns {Promise<any>}
 */
export async function request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const contentType = response.headers.get('content-type') || '';
    let data = null;

    if (contentType.includes('application/json')) {
        try {
            data = await response.json();
        } catch {
            data = { error: '接口返回了无效的 JSON 数据' };
        }
    } else {
        const rawText = await response.text();
        const isHtml = /^\s*</.test(rawText);
        data = {
            error: isHtml
                ? '接口返回了 HTML（通常是后端未启动或 /api 代理未生效）'
                : '接口返回了非 JSON 响应',
        };
    }

    if (!response.ok) {
        // Token 过期自动跳转登录
        if (response.status === 401) {
            clearAuth();
            if (!window.location.pathname.includes('login')) {
                window.location.href = '/login.html';
            }
        }
        throw new Error(data.error || '请求失败');
    }

    if (!contentType.includes('application/json')) {
        throw new Error(data.error || '接口返回格式错误');
    }

    return data;
}

/** 登录 */
export async function login(username, password) {
    const data = await request('/auth/login', {
        method: 'POST',
        body: { username, password },
    });
    saveAuth(data.token, data.user);
    return data.user;
}

/** 退出 */
export function logout() {
    clearAuth();
    window.location.href = '/login.html';
}

/** 提交做题结果 */
export async function submitProgress(problemId, status, code) {
    return request('/progress/submit', {
        method: 'POST',
        body: { problemId, status, code },
    });
}

/** 获取当前用户进度 */
export async function getMyProgress() {
    return request('/progress/me');
}

/** 获取学生列表（管理员） */
export async function getStudents() {
    return request('/students');
}

/** 创建学生（管理员） */
export async function createStudent(username, password, displayName) {
    return request('/students', {
        method: 'POST',
        body: { username, password, displayName },
    });
}

/** 删除学生（管理员） */
export async function deleteStudent(id) {
    return request(`/students/${id}`, { method: 'DELETE' });
}

/** 获取学生进度（管理员） */
export async function getStudentProgress(id) {
    return request(`/students/${id}/progress`);
}
