const express = require('express');
const authenticate = require('../middleware/authMiddleware');
const {
  createScheduledPayment,
  getScheduledPayments,
  cancelScheduledPayment,
  executeScheduledPayments
} = require('../controllers/scheduledPaymentController');

const router = express.Router();

router.use(authenticate);

// Create scheduled payment
router.post('/create', createScheduledPayment);

// Get all scheduled payments
router.get('/', getScheduledPayments);

// Cancel scheduled payment
router.post('/:paymentId/cancel', cancelScheduledPayment);

// Execute scheduled payments (admin/cron job endpoint)
router.post('/execute/all', executeScheduledPayments);

module.exports = router;
