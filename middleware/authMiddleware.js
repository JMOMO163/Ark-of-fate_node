const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

// 保护路由
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // 从 Bearer token 中获取 token
    token = req.headers.authorization.split(' ')[1];
  }

  // 确保 token 存在
  if (!token) {
    console.error('[AUTH] 未提供token');
    return res.unauthorized('请先登录');
  }

  try {
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`[AUTH] Token验证成功: ${decoded.id}`);

    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      console.error(`[AUTH] 用户不存在: ${decoded.id}`);
      return res.unauthorized('用户不存在');
    }
    
    next();
  } catch (err) {
    console.error('[AUTH] Token验证失败:', err);
    return res.unauthorized('登录已过期，请重新登录');
  }
};

// 授权角色
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      console.error(`[AUTH] 权限不足: ${req.user.role} 尝试访问需要 ${roles.join(',')} 权限的资源`);
      return res.error(`用户角色 ${req.user.role} 无权访问此资源`, 201);
    }
    console.log(`[AUTH] 授权成功: ${req.user.role}`);
    next();
  };
}; 