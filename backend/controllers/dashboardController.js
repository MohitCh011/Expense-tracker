const Expense = require('../models/Expense');
const Income = require('../models/Income');
const AnalyticsEngine = require('../utils/analyticsEngine');

// @desc    Get dashboard data
// @route   GET /api/dashboard
// @access  Private
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total calculations
    const totalIncome = await Income.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalExpenses = await Expense.aggregate([
      { $match: { userId: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const income = totalIncome[0]?.total || 0;
    const expenses = totalExpenses[0]?.total || 0;
    const savings = income - expenses;

    // Advanced analytics
    const monthlyComparison = await AnalyticsEngine.getMonthlyComparison(userId);
    const categoryWiseSpending = await AnalyticsEngine.getCategoryWiseSpending(userId);
    const weeklyTrend = await AnalyticsEngine.getWeeklyTrend(userId);
    const cheapestPlaces = await AnalyticsEngine.getCheapestPlaces(userId);
    const savingsProjection = await AnalyticsEngine.predictSavings(userId);

    res.json({
      totalIncome: income,
      totalExpenses: expenses,
      totalSavings: savings,
      savingsRate: income > 0 ? ((savings / income) * 100).toFixed(2) : 0,
      monthlyComparison,
      categoryWiseSpending,
      weeklyTrend,
      cheapestPlaces,
      savingsProjection
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard };
