const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  updatePassword,
  updateProfile,
  weeklyReset
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetPassword);
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);
router.put('/profile', protect, updateProfile);
router.post('/weekly-reset', protect, weeklyReset);

module.exports = router; 