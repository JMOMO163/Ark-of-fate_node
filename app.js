const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const responseMiddleware = require('./middleware/responseMiddleware');

// 加载环境变量
dotenv.config();

// 连接数据库
connectDB();

// 路由文件
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const gameAccountRoutes = require('./routes/gameAccountRoutes');
const dungeonRoutes = require('./routes/dungeonRoutes');
const characterRoutes = require('./routes/characterRoutes');
const dungeonRecordRoutes = require('./routes/dungeonRecordRoutes');
const statisticsRoutes = require('./routes/statisticsRoutes');

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 使用响应中间件
app.use(responseMiddleware);

// 添加请求日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// 挂载路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/game-accounts', gameAccountRoutes);
app.use('/api/dungeons', dungeonRoutes);
app.use('/api/characters', characterRoutes);
app.use('/api/dungeon-records', dungeonRecordRoutes);
app.use('/api/statistics', statisticsRoutes);

// 基础路由
app.get('/', (req, res) => {
  res.success({ name: 'SHui API', version: '1.0.0' }, '欢迎使用 SHui API');
});

// 处理 404
app.use((req, res) => {
  res.error('找不到请求的资源', 201);
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.serverError(err.message);
});

module.exports = app; 