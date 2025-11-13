import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth APIs
export const register = (userData) => api.post('/auth/register', userData);
export const login = (credentials) => api.post('/auth/login', credentials);
export const getProfile = () => api.get('/auth/profile');
export const updateBudget = (data) => api.put('/auth/budget', data);

// Expense APIs
export const getExpenses = () => api.get('/expenses');
export const addExpense = (data) => api.post('/expenses', data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);

// Income APIs
export const getIncome = () => api.get('/income');
export const addIncome = (data) => api.post('/income', data);
export const deleteIncome = (id) => api.delete(`/income/${id}`);

// Dashboard APIs
export const getDashboard = () => api.get('/dashboard');
export const getRecommendations = () => api.get('/recommendations');

// 🆕 Savings Goals APIs
export const getSavingsGoals = () => api.get('/savings-goals');
export const addSavingsGoal = (data) => api.post('/savings-goals', data);
export const updateSavingsGoal = (id, data) => api.put(`/savings-goals/${id}`, data);
export const deleteSavingsGoal = (id) => api.delete(`/savings-goals/${id}`);
export const contributeToGoal = (id, amount) => api.post(`/savings-goals/${id}/contribute`, { amount });

// 🆕 Bill Reminders APIs
export const getBillReminders = () => api.get('/bill-reminders');
export const getUpcomingBills = () => api.get('/bill-reminders/upcoming');
export const addBillReminder = (data) => api.post('/bill-reminders', data);
export const updateBillReminder = (id, data) => api.put(`/bill-reminders/${id}`, data);
export const deleteBillReminder = (id) => api.delete(`/bill-reminders/${id}`);
export const markBillAsPaid = (id) => api.put(`/bill-reminders/${id}/pay`);

export default api;
