const User = require('../models/userModel');

// @desc    获取所有用户
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    console.log('[USERS] 获取所有用户');
    const users = await User.find();

    res.success({
      count: users.length,
      users
    }, '获取用户列表成功');
  } catch (err) {
    console.error('[USERS] 获取用户列表失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    获取单个用户
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    console.log(`[USERS] 获取用户: ${req.params.id}`);
    const user = await User.findById(req.params.id);

    if (!user) {
      console.error(`[USERS] 用户不存在: ${req.params.id}`);
      return res.error('未找到用户', 201);
    }

    res.success(user, '获取用户成功');
  } catch (err) {
    console.error('[USERS] 获取用户失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    更新用户
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.error('未找到用户', 201);
    }

    res.success(user, '更新用户成功');
  } catch (err) {
    res.error(err.message, 201);
  }
};

// @desc    删除用户
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.error('未找到用户', 201);
    }

    res.success(null, '删除用户成功');
  } catch (err) {
    res.error(err.message, 201);
  }
}; 