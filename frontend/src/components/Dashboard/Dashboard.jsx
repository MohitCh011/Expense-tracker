import React, { useState, useEffect, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboard, getRecommendations, getExpenses, getIncome } from '../../services/api';
import { exportToPDF, exportToExcel } from '../../utils/exportUtils';
import StatsCard from './StatsCard';
import PieChart from '../Charts/PieChart';
import BarChart from '../Charts/BarChart';
import BudgetProgress from './BudgetProgress';
import ExpenseCalendar from '../Calendar/ExpenseCalendar';
import AIInsights from '../Insights/AIInsights';
import AnimatedCard from '../Animations/AnimatedCard';
import FadeIn from '../Animations/FadeIn';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';
import { FiTrendingUp, FiTrendingDown, FiDownload, FiFileText, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, recRes, expRes, incRes] = await Promise.all([
        getDashboard(),
        getRecommendations(),
        getExpenses(),
        getIncome()
      ]);

      setDashboard(dashRes?.data || null);
      setRecommendations(recRes?.data || []);
      setExpenses(expRes?.data || []);
      setIncome(incRes?.data || []);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    try {
      if (!dashboard) {
        toast.error('No data to export');
        return;
      }
      exportToPDF(dashboard, expenses, income, user?.username || 'user');
      toast.success('📄 Report exported to PDF!');
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast.error('Failed to export PDF: ' + (error?.message || error));
    }
  };

  const handleExportExcel = () => {
    try {
      if (!dashboard) {
        toast.error('No data to export');
        return;
      }
      exportToExcel(expenses, income, dashboard);
      toast.success('📊 Report exported to Excel!');
    } catch (error) {
      console.error('Excel Export Error:', error);
      toast.error('Failed to export Excel: ' + (error?.message || error));
    }
  };

  const generateSpendingAlerts = () => {
    if (!expenses || expenses.length === 0) return [];

    const alerts = [];
    const today = new Date();

    const todayExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.toDateString() === today.toDateString();
    });
    const todayTotal = todayExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

    // Example threshold - you can adjust or make it configurable
    if (todayTotal > 2000 && !dismissedAlerts.includes('daily-high')) {
      alerts.push({
        id: 'daily-high',
        type: 'warning',
        title: '⚠️ High Spending Alert',
        message: `You've spent ₹${todayTotal.toFixed(2)} today. That's unusually high!`
      });
    }

    const categoryTotals = {};
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate.getMonth() === today.getMonth() && expDate.getFullYear() === today.getFullYear()) {
        const cat = exp.category || 'Other';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (Number(exp.amount) || 0);
      }
    });

    Object.entries(categoryTotals).forEach(([category, spent]) => {
      const alertId = `budget-${category}`;
      if (spent > 5000 && !dismissedAlerts.includes(alertId)) {
        alerts.push({
          id: alertId,
          type: 'danger',
          title: `🚨 ${category} Budget Alert`,
          message: `You've spent ₹${spent.toFixed(2)} on ${category} this month!`
        });
      }
    });

    return alerts;
  };

  const spendingAlerts = useMemo(generateSpendingAlerts, [expenses, dismissedAlerts]);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your financial insights...</p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="dashboard-loading">
        <p>No data available. Please add some expenses and income.</p>
      </div>
    );
  }

  const monthlyComparison = dashboard.monthlyComparison || {
    currentMonthSavings: 0,
    lastMonthSavings: 0,
    trend: 'stable',
    savingsChangePercent: 0
  };

  return (
    <motion.div
      className={`dashboard ${theme || ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Real-time Spending Alerts */}
      <AnimatePresence>
        {spendingAlerts.length > 0 && (
          <div className="spending-alerts-fixed">
            {spendingAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                className={`alert-card ${alert.type}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="alert-content">
                  <h4>{alert.title}</h4>
                  <p>{alert.message}</p>
                </div>
                <button
                  className="alert-dismiss"
                  onClick={() => setDismissedAlerts(prev => [...prev, alert.id])}
                  aria-label="Dismiss alert"
                >
                  <FiX />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Dashboard Header */}
      <div className="dashboard-header">
        <FadeIn>
          <h1>Dashboard 📊</h1>
          <p className="subtitle">Your financial overview at a glance</p>
        </FadeIn>

        <div className="export-buttons">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-gradient"
            onClick={handleExportPDF}
          >
            <FiFileText /> Export PDF
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="btn-gradient"
            onClick={handleExportExcel}
          >
            <FiDownload /> Export Excel
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <AnimatedCard delay={0.1}>
          <StatsCard
            title="Total Income"
            value={`₹${(Number(dashboard.totalIncome) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon="💰"
            color="green"
            trend={+15.5}
          />
        </AnimatedCard>

        <AnimatedCard delay={0.2}>
          <StatsCard
            title="Total Expenses"
            value={`₹${(Number(dashboard.totalExpenses) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon="💸"
            color="red"
            trend={-8.2}
          />
        </AnimatedCard>

        <AnimatedCard delay={0.3}>
          <StatsCard
            title="Total Savings"
            value={`₹${(Number(dashboard.totalSavings) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon="🏦"
            color="blue"
            trend={+22.3}
          />
        </AnimatedCard>

        <AnimatedCard delay={0.4}>
          <StatsCard
            title="Savings Rate"
            value={`${(Number(dashboard.savingsRate) || 0).toFixed(2)}%`}
            icon="📈"
            color="purple"
            trend={+5.1}
          />
        </AnimatedCard>
      </div>

      {/* Monthly Comparison */}
      <AnimatedCard delay={0.5}>
        <div className="comparison-card modern-card">
          <h3>📅 This Month vs Last Month</h3>
          <div className="comparison-content">
            <div className="comparison-stats">
              <div className="stat-item">
                <span className="label">Current Savings</span>
                <span className="value success">₹{(Number(monthlyComparison.currentMonthSavings) || 0).toFixed(2)}</span>
              </div>
              <div className="stat-item">
                <span className="label">Last Month</span>
                <span className="value">₹{(Number(monthlyComparison.lastMonthSavings) || 0).toFixed(2)}</span>
              </div>
            </div>

            <motion.div 
              className={`trend-indicator ${monthlyComparison.trend}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8, type: 'spring' }}
            >
              {monthlyComparison.trend === 'up' ? (
                <FiTrendingUp size={32} />
              ) : (
                <FiTrendingDown size={32} />
              )}
              <span className="percentage">{Math.abs(Number(monthlyComparison.savingsChangePercent) || 0).toFixed(2)}%</span>
            </motion.div>
          </div>
        </div>
      </AnimatedCard>

      {/* AI Insights */}
      <AnimatedCard delay={0.6}>
        <AIInsights dashboard={dashboard} expenses={expenses} />
      </AnimatedCard>

      {/* Two Calendars Side by Side */}
      <div className="calendars-wrapper">
        <AnimatedCard delay={0.7}>
          <ExpenseCalendar />
        </AnimatedCard>

        <AnimatedCard delay={0.75}>
          <div className="heatmap-container modern-card">
            <h3>🔥 Spending Heatmap</h3>
            <p className="subtitle" style={{ marginBottom: '15px', color: '#6b7280', fontSize: '12px' }}>
              Daily spending patterns this month
            </p>

            <div className="heatmap-grid-days">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="heatmap-day-label">{day}</div>
              ))}
            </div>

            <div className="heatmap-grid">
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const dayExpenses = expenses.filter(exp => {
                  const expDate = new Date(exp.date);
                  return expDate.getDate() === day &&
                         expDate.getMonth() === new Date().getMonth() &&
                         expDate.getFullYear() === new Date().getFullYear();
                });
                const total = dayExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);

                const intensity = total > 3000 ? 4 : 
                                  total > 2000 ? 3 : 
                                  total > 1000 ? 2 : 
                                  total > 0 ? 1 : 0;

                return (
                  <motion.div
                    key={day}
                    className={`heatmap-day intensity-${intensity}`}
                    whileHover={{ scale: 1.1 }}
                    title={total > 0 ? `Day ${day}: ₹${total.toFixed(0)}` : `Day ${day}: No expenses`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.75 + (i * 0.005) }}
                  >
                    <span className="day-number">{day}</span>
                    {total > 0 && (
                      <span className="day-amount">₹{total.toFixed(0)}</span>
                    )}
                  </motion.div>
                );
              })}
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
          </div>
        </AnimatedCard>
      </div>

      {/* Budget Progress */}
      <AnimatedCard delay={0.8}>
        <BudgetProgress />
      </AnimatedCard>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <AnimatedCard delay={0.9}>
          <div className="recommendations modern-card">
            <h3>💡 Smart Recommendations</h3>
            <AnimatePresence>
              {recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`recommendation-card ${rec.type || ''}`}
                >
                  {rec.message}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </AnimatedCard>
      )}

      {/* Charts Side by Side */}
      {dashboard.categoryWiseSpending && Object.keys(dashboard.categoryWiseSpending).length > 0 && (
        <div className="charts-grid">
          <AnimatedCard delay={1.0}>
            <div className="chart-card modern-card">
              <h3>📊 Category Distribution</h3>
              <PieChart data={dashboard.categoryWiseSpending} />
            </div>
          </AnimatedCard>

          <AnimatedCard delay={1.1}>
            <div className="chart-card modern-card">
              <h3>📈 Weekly Trend</h3>
              <BarChart data={dashboard.weeklyTrend || {}} />
            </div>
          </AnimatedCard>
        </div>
      )}

      {/* Savings Projection */}
      {dashboard.savingsProjection !== undefined && (
        <AnimatedCard delay={1.2}>
          <div className="projection-card modern-card">
            <h3>🔮 Next Month Savings Projection</h3>
            <motion.p 
              className="projection-value"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.4, type: 'spring' }}
            >
              ₹{(Number(dashboard.savingsProjection) || 0).toFixed(2)}
            </motion.p>
            <p className="projection-note">Based on your last 3 months spending pattern</p>
          </div>
        </AnimatedCard>
      )}
    </motion.div>
  );
};

export default Dashboard;
