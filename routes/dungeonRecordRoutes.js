const express = require('express');
const {
  getDungeonRecords,
  createDungeonRecord,
  getCompletedDungeons,
  getDungeonRecordStats,
  updateDungeonRecord, 
  deleteDungeonRecord
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

// 添加更新和删除的路由
router
  .route('/record/:id')
  .put(protect, updateDungeonRecord)
  .delete(protect, deleteDungeonRecord);

module.exports = router; 