const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  friendId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked'],
    default: 'pending'
  },
  nickname: {
    type: String,
    default: null
  },
  isFavorite: {
    type: Boolean,
    default: false
  },
  frequencyScore: {
    type: Number,
    default: 0 // Track how often they transact
  },
  lastTransactionDate: Date,
  requestedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  blockedAt: Date
});

// Ensure unique friend requests (user can't send duplicate requests)
contactSchema.index({ userId: 1, friendId: 1 }, { unique: true });

module.exports = mongoose.model('Contact', contactSchema);
