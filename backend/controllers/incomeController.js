const Income = require('../models/Income');

// @desc    Get all income for user
// @route   GET /api/income
// @access  Private
const getIncome = async (req, res) => {
  try {
    const income = await Income.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new income
// @route   POST /api/income
// @access  Private
const addIncome = async (req, res) => {
  try {
    const { amount, source, description, date } = req.body;

    const income = await Income.create({
      userId: req.user._id,
      amount,
      source,
      description,
      date: date || Date.now()
    });

    res.status(201).json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete income
// @route   DELETE /api/income/:id
// @access  Private
const deleteIncome = async (req, res) => {
  try {
    const income = await Income.findById(req.params.id);

    if (!income) {
      return res.status(404).json({ message: 'Income not found' });
    }

    if (income.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await income.deleteOne();
    res.json({ message: 'Income removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getIncome,
  addIncome,
  deleteIncome
};
