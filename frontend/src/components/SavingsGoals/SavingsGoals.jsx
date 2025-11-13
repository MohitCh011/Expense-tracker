import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiTarget, FiTrendingUp, FiTrash, FiEdit2 } from 'react-icons/fi';
import axios from '../../services/api';
import { toast } from 'react-toastify';
import './SavingsGoals.css';

const SavingsGoals = () => {
  const [goals, setGoals] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    category: 'Other',
    icon: '🎯'
  });

  const goalIcons = {
    'Vacation': '✈️',
    'Emergency Fund': '🚨',
    'Car': '🚗',
    'House': '🏠',
    'Education': '🎓',
    'Wedding': '💒',
    'Gadget': '📱',
    'Other': '🎯'
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await axios.get('/api/savings-goals');
      setGoals(data);
    } catch (error) {
      toast.error('Failed to fetch goals');
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/savings-goals', {
        ...newGoal,
        icon: goalIcons[newGoal.category]
      });
      toast.success('🎯 Goal created successfully!');
      setShowAddModal(false);
      setNewGoal({ title: '', targetAmount: '', deadline: '', category: 'Other', icon: '🎯' });
      fetchGoals();
    } catch (error) {
      toast.error('Failed to create goal');
    }
  };

  const handleContribute = async (goalId) => {
    const amount = prompt('Enter contribution amount:');
    if (amount && !isNaN(amount)) {
      try {
        await axios.post(`/api/savings-goals/${goalId}/contribute`, { amount: parseFloat(amount) });
        toast.success('💰 Contribution added!');
        fetchGoals();
      } catch (error) {
        toast.error('Failed to add contribution');
      }
    }
  };

  const handleDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await axios.delete(`/api/savings-goals/${goalId}`);
        toast.success('Goal deleted');
        fetchGoals();
      } catch (error) {
        toast.error('Failed to delete goal');
      }
    }
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="savings-goals-container">
      <div className="goals-header">
        <h2>🎯 Savings Goals</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-add-goal"
          onClick={() => setShowAddModal(true)}
        >
          <FiPlus /> Add Goal
        </motion.button>
      </div>

      <div className="goals-grid">
        <AnimatePresence>
          {goals.map((goal, index) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isCompleted = goal.isCompleted;

            return (
              <motion.div
                key={goal._id}
                className={`goal-card modern-card ${isCompleted ? 'completed' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="goal-header">
                  <span className="goal-icon">{goal.icon}</span>
                  <div className="goal-actions">
                    <button onClick={() => handleContribute(goal._id)} className="btn-icon">
                      <FiTrendingUp />
                    </button>
                    <button onClick={() => handleDelete(goal._id)} className="btn-icon delete">
                      <FiTrash />
                    </button>
                  </div>
                </div>

                <h3 className="goal-title">{goal.title}</h3>
                <p className="goal-category">{goal.category}</p>

                <div className="goal-progress">
                  <div className="progress-bar">
                    <motion.div
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      style={{
                        background: isCompleted 
                          ? '#10b981' 
                          : progress > 75 
                          ? '#3b82f6' 
                          : progress > 50 
                          ? '#f59e0b' 
                          : '#ef4444'
                      }}
                    />
                  </div>
                  <span className="progress-text">{progress.toFixed(1)}%</span>
                </div>

                <div className="goal-stats">
                  <div className="stat">
                    <span className="stat-label">Current</span>
                    <span className="stat-value">₹{goal.currentAmount.toFixed(0)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Target</span>
                    <span className="stat-value">₹{goal.targetAmount.toFixed(0)}</span>
                  </div>
                </div>

                <div className="goal-footer">
                  <span className="days-remaining">
                    {isCompleted ? (
                      <span className="completed-badge">🎉 Completed!</span>
                    ) : (
                      <>⏰ {daysRemaining} days left</>
                    )}
                  </span>
                  <span className="amount-remaining">
                    ₹{(goal.targetAmount - goal.currentAmount).toFixed(0)} to go
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {goals.length === 0 && (
          <div className="no-goals">
            <FiTarget size={64} color="#ccc" />
            <p>No savings goals yet. Create your first goal!</p>
          </div>
        )}
      </div>

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>🎯 Create New Savings Goal</h3>
              <form onSubmit={handleAddGoal}>
                <div className="form-group">
                  <label>Goal Title *</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    required
                    placeholder="e.g., Dream Vacation"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={newGoal.category}
                    onChange={(e) => setNewGoal({ ...newGoal, category: e.target.value })}
                    required
                  >
                    {Object.keys(goalIcons).map(cat => (
                      <option key={cat} value={cat}>{goalIcons[cat]} {cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Target Amount (₹) *</label>
                    <input
                      type="number"
                      value={newGoal.targetAmount}
                      onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                      required
                      min="0"
                      placeholder="50000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Deadline *</label>
                    <input
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                      required
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SavingsGoals;
