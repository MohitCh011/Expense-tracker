import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import ExpensesPage from './pages/ExpensesPage';

import { FiMoon, FiSun } from 'react-icons/fi';
import './App.css';


// ---------------------- PRIVATE ROUTE ----------------------
const PrivateRoute = ({ children }) => {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};


// ---------------------- NAVBAR ----------------------
const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  if (!user) return null;

  return (
    <nav
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '15px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        flexWrap: 'wrap',
        gap: '15px'
      }}
    >
      <h2 style={{ margin: 0, fontSize: '20px' }}>💰 Smart Expense Tracker</h2>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
        <Link
          to="/dashboard"
          style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}
        >
          📊 Dashboard
        </Link>

        <Link
          to="/expenses"
          style={{ color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '15px' }}
        >
          💸 Transactions
        </Link>

        {/* THEME TOGGLE */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          {theme === 'light' ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>

        <span style={{ opacity: 0.9 }}>👤 {user.username}</span>

        <button
          onClick={logout}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: '2px solid white',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};


// ---------------------- MAIN APP ----------------------
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="App">
            <Navbar />

            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />

              <Route
                path="/expenses"
                element={
                  <PrivateRoute>
                    <ExpensesPage />
                  </PrivateRoute>
                }
              />

              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>

            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
