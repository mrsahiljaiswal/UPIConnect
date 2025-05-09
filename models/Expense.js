const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  currentMonth: {
    total: { type: Number, default: 0 },
    categories: [
      {
        category: { type: String, required: true },
        amount: { type: Number, required: true },
        paymentMode: { type: String, enum: ["online", "offline"], required: true },
      },
    ],
  },
  lastMonth: {
    total: { type: Number, default: 0 },
    categories: [
      {
        category: { type: String, required: true },
        amount: { type: Number, required: true },
        paymentMode: { type: String, enum: ["online", "offline"], required: true },
      },
    ],
  },
});

module.exports = mongoose.model("Expense", expenseSchema);