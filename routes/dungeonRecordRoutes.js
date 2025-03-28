const express = require('express');
const {
  getDungeonRecords,
  createDungeonRecord,
  getCompletedDungeons,
  getDungeonRecordStats
} = require('../controllers/dungeonRecordController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .post(protect, createDungeonRecord);

router
  .route('/:characterId')
  .get(protect, getDungeonRecords);

router
  .route('/completed/:characterId')
  .get(protect, getCompletedDungeons);

router
  .route('/stats/:characterId')
  .get(protect, getDungeonRecordStats);

module.exports = router; 