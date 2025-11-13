const Expense = require('../models/Expense');
const Income = require('../models/Income');
const moment = require('moment');

class AnalyticsEngine {
  
  // Get monthly comparison
  static async getMonthlyComparison(userId) {
    const currentMonth = moment().startOf('month');
    const lastMonth = moment().subtract(1, 'month').startOf('month');

    const currentIncome = await Income.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: currentMonth.toDate() }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const currentExpenses = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: { $gte: currentMonth.toDate() }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const lastIncome = await Income.aggregate([
      {
        $match: {
          userId: userId,
          date: {
            $gte: lastMonth.toDate(),
            $lt: currentMonth.toDate()
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const lastExpenses = await Expense.aggregate([
      {
        $match: {
          userId: userId,
          date: {
            $gte: lastMonth.toDate(),
            $lt: currentMonth.toDate()
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const currentSavings = (currentIncome[0]?.total || 0) - (currentExpenses[0]?.total || 0);
    const lastSavings = (lastIncome[0]?.total || 0) - (lastExpenses[0]?.total || 0);
    const difference = currentSavings - lastSavings;
    const percentChange = lastSavings !== 0 ? (difference / lastSavings) * 100 : 0;

    return {
      currentMonthSavings: currentSavings,
      lastMonthSavings: lastSavings,
      savingsDifference: difference,
      savingsChangePercent: Math.round(percentChange * 100) / 100,
      trend: difference >= 0 ? 'up' : 'down'
    };
  }

  // Get category-wise spending
  static async getCategoryWiseSpending(userId) {
    const categories = await Expense.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);

    return categories.reduce((acc, cat) => {
      acc[cat._id] = cat.total;
      return acc;
    }, {});
  }

  // Get weekly trend
  static async getWeeklyTrend(userId) {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = moment().subtract(i, 'weeks').startOf('week');
      const weekEnd = moment().subtract(i, 'weeks').endOf('week');

      const total = await Expense.aggregate([
        {
          $match: {
            userId: userId,
            date: {
              $gte: weekStart.toDate(),
              $lte: weekEnd.toDate()
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);

      weeks.push({
        week: `Week ${4 - i}`,
        amount: total[0]?.total || 0
      });
    }

    return weeks;
  }

  // Get cheapest places
  static async getCheapestPlaces(userId) {
    const places = await Expense.aggregate([
      { 
        $match: { 
          userId: userId,
          place: { $ne: '', $exists: true }
        } 
      },
      {
        $group: {
          _id: '$place',
          avgAmount: { $avg: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgAmount: 1 } }
    ]);

    return places;
  }

  // Predict next month savings
  static async predictSavings(userId) {
    const savings = [];
    
    for (let i = 1; i <= 3; i++) {
      const monthStart = moment().subtract(i, 'months').startOf('month');
      const monthEnd = moment().subtract(i, 'months').endOf('month');

      const income = await Income.aggregate([
        {
          $match: {
            userId: userId,
            date: {
              $gte: monthStart.toDate(),
              $lte: monthEnd.toDate()
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const expenses = await Expense.aggregate([
        {
          $match: {
            userId: userId,
            date: {
              $gte: monthStart.toDate(),
              $lte: monthEnd.toDate()
            }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      savings.push((income[0]?.total || 0) - (expenses[0]?.total || 0));
    }

    // Weighted average
    if (savings.length >= 3) {
      return savings[0] * 0.5 + savings[1] * 0.3 + savings[2] * 0.2;
    }

    return 0;
  }
}

module.exports = AnalyticsEngine;
