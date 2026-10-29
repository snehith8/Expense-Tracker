const Transaction = require('../models/Transaction');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Date 5 months prior to get a guaranteed 6-month window (including current month)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [
      totalSummary,
      monthlySummary,
      categoryBreakdown,
      recentTransactions,
      monthlyTrend,
    ] = await Promise.all([
      // 1. Overall Income vs Expense Totals
      Transaction.aggregate([
        { $match: { user: userId } },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),

      // 2. Current Month Income vs Expense
      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),

      // 3. Category Breakdown (Expenses Only)
      Transaction.aggregate([
        { $match: { user: userId, type: 'expense' } },
        {
          $group: {
            _id: '$category',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 10 },
      ]),

      // 4. Latest 5 Transactions
      Transaction.find({ user: userId }).sort({ date: -1 }).limit(5).lean(),

      // 5. Monthly Trend Aggregate
      Transaction.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$date' },
              month: { $month: '$date' },
              type: '$type',
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    // Format Overall Totals
    const totals = { income: 0, expense: 0 };
    totalSummary.forEach(({ _id, total }) => {
      if (_id) totals[_id] = total;
    });

    // Format Current Month Totals
    const currentMonth = { income: 0, expense: 0 };
    monthlySummary.forEach(({ _id, total }) => {
      if (_id) currentMonth[_id] = total;
    });

    // Generate unbroken 6-month continuous sequence
    const monthsOrder = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthsOrder.push(key);
    }

    const trendMap = {};
    monthsOrder.forEach((key) => {
      trendMap[key] = { month: key, income: 0, expense: 0 };
    });

    monthlyTrend.forEach(({ _id, total }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2, '0')}`;
      if (trendMap[key] && _id.type) {
        trendMap[key][_id.type] = total;
      }
    });

    const continuousMonthlyTrend = monthsOrder.map((key) => trendMap[key]);

    res.json({
      success: true,
      data: {
        totals: {
          ...totals,
          balance: totals.income - totals.expense,
        },
        currentMonth: {
          ...currentMonth,
          balance: currentMonth.income - currentMonth.expense,
        },
        categoryBreakdown: categoryBreakdown.map(({ _id, total, count }) => ({
          category: _id,
          total,
          count,
          percentage:
            totals.expense > 0
              ? parseFloat(((total / totals.expense) * 100).toFixed(1))
              : 0,
        })),
        recentTransactions,
        monthlyTrend: continuousMonthlyTrend,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: 'Error fetching dashboard data' });
  }
};

module.exports = { getDashboard };
