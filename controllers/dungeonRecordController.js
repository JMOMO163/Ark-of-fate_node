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