const express = require('express');
const { getStatistics, getAllDungeons } = require('../controllers/statisticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getStatistics);
router.get('/dungeons/all', protect, getAllDungeons);

module.exports = router; 