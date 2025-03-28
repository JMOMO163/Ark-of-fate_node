// 统一响应格式中间件
const responseMiddleware = (req, res, next) => {
  // 重写 res.json 方法
  const originalJson = res.json;
  
  res.success = (data = null, message = '操作成功') => {
    console.log(`[SUCCESS] ${req.method} ${req.originalUrl} - ${message}`);
    return originalJson.call(res, {
      code: 200,
      message,
      data
    });
  };
  
  res.error = (message = '操作失败', code = 201) => {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} - ${message}`);
    return originalJson.call(res, {
      code,
      message,
      data: null
    });
  };
  
  res.unauthorized = (message = '未登录或登录已过期') => {
    console.error(`[UNAUTHORIZED] ${req.method} ${req.originalUrl} - ${message}`);
    return originalJson.call(res, {
      code: 401,
      message,
      data: null
    });
  };
  
  res.serverError = (message = '服务器内部错误') => {
    console.error(`[SERVER ERROR] ${req.method} ${req.originalUrl} - ${message}`);
    return originalJson.call(res, {
      code: 500,
      message,
      data: null
    });
  };
  
  next();
};

module.exports = responseMiddleware; 