/**
 * JWT 认证中间件
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'javaoj_secret_key_2026';
const JWT_EXPIRES_IN = '24h';

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
