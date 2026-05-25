const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTransactions,
  addTransaction,
  deleteTransaction,
  getMonthlyStats,
  getCategoryStats,
} = require('../controllers/transactionController');
const { importFromPDF } = require('../controllers/importController');

router.use(protect); // All routes below are protected

router.route('/').get(getTransactions).post(addTransaction);
router.route('/:id').delete(deleteTransaction);
router.get('/stats/monthly', getMonthlyStats);
router.get('/stats/categories', getCategoryStats);
router.post('/import/pdf', importFromPDF);

module.exports = router;

