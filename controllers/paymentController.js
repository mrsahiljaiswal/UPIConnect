const Transaction = require("../models/Transaction");
const User = require("../models/User");
const calculateBalance = require("../utils/calculateBalance");
const { getUsernameFromId, getIdFromUsername } = require("../utils/userMaps");
const Notification = require('../models/Notification')
exports.initiatePayment = async (req, res) => {
  try {
    const { amount, note, payee } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ status: "fail", message: "Invalid amount." });
    }

    const payeeId = getIdFromUsername(payee);
    if (!payeeId) {
      return res.status(404).json({ status: "fail", message: `User '${payee}' not found.` });
    }

    if (payeeId === req.user.id) {
      return res.status(400).json({ status: "fail", message: "Cannot pay yourself." });
    }

    const { finalBalance } = await calculateBalance(req.user.id);
    if (finalBalance < amount) {
      return res.status(400).json({
        status: "fail",
        message: "Insufficient balance.",
        currentBalance: finalBalance,
      });
    }

    const senderUsername = req.user.username;
    const receiverUsername = payee;

    // Save both transactions
    const debitTxn = new Transaction({
      userId: req.user.id,
      type: "debit",
      amount,
      note,
      sender: senderUsername,
      receiver: receiverUsername,
      date: new Date(),
    });

    const creditTxn = new Transaction({
      userId: payeeId,
      type: "credit",
      amount,
      note: `Received from ${senderUsername}`,
      sender: senderUsername,
      receiver: receiverUsername,
      date: new Date(),
    });

    await debitTxn.save();
    await creditTxn.save();

    const { finalBalance: newBalance } = await calculateBalance(req.user.id);

    res.status(201).json({
      status: "success",
      message: `Payment of ₹${amount} to '${payee}' completed.`,
      data: {
        transactionId: debitTxn._id,
        amount,
        note,
        payee,
        balanceAfterTransaction: newBalance,
        transactionDate: debitTxn.date,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Payment failed.", error: err.message });
  }
};

exports.getLastTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(10);

    const formatted = transactions.map(txn => ({
      transactionId: txn._id,
      amount: txn.amount,
      type: txn.type,
      note: txn.note,
      status: "Success",
      sender: txn.sender,
      receiver: txn.receiver,
      transactionDate: txn.date,
    }));

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

exports.checkBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username email");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
        timestamp: new Date().toISOString(),
      });
    }

    const { finalBalance } = await calculateBalance(req.user.id);

    res.status(200).json({
      status: "success",
      message: "Current user details fetched.",
      data: {
        userId: req.user.id,
        username: user.username,
        email: user.email,
        balance: finalBalance,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch user details.",
      error: err.message,
    });
  }
};

// exports.requestRefund = async (req, res) => {
//   try {
//     const { amount, note } = req.body;

//     if (!amount || amount <= 0) {
//       return res.status(400).json({ status: "fail", message: "Invalid refund amount." });
//     }

//     const user = await User.findById(req.user.id);

//     const refundTxn = new Transaction({
//       userId: req.user.id,
//       type: "refund",
//       amount,
//       note,
//       sender: "System",
//       receiver: user.username,
//       date: new Date(),
//     });

//     await refundTxn.save();

//     const { finalBalance } = await calculateBalance(req.user.id);

//     res.status(201).json({
//       status: "success",
//       message: `Refund of ₹${amount} requested.`,
//       data: {
//         transactionId: refundTxn._id,
//         refundAmount: amount,
//         status: "Refund Pending",
//         balanceAfterRefund: finalBalance,
//         note,
//         transactionDate: refundTxn.date,
//       },
//     });
//   } catch (err) {
//     res.status(500).json({ status: "error", message: "Refund request failed.", error: err.message });
//   }
// };

exports.convertAmount = async (req, res) => {
  try {
    const { amount, rate } = req.query;

    if (!amount || !rate || isNaN(amount) || isNaN(rate)) {
      return res.status(400).json({
        status: "fail",
        message: "Amount and rate must be valid numbers.",
      });
    }

    const converted = parseFloat(amount) * parseFloat(rate);

    res.status(200).json({
      status: "success",
      message: `₹${amount} converted at rate ${rate}.`,
      data: {
        originalAmount: amount,
        conversionRate: rate,
        convertedAmount: converted.toFixed(2),
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Conversion failed.",
      error: err.message,
    });
  }
};
