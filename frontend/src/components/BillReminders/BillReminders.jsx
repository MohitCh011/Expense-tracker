import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiAlertCircle, FiCheckCircle, FiTrash, FiClock } from 'react-icons/fi';
import axios from '../../services/api';
import { toast } from 'react-toastify';
import './BillReminders.css';

const BillReminders = () => {
  const [bills, setBills] = useState([]);
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBill, setNewBill] = useState({
    title: '',
    amount: '',
    category: 'Rent',
    dueDate: '',
    reminderDays: 3,
    isRecurring: true,
    notes: ''
  });

  const billCategories = ['Rent', 'Electricity', 'Water', 'Internet', 'Phone', 'Insurance', 'Loan EMI', 'Credit Card', 'Subscription', 'Other'];

  const categoryIcons = {
    'Rent': '🏠',
    'Electricity': '⚡',
    'Water': '💧',
    'Internet': '🌐',
    'Phone': '📱',
    'Insurance': '🛡️',
    'Loan EMI': '🏦',
    'Credit Card': '💳',
    'Subscription': '📺',
    'Other': '📄'
  };

  useEffect(() => {
    fetchBills();
    fetchUpcomingBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data } = await axios.get('/api/bill-reminders');
      setBills(data);
    } catch (error) {
      toast.error('Failed to fetch bills');
    }
  };

  const fetchUpcomingBills = async () => {
    try {
      const { data } = await axios.get('/api/bill-reminders/upcoming');
      setUpcomingBills(data);
    } catch (error) {
      console.error('Failed to fetch upcoming bills');
    }
  };

  const handleAddBill = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/bill-reminders', newBill);
      toast.success('🔔 Bill reminder created!');
      setShowAddModal(false);
      setNewBill({
        title: '',
        amount: '',
        category: 'Rent',
        dueDate: '',
        reminderDays: 3,
        isRecurring: true,
        notes: ''
      });
      fetchBills();
      fetchUpcomingBills();
    } catch (error) {
      toast.error('Failed to create bill reminder');
    }
  };

  const handleMarkPaid = async (billId) => {
    try {
      await axios.put(`/api/bill-reminders/${billId}/pay`);
      toast.success('✅ Bill marked as paid!');
      fetchBills();
      fetchUpcomingBills();
    } catch (error) {
      toast.error('Failed to mark bill as paid');
    }
  };

  const handleDelete = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill reminder?')) {
      try {
        await axios.delete(`/api/bill-reminders/${billId}`);
        toast.success('Bill reminder deleted');
        fetchBills();
        fetchUpcomingBills();
      } catch (error) {
        toast.error('Failed to delete bill reminder');
      }
    }
  };

  const getDaysUntilDue = (dueDate) => {
    const today = new Date().getDate();
    let daysUntil = dueDate - today;
    if (daysUntil < 0) daysUntil += 30; // Approximate next month
    return daysUntil;
  };

  return (
    <div className="bill-reminders-container">
      <div className="bills-header">
        <h2>🔔 Bill Reminders</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-add-bill"
          onClick={() => setShowAddModal(true)}
        >
          <FiPlus /> Add Bill
        </motion.button>
      </div>

      {/* Upcoming Bills Alert */}
      {upcomingBills.length > 0 && (
        <motion.div
          className="upcoming-alert"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FiAlertCircle size={24} />
          <div>
            <strong>Upcoming Bills</strong>
            <p>You have {upcomingBills.length} bill(s) due in the next 7 days</p>
          </div>
        </motion.div>
      )}

      <div className="bills-grid">
        <AnimatePresence>
          {bills.map((bill, index) => {
            const daysUntil = getDaysUntilDue(bill.dueDate);
            const isOverdue = daysUntil < 0 && !bill.isPaid;
            const isDueSoon = daysUntil <= 3 && daysUntil >= 0 && !bill.isPaid;

            return (
              <motion.div
                key={bill._id}
                className={`bill-card modern-card ${bill.isPaid ? 'paid' : ''} ${isOverdue ? 'overdue' : ''} ${isDueSoon ? 'due-soon' : ''}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="bill-header">
                  <span className="bill-icon">{categoryIcons[bill.category]}</span>
                  <div className="bill-actions">
                    {!bill.isPaid && (
                      <button onClick={() => handleMarkPaid(bill._id)} className="btn-icon pay">
                        <FiCheckCircle />
                      </button>
                    )}
                    <button onClick={() => handleDelete(bill._id)} className="btn-icon delete">
                      <FiTrash />
                    </button>
                  </div>
                </div>

                <h3 className="bill-title">{bill.title}</h3>
                <p className="bill-category">{bill.category}</p>

                <div className="bill-amount">
                  ₹{bill.amount.toFixed(2)}
                  {bill.isRecurring && <span className="recurring-badge">Recurring</span>}
                </div>

                <div className="bill-due">
                  <FiClock />
                  <span>
                    {bill.isPaid ? (
                      <span className="paid-text">Paid on {new Date(bill.lastPaidDate).toLocaleDateString('en-IN')}</span>
                    ) : (
                      <>Due on: {bill.dueDate}th of month</>
                    )}
                  </span>
                </div>

                {!bill.isPaid && (
                  <div className={`days-until ${isDueSoon ? 'urgent' : ''} ${isOverdue ? 'overdue-text' : ''}`}>
                    {isOverdue ? (
                      <>⚠️ Overdue!</>
                    ) : (
                      <>📅 {daysUntil} day{daysUntil !== 1 ? 's' : ''} remaining</>
                    )}
                  </div>
                )}

                {bill.notes && (
                  <p className="bill-notes">📝 {bill.notes}</p>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {bills.length === 0 && (
          <div className="no-bills">
            <FiAlertCircle size={64} color="#ccc" />
            <p>No bill reminders yet. Add your first bill!</p>
          </div>
        )}
      </div>

      {/* Add Bill Modal */}
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
              <h3>🔔 Create Bill Reminder</h3>
              <form onSubmit={handleAddBill}>
                <div className="form-group">
                  <label>Bill Title *</label>
                  <input
                    type="text"
                    value={newBill.title}
                    onChange={(e) => setNewBill({ ...newBill, title: e.target.value })}
                    required
                    placeholder="e.g., Electricity Bill"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={newBill.category}
                    onChange={(e) => setNewBill({ ...newBill, category: e.target.value })}
                    required
                  >
                    {billCategories.map(cat => (
                      <option key={cat} value={cat}>{categoryIcons[cat]} {cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Amount (₹) *</label>
                    <input
                      type="number"
                      value={newBill.amount}
                      onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                      required
                      min="0"
                      placeholder="2000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Due Date (Day of Month) *</label>
                    <input
                      type="number"
                      value={newBill.dueDate}
                      onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                      required
                      min="1"
                      max="31"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Remind Me (days before)</label>
                    <input
                      type="number"
                      value={newBill.reminderDays}
                      onChange={(e) => setNewBill({ ...newBill, reminderDays: e.target.value })}
                      min="1"
                      max="15"
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={newBill.isRecurring}
                        onChange={(e) => setNewBill({ ...newBill, isRecurring: e.target.checked })}
                      />
                      <span>Recurring Monthly</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    value={newBill.notes}
                    onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })}
                    rows="2"
                    placeholder="Any additional details..."
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create Reminder
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

export default BillReminders;
