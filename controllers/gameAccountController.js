const GameAccount = require('../models/gameAccountModel');
const Character = require('../models/characterModel');
const DungeonRecord = require('../models/dungeonRecordModel');

// @desc    获取所有游戏账号
// @route   GET /api/game-accounts
// @access  Private
exports.getGameAccounts = async (req, res) => {
  try {
    console.log('[GAME ACCOUNTS] 获取游戏账号列表');
    // 只获取当前用户的游戏账号
    const gameAccounts = await GameAccount.find({ user: req.user.id });

    res.success({
      count: gameAccounts.length,
      gameAccounts
    }, '获取游戏账号列表成功');
  } catch (err) {
    console.error('[GAME ACCOUNTS] 获取游戏账号列表失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    获取单个游戏账号
// @route   GET /api/game-accounts/:id
// @access  Private
exports.getGameAccount = async (req, res) => {
  try {
    console.log(`[GAME ACCOUNTS] 获取游戏账号: ${req.params.id}`);
    const gameAccount = await GameAccount.findById(req.params.id);

    if (!gameAccount) {
      console.error(`[GAME ACCOUNTS] 游戏账号不存在: ${req.params.id}`);
      return res.error('未找到游戏账号', 201);
    }

    // 确保用户只能访问自己的游戏账号
    if (gameAccount.user.toString() !== req.user.id && req.user.role !== 'admin') {
      console.error(`[GAME ACCOUNTS] 权限不足: ${req.user.id} 尝试访问 ${gameAccount.user} 的游戏账号`);
      return res.error('无权访问此游戏账号', 201);
    }

    res.success(gameAccount, '获取游戏账号成功');
  } catch (err) {
    console.error('[GAME ACCOUNTS] 获取游戏账号失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    创建游戏账号
// @route   POST /api/game-accounts
// @access  Private
exports.createGameAccount = async (req, res) => {
  try {
    console.log('[GAME ACCOUNTS] 创建游戏账号:', req.body);
    const { accountNumber, accountName } = req.body;

    // 检查账号是否已存在
    const existingAccount = await GameAccount.findOne({ accountNumber });
    if (existingAccount) {
      console.error(`[GAME ACCOUNTS] 游戏账号已存在: ${accountNumber}`);
      return res.error('该游戏账号已存在', 201);
    }

    // 创建游戏账号
    const gameAccount = await GameAccount.create({
      accountNumber,
      accountName,
      user: req.user.id
    });

    console.log(`[GAME ACCOUNTS] 游戏账号创建成功: ${gameAccount._id}`);
    res.success(gameAccount, '创建游戏账号成功');
  } catch (err) {
    console.error('[GAME ACCOUNTS] 创建游戏账号失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    更新游戏账号
// @route   PUT /api/game-accounts/:id
// @access  Private
exports.updateGameAccount = async (req, res) => {
  try {
    console.log(`[GAME ACCOUNTS] 更新游戏账号: ${req.params.id}`, req.body);
    let gameAccount = await GameAccount.findById(req.params.id);

    if (!gameAccount) {
      console.error(`[GAME ACCOUNTS] 游戏账号不存在: ${req.params.id}`);
      return res.error('未找到游戏账号', 201);
    }

    // 确保用户只能更新自己的游戏账号
    if (gameAccount.user.toString() !== req.user.id && req.user.role !== 'admin') {
      console.error(`[GAME ACCOUNTS] 权限不足: ${req.user.id} 尝试更新 ${gameAccount.user} 的游戏账号`);
      return res.error('无权更新此游戏账号', 201);
    }

    // 如果更新了账号，检查是否与其他账号冲突
    if (req.body.accountNumber && req.body.accountNumber !== gameAccount.accountNumber) {
      const existingAccount = await GameAccount.findOne({ 
        accountNumber: req.body.accountNumber,
        _id: { $ne: req.params.id }
      });
      
      if (existingAccount) {
        console.error(`[GAME ACCOUNTS] 游戏账号已存在: ${req.body.accountNumber}`);
        return res.error('该游戏账号已存在', 201);
      }
    }

    gameAccount = await GameAccount.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    console.log(`[GAME ACCOUNTS] 游戏账号更新成功: ${gameAccount._id}`);
    res.success(gameAccount, '更新游戏账号成功');
  } catch (err) {
    console.error('[GAME ACCOUNTS] 更新游戏账号失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    删除游戏账号
// @route   DELETE /api/game-accounts/:id
// @access  Private
exports.deleteGameAccount = async (req, res) => {
  try {
    console.log(`[GAME ACCOUNTS] 删除游戏账号: ${req.params.id}`);
    const gameAccount = await GameAccount.findById(req.params.id);

    if (!gameAccount) {
      console.error(`[GAME ACCOUNTS] 游戏账号不存在: ${req.params.id}`);
      return res.error('未找到游戏账号', 201);
    }

    // 确保用户只能删除自己的游戏账号
    if (gameAccount.user.toString() !== req.user.id && req.user.role !== 'admin') {
      console.error(`[GAME ACCOUNTS] 权限不足: ${req.user.id} 尝试删除 ${gameAccount.user} 的游戏账号`);
      return res.error('无权删除此游戏账号', 201);
    }

    await gameAccount.remove();

    console.log(`[GAME ACCOUNTS] 游戏账号删除成功: ${req.params.id}`);
    res.success(null, '删除游戏账号成功');
  } catch (err) {
    console.error('[GAME ACCOUNTS] 删除游戏账号失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    获取游戏账号详情统计
// @route   GET /api/game-accounts/:id/stats
// @access  Private
exports.getGameAccountStats = async (req, res) => {
  try {
    console.log(`[GAME ACCOUNTS] 获取账号详情统计: ${req.params.id}`);
    
    // 获取账号下的所有角色
    const characters = await Character.find({ 
      gameAccount: req.params.id,
      user: req.user.id 
    }).sort('-itemLevel');

    // 获取所有角色的副本记录
    const dungeonRecords = await DungeonRecord.find({
      'gameAccount.id': req.params.id,
      user: req.user.id,
      isCompleted: true,
      hasReward: true
    });

    // 计算总收益
    let totalIncome = 0;
    let boundIncome = 0;
    let tradeableIncome = 0;

    dungeonRecords.forEach(record => {
      totalIncome += record.rewards.total;
      boundIncome += record.rewards.bound;
      tradeableIncome += record.rewards.tradeable;
    });

    // 按角色分组统计
    const characterStats = await Promise.all(characters.map(async (char) => {
      const charRecords = dungeonRecords.filter(
        record => record.character.id.toString() === char._id.toString()
      );

      let charTotalIncome = 0;
      let charBoundIncome = 0;
      let charTradeableIncome = 0;

      // 获取角色的所有副本记录（包括未完成和无收益的）
      const allRecords = await DungeonRecord.find({
        'character.id': char._id,
        user: req.user.id
      }).sort('-createdAt');

      // 处理副本记录
      const dungeonDetails = allRecords.map(record => ({
        dungeonName: record.dungeon.name,
        isCompleted: record.isCompleted,
        hasReward: record.hasReward,
        rewards: record.rewards
      }));

      // 计算已完成且有收益的记录的总收益
      charRecords.forEach(record => {
        charTotalIncome += record.rewards.total;
        charBoundIncome += record.rewards.bound;
        charTradeableIncome += record.rewards.tradeable;
      });

      return {
        characterId: char._id,
        characterName: char.name,
        profession: char.profession,
        itemLevel: char.itemLevel,
        dungeonDetails, // 添加副本详情
        totalIncome: charTotalIncome,
        boundIncome: charBoundIncome,
        tradeableIncome: charTradeableIncome
      };
    }));

    res.success({
      totalIncome,
      boundIncome,
      tradeableIncome,
      recordCount: dungeonRecords.length,
      characterCount: characters.length,
      characters: characterStats
    }, '获取账号详情统计成功');
  } catch (err) {
    console.error('[GAME ACCOUNTS] 获取账号详情统计失败:', err);
    res.error(err.message, 201);
  }
}; 