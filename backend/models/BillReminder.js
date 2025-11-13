const mongoose = require('mongoose');

const billReminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['Rent', 'Electricity', 'Water', 'Internet', 'Phone', 'Insurance', 'Loan EMI', 'Credit Card', 'Subscription', 'Other'],
    default: 'Other'
  },
  dueDate: {
    type: Number, // Day of month (1-31)
    required: true,
    min: 1,
    max: 31
  },
  reminderDays: {
    type: Number, // Days before due date to remind
    default: 3
  },
  isRecurring: {
    type: Boolean,
    default: true
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  lastPaidDate: {
    type: Date
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('BillReminder', billReminderSchema);
