const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请提供角色名称'],
    trim: true
  },
  itemLevel: {
    type: Number,
    required: [true, '请提供角色装等']
  },
  gameAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GameAccount',
    required: [true, '请选择游戏账号']
  },
  profession: {
    type: String,
    required: [true, '请选择角色职业'],
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  equipmentLevels: {
    helmet: {
      type: Number,
      required: [true, '请提供头盔等级']
    },
    shoulder: {
      type: Number,
      required: [true, '请提供肩部等级']
    },
    chest: {
      type: Number,
      required: [true, '请提供上装等级']
    },
    pants: {
      type: Number,
      required: [true, '请提供下装等级']
    },
    gloves: {
      type: Number,
      required: [true, '请提供手套等级']
    },
    weapon: {
      type: Number,
      required: [true, '请提供武器等级']
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Character', characterSchema); 