import React from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatsCard = ({ title, value, icon, color, trend }) => {
  const colors = {
    green: '#10b981',
    red: '#ef4444',
    blue: '#3b82f6',
    purple: '#8b5cf6',
    orange: '#f59e0b'
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <motion.div 
      className="stat-card modern-card ripple"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: -5,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)"
      }}
    >
      <div className="stat-header">
        <div>
          <motion.div 
            className="stat-value"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            style={{ color: colors[color] || '#333' }}
          >
            {value}
          </motion.div>
          <div className="stat-title">{title}</div>
          
          {trend && (
            <motion.div 
              className="stat-trend"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              {trend > 0 ? (
                <span className="trend-up">
                  <FiTrendingUp size={14} /> +{trend}%
                </span>
              ) : (
                <span className="trend-down">
                  <FiTrendingDown size={14} /> {trend}%
                </span>
              )}
            </motion.div>
          )}
        </div>
        <motion.div 
          className="stat-icon"
          initial={{ rotate: -180, scale: 0 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
        >
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
