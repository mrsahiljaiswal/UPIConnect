const mongoose = require('mongoose');

const twoFAConfigSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  method: {
    type: String,
    enum: ['sms', 'email', 'authenticator_app', 'none'],
    default: 'none'
  },
  isEnabled: {
    type: Boolean,
    default: false
  },
  sms: {
    phoneNumber: String,
    verified: { type: Boolean, default: false }
  },
  email: {
    emailAddress: String,
    verified: { type: Boolean, default: false }
  },
  authenticatorApp: {
    secret: String, // Base32 encoded secret for TOTP
    verified: { type: Boolean, default: false },
    backupCodes: [String] // Backup codes for recovery
  },
  backupCodes: {
    codes: [String],
    generatedAt: Date,
    usedCodes: [String]
  },
  enabledAt: Date,
  lastUsedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TwoFAConfig', twoFAConfigSchema);
