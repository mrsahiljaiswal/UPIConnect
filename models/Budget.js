const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String, // Format: "2025-05"
    required: true
  },
  categories: {
    food: {
      limit: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    entertainment: {
      limit: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    shopping: {
      limit: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    utility: {
      limit: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    transfer: {
      limit: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    },
    other: {
      limit: { type: Number, default: 0 },
      spent: { type: Number, default: 0 },
      percentage: { type: Number, default: 0 }
    }
  },
  alerts: [
    {
      category: String,
      percentage: Number, // Alert at 80% of limit
      enabled: { type: Boolean, default: true }
    }
  ],
  totalBudget: Number,
  totalSpent: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Budget', budgetSchema);
