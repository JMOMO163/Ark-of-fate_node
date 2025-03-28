const mongoose = require('mongoose');

const dungeonRecordSchema = new mongoose.Schema({
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
  progress: {
    type: String,
    required: function() {
      return !this.isCompleted;
    }
  },
  hasReward: {
    type: Boolean,
    required: true,
    default: false
  },
  hasEster: {
    type: Boolean,
    required: true,
    default: false
  },
  rewards: {
    total: {
      type: Number,
      default: 0
    },
    bound: {
      type: Number,
      default: 0
    },
    tradeable: {
      type: Number,
      default: 0
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

module.exports = mongoose.model('DungeonRecord', dungeonRecordSchema); 