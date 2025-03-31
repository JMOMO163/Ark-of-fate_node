const Dungeon = require('../models/dungeonModel');

// @desc    获取所有副本
// @route   GET /api/dungeons
// @access  Private
exports.getDungeons = async (req, res) => {
  try {
    console.log('[DUNGEONS] 获取副本列表, 查询参数:', req.query);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 移除用户ID限制
    const query = {};

    // 获取总记录数
    const total = await Dungeon.countDocuments(query);

    // 获取分页数据，按装等降序排序
    const dungeons = await Dungeon.find(query)
      .sort({ itemLevel: -1 })
      .skip(skip)
      .limit(limit);

    res.success({
      total,
      page,
      limit,
      dungeons
    }, '获取副本列表成功');
  } catch (err) {
    console.error('[DUNGEONS] 获取副本列表失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    获取单个副本
// @route   GET /api/dungeons/:id
// @access  Private
exports.getDungeon = async (req, res) => {
  try {
    console.log(`[DUNGEONS] 获取副本: ${req.params.id}`);
    const dungeon = await Dungeon.findById(req.params.id);

    if (!dungeon) {
      console.error(`[DUNGEONS] 副本不存在: ${req.params.id}`);
      return res.error('未找到副本', 201);
    }

    res.success(dungeon, '获取副本成功');
  } catch (err) {
    console.error('[DUNGEONS] 获取副本失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    创建副本
// @route   POST /api/dungeons
// @access  Private/Admin
exports.createDungeon = async (req, res) => {
  try {
    // 只允许管理员创建副本
    if (req.user.role !== 'admin') {
      return res.error('只有管理员可以创建副本', 201);
    }

    console.log('[DUNGEONS] 创建副本:', req.body);
    const { 
      name, 
      itemLevel, 
      totalIncome, 
      boundGoldIncome, 
      tradeableGoldIncome, 
      hasEster, 
      refreshInterval,
      hasSoloMode,
      soloIncome
    } = req.body;

    // 验证单人模式数据
    if (hasSoloMode && !soloIncome && soloIncome !== 0) {
      console.error('[DUNGEONS] 创建副本失败: 有单人模式但未提供单人收益');
      return res.error('有单人模式时必须提供单人收益', 201);
    }

    // 创建副本
    const dungeon = await Dungeon.create({
      name,
      itemLevel,
      totalIncome,
      boundGoldIncome,
      tradeableGoldIncome,
      hasEster,
      refreshInterval,
      hasSoloMode,
      soloIncome: hasSoloMode ? soloIncome : 0,
    });

    console.log(`[DUNGEONS] 副本创建成功: ${dungeon._id}`);
    res.success(dungeon, '创建副本成功');
  } catch (err) {
    console.error('[DUNGEONS] 创建副本失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    更新副本
// @route   PUT /api/dungeons/:id
// @access  Private/Admin
exports.updateDungeon = async (req, res) => {
  try {
    // 只允许管理员更新副本
    if (req.user.role !== 'admin') {
      return res.error('只有管理员可以更新副本', 201);
    }

    console.log(`[DUNGEONS] 更新副本: ${req.params.id}`, req.body);
    let dungeon = await Dungeon.findById(req.params.id);

    if (!dungeon) {
      console.error(`[DUNGEONS] 副本不存在: ${req.params.id}`);
      return res.error('未找到副本', 201);
    }

    // 验证单人模式数据
    if (req.body.hasSoloMode && !req.body.soloIncome && req.body.soloIncome !== 0) {
      console.error('[DUNGEONS] 更新副本失败: 有单人模式但未提供单人收益');
      return res.error('有单人模式时必须提供单人收益', 201);
    }

    // 如果没有单人模式，将单人收益设为0
    if (req.body.hasSoloMode === false) {
      req.body.soloIncome = 0;
    }

    dungeon = await Dungeon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    console.log(`[DUNGEONS] 副本更新成功: ${dungeon._id}`);
    res.success(dungeon, '更新副本成功');
  } catch (err) {
    console.error('[DUNGEONS] 更新副本失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    删除副本
// @route   DELETE /api/dungeons/:id
// @access  Private/Admin
exports.deleteDungeon = async (req, res) => {
  try {
    // 只允许管理员删除副本
    if (req.user.role !== 'admin') {
      return res.error('只有管理员可以删除副本', 201);
    }

    console.log(`[DUNGEONS] 删除副本: ${req.params.id}`);
    const dungeon = await Dungeon.findById(req.params.id);

    if (!dungeon) {
      console.error(`[DUNGEONS] 副本不存在: ${req.params.id}`);
      return res.error('未找到副本', 201);
    }

    await Dungeon.findByIdAndDelete(req.params.id);

    console.log(`[DUNGEONS] 副本删除成功: ${req.params.id}`);
    res.success(null, '删除副本成功');
  } catch (err) {
    console.error('[DUNGEONS] 删除副本失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    获取所有副本（不分页）
// @route   GET /api/dungeons/all
// @access  Private
exports.getAllDungeons = async (req, res) => {
  try {
    console.log('[DUNGEONS] 获取所有副本列表');
    
    // 构建查询条件
    const query = { user: req.user.id };

    // 获取所有副本数据，按装等降序排序
    const dungeons = await Dungeon.find(query).sort({ itemLevel: -1 });

    res.success({
      dungeons
    }, '获取所有副本列表成功');
  } catch (err) {
    console.error('[DUNGEONS] 获取所有副本列表失败:', err);
    res.error(err.message, 201);
  }
}; 