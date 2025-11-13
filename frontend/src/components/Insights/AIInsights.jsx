import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAlertCircle, FiCheckCircle, FiTarget } from 'react-icons/fi';
import './AIInsights.css';

const AIInsights = ({ dashboard, expenses }) => {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    generateInsights();
  }, [dashboard, expenses]);

  const generateInsights = () => {
    const newInsights = [];

    // Insight 1: Savings Rate Analysis
    if (dashboard.savingsRate < 20) {
      newInsights.push({
        type: 'warning',
        icon: <FiAlertCircle />,
        title: 'Low Savings Rate',
        message: `Your current savings rate is ${dashboard.savingsRate}%. Financial experts recommend saving at least 20% of your income.`,
        action: 'Reduce unnecessary expenses to boost your savings.'
      });
    } else if (dashboard.savingsRate >= 30) {
      newInsights.push({
        type: 'success',
        icon: <FiCheckCircle />,
        title: 'Excellent Savings!',
        message: `You're saving ${dashboard.savingsRate}% of your income. You're on track to achieve your financial goals!`,
        action: 'Consider investing your surplus savings for better returns.'
      });
    }

    // Insight 2: Top Spending Category
    if (dashboard.categoryWiseSpending && Object.keys(dashboard.categoryWiseSpending).length > 0) {
      const topCategory = Object.entries(dashboard.categoryWiseSpending)
        .sort(([, a], [, b]) => b - a)[0];
      
      const percentage = (topCategory[1] / dashboard.totalExpenses) * 100;
      
      newInsights.push({
        type: 'info',
        icon: <FiTrendingUp />,
        title: 'Top Spending Category',
        message: `${topCategory[0]} is your highest expense at ₹${topCategory[1].toFixed(2)} (${percentage.toFixed(1)}% of total expenses).`,
        action: 'Look for ways to optimize spending in this category.'
      });
    }

    // Insight 3: Spending Trend
    if (dashboard.monthlyComparison) {
      const trend = dashboard.monthlyComparison.trend;
      const change = Math.abs(dashboard.monthlyComparison.savingsChangePercent);
      
      if (trend === 'up') {
        newInsights.push({
          type: 'success',
          icon: <FiTrendingUp />,
          title: 'Positive Trend',
          message: `Your savings increased by ${change.toFixed(1)}% compared to last month!`,
          action: 'Keep up the good work and maintain this momentum.'
        });
      } else if (trend === 'down') {
        newInsights.push({
          type: 'warning',
          icon: <FiAlertCircle />,
          title: 'Declining Savings',
          message: `Your savings decreased by ${change.toFixed(1)}% compared to last month.`,
          action: 'Review your recent expenses and identify areas to cut back.'
        });
      }
    }

    // Insight 4: Future Projection
    if (dashboard.savingsProjection > 0) {
      newInsights.push({
        type: 'goal',
        icon: <FiTarget />,
        title: 'Savings Projection',
        message: `Based on your current trend, you're projected to save ₹${dashboard.savingsProjection.toFixed(2)} next month.`,
        action: 'Set a savings goal and track your progress daily.'
      });
    }

    setInsights(newInsights);
  };

  return (
    <div className="ai-insights-container modern-card">
      <h3>🤖 AI-Powered Insights</h3>
      <p className="insights-subtitle">Smart recommendations based on your spending patterns</p>

      <div className="insights-grid">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            className={`insight-card ${insight.type}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="insight-icon">{insight.icon}</div>
            <div className="insight-content">
              <h4>{insight.title}</h4>
              <p>{insight.message}</p>
              <div className="insight-action">
                <strong>Action:</strong> {insight.action}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIInsights;
