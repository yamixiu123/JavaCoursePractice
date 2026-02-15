/**
 * 统计页逻辑
 */
import { problems } from './problems.js';
import { getSolvedSet, getHistory, getDailyCountMap } from './storage.js';
import { getMyProgress, requireStudentAuth } from './api.js';

let solvedSet = new Set();
let historyList = [];
let dailyCountMap = {};

async function init() {
    const user = requireStudentAuth();
    if (!user) return;

    await loadStatsData();
    renderOverview();
    renderDifficultyBars();
    renderHeatmap();
    renderHistory();
}

async function loadStatsData() {
    solvedSet = getSolvedSet();
    historyList = getHistory();
    dailyCountMap = getDailyCountMap();

    try {
        const data = await getMyProgress();
        solvedSet = new Set(
            (data.progress || [])
                .filter((item) => Number(item.solved) === 1)
                .map((item) => Number(item.problem_id))
                .filter(Boolean)
        );

        historyList = (data.recentSubmissions || [])
            .map((item) => {
                const problemId = Number(item.problem_id);
                if (!problemId) return null;
                const ts = new Date(item.submitted_at).getTime();
                if (!Number.isFinite(ts)) return null;

                return {
                    problemId,
                    title: getProblemTitle(problemId),
                    status: item.status === 'accepted' ? 'accepted' : 'wrong',
                    timestamp: ts,
                };
            })
            .filter(Boolean);

        dailyCountMap = buildDailyCountMap(historyList);
    } catch (err) {
        console.warn('加载后端统计失败，使用本地统计:', err);
    }
}

/** 概览：进度环 */
function renderOverview() {
    const total = problems.length;
    const solvedCount = solvedSet.size;

    document.getElementById('overview-solved').textContent = solvedCount;
    document.getElementById('overview-total').textContent = total;

    drawProgressRing(solvedCount, total);
}

/** 绘制进度环 */
function drawProgressRing(solved, total) {
    const canvas = document.getElementById('progress-ring');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 160;
    const center = size / 2;
    const radius = 60;
    const lineWidth = 10;
    const ratio = total > 0 ? solved / total : 0;

    ctx.clearRect(0, 0, size, size);

    // 背景环
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // 进度环
    if (ratio > 0) {
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, '#00f5a0');
        gradient.addColorStop(1, '#00d9f5');

        ctx.beginPath();
        ctx.arc(center, center, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ratio);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.stroke();
    }

    // 中心文字
    ctx.fillStyle = '#f0f4ff';
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(ratio * 100)}%`, center, center);
}

/** 难度柱状图 */
function renderDifficultyBars() {
    const counts = { easy: { total: 0, solved: 0 }, medium: { total: 0, solved: 0 }, hard: { total: 0, solved: 0 } };

    problems.forEach((p) => {
        counts[p.difficulty].total++;
        if (solvedSet.has(p.id)) counts[p.difficulty].solved++;
    });

    for (const [diff, data] of Object.entries(counts)) {
        const pct = data.total > 0 ? (data.solved / data.total) * 100 : 0;
        const bar = document.getElementById(`bar-${diff}`);
        const count = document.getElementById(`count-${diff}`);
        if (bar) setTimeout(() => (bar.style.width = `${pct}%`), 300);
        if (count) count.textContent = `${data.solved}/${data.total}`;
    }
}

/** 热力图 */
function renderHeatmap() {
    const grid = document.getElementById('heatmap-grid');
    const monthsEl = document.getElementById('heatmap-months');
    if (!grid) return;

    const today = new Date();
    const weeks = 26; // 约半年
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - weeks * 7 + (7 - startDate.getDay()));

    // 月份标签
    const months = [];
    let lastMonth = -1;
    const tempDate = new Date(startDate);
    for (let w = 0; w < weeks; w++) {
        const month = tempDate.getMonth();
        if (month !== lastMonth) {
            months.push({ week: w, name: `${month + 1}月` });
            lastMonth = month;
        }
        tempDate.setDate(tempDate.getDate() + 7);
    }

    monthsEl.innerHTML = '';
    let monthIdx = 0;
    for (let w = 0; w < weeks; w++) {
        const span = document.createElement('span');
        if (monthIdx < months.length && months[monthIdx].week === w) {
            span.textContent = months[monthIdx].name;
            monthIdx++;
        }
        span.style.minWidth = '15px';
        monthsEl.appendChild(span);
    }

    // 热力图格子
    grid.innerHTML = '';
    const currentDate = new Date(startDate);
    for (let w = 0; w < weeks; w++) {
        const weekDiv = document.createElement('div');
        weekDiv.className = 'heatmap-week';
        for (let d = 0; d < 7; d++) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const count = dailyCountMap[dateStr] || 0;
            const level = count === 0 ? 0 : count <= 1 ? 1 : count <= 3 ? 2 : count <= 5 ? 3 : 4;

            const cell = document.createElement('span');
            cell.className = `heatmap-cell heatmap-cell--${level}`;
            cell.title = `${dateStr}: ${count} 次提交`;
            weekDiv.appendChild(cell);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        grid.appendChild(weekDiv);
    }
}

/** 提交历史 */
function renderHistory() {
    const container = document.getElementById('history-list');

    if (historyList.length === 0) {
        container.innerHTML = '<div class="empty-state">暂无提交记录</div>';
        return;
    }

    container.innerHTML = historyList
        .slice(0, 50)
        .map((item) => {
            const icon = item.status === 'accepted' ? '✅' : '❌';
            const time = new Date(item.timestamp).toLocaleString('zh-CN');
            const badge = item.status === 'accepted' ? 'diff-badge--easy' : 'diff-badge--hard';
            const label = item.status === 'accepted' ? 'AC' : 'WA';

            return `
        <div class="history-item" onclick="window.location.href='/problem.html?id=${item.problemId}'">
          <span class="history-item__icon">${icon}</span>
          <span class="history-item__title">#${String(item.problemId).padStart(3, '0')} ${item.title}</span>
          <span class="diff-badge ${badge}">${label}</span>
          <span class="history-item__time">${time}</span>
        </div>
      `;
        })
        .join('');
}

function getProblemTitle(problemId) {
    const p = problems.find((item) => item.id === problemId);
    return p ? p.title : `题目 ${problemId}`;
}

function buildDailyCountMap(history) {
    const map = {};
    for (const entry of history) {
        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        map[date] = (map[date] || 0) + 1;
    }
    return map;
}

document.addEventListener('DOMContentLoaded', init);
