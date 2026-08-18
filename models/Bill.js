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
  participants: [
    {
      username: {
        type: String,
        required: true
      },
      share: {
        type: Number,
        required: true
      },
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
  status: {
    type: String,
    enum: ['active', 'settled', 'cancelled'],
    default: 'active'
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

module.exports = mongoose.model('Bill', billSchema);
