/**
 * Express 服务入口
 * 端口 3000
 */
const express = require('express');
const cors = require('cors');
const { getDb, getDbPath } = require('./db');

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const progressRoutes = require('./routes/progress');

const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = buildCorsOptions();

// 中间件
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

// API 路由
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/progress', progressRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// CORS 错误统一返回 JSON，避免泄漏 HTML 错误页
app.use((err, req, res, next) => {
    if (err && err.message === 'CORS_ORIGIN_DENIED') {
        return res.status(403).json({ error: '当前来源不允许访问 API' });
    }
    next(err);
});

// 启动
try {
    getDb();
    console.log(`✅ 当前数据库: ${getDbPath()}`);
} catch (err) {
    console.error(`❌ 数据库初始化失败: ${err.message}`);
    process.exit(1);
}

app.listen(PORT, () => {
    console.log(`🚀 JavaOJ 后端已启动: http://localhost:${PORT}`);
    console.log(`   API 文档: /api/health`);
});

function buildCorsOptions() {
    const configured = (process.env.CORS_ORIGIN || '').trim();
    const allowAll = configured === '*';
    const allowList = allowAll
        ? []
        : (configured
            ? configured.split(',').map((item) => item.trim()).filter(Boolean)
            : [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                'http://localhost:3000',
                'http://127.0.0.1:3000',
            ]);

    if (allowAll) {
        console.warn('⚠️ CORS_ORIGIN=* 将允许任意来源访问 API，请仅在受控环境使用。');
    } else {
        console.log(`✅ CORS 白名单: ${allowList.join(', ')}`);
    }

    return {
        origin(origin, callback) {
            // 允许无 Origin 的请求（如 curl、同机健康检查）
            if (!origin || allowAll || allowList.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('CORS_ORIGIN_DENIED'));
        },
    };
}
