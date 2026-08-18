const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const {
  createBill,
  getBills,
  settleBill,
  cancelBill
} = require('../controllers/billController');

const router = express.Router();

router.use(authenticate);

// Create bill
router.post('/create', createBill);

// Get all bills
router.get('/', getBills);

// Settle bill
router.post('/:billId/settle', settleBill);

// Cancel bill
router.post('/:billId/cancel', cancelBill);

module.exports = router;
