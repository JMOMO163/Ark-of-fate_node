const User = require('../models/userModel');
const crypto = require('crypto');
const mongoose = require('mongoose');
const DungeonRecord = require('../models/dungeonRecordModel');
const DungeonHistory = require('../models/dungeonHistoryModel');

// @desc    注册用户
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('[REGISTER] 开始注册用户:', req.body);
    const { username, email, password } = req.body;

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error(`[REGISTER] 邮箱已被注册: ${email}`);
      return res.error('邮箱已被注册', 201);
    }

    // 创建用户
    const user = await User.create({
      username,
      email,
      password
    });
    
    console.log(`[REGISTER] 用户创建成功: ${user._id}`);
    sendTokenResponse(user, res);
  } catch (err) {
    console.error('[REGISTER] 注册失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    用户登录
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('[LOGIN] 开始登录:', req.body);
    const { email, phone, password } = req.body;

    // 验证账号和密码
    if ((!email && !phone) || !password) {
      console.error('[LOGIN] 缺少账号或密码');
      return res.error('请提供账号和密码', 201);
    }

    // 检查用户
    let user;
    if (email) {
      console.log(`[LOGIN] 使用邮箱登录: ${email}`);
      user = await User.findOne({ email }).select('+password');
    } else if (phone) {
      console.log(`[LOGIN] 使用手机号登录: ${phone}`);
      user = await User.findOne({ phone }).select('+password');
    }

    if (!user) {
      console.error('[LOGIN] 用户不存在');
      return res.error('账号或密码错误', 201);
    }

    // 检查密码是否匹配
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.error('[LOGIN] 密码不匹配');
      return res.error('账号或密码错误', 201);
    }

    console.log(`[LOGIN] 登录成功: ${user._id}`);
    sendTokenResponse(user, res);
  } catch (err) {
    console.error('[LOGIN] 登录失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    忘记密码
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    console.log('[FORGOT PASSWORD] 开始重置密码:', req.body);
    const { email } = req.body;
    
    if (!email) {
      console.error('[FORGOT PASSWORD] 缺少邮箱地址');
      return res.error('请提供邮箱地址', 201);
    }
    
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.error(`[FORGOT PASSWORD] 邮箱未注册: ${email}`);
      return res.error('该邮箱未注册', 201);
    }
    
    // 直接重置密码为123456
    user.password = '123456';
    
    await user.save();
    
    console.log(`[FORGOT PASSWORD] 密码重置成功: ${user._id}`);
    res.success(null, '密码已重置为123456');
  } catch (err) {
    console.error('[FORGOT PASSWORD] 重置密码失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    重置密码
// @route   POST /api/auth/resetpassword
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    console.log('[RESET PASSWORD] 开始重置密码:', req.body);
    const { email, resetCode, newPassword } = req.body;
    
    if (!email || !resetCode || !newPassword) {
      console.error('[RESET PASSWORD] 缺少必要信息');
      return res.error('请提供完整信息', 201);
    }
    
    const user = await User.findOne({
      email,
      resetPasswordCode: resetCode,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');
    
    if (!user) {
      console.error('[RESET PASSWORD] 重置码无效或已过期');
      return res.error('重置码无效或已过期', 201);
    }
    
    // 更新密码
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    console.log(`[RESET PASSWORD] 密码重置成功: ${user._id}`);
    res.success(null, '密码重置成功');
  } catch (err) {
    console.error('[RESET PASSWORD] 重置密码失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    获取当前登录用户
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    console.log(`[GET ME] 获取用户信息: ${req.user.id}`);
    const user = await User.findById(req.user.id);

    res.success(user, '获取用户信息成功');
  } catch (err) {
    console.error('[GET ME] 获取用户信息失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    修改密码
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res) => {
  try {
    console.log('[UPDATE PASSWORD] 开始修改密码');
    const { currentPassword, newPassword } = req.body;

    // 获取用户信息（包含密码）
    const user = await User.findById(req.user.id).select('+password');

    // 验证当前密码
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      console.error('[UPDATE PASSWORD] 当前密码错误');
      return res.error('当前密码错误', 201);
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    console.log(`[UPDATE PASSWORD] 密码修改成功: ${user._id}`);
    res.success(null, '密码修改成功');
  } catch (err) {
    console.error('[UPDATE PASSWORD] 修改密码失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    更新用户信息
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    console.log('[UPDATE PROFILE] 开始更新用户信息:', req.body);
    const { username, goldRate } = req.body;

    const updateData = {};
    if (username) updateData.username = username;
    if (goldRate) updateData.goldRate = goldRate;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log(`[UPDATE PROFILE] 用户信息更新成功: ${user._id}`);
    res.success(user, '更新用户信息成功');
  } catch (err) {
    console.error('[UPDATE PROFILE] 更新用户信息失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    周重置
// @route   POST /api/auth/weekly-reset
// @access  Private
exports.weeklyReset = async (req, res) => {
  try {
    console.log(`[WEEKLY RESET] 用户 ${req.user._id} 开始周重置`);
    
    // 获取所有当前记录
    const currentRecords = await DungeonRecord.find({ 
      user: req.user._id 
    }).populate({
      path: 'gameAccount.id',
      select: 'accountNumber'
    })
    .populate('character.id', 'name')
    .populate('dungeon.id', 'name');
    
    if (currentRecords.length > 0) {
      // 创建历史记录
      const historyRecords = currentRecords.map(record => {
        const recordObj = record.toObject();
        return {
          character: {
            id: recordObj.character.id._id,
            name: recordObj.character.id.name
          },
          gameAccount: {
            id: recordObj.gameAccount.id._id,
            name: recordObj.gameAccount.id.accountNumber
          },
          dungeon: {
            id: recordObj.dungeon.id._id,
            name: recordObj.dungeon.id.name
          },
          isSolo: recordObj.isSolo,
          isCompleted: recordObj.isCompleted,
          hasReward: recordObj.hasReward,
          rewards: recordObj.rewards,
          user: recordObj.user,
          originalCreatedAt: recordObj.createdAt,
          createdAt: new Date()
        };
      });

      // 批量插入历史记录
      const insertedRecords = await DungeonHistory.insertMany(historyRecords);
      
      // 验证是否所有记录都成功插入
      if (insertedRecords.length !== currentRecords.length) {
        console.error('[WEEKLY RESET] 历史记录插入不完整');
        // 如果插入不完整，删除已插入的记录
        if (insertedRecords.length > 0) {
          const insertedIds = insertedRecords.map(record => record._id);
          await DungeonHistory.deleteMany({ _id: { $in: insertedIds } });
        }
        throw new Error('历史记录转移不完整');
      }
      
      // 只有在历史记录全部插入成功后才删除原记录
      console.log('[WEEKLY RESET] 历史记录插入成功，开始删除原记录...');
      await DungeonRecord.deleteMany({ user: req.user._id });
      
      console.log(`[WEEKLY RESET] 用户 ${req.user._id} 周重置成功，${currentRecords.length} 条记录已归档`);
      res.success({ count: currentRecords.length }, '周重置成功');
    } else {
      console.log(`[WEEKLY RESET] 用户 ${req.user._id} 无记录需要重置`);
      res.success(null, '无记录需要重置');
    }
  } catch (err) {
    console.error('[WEEKLY RESET] 周重置失败:', err);
    res.error(err.message || '周重置失败', 201);
  }
};

// 生成token并发送响应
const sendTokenResponse = (user, res) => {
  // 创建token
  const token = user.getSignedJwtToken();

  // 移除敏感字段
  const userData = {
    _id: user._id,
    username: user.username,
    email: user.email,
    role: user.role
  };

  console.log(`[TOKEN] 生成token成功: ${user._id}`);
  res.success({
    user: userData,
    token
  }, '登录成功');
}; 