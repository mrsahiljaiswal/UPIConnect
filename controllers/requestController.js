const {
    getUsernameFromId,
    getIdFromUsername,
    populateUserMaps,
    updateUserMap
  } = require("../utils/userMaps");
   // Import the mapping util
const User = require("../models/User");
const PaymentRequest = require("../models/Request");
const Notification = require("../models/Notification");
const Transaction = require("../models/Transaction");

// 1. Create a new payment request
exports.createRequest = async (req, res) => {
  try {
    const { amount, note, recipient } = req.body;

    if (!amount || amount <= 0 || !recipient) {
      return res.status(400).json({
        status: "fail",
        message: "Amount and recipient are required and must be valid.",
        timestamp: new Date().toISOString(),
      });
    }

    // Map username to MongoDB ObjectId
    const recipientId = await getIdFromUsername(recipient);

    if (!recipientId) {
      return res.status(404).json({
        status: "fail",
        message: "Recipient user not found.",
        timestamp: new Date().toISOString(),
      });
    }

    // Prevent self-request
    if (recipientId.toString() === req.user.id.toString()) {
      return res.status(400).json({
        status: "fail",
        message: "You cannot send a payment request to yourself.",
        timestamp: new Date().toISOString(),
      });
    }

    // Create a new payment request
    const newRequest = new PaymentRequest({
      requester: req.user.id,
      recipient: recipientId,
      amount,
      note,
      status: "pending",
    });

    await newRequest.save();

    // Add a notification for the recipient
    const recipientUser = await User.findById(recipientId);
    recipientUser.notifications.push({
      message: `You have received a payment request of ₹${amount} from ${req.user.username}${note ? ` with note: "${note}"` : ""}.`,
      type: "request_sent",
      transactionId: newRequest._id, // Include the transaction ID
      seen: false,
    });
    await recipientUser.save();

    // Respond with success
    res.status(201).json({
      status: "success",
      message: `Payment request of ₹${amount} sent to '${recipient}'.`,
      data: {
        transactionId: newRequest._id, // Include the transaction ID in the response
        amount,
        note,
        recipient,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: "error",
      message: "Failed to create payment request.",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
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

    if (request.status !== "pending") {
      return res.status(400).json({
        status: "fail",
        message: `Request already ${request.status}.`,
        timestamp: new Date().toISOString(),
      });
    }

    const requesterUser = await User.findById(request.requester);
    const recipientUser = await User.findById(req.user.id);

    // Check if the recipient has enough balance
    if (recipientUser.balance < request.amount) {
      return res.status(400).json({
        status: "fail",
        message: "Insufficient balance to accept the payment request.",
        timestamp: new Date().toISOString(),
      });
    }

    // Update balances
    recipientUser.balance -= request.amount; // Debit from recipient
    requesterUser.balance += request.amount; // Credit to requester

    await recipientUser.save();
    await requesterUser.save();

    // Update request status
    request.status = "accepted";
    await request.save();

    // Add notification for requester
    requesterUser.notifications.push({
      message: `${recipientUser.username} accepted your payment request of ₹${request.amount}.`,
      type: "request_accepted",
      transactionId: request._id,
      seen: false,
    });
    await requesterUser.save();

    // Add debit transaction for recipient
    const debitTransaction = new Transaction({
      userId: recipientUser._id,
      sender: recipientUser.username,
      receiver: requesterUser.username,
      amount: request.amount,
      type: "debited",
      status: "completed",
      note: request.note,
      date: new Date(),
    });
    await debitTransaction.save();

    // Add credit transaction for requester
    const creditTransaction = new Transaction({
      userId: requesterUser._id,
      sender: recipientUser.username,
      receiver: requesterUser.username,
      amount: request.amount,
      type: "credited",
      status: "completed",
      note: request.note,
      date: new Date(),
    });
    await creditTransaction.save();

    res.status(200).json({
      status: "success",
      message: "Payment request accepted.",
      data: {
        request,
        transactions: {
          debitTransaction,
          creditTransaction,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
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

    if (!request || request.recipient.toString() !== req.user.id.toString()) {
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

    const requesterUser = await User.findById(request.requester);
    const recipientUser = await User.findById(req.user.id);

    // Update request status
    request.status = "rejected";
    await request.save();

    // Add notification for requester
    requesterUser.notifications.push({
      message: `${recipientUser.username} rejected your payment request of ₹${request.amount}.`,
      type: "request_rejected",
      transactionId: request._id,
      seen: false,
    });
    await requesterUser.save();

    // Add transaction for rejection
    const transaction = new Transaction({
      userId: req.user.id, // Add userId for the recipient
      sender: requesterUser.username,
      receiver: recipientUser.username,
      amount: request.amount,
      type: "rejected", // Ensure this matches the enum in the model
      status: "rejected",
      note: request.note,
      date: new Date(),
    });
    await transaction.save();

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
    // Fetch only pending payment requests where the user is the recipient
    const pendingRequests = await PaymentRequest.find({
      recipient: req.user.id,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .select("_id requester recipient amount note status createdAt");

    // Count pending requests dynamically
    const pendingRequestsCount = pendingRequests.length;

    res.status(200).json({
      status: "success",
      message: "Pending payment requests fetched successfully.",
      data: {
        pendingRequests: pendingRequests.map((request) => ({
          transactionId: request._id, // Include transaction ID
          requester: request.requester,
          recipient: request.recipient,
          amount: request.amount,
          note: request.note,
          status: request.status,
          createdAt: request.createdAt,
        })),
        pendingRequestsCount, // Count of pending requests
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch pending payment requests.",
      error: err.message,
    });
  }
};
