/**
 * localStorage 封装模块
 * 管理用户做题进度和提交记录
 */

const STORAGE_KEYS = {
    SOLVED: 'javaoj_solved',
    ATTEMPTS: 'javaoj_attempts',
    HISTORY: 'javaoj_history',
    CODE: 'javaoj_code',
};
const AUTH_USER_STORAGE_KEY = 'javaoj_user';

/**
 * 获取已通过的题目 ID 集合
 * @returns {Set<number>}
 */
export function getSolvedSet() {
    try {
        const data = readScopedJson(STORAGE_KEYS.SOLVED, []);
        return new Set(data ? JSON.parse(data) : []);
    } catch {
        return new Set();
    }
}

/**
 * 标记题目为已通过
 * @param {number} problemId
 */
export function markSolved(problemId) {
    const solved = getSolvedSet();
    solved.add(problemId);
    writeScopedJson(STORAGE_KEYS.SOLVED, [...solved]);
}

/**
 * 获取已尝试过的题目 ID 集合
 * @returns {Set<number>}
 */
export function getAttemptedSet() {
    try {
        const data = readScopedJson(STORAGE_KEYS.ATTEMPTS, []);
        return new Set(data ? JSON.parse(data) : []);
    } catch {
        return new Set();
    }
}

/**
 * 标记题目为已尝试
 * @param {number} problemId
 */
export function markAttempted(problemId) {
    const attempts = getAttemptedSet();
    attempts.add(problemId);
    writeScopedJson(STORAGE_KEYS.ATTEMPTS, [...attempts]);
}

/**
 * 添加提交记录
 * @param {{ problemId: number, title: string, status: string, timestamp: number }} entry
 */
export function addHistory(entry) {
    try {
        const history = getHistory();
        history.unshift(entry);
        // 最多保存 200 条
        if (history.length > 200) history.length = 200;
        writeScopedJson(STORAGE_KEYS.HISTORY, history);
    } catch {
        // 存储空间不足时忽略
    }
}

/**
 * 获取提交历史
 * @returns {Array}
 */
export function getHistory() {
    try {
        const data = readScopedJson(STORAGE_KEYS.HISTORY, []);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * 保存用户代码草稿
 * @param {number} problemId
 * @param {string} code
 */
export function saveCode(problemId, code) {
    try {
        const codeMap = getCodeMap();
        codeMap[problemId] = code;
        writeScopedJson(STORAGE_KEYS.CODE, codeMap);
    } catch {
        // 忽略
    }
}

/**
 * 获取用户保存的代码
 * @param {number} problemId
 * @returns {string|null}
 */
export function getSavedCode(problemId) {
    const codeMap = getCodeMap();
    return codeMap[problemId] || null;
}

function getCodeMap() {
    try {
        const data = readScopedJson(STORAGE_KEYS.CODE, {});
        return data ? JSON.parse(data) : {};
    } catch {
        return {};
    }
}

/**
 * 获取每日做题计数（用于热力图）
 * @returns {Object<string, number>} key 是 YYYY-MM-DD 格式
 */
export function getDailyCountMap() {
    const history = getHistory();
    const map = {};
    for (const entry of history) {
        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        map[date] = (map[date] || 0) + 1;
    }
    return map;
}

function writeScopedJson(baseKey, value) {
    const key = getScopedStorageKey(baseKey);
    localStorage.setItem(key, JSON.stringify(value));
}

function readScopedJson(baseKey, fallbackValue) {
    const scopedKey = getScopedStorageKey(baseKey);
    const scoped = localStorage.getItem(scopedKey);
    if (scoped !== null) return scoped;

    // 向后兼容：如果旧版未分用户，首次读取时迁移到当前用户命名空间
    const legacy = localStorage.getItem(baseKey);
    if (legacy === null) {
        return JSON.stringify(fallbackValue);
    }
    localStorage.setItem(scopedKey, legacy);
    return legacy;
}

function getScopedStorageKey(baseKey) {
    const userScope = getUserScope();
    return `${baseKey}:${userScope}`;
}

function getUserScope() {
    try {
        const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
        if (!raw) return 'anonymous';
        const user = JSON.parse(raw);
        if (user && user.id) return `u${user.id}`;
        if (user && user.username) return `name:${String(user.username)}`;
        return 'anonymous';
    } catch {
        return 'anonymous';
    }
}
