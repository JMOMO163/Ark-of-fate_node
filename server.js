const app = require('./app');

const PORT = process.env.PORT || 5000;

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