const mongoose = require('mongoose');

const deviceSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  deviceName: String, // "iPhone 12", "Chrome on Windows"
  deviceType: {
    type: String,
    enum: ['mobile', 'tablet', 'desktop'],
    default: 'mobile'
  },
  osType: String, // iOS, Android, Windows, macOS
  osVersion: String,
  browserName: String,
  ipAddress: String,
  location: {
    city: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  lastActive: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  isTrusted: {
    type: Boolean,
    default: false
  },
  loginTime: Date,
  logoutTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('DeviceSession', deviceSessionSchema);
