const Character = require('../models/characterModel');
const GameAccount = require('../models/gameAccountModel');

// @desc    获取所有角色
// @route   GET /api/characters
// @access  Private
exports.getCharacters = async (req, res) => {
  try {
    console.log('[CHARACTERS] 获取角色列表, 查询参数:', req.query);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = { user: req.user.id };
    
    // 根据游戏账号查询
    if (req.query.gameAccount) {
      query.gameAccount = req.query.gameAccount;
    }
    
    // 根据最低装等查询
    if (req.query.minItemLevel) {
      query.itemLevel = { $gte: Number(req.query.minItemLevel) };
    }

    // 获取总记录数
    const total = await Character.countDocuments(query);

    // 获取分页数据，按装等降序排序
    const characters = await Character.find(query)
      .sort({ itemLevel: -1 })
      .skip(skip)
      .limit(limit)
      .populate('gameAccount', 'accountNumber accountName');

    res.success({
      total,
      page,
      limit,
      characters
    }, '获取角色列表成功');
  } catch (err) {
    console.error('[CHARACTERS] 获取角色列表失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    获取单个角色
// @route   GET /api/characters/:id
// @access  Private
exports.getCharacter = async (req, res) => {
  try {
    console.log(`[CHARACTERS] 获取角色: ${req.params.id}`);
    const character = await Character.findById(req.params.id)
      .populate('gameAccount', 'accountNumber accountName');

    if (!character) {
      console.error(`[CHARACTERS] 角色不存在: ${req.params.id}`);
      return res.error('未找到角色', 201);
    }

    // 确保用户只能访问自己的角色
    if (character.user.toString() !== req.user.id && req.user.role !== 'admin') {
      console.error(`[CHARACTERS] 权限不足: ${req.user.id} 尝试访问 ${character.user} 的角色`);
      return res.error('无权访问此角色', 201);
    }

    res.success(character, '获取角色成功');
  } catch (err) {
    console.error('[CHARACTERS] 获取角色失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    创建角色
// @route   POST /api/characters
// @access  Private
exports.createCharacter = async (req, res) => {
  try {
    console.log('[CHARACTERS] 创建角色:', req.body);

    // 验证游戏账号是否存在且属于当前用户
    const gameAccount = await GameAccount.findById(req.body.gameAccount);
    if (!gameAccount) {
      return res.error('游戏账号不存在', 201);
    }
    if (gameAccount.user.toString() !== req.user.id) {
      return res.error('无权使用此游戏账号', 201);
    }

    const character = await Character.create({
      ...req.body,
      user: req.user.id
    });

    const populatedCharacter = await Character.findById(character._id)
      .populate('gameAccount', 'accountNumber accountName');

    console.log(`[CHARACTERS] 角色创建成功: ${character._id}`);
    res.success(populatedCharacter, '创建角色成功');
  } catch (err) {
    console.error('[CHARACTERS] 创建角色失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    更新角色
// @route   PUT /api/characters/:id
// @access  Private
exports.updateCharacter = async (req, res) => {
  try {
    console.log(`[CHARACTERS] 更新角色: ${req.params.id}`, req.body);
    let character = await Character.findById(req.params.id);

    if (!character) {
      console.error(`[CHARACTERS] 角色不存在: ${req.params.id}`);
      return res.error('未找到角色', 201);
    }

    // 确保用户只能更新自己的角色
    if (character.user.toString() !== req.user.id && req.user.role !== 'admin') {
      console.error(`[CHARACTERS] 权限不足: ${req.user.id} 尝试更新 ${character.user} 的角色`);
      return res.error('无权更新此角色', 201);
    }

    // 如果更新了游戏账号，验证新账号是否存在且属于当前用户
    if (req.body.gameAccount && req.body.gameAccount !== character.gameAccount.toString()) {
      const gameAccount = await GameAccount.findById(req.body.gameAccount);
      if (!gameAccount) {
        return res.error('游戏账号不存在', 201);
      }
      if (gameAccount.user.toString() !== req.user.id) {
        return res.error('无权使用此游戏账号', 201);
      }
    }

    character = await Character.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('gameAccount', 'accountNumber accountName');

    console.log(`[CHARACTERS] 角色更新成功: ${character._id}`);
    res.success(character, '更新角色成功');
  } catch (err) {
    console.error('[CHARACTERS] 更新角色失败:', err);
    res.error(err.message, 201);
  }
};

// @desc    删除角色
// @route   DELETE /api/characters/:id
// @access  Private
exports.deleteCharacter = async (req, res) => {
  try {
    console.log(`[CHARACTERS] 删除角色: ${req.params.id}`);
    const character = await Character.findById(req.params.id);

    if (!character) {
      console.error(`[CHARACTERS] 角色不存在: ${req.params.id}`);
      return res.error('未找到角色', 201);
    }

    // 确保用户只能删除自己的角色
    if (character.user.toString() !== req.user.id && req.user.role !== 'admin') {
      console.error(`[CHARACTERS] 权限不足: ${req.user.id} 尝试删除 ${character.user} 的角色`);
      return res.error('无权删除此角色', 201);
    }

    await Character.findByIdAndDelete(req.params.id);

    console.log(`[CHARACTERS] 角色删除成功: ${req.params.id}`);
    res.success(null, '删除角色成功');
  } catch (err) {
    console.error('[CHARACTERS] 删除角色失败:', err);
    res.error(err.message, 201);
  }
}; 