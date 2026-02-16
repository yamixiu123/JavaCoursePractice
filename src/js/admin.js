/**
 * 管理员页面逻辑
 */
import { problems } from './problems.js';
import {
    getCurrentUser, isLoggedIn, logout,
    getStudents, createStudent, deleteStudent, getStudentProgress,
} from './api.js';

const TOTAL_PROBLEMS = problems.length;

function init() {
    // 权限检查
    if (!isLoggedIn()) {
        window.location.href = '/login.html';
        return;
    }
    const user = getCurrentUser();
    if (user?.role !== 'admin') {
        window.location.href = '/';
        return;
    }

    document.getElementById('nav-user').textContent = user.displayName || '管理员';
    document.getElementById('stat-total-problems').textContent = TOTAL_PROBLEMS;
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('create-form').addEventListener('submit', handleCreate);
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('detail-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });

    loadStudents();
}

async function loadStudents() {
    try {
        const students = await getStudents();

        // 更新统计
        document.getElementById('stat-students').textContent = students.length;
        const totalSubs = students.reduce((sum, s) => sum + (s.submission_count || 0), 0);
        document.getElementById('stat-submissions').textContent = totalSubs;

        renderStudentTable(students);
    } catch (err) {
        console.error('加载学生列表失败:', err);
    }
}

function renderStudentTable(students) {
    const tbody = document.getElementById('student-tbody');

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">暂无学生，请创建</td></tr>';
        return;
    }

    tbody.innerHTML = students
        .map((s) => {
            const pct = TOTAL_PROBLEMS > 0 ? Math.round((s.solved_count / TOTAL_PROBLEMS) * 100) : 0;
            return `
        <tr>
          <td><strong>${escapeHtml(s.display_name)}</strong></td>
          <td style="color:var(--text-muted);font-family:var(--font-mono);font-size:0.85rem">${escapeHtml(s.username)}</td>
          <td><span style="color:var(--accent-green);font-weight:600">${s.solved_count}</span> / ${TOTAL_PROBLEMS}</td>
          <td>
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" style="width:${pct}%"></div>
            </div>
          </td>
          <td>${s.submission_count || 0}</td>
          <td>
            <div class="table-actions">
              <button class="table-btn table-btn--view" data-id="${s.id}">查看详情</button>
              <button class="table-btn table-btn--delete" data-id="${s.id}" data-name="${escapeHtml(s.display_name)}">删除</button>
            </div>
          </td>
        </tr>
      `;
        })
        .join('');

    // 绑定事件
    tbody.querySelectorAll('.table-btn--view').forEach((btn) => {
        btn.addEventListener('click', () => showDetail(Number(btn.dataset.id)));
    });
    tbody.querySelectorAll('.table-btn--delete').forEach((btn) => {
        btn.addEventListener('click', () => handleDelete(Number(btn.dataset.id), btn.dataset.name));
    });
}

async function handleCreate(e) {
    e.preventDefault();
    const errorEl = document.getElementById('create-error');
    const successEl = document.getElementById('create-success');
    errorEl.textContent = '';
    successEl.textContent = '';

    const displayName = document.getElementById('stu-name').value.trim();
    const username = document.getElementById('stu-username').value.trim();
    const password = document.getElementById('stu-password').value;

    if (!displayName || !username || !password) {
        errorEl.textContent = '所有字段都不能为空';
        return;
    }

    if (password.length < 8) {
        errorEl.textContent = '密码至少 8 个字符';
        return;
    }

    try {
        await createStudent(username, password, displayName);
        successEl.textContent = `✅ 学生 ${displayName} 创建成功！`;
        document.getElementById('create-form').reset();
        loadStudents();
        setTimeout(() => (successEl.textContent = ''), 3000);
    } catch (err) {
        errorEl.textContent = err.message;
    }
}

async function handleDelete(id, name) {
    if (!confirm(`确定要删除学生 "${name}" 吗？该学生的所有提交记录也将被删除。`)) return;

    try {
        await deleteStudent(id);
        loadStudents();
    } catch (err) {
        alert('删除失败: ' + err.message);
    }
}

async function showDetail(studentId) {
    const modal = document.getElementById('detail-modal');
    const body = document.getElementById('modal-body');
    const title = document.getElementById('modal-title');

    body.innerHTML = '<div class="empty-state"><span class="spinner"></span> 加载中...</div>';
    modal.classList.add('visible');

    try {
        const data = await getStudentProgress(studentId);
        title.textContent = `${data.user.displayName} 的做题进度`;

        // 构建题目进度表格
        const progressMap = {};
        data.progress.forEach((p) => (progressMap[p.problem_id] = p));

        let tableHtml = `
      <table class="detail-table">
        <thead>
          <tr><th>#</th><th>题目</th><th>难度</th><th>状态</th><th>尝试次数</th><th>最后提交</th></tr>
        </thead>
        <tbody>
    `;

        for (const prob of problems) {
            const pg = progressMap[prob.id];
            const status = pg ? (pg.solved ? '✅ 已通过' : '❌ 未通过') : '⚪ 未做';
            const statusColor = pg ? (pg.solved ? 'var(--easy)' : 'var(--hard)') : 'var(--text-muted)';
            const diffLabel = { easy: '简单', medium: '中等', hard: '困难' }[prob.difficulty];

            tableHtml += `
        <tr>
          <td style="color:var(--text-muted);font-family:var(--font-mono)">${prob.id}</td>
          <td>${escapeHtml(prob.title)}</td>
          <td><span class="diff-badge diff-badge--${prob.difficulty}">${diffLabel}</span></td>
          <td style="color:${statusColor}">${status}</td>
          <td>${pg ? pg.attempts : 0}</td>
          <td style="font-size:0.8rem;color:var(--text-muted)">${pg?.last_submit ? new Date(pg.last_submit).toLocaleString('zh-CN') : '-'}</td>
        </tr>
      `;
        }

        tableHtml += '</tbody></table>';
        body.innerHTML = tableHtml;
    } catch (err) {
        body.innerHTML = `<div class="form-error">加载失败: ${err.message}</div>`;
    }
}

function closeModal() {
    document.getElementById('detail-modal').classList.remove('visible');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', init);
