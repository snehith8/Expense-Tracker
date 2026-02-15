const Transaction = require('../models/Transaction');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalSummary,
      monthlySummary,
      categoryBreakdown,
      recentTransactions,
      monthlyTrend,
    ] = await Promise.all([
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

      Transaction.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),

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

      Transaction.find({ user: userId }).sort({ date: -1 }).limit(5).lean(),

      Transaction.aggregate([
        {
          $match: {
            user: userId,
            date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
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

    const totals = { income: 0, expense: 0 };
    totalSummary.forEach(({ _id, total }) => (totals[_id] = total));

    const currentMonth = { income: 0, expense: 0 };
    monthlySummary.forEach(({ _id, total }) => (currentMonth[_id] = total));

    const trendMap = {};
    monthlyTrend.forEach(({ _id, total }) => {
      const key = `${_id.year}-${String(_id.month).padStart(2, '0')}`;
      if (!trendMap[key]) trendMap[key] = { month: key, income: 0, expense: 0 };
      trendMap[key][_id.type] = total;
    });

    res.json({
      success: true,
      data: {
        totals: { ...totals, balance: totals.income - totals.expense },
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
              ? ((total / totals.expense) * 100).toFixed(1)
              : 0,
        })),
        recentTransactions,
        monthlyTrend: Object.values(trendMap).sort((a, b) =>
          a.month.localeCompare(b.month),
        ),
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
