const BillReminder = require('../models/BillReminder');

// @desc    Get all bill reminders
// @route   GET /api/bill-reminders
// @access  Private
const getBillReminders = async (req, res) => {
  try {
    const reminders = await BillReminder.find({ userId: req.user._id }).sort({ dueDate: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get upcoming bills (due in next 7 days)
// @route   GET /api/bill-reminders/upcoming
// @access  Private
const getUpcomingBills = async (req, res) => {
  try {
    const today = new Date().getDate();
    const reminders = await BillReminder.find({ 
      userId: req.user._id,
      isPaid: false
    });

    const upcoming = reminders.filter(bill => {
      const daysUntilDue = bill.dueDate - today;
      return daysUntilDue >= 0 && daysUntilDue <= 7;
    });

    res.json(upcoming);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new bill reminder
// @route   POST /api/bill-reminders
// @access  Private
const addBillReminder = async (req, res) => {
  try {
    const { title, amount, category, dueDate, reminderDays, isRecurring, notes } = req.body;

    const reminder = await BillReminder.create({
      userId: req.user._id,
      title,
      amount,
      category,
      dueDate,
      reminderDays: reminderDays || 3,
      isRecurring: isRecurring !== undefined ? isRecurring : true,
      notes
    });

    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark bill as paid
// @route   PUT /api/bill-reminders/:id/pay
// @access  Private
const markBillAsPaid = async (req, res) => {
  try {
    const reminder = await BillReminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Bill reminder not found' });
    }

    if (reminder.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    reminder.isPaid = true;
    reminder.lastPaidDate = new Date();
    await reminder.save();

    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset bill status (for recurring bills)
// @route   PUT /api/bill-reminders/:id/reset
// @access  Private
const resetBillStatus = async (req, res) => {
  try {
    const reminder = await BillReminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Bill reminder not found' });
    }

    if (reminder.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    reminder.isPaid = false;
    await reminder.save();

    res.json(reminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update bill reminder
// @route   PUT /api/bill-reminders/:id
// @access  Private
const updateBillReminder = async (req, res) => {
  try {
    const reminder = await BillReminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Bill reminder not found' });
    }

    if (reminder.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedReminder = await BillReminder.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedReminder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete bill reminder
// @route   DELETE /api/bill-reminders/:id
// @access  Private
const deleteBillReminder = async (req, res) => {
  try {
    const reminder = await BillReminder.findById(req.params.id);

    if (!reminder) {
      return res.status(404).json({ message: 'Bill reminder not found' });
    }

    if (reminder.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await reminder.deleteOne();
    res.json({ message: 'Bill reminder removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBillReminders,
  getUpcomingBills,
  addBillReminder,
  markBillAsPaid,
  resetBillStatus,
  updateBillReminder,
  deleteBillReminder
};
