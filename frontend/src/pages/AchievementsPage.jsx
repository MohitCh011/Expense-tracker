import React, { useState, useEffect } from 'react';
import { getExpenses, getIncome, getDashboard } from '../services/api';
import Achievements from '../components/Achievements/Achievements';

const AchievementsPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [savings, setSavings] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expRes, incRes, dashRes] = await Promise.all([
        getExpenses(),
        getIncome(),
        getDashboard()
      ]);
      
      setExpenses(expRes.data);
      setIncome(incRes.data);
      setSavings(dashRes.data.totalSavings);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--light)', padding: '30px' }}>
      <Achievements expenses={expenses} income={income} savings={savings} />
    </div>
  );
};

export default AchievementsPage;
