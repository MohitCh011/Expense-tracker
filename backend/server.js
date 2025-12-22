const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// ✅ Allowed origins (local + deployed)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  process.env.FRONTEND_URL || 'https://your-frontend-url.onrender.com',
];

// ✅ Single, clean CORS setup
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like Postman) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
};

app.use(cors(corsOptions));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expense'));
app.use('/api/income', require('./routes/income'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/recommendations', require('./routes/recommendations'));
app.use('/api/savings-goals', require('./routes/savingsGoal'));
app.use('/api/bill-reminders', require('./routes/billReminder'));

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Smart Expense Tracker API - v2.0' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
