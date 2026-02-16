/**
 * 题目列表页逻辑
 */
import { problems, getAllTags } from './problems.js';
import { getSolvedSet, getAttemptedSet } from './storage.js';
import { getMyProgress, requireStudentAuth, logout } from './api.js';

let currentDifficulty = 'all';
let currentTag = null;
let searchQuery = '';
let solvedSet = new Set();
let attemptedSet = new Set();

/** 初始化页面 */
async function init() {
    const user = requireStudentAuth();
    if (!user) return;

    setupNav(user);
    await loadProgressState();
    renderStats();
    renderTagFilter();
    renderProblemList();
    bindEvents();
}

async function loadProgressState() {
    solvedSet = getSolvedSet();
    attemptedSet = getAttemptedSet();

    try {
        const data = await getMyProgress();
        const nextSolved = new Set();
        const nextAttempted = new Set();

        for (const item of data.progress || []) {
            const problemId = Number(item.problem_id);
            if (!problemId) continue;
            nextAttempted.add(problemId);
            if (Number(item.solved) === 1) {
                nextSolved.add(problemId);
            }
        }

        solvedSet = nextSolved;
        attemptedSet = nextAttempted;
    } catch (err) {
        console.warn('加载后端进度失败，使用本地进度:', err);
    }
}

/** 渲染统计卡片 */
function renderStats() {
    const total = problems.length;
    const solvedCount = solvedSet.size;
    const rate = total > 0 ? Math.round((solvedCount / total) * 100) : 0;

    document.getElementById('total-count').textContent = total;
    document.getElementById('solved-count').textContent = solvedCount;
    document.getElementById('pass-rate').textContent = `${rate}%`;
}

/** 渲染标签筛选器 */
function renderTagFilter() {
    const tags = getAllTags();
    const container = document.getElementById('tag-filter');

    container.innerHTML = tags
        .map((tag) => `<button class="tag-filter-btn" data-tag="${tag}">${tag}</button>`)
        .join('');
}

/** 渲染题目列表 */
function renderProblemList() {
    const container = document.getElementById('problem-list');

    const filtered = problems.filter((p) => {
        if (currentDifficulty !== 'all' && p.difficulty !== currentDifficulty) return false;
        if (currentTag && !p.tags.includes(currentTag)) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return (
                p.title.toLowerCase().includes(q) ||
                p.tags.some((t) => t.toLowerCase().includes(q)) ||
                String(p.id).includes(q)
            );
        }
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state">没有找到匹配的题目</div>';
        return;
    }

    container.innerHTML = filtered
        .map((p, i) => {
            const isSolved = solvedSet.has(p.id);
            const isAttempted = attemptedSet.has(p.id);
            const statusClass = isSolved ? 'solved' : isAttempted ? 'attempted' : 'unsolved';
            const statusIcon = isSolved ? '✅' : isAttempted ? '🟡' : '⚪';
            const diffClass = p.difficulty;

            return `
        <div class="problem-card" data-id="${p.id}" style="animation-delay: ${i * 0.04}s">
          <div class="problem-card__status">
            <span class="status-icon status-icon--${statusClass}">${statusIcon}</span>
          </div>
          <div class="problem-card__info">
            <div class="problem-card__title">
              <span class="problem-card__id">#${String(p.id).padStart(3, '0')}</span>
              ${p.title}
            </div>
            <div class="problem-card__tags">
              ${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
            </div>
          </div>
          <div class="problem-card__difficulty">
            <span class="diff-badge diff-badge--${diffClass}">${difficultyLabel(p.difficulty)}</span>
          </div>
          <div class="problem-card__actions">
            <span class="problem-card__arrow">→</span>
          </div>
        </div>
      `;
        })
        .join('');
}

function difficultyLabel(diff) {
    return { easy: '简单', medium: '中等', hard: '困难' }[diff] || diff;
}

function setupNav(user) {
    const navUser = document.getElementById('nav-user');
    const logoutBtn = document.getElementById('logout-btn');

    if (navUser) {
        navUser.textContent = user.displayName || user.username || '学生';
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}

/** 绑定事件 */
function bindEvents() {
    // 搜索
    document.getElementById('search-input').addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderProblemList();
    });

    // 难度筛选
    document.querySelectorAll('.filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.difficulty;
            renderProblemList();
        });
    });

    // 标签筛选
    document.getElementById('tag-filter').addEventListener('click', (e) => {
        const btn = e.target.closest('.tag-filter-btn');
        if (!btn) return;

        if (btn.classList.contains('active')) {
            btn.classList.remove('active');
            currentTag = null;
        } else {
            document.querySelectorAll('.tag-filter-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            currentTag = btn.dataset.tag;
        }
        renderProblemList();
    });

    // 点击题目卡片
    document.getElementById('problem-list').addEventListener('click', (e) => {
        const card = e.target.closest('.problem-card');
        if (!card) return;
        window.location.href = `/problem.html?id=${card.dataset.id}`;
    });
}

// 启动
document.addEventListener('DOMContentLoaded', init);
