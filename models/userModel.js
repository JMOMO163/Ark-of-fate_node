const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '请提供用户名'],
    unique: true,
    trim: true,
    maxlength: [50, '用户名不能超过50个字符']
  },
  avatar: {
    type: String,
    default: ''
  },
  goldRate: {
    type: Number,
    default: 1500, // 默认1RMB=1500金
    min: [1, '金价比例不能小于1']
  },
  email: {
    type: String,
    required: [true, '请提供邮箱'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      '请提供有效的邮箱'
    ]
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
    match: [
      /^1[3-9]\d{9}$/,
      '请提供有效的手机号'
    ]
  },
  password: {
    type: String,
    required: [true, '请提供密码'],
    minlength: [6, '密码至少6个字符'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  resetPasswordCode: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 加密密码
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// 生成JWT令牌
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// 验证密码
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 