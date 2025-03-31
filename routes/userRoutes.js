const express = require('express');
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserRole
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// 所有用户管理相关的路由都需要管理员权限
router.use(protect, authorize('admin'));

router.get('/all', getUsers);
router.put('/:id/role', updateUserRole);
router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

module.exports = router; 