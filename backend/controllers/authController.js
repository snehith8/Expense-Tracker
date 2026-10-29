const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: 'Server error during registration' });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password',
    );
    if (!user || !(await user.matchPassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: 'Server error during login' });
  }
};

const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
    },
  });
};

// 1. Verify if email exists
const verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: 'Please provide an email' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'No account found with this email' });
    }

    res.json({
      success: true,
      message: 'Email verified successfully',
      email: user.email,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Server error verifying email' });
  }
};

// 2. Direct password reset for verified email
const directResetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    user.password = password;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully! You can now log in.',
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Error resetting password' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Trigger findOneAndDelete so the hook runs, and double-ensure cascade
    const Transaction = require('../models/Transaction');

    await Promise.all([
      User.findByIdAndDelete(userId),
      Transaction.deleteMany({ user: userId }),
    ]);

    res.json({
      success: true,
      message:
        'User account and all associated transactions have been permanently deleted',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account',
    });
  }
};
// Append to controllers/authController.js

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    const { name, currentPassword, newPassword } = req.body;

    // Update Name
    if (name && name.trim()) {
      user.name = name.trim();
    }

    // Update Password if requested
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Please provide current password to set a new password',
        });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters long',
        });
      }

      user.password = newPassword;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  verifyEmail,
  directResetPassword,
  deleteAccount,
  updateProfile,
};
