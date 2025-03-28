const express = require('express');
const {
  getGameAccounts,
  getGameAccount,
  createGameAccount,
  updateGameAccount,
  deleteGameAccount,
  getGameAccountStats
} = require('../controllers/gameAccountController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getGameAccounts)
  .post(protect, createGameAccount);

router
  .route('/:id')
  .get(protect, getGameAccount)
  .put(protect, updateGameAccount)
  .delete(protect, deleteGameAccount);

router
  .route('/:id/stats')
  .get(protect, getGameAccountStats);

module.exports = router; 