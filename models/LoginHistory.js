const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: String,
  deviceName: String,
  ipAddress: String,
  location: {
    city: String,
    country: String
  },
  loginTime: {
    type: Date,
    default: Date.now
  },
  logoutTime: Date,
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  failureReason: String,
  osType: String,
  browserName: String
});

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
