/**
 * 学生管理路由（管理员专用）
 * GET    /api/students        - 学生列表（含进度）
 * POST   /api/students        - 创建学生
 * DELETE /api/students/:id    - 删除学生
 * GET    /api/students/:id/progress - 学生详细进度
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { getDb } = require('../db');
const { requireAuth, requireAdmin } = require('../auth');

const router = express.Router();

// 所有路由需要管理员权限
router.use(requireAuth, requireAdmin);

/** 获取学生列表（含做题统计） */
router.get('/', (req, res) => {
    const db = getDb();

    const students = db.prepare(`
    SELECT
      u.id, u.username, u.display_name, u.created_at,
      COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.problem_id END) AS solved_count,
      COUNT(DISTINCT s.id) AS submission_count
    FROM users u
    LEFT JOIN submissions s ON u.id = s.user_id
    WHERE u.role = 'student'
    GROUP BY u.id
    ORDER BY u.created_at DESC
  `).all();

    res.json(students);
});

/** 创建学生 */
router.post('/', (req, res) => {
    const { username, password, displayName } = req.body;

    if (!username || !password || !displayName) {
        return res.status(400).json({ error: '用户名、密码和姓名不能为空' });
    }

    if (username.length < 2 || username.length > 30) {
        return res.status(400).json({ error: '用户名长度 2-30 个字符' });
    }

    if (password.length < 4) {
        return res.status(400).json({ error: '密码至少 4 个字符' });
    }

    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (existing) {
        return res.status(409).json({ error: '用户名已存在' });
    }

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
        'INSERT INTO users (username, password_hash, role, display_name) VALUES (?, ?, ?, ?)'
    ).run(username, hash, 'student', displayName);

    res.status(201).json({
        id: result.lastInsertRowid,
        username,
        displayName,
        message: '学生创建成功',
    });
});

/** 删除学生 */
router.delete('/:id', (req, res) => {
    const db = getDb();
    const id = Number(req.params.id);

    const user = db.prepare('SELECT role FROM users WHERE id = ?').get(id);
    if (!user) {
        return res.status(404).json({ error: '用户不存在' });
    }
    if (user.role === 'admin') {
        return res.status(403).json({ error: '不能删除管理员' });
    }

    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ message: '删除成功' });
});

/** 获取学生详细进度 */
router.get('/:id/progress', (req, res) => {
    const db = getDb();
    const userId = Number(req.params.id);

    const user = db.prepare('SELECT id, username, display_name FROM users WHERE id = ?').get(userId);
    if (!user) {
        return res.status(404).json({ error: '用户不存在' });
    }

    // 获取每道题的最新提交状态
    const progress = db.prepare(`
    SELECT
      problem_id,
      MAX(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) AS solved,
      COUNT(*) AS attempts,
      MAX(submitted_at) AS last_submit
    FROM submissions
    WHERE user_id = ?
    GROUP BY problem_id
    ORDER BY problem_id
  `).all(userId);

    // 最近提交记录
    const recentSubmissions = db.prepare(`
    SELECT problem_id, status, submitted_at
    FROM submissions
    WHERE user_id = ?
    ORDER BY submitted_at DESC
    LIMIT 20
  `).all(userId);

    res.json({
        user: { id: user.id, username: user.username, displayName: user.display_name },
        progress,
        recentSubmissions,
    });
});

module.exports = router;
