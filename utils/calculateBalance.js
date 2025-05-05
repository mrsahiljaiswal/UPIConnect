// utils/calculateBalance.js
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const calculateBalance = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const transactions = await Transaction.find({ userId });

  const transactionNet = transactions.reduce((acc, txn) => {
    return txn.type === "credit" || txn.type === "refund"
      ? acc + txn.amount
      : acc - txn.amount;
  }, 0);

  const finalBalance = user.balance + transactionNet;

  return {
    initialBalance: user.balance,
    finalBalance,
    transactionsCount: transactions.length,
    transactions,
  };
};

module.exports = calculateBalance;
