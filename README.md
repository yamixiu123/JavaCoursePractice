# JavaOJ 练习平台（项目说明）

一个基于 **Vite + 原生前端 + Express + SQLite** 的 Java 练习平台原型，包含题库、做题页、统计页、登录与管理员学生管理。

## 1. 功能概览

- 题库列表：按难度、标签、关键字筛选题目
- 做题页：CodeMirror Java 编辑器、运行/提交、提示展开、上下题导航
- 判题：前端模拟判题（关键词/结构匹配，不是真实 JVM 执行）
- 学习统计：进度环、难度分布、提交热力图、最近提交
- 认证与管理：学生登录（JWT），管理员登录后创建/删除学生、查看学生做题进度
- 学生端页面鉴权：未登录会跳转登录页，管理员访问学生页会跳转管理页
- 提交闭环：学生“提交”会写入后端 `submissions`，题库/统计优先读取后端数据

## 2. 技术栈

- 前端：Vite 7、原生 HTML/CSS/JS、CodeMirror 6
- 后端：Express 5、JWT（jsonwebtoken）、bcryptjs
- 数据库：SQLite（better-sqlite3）

## 3. 目录结构（核心）

```text
.
├─ index.html / problem.html / stats.html / login.html / admin.html
├─ src/
│  ├─ js/
│  │  ├─ problems.js        # 30 道 Java 题目数据
│  │  ├─ judge.js           # 前端模拟判题引擎
│  │  ├─ problem-list.js    # 题库页逻辑
│  │  ├─ problem.js         # 做题页逻辑
│  │  ├─ stats.js           # 统计页逻辑
│  │  ├─ api.js             # 前端 API 封装（JWT）
│  │  ├─ login.js / admin.js
│  │  └─ storage.js         # localStorage 封装
│  └─ styles/
├─ server/
│  ├─ index.js              # Express 入口
│  ├─ db.js                 # SQLite 初始化
│  ├─ auth.js               # JWT 中间件
│  └─ routes/
│     ├─ auth.js
│     ├─ students.js
│     └─ progress.js
├─ vite.config.js
└─ package.json
```

## 4. 运行方式

### 4.1 前端开发

```bash
npm install
npm run dev
```

- Vite 开发服务器默认端口：`5173`
- `vite.config.js` 已配置 `/api -> http://localhost:3000` 代理

### 4.2 后端开发

```bash
npm run dev:server
```

- 后端默认端口：`3000`
- 健康检查：`GET http://localhost:3000/api/health`

### 4.3 前端构建

```bash
npm run build
```

已在当前仓库验证可成功构建，产物输出到 `dist/`。

### 4.4 API 烟雾测试（需后端已启动）

```bash
# Windows PowerShell
$env:ADMIN_PASSWORD='你的管理员密码'; npm run test:smoke

# macOS/Linux
ADMIN_PASSWORD='你的管理员密码' npm run test:smoke
```

### 4.5 前后端同时调试（推荐）

一条命令启动前后端：

```bash
npm run dev:all
```

也可以开两个终端分别执行：

```bash
# 终端 1
npm run dev:server

# 终端 2
npm run dev
```

## 5. 页面与路由

- `/`：题库列表页
- `/problem.html?id=题号`：做题页
- `/stats.html`：统计页
- `/login.html`：登录页
- `/admin.html`：管理员页

## 6. API 概览

### 6.1 认证

- `POST /api/auth/login`：登录
- `GET /api/auth/me`：当前用户信息（需 Bearer Token）

### 6.2 学生管理（管理员）

- `GET /api/students`：学生列表（含做题统计）
- `POST /api/students`：创建学生
- `DELETE /api/students/:id`：删除学生
- `GET /api/students/:id/progress`：学生详细进度

### 6.3 进度

- `POST /api/progress/submit`：上报提交结果
- `GET /api/progress/me`：当前用户进度

### 6.4 健康检查

- `GET /api/health`

## 7. 数据库说明

数据库文件：`data/javaoj.db`（首次启动自动创建）

默认采用固定路径模式（不自动切库），避免“账号在 A 库，服务连到 B 库”的问题。

- 固定路径：`data/javaoj.db`
- 可选回退模式：设置 `JAVAOJ_ENABLE_DB_FALLBACK=1` 后，才会允许回退到
  - `os.tmpdir()/javaoj/javaoj_safe.db`
  - `:memory:`

可通过环境变量指定数据库路径：

- `JAVAOJ_DB_PATH=你的数据库路径`（支持绝对路径或相对项目根目录）

### 7.1 临时库迁移回主库

如果历史数据写到了临时库，可执行：

```bash
npm run db:migrate:temp
```

可选参数：

```bash
node scripts/migrate-db.cjs --from "源库路径" --to "目标库路径"
node scripts/migrate-db.cjs --force   # 覆盖目标库且不备份
```

迁移前请先停止后端服务，避免文件占用。

主要表：

- `users`：用户（管理员/学生）
- `submissions`：提交记录（关联 `users.id`）

管理员初始化（首次建库）：

- 默认用户名：`admin`（可由 `JAVAOJ_ADMIN_USERNAME` 覆盖）
- 密码：必须满足至少 8 位
- 推荐显式配置：`JAVAOJ_ADMIN_PASSWORD=你的强密码`
- 开发环境未配置 `JAVAOJ_ADMIN_PASSWORD` 时，会自动生成一次性临时密码并打印到控制台

安全相关环境变量：

- `JWT_SECRET`：JWT 签名密钥（生产环境必填，建议 >= 32 字符）
- `CORS_ORIGIN`：允许的跨域来源，逗号分隔（例如 `http://localhost:5173,http://127.0.0.1:5173`）
- `JAVAOJ_DB_PATH`：自定义 SQLite 路径
- `JAVAOJ_ENABLE_DB_FALLBACK`：是否开启数据库回退（`1` 开启，默认关闭）

## 8. 当前实现特点与限制

- 判题引擎为前端模拟判题，不会真实编译/运行 Java 代码
- 代码草稿与部分本地历史仍保存在 localStorage
- 用户认证、学生管理、提交记录与统计依赖后端 API + SQLite
