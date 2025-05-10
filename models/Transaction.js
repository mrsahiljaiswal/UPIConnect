const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  sender: { 
    type: String, 
    required: true,
  },
  receiver: { 
    type: String, 
    required: true,
  },
  amount: { 
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ["credited", "debited"],
    required: true,
  },
  status: {
    type: String,
    enum: ["completed", "rejected"],
    required: true,
    },
  note: { 
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
