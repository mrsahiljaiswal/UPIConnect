const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String, // Format: "2025-05"
    required: true
  },
  year: Number,
  totalTransactions: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  totalReceived: { type: Number, default: 0 },
  averageTransactionAmount: { type: Number, default: 0 },
  largestTransaction: { type: Number, default: 0 },
  smallestTransaction: { type: Number, default: 0 },
  categoryBreakdown: {
    food: { type: Number, default: 0 },
    entertainment: { type: Number, default: 0 },
    shopping: { type: Number, default: 0 },
    utility: { type: Number, default: 0 },
    transfer: { type: Number, default: 0 },
    other: { type: Number, default: 0 }
  },
  topRecipients: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      totalAmount: Number,
      transactionCount: Number
    }
  ],
  topSenders: [
    {
      userId: mongoose.Schema.Types.ObjectId,
      username: String,
      totalAmount: Number,
      transactionCount: Number
    }
  ],
  dailyBreakdown: [
    {
      date: String, // "2025-05-01"
      spent: Number,
      received: Number,
      transactionCount: Number
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analytics', analyticsSchema);
