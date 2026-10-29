const Transaction = require('../models/Transaction');
const { validationResult } = require('express-validator');

// Helper to escape regex special characters
const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 15,
      search,
      category,
      type,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const query = { user: req.user._id };

    // Safe sanitized search across title, notes, and category
    if (search?.trim()) {
      const cleanSearch = escapeRegex(search.trim());
      query.$or = [
        { title: { $regex: cleanSearch, $options: 'i' } },
        { notes: { $regex: cleanSearch, $options: 'i' } },
        { category: { $regex: cleanSearch, $options: 'i' } },
      ];
    }

    if (category && category !== 'all') query.category = category;
    if (type && type !== 'all') query.type = type;

    // Date range boundaries
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Amount boundaries
    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = parseFloat(minAmount);
      if (maxAmount) query.amount.$lte = parseFloat(maxAmount);
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
    const skip = (pageNum - 1) * limitNum;
    const sortObj = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(query).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Transaction.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum) || 1;

    res.json({
      success: true,
      data: transactions,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
    });
  }
};

const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).lean();

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
    });
  }
};

const createTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { title, amount, category, date, notes, type } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      title,
      amount: parseFloat(amount),
      category,
      date: date || Date.now(),
      notes: notes || '',
      type: type || 'expense',
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error creating transaction',
    });
  }
};

const updateTransaction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const updateFields = {};
    const allowed = ['title', 'amount', 'category', 'date', 'notes', 'type'];

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[field] =
          field === 'amount' ? parseFloat(req.body[field]) : req.body[field];
      }
    });

    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updateFields },
      { new: true, runValidators: true },
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Error updating transaction',
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
    });
  }
};

module.exports = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
