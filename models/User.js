const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  notifications: [
    {
      message: { type: String, required: true },
      type: { type: String, enum: ["request_sent", "request_accepted", "request_rejected"], required: true },
      transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: false },
      seen: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);