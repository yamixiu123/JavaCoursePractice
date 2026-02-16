/**
 * JWT 认证中间件
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = resolveJwtSecret();
const JWT_EXPIRES_IN = '24h';

function resolveJwtSecret() {
    const fromEnv = (process.env.JWT_SECRET || '').trim();
    if (fromEnv) {
        if (fromEnv.length < 32) {
            console.warn('⚠️ JWT_SECRET 长度建议至少 32 字符。');
        }
        return fromEnv;
    }

    if (process.env.NODE_ENV === 'production') {
        throw new Error('生产环境必须配置 JWT_SECRET 环境变量。');
    }

    const tempSecret = crypto.randomBytes(48).toString('hex');
    console.warn('⚠️ JWT_SECRET 未配置，已使用临时随机密钥（服务重启后旧 token 会失效）。');
    return tempSecret;
}

/**
 * 签发 JWT
 * @param {{ id: number, username: string, role: string }} user
 * @returns {string}
 */
function signToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * 验证 JWT 中间件（必须登录）
 */
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '未登录' });
    }

    try {
        const token = authHeader.split(' ')[1];
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Token 无效或已过期' });
    }
}

/**
 * 验证管理员角色中间件
 */
function requireAdmin(req, res, next) {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '权限不足' });
    }
    next();
}

module.exports = { signToken, requireAuth, requireAdmin, JWT_SECRET };
