/**
 * SQLite 数据库初始化
 * 创建用户表、提交记录表，并按配置初始化管理员
 */
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT_DIR = path.join(__dirname, '..');
const DEFAULT_DB_PATH = path.join(ROOT_DIR, 'data', 'javaoj.db');
const TEMP_DB_PATH = path.join(os.tmpdir(), 'javaoj', 'javaoj_safe.db');
const MEMORY_DB_PATH = ':memory:';
const ENV_DB_PATH = resolveEnvDbPath();
const ENABLE_DB_FALLBACK = process.env.JAVAOJ_ENABLE_DB_FALLBACK === '1';
const DB_CANDIDATES = buildDbCandidates();

let dbPath = DB_CANDIDATES[0];
let db;

function getDb() {
    if (db) return db;
    initWithFallbacks();
    return db;
}

function getDbPath() {
    return dbPath;
}

function resolveEnvDbPath() {
    const rawPath = (process.env.JAVAOJ_DB_PATH || '').trim();
    if (!rawPath) return '';
    return path.isAbsolute(rawPath) ? rawPath : path.resolve(ROOT_DIR, rawPath);
}

function buildDbCandidates() {
    const primaryPath = ENV_DB_PATH || DEFAULT_DB_PATH;
    if (!ENABLE_DB_FALLBACK) {
        return [primaryPath];
    }
    return [primaryPath, TEMP_DB_PATH, MEMORY_DB_PATH];
}

function initWithFallbacks() {
    let lastErr = null;

    for (let i = 0; i < DB_CANDIDATES.length; i++) {
        const candidate = DB_CANDIDATES[i];
        try {
            ensureParentDir(candidate);
            initDatabase(candidate);
            dbPath = candidate;
            if (candidate === MEMORY_DB_PATH) {
                console.warn('⚠️ 当前使用内存数据库（重启后数据会丢失）。');
            } else {
                console.log(`✅ SQLite 已就绪: ${dbPath}`);
                if (i > 0) {
                    console.warn('⚠️ 当前使用的是回退数据库路径，建议尽快迁移回主库路径。');
                } else if (!ENABLE_DB_FALLBACK) {
                    console.log('✅ 数据库回退已关闭（固定路径模式）。');
                }
            }
            return;
        } catch (err) {
            lastErr = err;
            safelyCloseDb();

            if (!ENABLE_DB_FALLBACK && isRecoverableDbError(err)) {
                throw new Error([
                    `数据库路径不可用 (${candidate}): ${err.message}`,
                    '当前运行在固定路径模式（未开启回退）。',
                    '如需临时启用回退，请设置环境变量 JAVAOJ_ENABLE_DB_FALLBACK=1。',
                    `如需迁移历史临时库，可执行: node scripts/migrate-db.cjs --from "${TEMP_DB_PATH}" --to "${candidate}"`,
                ].join('\n'));
            }

            if (!isRecoverableDbError(err) || i === DB_CANDIDATES.length - 1) {
                throw err;
            }

            const nextCandidate = DB_CANDIDATES[i + 1];
            console.warn(`⚠️ 数据库路径不可用 (${candidate}): ${err.message}`);
            console.warn(`⚠️ 尝试回退到: ${nextCandidate}`);
        }
    }

    throw lastErr || new Error('数据库初始化失败');
}

function initDatabase(filePath) {
    db = new Database(filePath);
    enablePragmas();
    initTables();
    seedAdmin();
}

function enablePragmas() {
    try {
        db.pragma('journal_mode = WAL');
    } catch (err) {
        if (!isRecoverableDbError(err)) throw err;
        console.warn('⚠️ 当前磁盘环境不支持 WAL，已回退为 DELETE journal 模式。');
        db.pragma('journal_mode = DELETE');
    }

    try {
        db.pragma('foreign_keys = ON');
    } catch (err) {
        if (!isRecoverableDbError(err)) throw err;
        console.warn('⚠️ foreign_keys pragma 设置失败，继续以默认模式运行。');
    }
}

function ensureParentDir(filePath) {
    if (filePath === MEMORY_DB_PATH) return;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function isRecoverableDbError(err) {
    const message = String((err && err.message) || '');
    return /(disk I\/O error|readonly|read-only|unable to open database file|database is locked|SQLITE_READONLY|SQLITE_CANTOPEN|database disk image is malformed)/i.test(message);
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

/** 初始化管理员账号（首次建库） */
function seedAdmin() {
    const existingAdmin = db.prepare('SELECT id, username FROM users WHERE role = ? LIMIT 1').get('admin');
    if (existingAdmin) return;

    const adminUsername = ((process.env.JAVAOJ_ADMIN_USERNAME || 'admin').trim()) || 'admin';
    const adminDisplayName = ((process.env.JAVAOJ_ADMIN_DISPLAY_NAME || '管理员').trim()) || '管理员';
    let adminPassword = (process.env.JAVAOJ_ADMIN_PASSWORD || '').trim();
    let generatedTemporaryPassword = false;

    if (!adminPassword) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('生产环境首次初始化管理员时必须配置 JAVAOJ_ADMIN_PASSWORD。');
        }
        adminPassword = generateTemporaryPassword();
        generatedTemporaryPassword = true;
    }

    if (adminPassword.length < 8) {
        throw new Error('管理员密码长度至少 8 字符（JAVAOJ_ADMIN_PASSWORD）。');
    }

    const existingUsername = db.prepare('SELECT id FROM users WHERE username = ?').get(adminUsername);
    if (existingUsername) {
        throw new Error(`无法初始化管理员：用户名 "${adminUsername}" 已存在。`);
    }

    const hash = bcrypt.hashSync(adminPassword, 10);
    db.prepare(
        'INSERT INTO users (username, password_hash, role, display_name) VALUES (?, ?, ?, ?)'
    ).run(adminUsername, hash, 'admin', adminDisplayName);

    console.log(`✅ 管理员已创建: ${adminUsername}`);
    if (generatedTemporaryPassword) {
        console.warn(`⚠️ 临时管理员密码: ${adminPassword}`);
        console.warn('⚠️ 建议立即在环境变量中设置 JAVAOJ_ADMIN_PASSWORD 并重启服务。');
    }
}

function generateTemporaryPassword() {
    return crypto.randomBytes(9).toString('base64').replace(/[+/=]/g, '').slice(0, 12);
}

module.exports = { getDb, getDbPath };
