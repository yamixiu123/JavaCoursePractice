/**
 * 认证路由
 * POST /api/auth/login  - 登录
 * GET  /api/auth/me     - 获取当前用户信息
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');
const { signToken, requireAuth } = require('../auth');

const router = express.Router();

/** 登录 */
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: '用户名或密码错误' });
    }

    const token = signToken(user);
    res.json({
        token,
        user: {
            id: user.id,
            username: user.username,
            role: user.role,
            displayName: user.display_name,
        },
    });
});

/** 获取当前用户 */
router.get('/me', requireAuth, (req, res) => {
    const db = getDb();
    const user = db.prepare('SELECT id, username, role, display_name FROM users WHERE id = ?').get(req.user.id);

    if (!user) {
        return res.status(404).json({ error: '用户不存在' });
    }

    res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        displayName: user.display_name,
    });
});

module.exports = router;
