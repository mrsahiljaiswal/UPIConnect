const mongoose = require('mongoose');

const scheduledPaymentSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverUsername: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  note: String,
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  nextScheduledDate: {
    type: Date,
    required: true
  },
  lastExecutedDate: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  totalExecutions: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ScheduledPayment', scheduledPaymentSchema);
