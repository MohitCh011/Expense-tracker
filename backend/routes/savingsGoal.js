const express = require('express');
const router = express.Router();
const { 
  getSavingsGoals, 
  addSavingsGoal, 
  updateSavingsGoal, 
  deleteSavingsGoal,
  contributeToGoal 
} = require('../controllers/savingsGoalController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getSavingsGoals).post(protect, addSavingsGoal);
router.route('/:id').put(protect, updateSavingsGoal).delete(protect, deleteSavingsGoal);
router.post('/:id/contribute', protect, contributeToGoal);

module.exports = router;
