/**
 * 进度路由
 * POST /api/progress/submit - 上报提交结果
 * GET  /api/progress/me     - 获取当前用户进度
 */
const express = require('express');
const { getDb } = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();
router.use(requireAuth);

/** 上报提交结果 */
router.post('/submit', (req, res) => {
    const { problemId, status, code } = req.body;

    if (!problemId || !status) {
        return res.status(400).json({ error: '缺少 problemId 或 status' });
    }

    const db = getDb();
    db.prepare(
        'INSERT INTO submissions (user_id, problem_id, status, code) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, problemId, status, code || '');

    res.json({ message: '提交成功' });
});

/** 获取当前用户做题进度 */
router.get('/me', (req, res) => {
    const db = getDb();

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
  `).all(req.user.id);

    const recentSubmissions = db.prepare(`
    SELECT problem_id, status, submitted_at
    FROM submissions
    WHERE user_id = ?
    ORDER BY submitted_at DESC
    LIMIT 50
  `).all(req.user.id);

    res.json({ progress, recentSubmissions });
});

module.exports = router;
