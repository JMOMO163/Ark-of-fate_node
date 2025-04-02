const DungeonRecord = require('../models/dungeonRecordModel');
const Dungeon = require('../models/dungeonModel');

// @desc    获取角色的副本记录
// @route   GET /api/dungeon-records/:characterId
// @access  Private
exports.getDungeonRecords = async (req, res) => {
  try {
    console.log(`[DUNGEON RECORDS] 获取角色副本记录: ${req.params.characterId}`);
    
    const records = await DungeonRecord.find({
      'character.id': req.params.characterId,
      user: req.user.id
    }).sort('-createdAt');

    res.success({
      count: records.length,
      records
    }, '获取副本记录成功');
  } catch (err) {
    console.error('[DUNGEON RECORDS] 获取副本记录失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    创建副本记录
// @route   POST /api/dungeon-records
// @access  Private
exports.createDungeonRecord = async (req, res) => {
  try {
    console.log('[DUNGEON RECORDS] 创建副本记录:', req.body);
    
    const {
      characterId,
      characterName,
      gameAccountId,
      gameAccountName,
      dungeonId,
      isSolo,
      isCompleted,
      progress,
      hasReward,
      hasEster
    } = req.body;

    // 获取副本信息
    const dungeon = await Dungeon.findById(dungeonId);
    if (!dungeon) {
      return res.error('副本不存在', 201);
    }

    // 计算收益
    let rewards = {
      total: 0,
      bound: 0,
      tradeable: 0
    };

    if (hasReward) {
      if (isSolo) {
        rewards = {
          total: dungeon.soloIncome,
          bound: dungeon.soloIncome,
          tradeable: 0
        };
      } else {
        rewards = {
          total: dungeon.totalIncome,
          bound: dungeon.boundGoldIncome,
          tradeable: dungeon.tradeableGoldIncome
        };
      }
    }

    const record = await DungeonRecord.create({
      character: {
        id: characterId,
        name: characterName
      },
      gameAccount: {
        id: gameAccountId,
        name: gameAccountName
      },
      dungeon: {
        id: dungeonId,
        name: dungeon.name
      },
      isSolo,
      isCompleted,
      progress: isCompleted ? undefined : progress,
      hasReward,
      hasEster,
      rewards,
      user: req.user.id
    });

    console.log(`[DUNGEON RECORDS] 副本记录创建成功: ${record._id}`);
    res.success(record, '创建副本记录成功');
  } catch (err) {
    console.error('[DUNGEON RECORDS] 创建副本记录失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    获取角色已完成副本
// @route   GET /api/dungeon-records/completed/:characterId
// @access  Private
exports.getCompletedDungeons = async (req, res) => {
  try {
    console.log(`[DUNGEON RECORDS] 获取角色已完成副本: ${req.params.characterId}`);
    
    const records = await DungeonRecord.find({
      'character.id': req.params.characterId,
      user: req.user.id
    }).distinct('dungeon.id');

    res.success({
      dungeons: records
    }, '获取已完成副本成功');
  } catch (err) {
    console.error('[DUNGEON RECORDS] 获取已完成副本失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    获取角色的副本记录统计
// @route   GET /api/dungeon-records/stats/:characterId
// @access  Private
exports.getDungeonRecordStats = async (req, res) => {
  try {
    console.log(`[DUNGEON RECORDS] 获取角色副本记录统计: ${req.params.characterId}`);
    
    const records = await DungeonRecord.find({
      'character.id': req.params.characterId,
      user: req.user.id,
      isCompleted: true,
      hasReward: true
    });

    let totalIncome = 0;
    let boundIncome = 0;
    let tradeableIncome = 0;

    records.forEach(record => {
      totalIncome += record.rewards.total;
      boundIncome += record.rewards.bound;
      tradeableIncome += record.rewards.tradeable;
    });

    res.success({
      totalIncome,
      boundIncome,
      tradeableIncome,
      recordCount: records.length
    }, '获取副本记录统计成功');
  } catch (err) {
    console.error('[DUNGEON RECORDS] 获取副本记录统计失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    更新副本记录
// @route   PUT /api/dungeon-records/:id
// @access  Private
exports.updateDungeonRecord = async (req, res) => {
  try {
    console.log(`[DUNGEON RECORDS] 更新副本记录: ${req.params.id}`);
    
    const record = await DungeonRecord.findById(req.params.id);
    
    if (!record) {
      console.error(`[DUNGEON RECORDS] 副本记录不存在: ${req.params.id}`);
      return res.error('未找到副本记录', 201);
    }
    
    // 确保用户只能更新自己的记录
    if (record.user.toString() !== req.user.id) {
      console.error(`[DUNGEON RECORDS] 权限不足: ${req.user.id} 尝试更新 ${record.user} 的记录`);
      return res.error('无权更新此记录', 201);
    }
    
    // 获取副本信息，用于计算奖励
    const dungeon = await Dungeon.findById(record.dungeon.id);
    if (!dungeon) {
      console.error(`[DUNGEON RECORDS] 副本不存在: ${record.dungeon.id}`);
      return res.error('未找到相关副本信息', 201);
    }
    
    // 计算奖励
    const isSolo = req.body.isSolo || false;
    const isCompleted = req.body.isCompleted || false;
    const hasReward = req.body.hasReward || false;
    
    let boundIncome = 0;
    let tradeableIncome = 0;
    let totalIncome = 0;
    
    if (isCompleted && hasReward) {
      boundIncome = isSolo ? Math.round(dungeon.boundGoldIncome * 0.6) : dungeon.boundGoldIncome;
      tradeableIncome = isSolo ? Math.round(dungeon.tradeableGoldIncome * 0.6) : dungeon.tradeableGoldIncome;
      totalIncome = boundIncome + tradeableIncome;
    }
    
    // 更新记录
    const updatedRecord = await DungeonRecord.findByIdAndUpdate(
      req.params.id,
      {
        isSolo,
        isCompleted,
        progress: !isCompleted ? req.body.progress : '',
        hasReward,
        hasEster: req.body.hasEster || false,
        rewards: {
          bound: boundIncome,
          tradeable: tradeableIncome,
          total: totalIncome
        }
      },
      { new: true }
    );
    
    console.log(`[DUNGEON RECORDS] 副本记录更新成功: ${req.params.id}`);
    res.success({ record: updatedRecord }, '更新记录成功');
  } catch (err) {
    console.error('[DUNGEON RECORDS] 更新副本记录失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    删除副本记录
// @route   DELETE /api/dungeon-records/:id
// @access  Private
exports.deleteDungeonRecord = async (req, res) => {
  try {
    console.log(`[DUNGEON RECORDS] 删除副本记录: ${req.params.id}`);
    
    const record = await DungeonRecord.findById(req.params.id);
    
    if (!record) {
      console.error(`[DUNGEON RECORDS] 副本记录不存在: ${req.params.id}`);
      return res.error('未找到副本记录', 201);
    }
    
    // 确保用户只能删除自己的记录
    if (record.user.toString() !== req.user.id) {
      console.error(`[DUNGEON RECORDS] 权限不足: ${req.user.id} 尝试删除 ${record.user} 的记录`);
      return res.error('无权删除此记录', 201);
    }
    
    await DungeonRecord.findByIdAndDelete(req.params.id);
    
    console.log(`[DUNGEON RECORDS] 副本记录删除成功: ${req.params.id}`);
    res.success(null, '删除记录成功');
  } catch (err) {
    console.error('[DUNGEON RECORDS] 删除副本记录失败:', err);
    res.error(err.message, 201);
  }
}; 