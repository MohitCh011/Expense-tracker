import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import './SpendingHeatmap.css';

const SpendingHeatmap = ({ expenses }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [heatmapData, setHeatmapData] = useState({});

  useEffect(() => {
    generateHeatmapData();
  }, [expenses, currentMonth]);

  const generateHeatmapData = () => {
    if (!expenses) return;

    const data = {};
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate.getFullYear() === year && expDate.getMonth() === month) {
        const day = expDate.getDate();
        data[day] = (data[day] || 0) + exp.amount;
      }
    });

    setHeatmapData(data);
  };

  const getIntensityClass = (amount) => {
    if (!amount) return 'intensity-0';
    const max = Math.max(...Object.values(heatmapData));
    const ratio = amount / max;

    if (ratio > 0.75) return 'intensity-4';
    if (ratio > 0.5) return 'intensity-3';
    if (ratio > 0.25) return 'intensity-2';
    return 'intensity-1';
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return { firstDay, daysInMonth };
  };

  const changeMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const { firstDay, daysInMonth } = getDaysInMonth();
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <div className="heatmap-container modern-card">
      <div className="heatmap-header">
        <h3>🔥 Spending Heatmap</h3>
        <div className="heatmap-controls">
          <button onClick={() => changeMonth(-1)} className="nav-btn">
            <FiChevronLeft />
          </button>
          <span className="month-label">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button onClick={() => changeMonth(1)} className="nav-btn">
            <FiChevronRight />
          </button>
        </div>
      </div>

      <div className="heatmap-legend">
        <span>Less</span>
        <div className="legend-boxes">
          <div className="legend-box intensity-0"></div>
          <div className="legend-box intensity-1"></div>
          <div className="legend-box intensity-2"></div>
          <div className="legend-box intensity-3"></div>
          <div className="legend-box intensity-4"></div>
        </div>
        <span>More</span>
      </div>

      <div className="heatmap-grid">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <div key={day} className="day-label">{day}</div>
        ))}

        {blanks.map(blank => (
          <div key={`blank-${blank}`} className="heatmap-day blank"></div>
        ))}

        {days.map(day => {
          const amount = heatmapData[day] || 0;
          const intensityClass = getIntensityClass(amount);

          return (
            <motion.div
              key={day}
              className={`heatmap-day ${intensityClass}`}
              whileHover={{ scale: 1.1, zIndex: 10 }}
              title={amount > 0 ? `Day ${day}: ₹${amount.toFixed(2)}` : `Day ${day}: No expenses`}
            >
              <span className="day-number">{day}</span>
              {amount > 0 && (
                <span className="day-amount">₹{amount.toFixed(0)}</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SpendingHeatmap;
