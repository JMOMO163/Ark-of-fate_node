const mongoose = require('mongoose');

const gameAccountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: [true, '请提供游戏账号'],
    unique: true,
    trim: true
  },
  accountName: {
    type: String,
    required: [true, '请提供账号名称'],
    trim: true
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

module.exports = mongoose.model('GameAccount', gameAccountSchema); 