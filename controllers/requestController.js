const PaymentRequest = require("../models/Request");
const Transaction = require("../models/Transaction");


const {
    getUsernameFromId,
    getIdFromUsername,
    populateUserMaps,
    updateUserMap
  } = require("../utils/userMaps");
   // Import the mapping util
const User = require('../models/User')
const Notification = require('../models/Notification')
// 1. Create a new payment request
exports.createRequest = async (req, res) => {
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
        return res.status(400).json({ status: "fail", message: "Cannot request payment from yourself." });
      }
  
      // Create a transaction for the payment request
      const transaction = new Transaction({
        userId: payeeId,
        type: "payment_request",
        amount,
        note,
        sender: req.user.username,
        receiver: payee,
        date: new Date(),
      });
  
      await transaction.save();
  
      // Create a notification for the recipient
      const notification = new Notification({
        userId: payeeId,
        message: `You have a new payment request of ₹${amount} from ${req.user.username}.`,
        type: "request_sent",
        transactionId: transaction._id,
        date: new Date(),
        read: false,
      });
  
      await notification.save();
  
      res.status(201).json({
        status: "success",
        message: "Payment request created successfully.",
        data: {
          transactionId: transaction._id,
          amount,
          note,
          payee,
        },
      });
    } catch (err) {
      console.error(err); // Log the error for debugging
      res.status(500).json({ status: "error", message: "Failed to create payment request.", error: err.message });
    }
  };
  
  

// 2. Accept a payment request and convert it to a transaction
exports.acceptRequest = async (req, res) => {
    try {
      const request = await PaymentRequest.findById(req.params.id);
  
      if (!request || request.recipient.toString() !== req.user.id.toString()) {
        return res.status(404).json({
          status: "fail",
          message: "Payment request not found or unauthorized.",
          timestamp: new Date().toISOString(),
        });
      }
  
      // 🛑 Prevent self-request acceptance
      if (request.requester.toString() === req.user.id.toString()) {
        return res.status(400).json({
          status: "fail",
          message: "You cannot accept your own payment request.",
          timestamp: new Date().toISOString(),
        });
      }
  
      if (request.status !== "pending") {
        return res.status(400).json({
          status: "fail",
          message: `Request already ${request.status}.`,
          timestamp: new Date().toISOString(),
        });
      }
  
      // 🔍 Get requester's username
      const requesterUser = await User.findById(request.requester);
      if (!requesterUser) {
        return res.status(404).json({
          status: "fail",
          message: "Requester user not found.",
          timestamp: new Date().toISOString(),
        });
      }
  
      // Debit transaction: current user (recipient) pays
      const debitTxn = new Transaction({
        userId: req.user.id,
        type: "debit",
        amount: request.amount,
        note: request.note,
        sender: req.user.username,
        receiver: requesterUser.username,  // ✅ Save username, not ObjectId
        date: new Date(),
      });
  
      // Credit transaction: requester receives money
      const creditTxn = new Transaction({
        userId: request.requester,
        type: "credit",
        amount: request.amount,
        note: `Received from ${req.user.username}`,
        sender: req.user.username,
        receiver: requesterUser.username,  // ✅ Save username, not ObjectId
        date: new Date(),
      });
  
      await debitTxn.save();
      await creditTxn.save();
  
      request.status = "accepted";
      await request.save();
      
      await new Notification({
        userId: request.requester,  // Notify the person who made the request
        message: `${req.user.username} accepted your payment request of ₹${request.amount}`,
        type: "request_accepted",
      }).save();
    
    

      res.status(200).json({
        status: "success",
        message: "Payment request accepted and transaction created.",
        data: {
          request,
          transactionId: debitTxn._id,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error("[ERROR in acceptRequest]", err);
      res.status(500).json({
        status: "error",
        message: "Failed to accept request.",
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  };
  
  

// 3. Reject a payment request
exports.rejectRequest = async (req, res) => {
  try {
    const request = await PaymentRequest.findById(req.params.id);

    
    if (!request || request.recipient.toString() !== req.user.id.toString())
        {console.log(request)
      return res.status(404).json({
        status: "fail",
        message: "Payment request not found or unauthorized.",
        timestamp: new Date().toISOString(),
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        status: "fail",
        message: `Request already ${request.status}.`,
        timestamp: new Date().toISOString(),
      });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({
      status: "success",
      message: "Payment request rejected.",
      data: request,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to reject request.",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
};

// 4. Get all payment requests sent/received by current user
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await PaymentRequest.find({
      $or: [{ requester: req.user.id }, { recipient: req.user.id }],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      message: "Requests fetched successfully.",
      data: requests,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch requests.",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
};
