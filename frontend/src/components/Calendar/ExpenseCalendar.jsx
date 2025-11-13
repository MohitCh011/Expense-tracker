import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getExpenses } from '../../services/api';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './ExpenseCalendar.css';

const ExpenseCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [monthlyStats, setMonthlyStats] = useState({ min: 0, max: 0, avg: 0 });

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    calculateMonthlyStats();
  }, [expenses, currentDate]);

  const fetchExpenses = async () => {
    try {
      const { data } = await getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  };

  const calculateMonthlyStats = () => {
    const dailyTotals = [];
    const { daysInMonth } = getDaysInMonth(currentDate);

    for (let day = 1; day <= daysInMonth; day++) {
      const total = getTotalForDate(day);
      if (total > 0) dailyTotals.push(total);
    }

    if (dailyTotals.length > 0) {
      const min = Math.min(...dailyTotals);
      const max = Math.max(...dailyTotals);
      const avg = dailyTotals.reduce((sum, val) => sum + val, 0) / dailyTotals.length;
      setMonthlyStats({ min, max, avg });
    } else {
      setMonthlyStats({ min: 0, max: 0, avg: 0 });
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getExpensesForDate = (day) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return expenses.filter(exp => exp.date.startsWith(dateStr));
  };

  const getTotalForDate = (day) => {
    const dayExpenses = getExpensesForDate(day);
    return dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getColorClass = (total) => {
    if (total === 0) return '';
    
    const { min, max, avg } = monthlyStats;
    
    // Very High: Top 20% (red zone)
    if (total >= max * 0.8) return 'expense-very-high';
    
    // High: Above average (orange zone)
    if (total >= avg * 1.2) return 'expense-high';
    
    // Medium: Around average (yellow zone)
    if (total >= avg * 0.8) return 'expense-medium';
    
    // Low: Below average (green zone)
    return 'expense-low';
  };

  const changeMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
    setSelectedDate(null);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="calendar-container modern-card">
      {/* Header with Collapse Toggle */}
      <div className="calendar-header">
        <div className="calendar-title-section">
          <h3>📅 Expense Calendar</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className="collapse-btn"
          >
            {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
          </motion.button>
        </div>
        
        {isExpanded && (
          <div className="calendar-controls">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => changeMonth(-1)}
              className="calendar-nav-btn"
            >
              <FiChevronLeft />
            </motion.button>
            <span className="calendar-month">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => changeMonth(1)}
              className="calendar-nav-btn"
            >
              <FiChevronRight />
            </motion.button>
          </div>
        )}
      </div>

      {/* Color Legend */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="color-legend">
              <div className="legend-item">
                <div className="legend-color expense-low"></div>
                <span>Low Spending</span>
              </div>
              <div className="legend-item">
                <div className="legend-color expense-medium"></div>
                <span>Average</span>
              </div>
              <div className="legend-item">
                <div className="legend-color expense-high"></div>
                <span>High Spending</span>
              </div>
              <div className="legend-item">
                <div className="legend-color expense-very-high"></div>
                <span>Very High</span>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-day-name">{day}</div>
              ))}

              {blanks.map(blank => (
                <div key={`blank-${blank}`} className="calendar-day blank"></div>
              ))}

              {days.map(day => {
                const dayExpenses = getExpensesForDate(day);
                const total = getTotalForDate(day);
                const hasExpenses = dayExpenses.length > 0;
                const colorClass = getColorClass(total);

                return (
                  <motion.div
                    key={day}
                    className={`calendar-day ${colorClass} ${hasExpenses ? 'has-expenses' : ''} ${selectedDate === day ? 'selected' : ''}`}
                    onClick={() => setSelectedDate(selectedDate === day ? null : day)}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: day * 0.01 }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="day-number">{day}</div>
                    {hasExpenses && (
                      <>
                        <div className="day-amount">₹{total.toFixed(0)}</div>
                        <div className="expense-count">{dayExpenses.length} item{dayExpenses.length > 1 ? 's' : ''}</div>
                      </>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Selected Day Details */}
            <AnimatePresence>
              {selectedDate && (
                <motion.div
                  className="selected-day-details"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4>
                    📋 {monthNames[currentDate.getMonth()]} {selectedDate}, {currentDate.getFullYear()}
                  </h4>
                  <div className="day-expenses-list">
                    {getExpensesForDate(selectedDate).map(exp => (
                      <motion.div
                        key={exp._id}
                        className="day-expense-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <span className={`expense-badge ${exp.category}`}>{exp.category}</span>
                        <div className="expense-info-text">
                          <span className="expense-place">{exp.place || 'No place'}</span>
                          {exp.description && (
                            <span className="expense-description">{exp.description}</span>
                          )}
                        </div>
                        <strong className="expense-amount">₹{exp.amount.toFixed(2)}</strong>
                      </motion.div>
                    ))}
                    <div className="day-total">
                      <strong>Total Spent:</strong>
                      <strong className="total-value">₹{getTotalForDate(selectedDate).toFixed(2)}</strong>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpenseCalendar;
