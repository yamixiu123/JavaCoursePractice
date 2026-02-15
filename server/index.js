/**
 * Express 服务入口
 * 端口 3000
 */
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/progress', progressRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// 启动
app.listen(PORT, () => {
    console.log(`🚀 JavaOJ 后端已启动: http://localhost:${PORT}`);
    console.log(`   API 文档: /api/health`);
});
