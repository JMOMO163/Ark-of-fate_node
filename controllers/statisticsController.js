const Character = require('../models/characterModel');
const GameAccount = require('../models/gameAccountModel');
const DungeonRecord = require('../models/dungeonRecordModel');
const DungeonHistory = require('../models/dungeonHistoryModel');

// @desc    获取统计数据
// @route   GET /api/statistics
// @access  Private
exports.getStatistics = async (req, res) => {
  try {
    console.log('[STATISTICS] 获取统计数据, 查询参数:', req.query);
    
    // 构建查询条件
    const query = { user: req.user.id };
    
    // 添加游戏账号筛选
    if (req.query.gameAccountId) {
      query['gameAccount.id'] = req.query.gameAccountId;
    }
    
    // 添加日期范围筛选
    if (req.query.startDate || req.query.endDate) {
      query.createdAt = {};
      if (req.query.startDate) {
        query[req.query.recordType === 'history' ? 'originalCreatedAt' : 'createdAt'].$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        query[req.query.recordType === 'history' ? 'originalCreatedAt' : 'createdAt'].$lte = new Date(req.query.endDate);
      }
    }

    // 获取账号总数 - 不受筛选条件影响
    const accountCount = await GameAccount.countDocuments({ user: req.user.id });

    // 获取角色数据 - 只受账号筛选影响
    const characterQuery = { 
      user: req.user.id,
      ...(req.query.gameAccountId ? { gameAccount: req.query.gameAccountId } : {})
    };
    const characters = await Character.find(characterQuery);
    const characterCount = characters.length;

    // 获取所有副本记录 - 受所有筛选条件影响
    const Model = req.query.recordType === 'history' ? DungeonHistory : DungeonRecord;
    const records = await Model.find(query)
      .populate('dungeon.id', 'name boundGoldIncome tradeableGoldIncome');

    // 计算总收益
    let totalIncome = 0;
    let boundIncome = 0;
    let tradeableIncome = 0;
    let recordCount = 0;

    // 副本使用次数统计
    const dungeonUsage = {};
    // 副本收益统计
    const dungeonIncome = {};

    records.forEach(record => {
      if (record.hasReward && record.isCompleted) {
        const dungeonData = record.dungeon.id;
        totalIncome += dungeonData.boundGoldIncome + dungeonData.tradeableGoldIncome;
        boundIncome += dungeonData.boundGoldIncome;
        tradeableIncome += dungeonData.tradeableGoldIncome;
        recordCount++;

        // 统计副本使用次数
        const dungeonName = dungeonData.name;
        dungeonUsage[dungeonName] = (dungeonUsage[dungeonName] || 0) + 1;

        // 统计副本收益
        if (!dungeonIncome[dungeonName]) {
          dungeonIncome[dungeonName] = {
            bound: 0,
            tradeable: 0
          };
        }
        dungeonIncome[dungeonName].bound += dungeonData.boundGoldIncome;
        dungeonIncome[dungeonName].tradeable += dungeonData.tradeableGoldIncome;
      }
    });

    // 装等分布统计 - 使用已筛选的角色数据
    const itemLevelRanges = [
      { min: 1610, max: Infinity, label: '≥1610' },
      { min: 1600, max: 1610, label: '1600-1610' },
      { min: 1580, max: 1600, label: '1580-1600' },
      { min: 1540, max: 1580, label: '1540-1580' }
    ];

    const itemLevelDistribution = itemLevelRanges.map(range => {
      const count = characters.filter(char =>
        char.itemLevel >= range.min && char.itemLevel < range.max
      ).length;
      return {
        range: range.label,
        count
      };
    });

    res.success({
      overview: {
        accountCount,
        characterCount,
        recordCount,
        totalIncome,
        boundIncome,
        tradeableIncome
      },
      itemLevelDistribution,
      dungeonUsage: Object.entries(dungeonUsage).map(([name, count]) => ({
        name,
        count,
        boundIncome: dungeonIncome[name]?.bound || 0,
        tradeableIncome: dungeonIncome[name]?.tradeable || 0
      })),
      dungeonIncome: Object.entries(dungeonIncome).map(([name, income]) => ({
        name,
        bound: income.bound,
        tradeable: income.tradeable
      }))
    }, '获取统计数据成功');
  } catch (err) {
    console.error('[STATISTICS] 获取统计数据失败:', err);
    res.error(err.message, 201);
  }
}; 