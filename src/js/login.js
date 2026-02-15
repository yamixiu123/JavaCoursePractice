/**
 * 登录页逻辑
 */
import { login, isLoggedIn, getCurrentUser } from './api.js';

function init() {
    // 已登录则跳转
    if (isLoggedIn()) {
        const user = getCurrentUser();
        if (user?.role === 'admin') {
            window.location.href = '/admin.html';
        } else {
            window.location.href = '/';
        }
        return;
    }

    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const errorEl = document.getElementById('form-error');
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (!username || !password) {
        errorEl.textContent = '请输入用户名和密码';
        return;
    }

    btn.disabled = true;
    btn.querySelector('.login-btn-text').style.display = 'none';
    btn.querySelector('.login-btn-loading').style.display = 'flex';
    errorEl.textContent = '';

    try {
        const user = await login(username, password);
        // 根据角色跳转
        if (user.role === 'admin') {
            window.location.href = '/admin.html';
        } else {
            window.location.href = '/';
        }
    } catch (err) {
        errorEl.textContent = err.message;
        btn.disabled = false;
        btn.querySelector('.login-btn-text').style.display = 'inline';
        btn.querySelector('.login-btn-loading').style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', init);
