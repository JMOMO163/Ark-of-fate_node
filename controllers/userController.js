const User = require('../models/userModel');
const DungeonRecord = require('../models/dungeonRecordModel');
const DungeonHistory = require('../models/dungeonHistoryModel');

// @desc    获取所有用户及其统计数据
// @route   GET /api/users/all
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // 验证管理员权限
    if (req.user.role !== 'admin') {
      return res.error('无权访问', 201);
    }

    console.log('[USERS] 获取所有用户');
    const users = await User.find().select('-password');
    
    // 获取每个用户的统计数据
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const currentRecords = await DungeonRecord.find({
        user: user._id,
        isCompleted: true,
        hasReward: true
      });
      
      // 计算当前记录总收益
      const stats = currentRecords.reduce((acc, record) => {
        if (record.rewards) {
          const { bound = 0, tradeable = 0, total = 0 } = record.rewards;
          
          acc.totalIncome += total;
          acc.boundIncome += bound;
          acc.tradeableIncome += tradeable;
          acc.recordCount = (acc.recordCount || 0) + 1;
        }
        return acc;
      }, { totalIncome: 0, boundIncome: 0, tradeableIncome: 0, recordCount: 0 });
      
      return {
        ...user.toObject(),
        stats
      };
    }));

    res.success({
      users: usersWithStats
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

// @desc    更新用户角色
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
  try {
    // 验证管理员权限
    if (req.user.role !== 'admin') {
      return res.error('无权操作', 201);
    }
    
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.error('无效的角色类型', 201);
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.error('用户不存在', 201);
    }
    
    res.success(user, '更新用户角色成功');
  } catch (err) {
    console.error('[USERS] 更新用户角色失败:', err);
    res.error(err.message, 201);
  }
}; 