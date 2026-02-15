const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');
const Transaction = require('../models/Transaction');

const transactionValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 }),
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(Transaction.schema.path('category').enumValues)
    .withMessage('Invalid category'),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
  body('notes').optional().trim().isLength({ max: 500 }),
  body('type')
    .optional()
    .isIn(['expense', 'income'])
    .withMessage('Type must be expense or income'),
];

router.use(protect);

router.get('/meta/categories', (req, res) =>
  res.json({
    success: true,
    data: Transaction.schema.path('category').enumValues,
  }),
);

router
  .route('/')
  .get(getTransactions)
  .post(transactionValidation, createTransaction);
router
  .route('/:id')
  .get(getTransaction)
  .put(transactionValidation, updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
