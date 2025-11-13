import React from 'react';
import BillReminders from '../components/BillReminders/BillReminders';

const BillRemindersPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--light)' }}>
      <BillReminders />
    </div>
  );
};

export default BillRemindersPage;
