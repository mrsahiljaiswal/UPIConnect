const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  totalAmount: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['food', 'entertainment', 'shopping', 'utility', 'travel', 'other'],
    default: 'other'
  },
  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      share: Number,
      hasPaid: {
        type: Boolean,
        default: false
      },
      paidAmount: {
        type: Number,
        default: 0
      },
      paidAt: Date
    }
  ],
  splitMethod: {
    type: String,
    enum: ['equal', 'custom', 'itemwise'],
    default: 'equal'
  },
  items: [
    {
      name: String,
      amount: Number,
      assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
    }
  ],
  status: {
    type: String,
    enum: ['active', 'settled', 'cancelled'],
    default: 'active'
  },
  settledAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bill', billSchema);
