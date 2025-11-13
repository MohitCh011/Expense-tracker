import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getExpenses } from '../../services/api';
import './Dashboard.css';

const BudgetProgress = () => {
  const [budgetData, setBudgetData] = useState([]);

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      const { data } = await getExpenses();
      
      // Calculate category totals
      const categoryTotals = data.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {});

      // Default budgets (you can make this dynamic later)
      const defaultBudgets = {
        'Food': 5000,
        'Travel': 3000,
        'Shopping': 2000,
        'Entertainment': 1500,
        'Bills': 4000,
        'Healthcare': 2000,
        'Education': 3000,
        'Other': 1000
      };

      const budgetArray = Object.entries(defaultBudgets).map(([category, budget]) => ({
        category,
        budget,
        spent: categoryTotals[category] || 0,
        percentage: ((categoryTotals[category] || 0) / budget) * 100
      }));

      setBudgetData(budgetArray);
    } catch (error) {
      console.error('Error fetching budget data:', error);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#ef4444';
    if (percentage >= 80) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div className="budget-progress-card modern-card">
      <h3>📊 Budget Progress</h3>
      
      <div className="budget-list">
        {budgetData.map((item, index) => (
          <motion.div
            key={item.category}
            className="budget-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="budget-header">
              <span className="budget-category">{item.category}</span>
              <span className="budget-amount">
                ₹{item.spent.toFixed(0)} / ₹{item.budget}
              </span>
            </div>
            
            <div className="progress-bar">
              <motion.div
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(item.percentage, 100)}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                style={{ 
                  background: getProgressColor(item.percentage)
                }}
              />
            </div>
            
            <div className="budget-footer">
              <span className={`budget-percentage ${item.percentage >= 100 ? 'exceeded' : ''}`}>
                {item.percentage.toFixed(1)}% used
              </span>
              {item.percentage >= 100 && (
                <span className="badge badge-danger">Exceeded!</span>
              )}
              {item.percentage >= 80 && item.percentage < 100 && (
                <span className="badge badge-warning">Almost there</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BudgetProgress;
