import React, { useState } from 'react';
import AddExpense from '../components/Expenses/AddExpense';
import ExpenseList from '../components/Expenses/ExpenseList';
import { addIncome } from '../services/api';
import { toast } from 'react-toastify';
import '../components/Expenses/Expenses.css';

const ExpensesPage = () => {
  const [refresh, setRefresh] = useState(0);
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [incomeData, setIncomeData] = useState({
    amount: '',
    source: 'Salary',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const sources = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];

  const handleExpenseAdded = () => {
    setRefresh(prev => prev + 1);
  };

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    try {
      await addIncome(incomeData);
      toast.success('Income added successfully! 💰');
      setIncomeData({
        amount: '',
        source: 'Salary',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowIncomeForm(false);
      setRefresh(prev => prev + 1);
    } catch (error) {
      toast.error('Failed to add income');
    }
  };

  return (
    <div className="expenses-page">
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>Manage Transactions 💰</h1>
          <button 
            className="btn-primary" 
            onClick={() => setShowIncomeForm(!showIncomeForm)}
            style={{ width: 'auto', padding: '10px 20px' }}
          >
            {showIncomeForm ? '❌ Cancel' : '💵 Add Income'}
          </button>
        </div>

        {showIncomeForm && (
          <div className="add-income-card">
            <h3>💵 Add Income</h3>
            <form onSubmit={handleIncomeSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    value={incomeData.amount}
                    onChange={(e) => setIncomeData({ ...incomeData, amount: e.target.value })}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Enter amount"
                  />
                </div>

                <div className="form-group">
                  <label>Source *</label>
                  <select
                    value={incomeData.source}
                    onChange={(e) => setIncomeData({ ...incomeData, source: e.target.value })}
                    required
                  >
                    {sources.map(src => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={incomeData.date}
                    onChange={(e) => setIncomeData({ ...incomeData, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={incomeData.description}
                    onChange={(e) => setIncomeData({ ...incomeData, description: e.target.value })}
                    placeholder="Brief description"
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary">
                Add Income
              </button>
            </form>
          </div>
        )}

        <AddExpense onExpenseAdded={handleExpenseAdded} />
        <ExpenseList refresh={refresh} />
      </div>
    </div>
  );
};

export default ExpensesPage;
