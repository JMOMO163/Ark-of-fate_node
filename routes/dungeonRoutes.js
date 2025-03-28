const express = require('express');
const {
  getDungeons,
  getDungeon,
  createDungeon,
  updateDungeon,
  deleteDungeon,
  getAllDungeons
} = require('../controllers/dungeonController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

// 获取所有副本（不分页）- 需要放在 /:id 路由之前
router.get('/all', protect, getAllDungeons);

router
  .route('/')
  .get(protect, getDungeons)
  .post(protect, createDungeon);

router
  .route('/:id')
  .get(protect, getDungeon)
  .put(protect, updateDungeon)
  .delete(protect, deleteDungeon);

module.exports = router; 