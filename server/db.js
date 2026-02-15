/**
 * SQLite 数据库初始化
 * 创建用户表、提交记录表，并内置默认管理员
 */
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const os = require('os');

const DEFAULT_DB_PATH = path.join(__dirname, '..', 'data', 'javaoj.db');
const LOCAL_BASE_DIR = process.env.LOCALAPPDATA
    ? path.join(process.env.LOCALAPPDATA, 'javaoj')
    : path.join(os.tmpdir(), 'javaoj');
const SAFE_DB_PATH = path.join(LOCAL_BASE_DIR, 'javaoj_safe.db');
let dbPath = process.env.JAVAOJ_DB_PATH || DEFAULT_DB_PATH;

let db;

function getDb() {
    if (db) return db;

    tryInitPath(dbPath);

    return db;
}

function initDatabase(filePath) {
    db = new Database(filePath);
    try {
        db.pragma('journal_mode = WAL');
    } catch (err) {
        if (!isDiskIoError(err)) throw err;
        console.warn('⚠️ 当前磁盘环境不支持 WAL，已回退为 DELETE journal 模式。');
        db.pragma('journal_mode = DELETE');
    }
    try {
        db.pragma('foreign_keys = ON');
    } catch (err) {
        if (!isDiskIoError(err)) throw err;
        console.warn('⚠️ foreign_keys pragma 设置失败，继续以默认模式运行。');
    }
    initTables();
    seedAdmin();
}

function tryInitPath(filePath) {
    try {
        ensureParentDir(filePath);
        initDatabase(filePath);
    } catch (err) {
        if (!isDiskIoError(err)) throw err;
        safelyCloseDb();
        if (!process.env.JAVAOJ_DB_PATH && filePath === DEFAULT_DB_PATH) {
            console.warn('⚠️ 主数据库文件不可用，尝试切换到本地目录数据库。');
            dbPath = SAFE_DB_PATH;
            try {
                ensureParentDir(dbPath);
                initDatabase(dbPath);
                return;
            } catch (safeErr) {
                safelyCloseDb();
                console.warn('⚠️ 本地目录数据库仍不可用，已回退到内存数据库（重启后数据会丢失）。');
                dbPath = ':memory:';
                initDatabase(dbPath);
                return;
            }
        }
        throw err;
    }
}

function ensureParentDir(filePath) {
    if (filePath === ':memory:') return;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function isDiskIoError(err) {
    return /disk I\/O error/i.test(String(err && err.message));
}

function safelyCloseDb() {
    if (!db) return;
    try {
        db.close();
    } catch {
        // Ignore close errors on broken handles.
    }
    db = null;
}

function initTables() {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      display_name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      problem_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      code TEXT,
      submitted_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_problem ON submissions(problem_id);
  `);
}

/** 创建默认管理员 admin / admin123 */
function seedAdmin() {
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
    if (!existing) {
        const hash = bcrypt.hashSync('admin123', 10);
        db.prepare(
            'INSERT INTO users (username, password_hash, role, display_name) VALUES (?, ?, ?, ?)'
        ).run('admin', hash, 'admin', '管理员');
        console.log('✅ 默认管理员已创建: admin / admin123');
    }
}

module.exports = { getDb };
