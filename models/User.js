const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, required: true }, // e.g., "request_accepted", "money_received"
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction" },
  seen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  finalBalance: { type: Number, default: 0 },
  notifications: [notificationSchema], // Array of notifications
});

module.exports = mongoose.model("User", userSchema);