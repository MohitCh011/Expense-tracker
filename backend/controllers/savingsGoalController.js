const SavingsGoal = require('../models/SavingsGoal');

// @desc    Get all savings goals
// @route   GET /api/savings-goals
// @access  Private
const getSavingsGoals = async (req, res) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ deadline: 1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new savings goal
// @route   POST /api/savings-goals
// @access  Private
const addSavingsGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline, category, icon } = req.body;

    const goal = await SavingsGoal.create({
      userId: req.user._id,
      title,
      targetAmount,
      deadline,
      category,
      icon: icon || '🎯'
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update savings goal progress
// @route   PUT /api/savings-goals/:id
// @access  Private
const updateSavingsGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const updatedGoal = await SavingsGoal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    // Check if goal is completed
    if (updatedGoal.currentAmount >= updatedGoal.targetAmount) {
      updatedGoal.isCompleted = true;
      await updatedGoal.save();
    }

    res.json(updatedGoal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings-goals/:id
// @access  Private
const deleteSavingsGoal = async (req, res) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await goal.deleteOne();
    res.json({ message: 'Goal removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add contribution to goal
// @route   POST /api/savings-goals/:id/contribute
// @access  Private
const contributeToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    const goal = await SavingsGoal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (goal.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    goal.currentAmount += parseFloat(amount);
    
    if (goal.currentAmount >= goal.targetAmount) {
      goal.isCompleted = true;
    }

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSavingsGoals,
  addSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  contributeToGoal
};
