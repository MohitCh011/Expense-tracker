const express = require('express');
const router = express.Router();
const { 
  getBillReminders,
  getUpcomingBills,
  addBillReminder,
  markBillAsPaid,
  resetBillStatus,
  updateBillReminder,
  deleteBillReminder
} = require('../controllers/billReminderController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getBillReminders).post(protect, addBillReminder);
router.get('/upcoming', protect, getUpcomingBills);
router.put('/:id/pay', protect, markBillAsPaid);
router.put('/:id/reset', protect, resetBillStatus);
router.route('/:id').put(protect, updateBillReminder).delete(protect, deleteBillReminder);

module.exports = router;
