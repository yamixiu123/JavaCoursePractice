#!/usr/bin/env node
/**
 * Migrate SQLite database file from one path to another.
 * Default: OS temp safe DB -> project data/javaoj.db
 *
 * Usage:
 *   node scripts/migrate-db.cjs
 *   node scripts/migrate-db.cjs --from "C:\\path\\javaoj_safe.db" --to ".\\data\\javaoj.db"
 *   node scripts/migrate-db.cjs --force
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const DEFAULT_FROM = path.join(os.tmpdir(), 'javaoj', 'javaoj_safe.db');
const DEFAULT_TO = path.join(ROOT_DIR, 'data', 'javaoj.db');

const fromArg = getArgValue('--from');
const toArg = getArgValue('--to');
const force = hasFlag('--force');

const fromPath = resolvePathOrDefault(fromArg, DEFAULT_FROM);
const toPath = resolvePathOrDefault(toArg, DEFAULT_TO);

if (path.resolve(fromPath) === path.resolve(toPath)) {
    fail(`源路径与目标路径相同：${fromPath}`);
}

if (!fs.existsSync(fromPath)) {
    fail(`源数据库不存在：${fromPath}`);
}

ensureParentDir(toPath);

console.log(`迁移源: ${fromPath}`);
console.log(`迁移目标: ${toPath}`);
console.log('请确保迁移前后端服务处于停止状态，避免文件占用。');

let backupPath = null;
if (fs.existsSync(toPath)) {
    if (force) {
        console.warn('⚠️ 已启用 --force，将直接覆盖目标库且不备份。');
    } else {
        backupPath = `${toPath}.bak.${formatTimestamp(new Date())}`;
        fs.copyFileSync(toPath, backupPath);
        console.log(`已备份目标库: ${backupPath}`);
    }
}

fs.copyFileSync(fromPath, toPath);
console.log('✅ 数据库迁移完成。');
console.log('建议下一步：');
console.log('1) 设置 JAVAOJ_DB_PATH 指向目标库路径');
console.log('2) 不设置 JAVAOJ_ENABLE_DB_FALLBACK（保持固定路径）');
console.log('3) 重启服务并验证登录/题库/统计');

function hasFlag(flag) {
    return process.argv.includes(flag);
}

function getArgValue(flag) {
    const idx = process.argv.indexOf(flag);
    if (idx === -1) return '';
    const value = process.argv[idx + 1];
    if (!value || value.startsWith('--')) {
        fail(`${flag} 缺少参数值`);
    }
    return value;
}

function resolvePathOrDefault(inputPath, defaultPath) {
    if (!inputPath) return defaultPath;
    return path.isAbsolute(inputPath) ? inputPath : path.resolve(ROOT_DIR, inputPath);
}

function ensureParentDir(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function formatTimestamp(date) {
    const pad = (num) => String(num).padStart(2, '0');
    return [
        date.getFullYear(),
        pad(date.getMonth() + 1),
        pad(date.getDate()),
        '-',
        pad(date.getHours()),
        pad(date.getMinutes()),
        pad(date.getSeconds()),
    ].join('');
}

function fail(message) {
    console.error(`❌ ${message}`);
    process.exit(1);
}
