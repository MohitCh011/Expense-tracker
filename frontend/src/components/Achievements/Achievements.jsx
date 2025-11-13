import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiTarget, FiStar } from 'react-icons/fi';
import './Achievements.css';

const Achievements = ({ expenses, income, savings, user }) => {
  const [badges, setBadges] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  const badgeDefinitions = [
    {
      id: 'first-expense',
      title: 'Getting Started',
      description: 'Log your first expense',
      icon: '🎯',
      points: 10,
      check: () => expenses && expenses.length >= 1
    },
    {
      id: '7-day-streak',
      title: '7-Day Streak',
      description: 'Track expenses for 7 consecutive days',
      icon: '🔥',
      points: 50,
      check: () => checkConsecutiveDays(expenses, 7)
    },
    {
      id: '30-day-streak',
      title: 'Month Champion',
      description: 'Track expenses for 30 consecutive days',
      icon: '👑',
      points: 200,
      check: () => checkConsecutiveDays(expenses, 30)
    },
    {
      id: 'saver-bronze',
      title: 'Bronze Saver',
      description: 'Save ₹10,000 in a month',
      icon: '🥉',
      points: 100,
      check: () => checkMonthlySavings(10000)
    },
    {
      id: 'saver-silver',
      title: 'Silver Saver',
      description: 'Save ₹25,000 in a month',
      icon: '🥈',
      points: 250,
      check: () => checkMonthlySavings(25000)
    },
    {
      id: 'saver-gold',
      title: 'Gold Saver',
      description: 'Save ₹50,000 in a month',
      icon: '🥇',
      points: 500,
      check: () => checkMonthlySavings(50000)
    },
    {
      id: 'budget-master',
      title: 'Budget Master',
      description: 'Stay within budget for all categories',
      icon: '💎',
      points: 300,
      check: () => checkBudgetCompliance()
    },
    {
      id: 'expense-warrior',
      title: 'Expense Warrior',
      description: 'Log 100 expenses',
      icon: '⚔️',
      points: 150,
      check: () => expenses && expenses.length >= 100
    },
    {
      id: 'category-master',
      title: 'Category Master',
      description: 'Use all expense categories',
      icon: '🎨',
      points: 75,
      check: () => checkAllCategories()
    },
    {
      id: 'early-bird',
      title: 'Early Bird',
      description: 'Log expense before 8 AM',
      icon: '🌅',
      points: 25,
      check: () => checkEarlyExpense()
    }
  ];

  useEffect(() => {
    calculateBadges();
  }, [expenses, income, savings]);

  const checkConsecutiveDays = (expenses, days) => {
    if (!expenses || expenses.length === 0) return false;
    
    const dates = [...new Set(expenses.map(exp => new Date(exp.date).toDateString()))];
    dates.sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 1;
    for (let i = 0; i < dates.length - 1; i++) {
      const diff = (new Date(dates[i]) - new Date(dates[i + 1])) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
        if (streak >= days) return true;
      } else {
        streak = 1;
      }
    }
    return false;
  };

  const checkMonthlySavings = (targetAmount) => {
    if (!savings) return false;
    // Check if current month savings >= target
    return savings >= targetAmount;
  };

  const checkBudgetCompliance = () => {
    // Simplified check - can be enhanced with actual budget data
    return false; // Implement based on budget data
  };

  const checkAllCategories = () => {
    if (!expenses || expenses.length === 0) return false;
    const categories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Other'];
    const usedCategories = new Set(expenses.map(exp => exp.category));
    return categories.every(cat => usedCategories.has(cat));
  };

  const checkEarlyExpense = () => {
    if (!expenses || expenses.length === 0) return false;
    return expenses.some(exp => {
      const hour = new Date(exp.date).getHours();
      return hour < 8;
    });
  };

  const calculateBadges = () => {
    const earned = [];
    let points = 0;

    badgeDefinitions.forEach(badge => {
      if (badge.check()) {
        earned.push({ ...badge, earned: true });
        points += badge.points;
      } else {
        earned.push({ ...badge, earned: false });
      }
    });

    setBadges(earned);
    setTotalPoints(points);
  };

  const earnedCount = badges.filter(b => b.earned).length;
  const totalCount = badges.length;
  const progress = (earnedCount / totalCount) * 100;

  return (
    <div className="achievements-container modern-card">
      <div className="achievements-header">
        <h2>🏆 Achievements</h2>
        <div className="points-display">
          <FiStar className="star-icon" />
          <span className="points-value">{totalPoints} points</span>
        </div>
      </div>

      <div className="achievements-progress">
        <div className="progress-info">
          <span>{earnedCount} of {totalCount} unlocked</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      <div className="badges-grid">
        {badges.map((badge, index) => (
          <motion.div
            key={badge.id}
            className={`badge-card ${badge.earned ? 'earned' : 'locked'}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: badge.earned ? 1.05 : 1 }}
          >
            <div className="badge-icon">{badge.icon}</div>
            <h4 className="badge-title">{badge.title}</h4>
            <p className="badge-description">{badge.description}</p>
            <div className="badge-points">+{badge.points} pts</div>
            {badge.earned && (
              <div className="badge-earned-stamp">✓</div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
