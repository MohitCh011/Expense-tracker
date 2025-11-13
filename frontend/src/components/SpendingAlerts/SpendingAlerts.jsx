import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiTrendingUp, FiDollarSign, FiX } from 'react-icons/fi';
import { AuthContext } from '../../context/AuthContext';
import './SpendingAlerts.css';

const SpendingAlerts = ({ expenses, budget }) => {
  const [alerts, setAlerts] = useState([]);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    generateAlerts();
  }, [expenses, budget]);

  const generateAlerts = () => {
    if (!expenses || expenses.length === 0) return;

    const newAlerts = [];
    const today = new Date();
    const todayExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.toDateString() === today.toDateString();
    });

    // Alert 1: Daily spending exceeded
    const todayTotal = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    if (todayTotal > 2000) {
      newAlerts.push({
        id: 'daily-high',
        type: 'warning',
        icon: <FiAlertTriangle />,
        title: 'High Daily Spending',
        message: `You've spent ₹${todayTotal.toFixed(2)} today. That's unusually high!`,
        action: 'Review expenses'
      });
    }

    // Alert 2: Category budget exceeded
    const categoryTotals = expenses.reduce((acc, exp) => {
      const month = new Date(exp.date).getMonth();
      const currentMonth = new Date().getMonth();
      if (month === currentMonth) {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      }
      return acc;
    }, {});

    Object.entries(categoryTotals).forEach(([category, spent]) => {
      const budgetAmount = budget?.[category] || 0;
      if (budgetAmount > 0 && spent > budgetAmount) {
        newAlerts.push({
          id: `budget-${category}`,
          type: 'danger',
          icon: <FiDollarSign />,
          title: `${category} Budget Exceeded`,
          message: `You've exceeded your ${category} budget by ₹${(spent - budgetAmount).toFixed(2)}`,
          action: 'Reduce spending'
        });
      } else if (budgetAmount > 0 && spent > budgetAmount * 0.9) {
        newAlerts.push({
          id: `budget-warning-${category}`,
          type: 'caution',
          icon: <FiTrendingUp />,
          title: `${category} Budget Alert`,
          message: `You've used ${((spent / budgetAmount) * 100).toFixed(0)}% of your ${category} budget`,
          action: 'Monitor spending'
        });
      }
    });

    // Alert 3: Unusual spending spike
    const last7Days = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const diffTime = today - expDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    });

    const last7DaysTotal = last7Days.reduce((sum, exp) => sum + exp.amount, 0);
    const avgDaily = last7DaysTotal / 7;

    if (todayTotal > avgDaily * 2) {
      newAlerts.push({
        id: 'spike',
        type: 'info',
        icon: <FiTrendingUp />,
        title: 'Spending Spike Detected',
        message: `Today's spending is 2x your average. Avg: ₹${avgDaily.toFixed(2)}/day`,
        action: 'Track carefully'
      });
    }

    // Filter out dismissed alerts
    const filteredAlerts = newAlerts.filter(
      alert => !dismissedAlerts.includes(alert.id)
    );

    setAlerts(filteredAlerts);
  };

  const dismissAlert = (alertId) => {
    setDismissedAlerts([...dismissedAlerts, alertId]);
    setAlerts(alerts.filter(alert => alert.id !== alertId));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="spending-alerts-container">
      <AnimatePresence>
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            className={`alert-card ${alert.type}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="alert-icon">{alert.icon}</div>
            <div className="alert-content">
              <h4>{alert.title}</h4>
              <p>{alert.message}</p>
              <span className="alert-action">{alert.action}</span>
            </div>
            <button
              className="alert-dismiss"
              onClick={() => dismissAlert(alert.id)}
            >
              <FiX />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SpendingAlerts;
