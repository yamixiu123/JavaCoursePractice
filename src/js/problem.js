/**
 * 做题页逻辑
 * 含 CodeMirror 编辑器、判题、拖拽分隔条
 */
import { EditorView, basicSetup } from 'codemirror';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';
import { problems, getProblemById } from './problems.js';
import { judge } from './judge.js';
import { getMyProgress, requireStudentAuth, submitProgress } from './api.js';
import {
    getSolvedSet, markSolved, markAttempted,
    addHistory, saveCode, getSavedCode,
} from './storage.js';

let editor = null;
let currentProblem = null;
let solvedSet = new Set();

async function init() {
    const user = requireStudentAuth();
    if (!user) return;

    await loadSolvedState();

    const id = Number(new URLSearchParams(window.location.search).get('id')) || 1;
    currentProblem = getProblemById(id);
    if (!currentProblem) {
        currentProblem = problems[0];
        history.replaceState(null, '', `?id=${currentProblem.id}`);
    }
    renderProblem();
    initEditor();
    initResizer();
    initVerticalResizer();
    bindEvents();
}

async function loadSolvedState() {
    solvedSet = getSolvedSet();
    try {
        const data = await getMyProgress();
        const nextSolved = new Set();
        for (const item of data.progress || []) {
            const problemId = Number(item.problem_id);
            if (problemId && Number(item.solved) === 1) {
                nextSolved.add(problemId);
            }
        }
        solvedSet = nextSolved;
    } catch (err) {
        console.warn('加载后端进度失败，使用本地进度:', err);
    }
}

/** 渲染题目描述 */
function renderProblem() {
    const p = currentProblem;
    document.title = `#${p.id} ${p.title} - JavaOJ`;
    document.getElementById('problem-title').textContent = `#${p.id} ${p.title}`;

    // 元信息
    const diffLabel = { easy: '简单', medium: '中等', hard: '困难' }[p.difficulty];
    document.getElementById('problem-meta').innerHTML = `
    <span class="diff-badge diff-badge--${p.difficulty}">${diffLabel}</span>
    ${p.tags.map((t) => `<span class="tag">${t}</span>`).join('')}
    ${solvedSet.has(p.id) ? '<span class="status-icon status-icon--solved">✅</span>' : ''}
  `;

    // 描述（简易 Markdown 渲染）
    document.getElementById('problem-description').innerHTML = renderMarkdown(p.description);

    // 示例
    document.getElementById('problem-examples').innerHTML = p.examples
        .map((ex, i) => `
      <div class="example-card">
        <div class="example-header">示例 ${i + 1}</div>
        <div class="example-body">
          <div class="example-row"><span class="example-label">输入</span><span class="example-value">${escapeHtml(ex.input)}</span></div>
          <div class="example-row"><span class="example-label">输出</span><span class="example-value">${escapeHtml(ex.output)}</span></div>
        </div>
      </div>
    `).join('');

    // 提示
    document.getElementById('hints-list').innerHTML = p.hints
        .map((h, i) => `
      <div class="hint-item">
        <button class="hint-toggle" data-index="${i}">💡 提示 ${i + 1}（点击展开）</button>
        <div class="hint-content" id="hint-${i}">${escapeHtml(h)}</div>
      </div>
    `).join('');

    // 导航按钮状态
    const idx = problems.findIndex((pp) => pp.id === p.id);
    document.getElementById('prev-btn').disabled = idx <= 0;
    document.getElementById('next-btn').disabled = idx >= problems.length - 1;
}

/** 初始化代码编辑器 */
function initEditor() {
    const container = document.getElementById('editor-container');
    const savedCode = getSavedCode(currentProblem.id);
    const code = savedCode || currentProblem.templateCode;

    editor = new EditorView({
        state: EditorState.create({
            doc: code,
            extensions: [
                basicSetup,
                java(),
                oneDark,
                EditorView.theme({
                    '&': { height: '100%' },
                    '.cm-scroller': { overflow: 'auto' },
                }),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        saveCode(currentProblem.id, update.state.doc.toString());
                    }
                }),
            ],
        }),
        parent: container,
    });
}

/** 水平拖拽分隔条 */
function initResizer() {
    const resizer = document.getElementById('resizer');
    const leftPanel = document.getElementById('description-panel');
    if (!resizer || !leftPanel) return;

    let startX, startWidth;

    resizer.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startWidth = leftPanel.offsetWidth;
        resizer.classList.add('active');
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
    });

    function onMouseMove(e) {
        const newWidth = startWidth + (e.clientX - startX);
        const minWidth = 280;
        const maxWidth = window.innerWidth * 0.7;
        leftPanel.style.width = `${Math.min(maxWidth, Math.max(minWidth, newWidth))}px`;
    }

    function onMouseUp() {
        resizer.classList.remove('active');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

/** 垂直拖拽分隔条 */
function initVerticalResizer() {
    const resizer = document.getElementById('resizer-h');
    const resultSection = document.getElementById('result-section');
    const editorPanel = document.getElementById('editor-panel');
    if (!resizer || !resultSection || !editorPanel) return;

    let startY, startHeight;

    resizer.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        startHeight = resultSection.offsetHeight;
        resizer.classList.add('active');
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        e.preventDefault();
    });

    function onMouseMove(e) {
        const newHeight = startHeight - (e.clientY - startY);
        const minHeight = 80;
        const maxHeight = editorPanel.offsetHeight * 0.6;
        resultSection.style.height = `${Math.min(maxHeight, Math.max(minHeight, newHeight))}px`;
    }

    function onMouseUp() {
        resizer.classList.remove('active');
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

/** 绑定按钮事件 */
function bindEvents() {
    // 运行
    document.getElementById('run-btn').addEventListener('click', () => {
        void runCode(false);
    });
    // 提交
    document.getElementById('submit-btn').addEventListener('click', () => {
        void runCode(true);
    });
    // 重置
    document.getElementById('reset-btn').addEventListener('click', () => {
        if (!confirm('确定要重置代码吗？')) return;
        editor.dispatch({
            changes: { from: 0, to: editor.state.doc.length, insert: currentProblem.templateCode },
        });
    });

    // 上/下题
    document.getElementById('prev-btn').addEventListener('click', () => navigate(-1));
    document.getElementById('next-btn').addEventListener('click', () => navigate(1));

    // Tab 切换
    document.querySelectorAll('.panel-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.panel-tab').forEach((t) => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach((c) => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
        });
    });

    // 提示展开
    document.getElementById('hints-list').addEventListener('click', (e) => {
        const toggle = e.target.closest('.hint-toggle');
        if (!toggle) return;
        const content = document.getElementById(`hint-${toggle.dataset.index}`);
        content.classList.toggle('visible');
        toggle.textContent = content.classList.contains('visible')
            ? `💡 提示 ${Number(toggle.dataset.index) + 1}（点击收起）`
            : `💡 提示 ${Number(toggle.dataset.index) + 1}（点击展开）`;
    });

    // 庆祝弹窗
    document.getElementById('celebration-close').addEventListener('click', closeCelebration);
    document.getElementById('celebration-next').addEventListener('click', () => {
        closeCelebration();
        navigate(1);
    });
    document.getElementById('celebration-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeCelebration();
    });
}

/** 运行/提交代码 */
async function runCode(isSubmit) {
    const code = editor.state.doc.toString();
    const result = judge(code, currentProblem);

    markAttempted(currentProblem.id);

    // 渲染结果
    const resultBody = document.getElementById('result-body');
    const resultStatus = document.getElementById('result-status');

    resultStatus.textContent = result.accepted ? 'Accepted' : 'Wrong Answer';
    resultStatus.className = `result-status ${result.accepted ? 'result-status--ac' : 'result-status--wa'}`;

    let html = `<div class="result-message" style="margin-bottom:12px;font-size:0.9rem;color:${result.accepted ? 'var(--easy)' : 'var(--hard)'}">${result.message}</div>`;

    if (result.results.length > 0) {
        html += '<div class="test-case-list">';
        html += result.results
            .map((tc, i) => `
        <div class="test-case test-case--${tc.passed ? 'pass' : 'fail'}" style="animation-delay:${i * 0.1}s">
          <span class="test-case__icon">${tc.passed ? '✅' : '❌'}</span>
          <div class="test-case__detail">
            <div class="test-case__line"><span class="test-case__label">输入:</span><span class="test-case__value">${escapeHtml(tc.input)}</span></div>
            <div class="test-case__line"><span class="test-case__label">期望:</span><span class="test-case__value">${escapeHtml(tc.expected)}</span></div>
            <div class="test-case__line"><span class="test-case__label">实际:</span><span class="test-case__value">${escapeHtml(tc.actual)}</span></div>
          </div>
        </div>
      `).join('');
        html += '</div>';
    }

    resultBody.innerHTML = html;

    if (isSubmit) {
        try {
            await submitProgress(
                currentProblem.id,
                result.accepted ? 'accepted' : 'wrong',
                code
            );
        } catch (err) {
            resultBody.innerHTML = `
        <div class="form-error" style="margin-bottom:10px;">
          提交记录保存失败：${escapeHtml(err.message || '未知错误')}
        </div>
      ` + resultBody.innerHTML;
            return;
        }

        addHistory({
            problemId: currentProblem.id,
            title: currentProblem.title,
            status: result.accepted ? 'accepted' : 'wrong',
            timestamp: Date.now(),
        });

        if (result.accepted) {
            markSolved(currentProblem.id);
            solvedSet.add(currentProblem.id);
            renderProblem();
            showCelebration();
        }
    }
}

/** 导航上/下题 */
function navigate(delta) {
    const idx = problems.findIndex((p) => p.id === currentProblem.id);
    const newIdx = idx + delta;
    if (newIdx < 0 || newIdx >= problems.length) return;

    const newProblem = problems[newIdx];
    window.location.href = `/problem.html?id=${newProblem.id}`;
}

/** 展示庆祝弹窗 */
function showCelebration() {
    const overlay = document.getElementById('celebration-overlay');
    document.getElementById('celebration-text').textContent = `恭喜你通过了 #${currentProblem.id} ${currentProblem.title}！`;
    overlay.classList.add('visible');
}

function closeCelebration() {
    document.getElementById('celebration-overlay').classList.remove('visible');
}

/** 简易 Markdown 渲染 */
function renderMarkdown(text) {
    return text
        .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', init);
