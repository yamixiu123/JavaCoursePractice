#!/usr/bin/env node
/**
 * API smoke test (requires running server).
 *
 * Env:
 *   API_BASE=http://127.0.0.1:3000/api
 *   ADMIN_USERNAME=admin
 *   ADMIN_PASSWORD=...
 */
const crypto = require('crypto');

const API_BASE = (process.env.API_BASE || 'http://127.0.0.1:3000/api').replace(/\/+$/, '');
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const STUDENT_PASSWORD = 'Student@2026';

if (!ADMIN_PASSWORD) {
    console.error('❌ 缺少 ADMIN_PASSWORD 环境变量。');
    console.error('示例: ADMIN_PASSWORD=你的管理员密码 npm run test:smoke');
    process.exit(1);
}

run().catch((err) => {
    console.error(`❌ smoke check 失败: ${err.message}`);
    process.exit(1);
});

async function run() {
    const suffix = `${Date.now()}${crypto.randomBytes(2).toString('hex')}`.slice(-10);
    const studentUsername = `smoke_${suffix}`;
    let studentId = null;
    let adminToken = '';

    const adminLogin = await request('/auth/login', {
        method: 'POST',
        body: { username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
    });
    adminToken = adminLogin.token;
    logStep('admin login', true);

    try {
        const created = await request('/students', {
            method: 'POST',
            token: adminToken,
            body: {
                username: studentUsername,
                password: STUDENT_PASSWORD,
                displayName: 'Smoke Test Student',
            },
        });
        studentId = Number(created.id);
        logStep('create student', Number.isInteger(studentId) && studentId > 0);

        const studentLogin = await request('/auth/login', {
            method: 'POST',
            body: { username: studentUsername, password: STUDENT_PASSWORD },
        });
        const studentToken = studentLogin.token;
        logStep('student login', !!studentToken);

        await request('/progress/submit', {
            method: 'POST',
            token: studentToken,
            body: { problemId: 1, status: 'wrong', code: 'class Main {}' },
        });
        logStep('submit progress', true);

        const progress = await request('/progress/me', { token: studentToken });
        const progressCount = Array.isArray(progress.progress) ? progress.progress.length : 0;
        logStep('get progress', progressCount >= 1);
    } finally {
        if (studentId) {
            await request(`/students/${studentId}`, {
                method: 'DELETE',
                token: adminToken,
            });
            logStep('delete student', true);
        }
    }

    console.log('✅ smoke check 完成');
}

async function request(endpoint, options = {}) {
    const method = options.method || 'GET';
    const headers = { 'Content-Type': 'application/json' };
    if (options.token) {
        headers.Authorization = `Bearer ${options.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        method,
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    let data;
    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        data = { raw: text };
    }

    if (!response.ok) {
        const msg = data && data.error ? data.error : `HTTP ${response.status}`;
        throw new Error(`${method} ${endpoint} 失败: ${msg}`);
    }
    return data;
}

function logStep(name, pass) {
    if (!pass) {
        throw new Error(`步骤失败: ${name}`);
    }
    console.log(`- ${name}: ok`);
}
