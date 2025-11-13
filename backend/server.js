const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expense'));
app.use('/api/income', require('./routes/income'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/savings-goals', require('./routes/savingsGoal')); // 🆕
app.use('/api/bill-reminders', require('./routes/billReminder')); // 🆕

app.get('/', (req, res) => {
  res.json({ message: 'Smart Expense Tracker API - v2.0' });
});

const PORT = process.env.PORT || 5000;
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-frontend-url.onrender.com' 
    : 'http://localhost:3000',
  credentials: true
};

app.use(cors(corsOptions));
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
