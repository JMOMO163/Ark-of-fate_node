const mongoose = require('mongoose');

const dungeonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请提供副本名称'],
    trim: true
  },
  itemLevel: {
    type: Number,
    required: [true, '请提供装等'],
  },
  totalIncome: {
    type: Number,
    required: [true, '请提供总收益'],
  },
  boundGoldIncome: {
    type: Number,
    required: [true, '请提供绑金收益'],
  },
  tradeableGoldIncome: {
    type: Number,
    required: [true, '请提供交易金收益'],
  },
  hasEster: {
    type: Boolean,
    required: [true, '请选择是否有艾斯特'],
    default: false
  },
  refreshInterval: {
    type: Number,
    required: [true, '请提供刷新间隔'],
    min: [1, '刷新间隔不能小于1周']
  },
  hasSoloMode: {
    type: Boolean,
    required: [true, '请选择是否有单人模式'],
    default: false
  },
  soloIncome: {
    type: Number,
    required: function() {
      return this.hasSoloMode === true;
    },
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Dungeon', dungeonSchema); 