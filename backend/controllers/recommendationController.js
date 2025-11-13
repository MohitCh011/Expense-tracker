const Expense = require('../models/Expense');
const Income = require('../models/Income');
const User = require('../models/User');
const moment = require('moment');

// @desc    Get smart recommendations
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const recommendations = [];

    // 1. Category spending increase detection
    const currentMonth = moment().startOf('month');
    const lastMonth = moment().subtract(1, 'month').startOf('month');

    const currentCategorySpend = await Expense.aggregate([
      { $match: { userId: userId, date: { $gte: currentMonth.toDate() } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    const lastCategorySpend = await Expense.aggregate([
      { 
        $match: { 
          userId: userId, 
          date: { $gte: lastMonth.toDate(), $lt: currentMonth.toDate() } 
        } 
      },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    const lastCategoryMap = lastCategorySpend.reduce((acc, cat) => {
      acc[cat._id] = cat.total;
      return acc;
    }, {});

    currentCategorySpend.forEach(cat => {
      const lastAmount = lastCategoryMap[cat._id] || 0;
      if (lastAmount > 0) {
        const increase = ((cat.total - lastAmount) / lastAmount) * 100;
        if (increase > 20) {
          recommendations.push({
            type: 'warning',
            message: `⚠️ You spent ${increase.toFixed(0)}% more on ${cat._id} this month (₹${cat.total.toFixed(2)} vs ₹${lastAmount.toFixed(2)})`
          });
        }
      }
    });

    // 2. Budget alerts
    const user = await User.findById(userId);
    if (user.budget && user.budget.size > 0) {
      const currentSpendMap = currentCategorySpend.reduce((acc, cat) => {
        acc[cat._id] = cat.total;
        return acc;
      }, {});

      user.budget.forEach((budgetAmount, category) => {
        const spent = currentSpendMap[category] || 0;
        if (spent > budgetAmount) {
          recommendations.push({
            type: 'alert',
            message: `🚨 Budget exceeded for ${category}: ₹${(spent - budgetAmount).toFixed(2)} over budget`
          });
        } else if (spent > budgetAmount * 0.8) {
          recommendations.push({
            type: 'caution',
            message: `⚡ ${category} budget 80% used: ₹${(budgetAmount - spent).toFixed(2)} remaining`
          });
        }
      });
    }

    // 3. Savings rate recommendation
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

    if (income > 0) {
      const savingsRate = ((income - expenses) / income) * 100;
      
      if (savingsRate < 10) {
        recommendations.push({
          type: 'advice',
          message: `📊 Your savings rate is ${savingsRate.toFixed(1)}%. Try to save at least 20% of your income.`
        });
      } else if (savingsRate > 30) {
        recommendations.push({
          type: 'success',
          message: `🎉 Great job! Your savings rate is ${savingsRate.toFixed(1)}% - well above the 20% goal!`
        });
      }
    }

    // 4. Place-based recommendations
    const places = await Expense.aggregate([
      { $match: { userId: userId, place: { $ne: '', $exists: true } } },
      { $group: { _id: '$place', avgAmount: { $avg: '$amount' }, count: { $sum: 1 } } },
      { $sort: { avgAmount: 1 } }
    ]);

    if (places.length > 0) {
      recommendations.push({
        type: 'tip',
        message: `💡 You save most at ${places[0]._id} (avg ₹${places[0].avgAmount.toFixed(2)}). Consider shopping there more often!`
      });
    }

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getRecommendations };
