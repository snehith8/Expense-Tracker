const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// 1. Import middleware first
const { protect } = require('../middleware/auth');

// 2. Import controller methods
const {
  register,
  login,
  getMe,
  verifyEmail,
  directResetPassword,
  updateProfile,
  deleteAccount,
} = require('../controllers/authController');

// 3. Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 }),
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// 4. Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/verify-email', verifyEmail);
router.post('/direct-reset-password', directResetPassword);

// 5. Protected routes (protect is already initialized)
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;
