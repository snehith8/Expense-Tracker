const mongoose = require('mongoose');

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Healthcare',
  'Utilities',
  'Housing',
  'Education',
  'Travel',
  'Personal Care',
  'Investment',
  'Income',
  'Other',
];

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: {
        values: ['expense', 'income'],
        message: '{VALUE} is not a valid transaction type',
      },
      default: 'expense',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: CATEGORIES,
        message: '{VALUE} is not a supported category',
      },
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  },
);

// 1. Compound Index for user-scoped date sorting & date range filters (Transactions Page & Dashboard)
transactionSchema.index({ user: 1, date: -1 });

// 2. Compound Index for Type + Category filtering
transactionSchema.index({ user: 1, type: 1, category: 1 });

// 3. Text Search Index across Title and Notes
transactionSchema.index(
  { title: 'text', notes: 'text' },
  { weights: { title: 3, notes: 1 } },
);

transactionSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Transaction', transactionSchema);
