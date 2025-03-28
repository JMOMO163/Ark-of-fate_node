const mongoose = require('mongoose');

const dungeonHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameAccount: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameAccount',
      required: true
    },
    accountNumber: {
      type: String,
      required: true
    }
  },
  character: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Character',
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  dungeon: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dungeon',
      required: true
    },
    name: {
      type: String,
      required: true
    }
  },
  isCompleted: {
    type: Boolean,
    default: true
  },
  hasReward: {
    type: Boolean,
    default: true
  },
  resetDate: {
    type: Date,
    default: Date.now
  },
  originalCreatedAt: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('DungeonHistory', dungeonHistorySchema); 