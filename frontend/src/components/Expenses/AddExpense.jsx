import React, { useState } from 'react';
import { addExpense } from '../../services/api';
import { toast } from 'react-toastify';
import './Expenses.css';

const AddExpense = ({ onExpenseAdded }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: 'Food',
    place: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await addExpense(formData);
      toast.success('Expense added successfully! 💸');
      
      // Reset form
      setFormData({
        amount: '',
        category: 'Food',
        place: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      if (onExpenseAdded) onExpenseAdded();
    } catch (error) {
      toast.error('Failed to add expense');
    }
  };

  return (
    <div className="add-expense-card">
      <h3>💸 Add Expense</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Amount (₹) *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
              min="0"
              step="0.01"
              placeholder="Enter amount"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Place</label>
            <input
              type="text"
              value={formData.place}
              onChange={(e) => setFormData({ ...formData, place: e.target.value })}
              placeholder="e.g., D-Mart, Swiggy"
            />
          </div>

          <div className="form-group">
            <label>Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description (optional)"
            rows="2"
          />
        </div>

        <button type="submit" className="btn-primary">
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default AddExpense;
