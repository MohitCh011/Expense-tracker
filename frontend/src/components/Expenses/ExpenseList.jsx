import React, { useState, useEffect } from 'react';
import { getExpenses, deleteExpense } from '../../services/api';
import { toast } from 'react-toastify';
import { FaTrash } from 'react-icons/fa';
import './Expenses.css';

const ExpenseList = ({ refresh }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, [refresh]);

  const fetchExpenses = async () => {
    try {
      const { data } = await getExpenses();
      setExpenses(data);
    } catch (error) {
      toast.error('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        toast.success('Expense deleted');
        fetchExpenses();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  if (loading) return <div className="loading">Loading expenses...</div>;

  return (
    <div className="expense-list-card">
      <h3>📋 Recent Expenses</h3>
      
      {expenses.length === 0 ? (
        <p className="no-data">No expenses yet. Add your first expense above! 👆</p>
      ) : (
        <div className="expense-list">
          {expenses.map(expense => (
            <div key={expense._id} className="expense-item">
              <div className="expense-info">
                <div className="expense-category-badge" data-category={expense.category}>
                  {expense.category}
                </div>
                <div className="expense-details">
                  <strong>₹{expense.amount.toFixed(2)}</strong>
                  {expense.place && <span className="expense-place">• {expense.place}</span>}
                  <p className="expense-desc">{expense.description || 'No description'}</p>
                  <small>{new Date(expense.date).toLocaleDateString('en-IN')}</small>
                </div>
              </div>
              <button 
                className="btn-delete" 
                onClick={() => handleDelete(expense._id)}
                title="Delete expense"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {expenses.length > 0 && (
        <div className="expense-total">
          <strong>Total:</strong>
          <strong className="total-amount">
            ₹{expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
          </strong>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
