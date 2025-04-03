const app = require('./app');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const PORT = process.env.PORT || 5000;

// 安全中间件
app.use(helmet());

// 跨域配置
const corsOptions = {
  origin: '*', // 允许所有域名访问
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// 限制请求频率
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 1000 // 限制每个IP 15分钟内最多1000个请求
  });
  app.use('/api/', limiter);
}

// 防止 NoSQL 注入
app.use(mongoSanitize());

// 防止 XSS 攻击
app.use(xss());

const server = app.listen(PORT, () => {
  console.log(`[SERVER] 服务器启动成功，运行在端口 ${PORT}`);
  console.log(`[SERVER] 环境: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[SERVER] API地址: http://localhost:${PORT}/api`);
});

// 处理未捕获的异常
process.on('unhandledRejection', (err) => {
  console.error(`[SERVER] 未处理的Promise拒绝: ${err.message}`);
  console.error(err.stack);
  server.close(() => process.exit(1));
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error(`[SERVER] 未捕获的异常: ${err.message}`);
  console.error(err.stack);
  server.close(() => process.exit(1));
}); 