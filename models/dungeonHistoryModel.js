const mongoose = require('mongoose');

const dungeonHistorySchema = new mongoose.Schema({
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
  gameAccount: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GameAccount',
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
  isSolo: {
    type: Boolean,
    required: true,
    default: false
  },
  isCompleted: {
    type: Boolean,
    required: true,
    default: false
  },
  hasReward: {
    type: Boolean,
    required: true,
    default: false
  },
  rewards: {
    bound: {
      type: Number,
      required: true
    },
    tradeable: {
      type: Number,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalCreatedAt: {
    type: Date,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DungeonHistory', dungeonHistorySchema); 