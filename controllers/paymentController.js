const Transaction = require("../models/Transaction");
const User = require("../models/User");
const PaymentRequest = require("../models/Request"); // Import PaymentRequest model
const calculateBalance = require("../utils/calculateBalance");
const { getUsernameFromId, getIdFromUsername } = require("../utils/userMaps");
const Notification = require('../models/Notification')

exports.initiatePayment = async (req, res) => {
  try {
    const { amount, note, payee } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ status: "fail", message: "Invalid amount." });
    }

    const payeeId = await getIdFromUsername(payee);

    if (!payeeId) {
      return res.status(404).json({ status: "fail", message: `User '${payee}' not found.` });
    }

    if (payeeId === req.user.id) {
      return res.status(400).json({ status: "fail", message: "Cannot pay yourself." });
    }

    const sender = await User.findById(req.user.id);
    const receiver = await User.findById(payeeId);

    if (!sender || !receiver) {
      return res.status(404).json({ status: "fail", message: "Sender or receiver not found." });
    }

    if (sender.finalBalance < amount) {
      return res.status(400).json({
        status: "fail",
        message: "Insufficient balance.",
      });
    }

    // Create debit and credit transactions
    const debitTxn = new Transaction({
      userId: sender._id,
      type: "debited",
      amount,
      note,
      sender: sender.username,
      receiver: receiver.username,
      status: "completed",
      date: new Date(),
    });

    const creditTxn = new Transaction({
      userId: receiver._id,
      type: "credited",
      amount,
      note: `${note}`, // Include the original note
      sender: sender.username,
      receiver: receiver.username,
      status: "completed",
      date: new Date(),
    });

    await debitTxn.save();
    await creditTxn.save();

    // Update balances in the database
    sender.finalBalance -= amount;
    receiver.finalBalance += amount;

    await sender.save();
    await receiver.save();

    // Create a notification for the receiver
    await Notification.create({
      userId: receiver._id,
      message: `You have received ₹${amount} from ${sender.username}.`,
      type: "payment_received",
      transactionId: creditTxn._id,
      seen: false,
    });

    res.status(201).json({
      status: "success",
      message: `Payment of ₹${amount} to '${payee}' completed.`,
      data: {
        transactionId: debitTxn._id,
        amount,
        note, // Include the original note in the response
        payee,
        balanceAfterTransaction: sender.finalBalance,
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
      note: txn.note, // Include the original note
      status: "Success",
      sender: txn.sender,
      receiver: txn.receiver,
      transactionDate: txn.date,
    }));

    res.status(200).json({
      status: "success",
      message: "Transaction history fetched successfully.",
      data: formatted,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Failed to fetch transactions.", error: err.message });
  }
};

exports.checkBalance = async (req, res) => {
  try {
    // Fetch the user details
    const user = await User.findOne({ username: req.user.username }).select("username email finalBalance");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
        timestamp: new Date().toISOString(),
      });
    }

    res.status(200).json({
      status: "success",
      message: "Balance fetched successfully.",
      data: {
        username: user.username,
        email: user.email,
        finalBalance: user.finalBalance, // Ensure this field is included in the response
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch balance.",
      error: err.message,
      timestamp: new Date().toISOString(),
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
