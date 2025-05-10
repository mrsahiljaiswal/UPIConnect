const {
  getUsernameFromId,
  getIdFromUsername,
  populateUserMaps,
  updateUserMap
} = require("../utils/userMaps");
const User = require("../models/User");
const PaymentRequest = require("../models/Request");
const Notification = require("../models/Notification");
const Transaction = require("../models/Transaction"); // Import Transaction model

// 1. Create a new payment request
exports.createRequest = async (req, res) => {
  try {
    const { amount, note, recipient } = req.body;

    if (!amount || amount <= 0 || !recipient) {
      return res.status(400).json({
        status: "fail",
        message: "Amount and recipient are required and must be valid.",
      });
    }

    const recipientId = await getIdFromUsername(recipient);

    if (!recipientId) {
      return res.status(404).json({
        status: "fail",
        message: "Recipient user not found.",
      });
    }

    if (recipientId.toString() === req.user.id.toString()) {
      return res.status(400).json({
        status: "fail",
        message: "You cannot send a payment request to yourself.",
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

    // Create a notification for the recipient
    await Notification.create({
      userId: recipientId,
      message: `You have received a payment request of ₹${amount} from ${req.user.username}${note ? ` with note: "${note}"` : ""}.`,
      type: "request_sent",
      transactionId: newRequest._id,
      seen: false,
    });

    // Respond with success, including the date and status
    res.status(201).json({
      status: "success",
      message: `Payment request of ₹${amount} sent to '${recipient}'.`,
      data: {
        transactionId: newRequest._id,
        amount,
        note,
        recipient,
        date: newRequest.createdAt, // Include the date in the response
        status: newRequest.status, // Include the status in the response
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to create payment request.",
      error: err.message,
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
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        status: "fail",
        message: `Request already ${request.status}.`,
      });
    }

    const requesterUser = await User.findById(request.requester);
    const recipientUser = await User.findById(req.user.id);

    if (recipientUser.finalBalance < request.amount) {
      return res.status(400).json({
        status: "fail",
        message: "Insufficient balance to accept the payment request.",
      });
    }

    // Deduct balance from recipient and add to requester
    recipientUser.finalBalance -= request.amount;
    requesterUser.finalBalance += request.amount;

    await recipientUser.save();
    await requesterUser.save();

    // Update request status
    request.status = "accepted";
    await request.save();

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

    // Create a notification for the requester
    await Notification.create({
      userId: requesterUser._id,
      message: `${recipientUser.username} accepted your payment request of ₹${request.amount}.`,
      type: "request_accepted",
      transactionId: request._id,
      seen: false,
    });

    res.status(200).json({
      status: "success",
      message: "Payment request accepted.",
      data: {
        request,
        transactions: {
          debitTransaction,
          creditTransaction,
        },
        recipientBalance: recipientUser.finalBalance,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to accept request.",
      error: err.message,
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
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        status: "fail",
        message: `Request already ${request.status}.`,
      });
    }

    const requesterUser = await User.findById(request.requester);
    const recipientUser = await User.findById(req.user.id);

    request.status = "rejected";
    await request.save();

    // Create a notification for the requester
    await Notification.create({
      userId: requesterUser._id,
      message: `${recipientUser.username} rejected your payment request of ₹${request.amount}.`,
      type: "request_rejected",
      transactionId: request._id,
      seen: false,
    });

    res.status(200).json({
      status: "success",
      message: "Payment request rejected.",
      data: request,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to reject request.",
      error: err.message,
    });
  }
};

// 4. Get all payment requests sent/received by current user
exports.getMyRequests = async (req, res) => {
  try {
    const pendingRequests = await PaymentRequest.find({
      recipient: req.user.id,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .populate("requester", "username"); // Include requester's username

    const pendingCount = pendingRequests.length;

    // Format the response to include paymentRequestId, date, and other details
    const formattedRequests = pendingRequests.map((request) => ({
      paymentRequestId: request._id, // Include the payment request ID
      amount: request.amount,
      note: request.note,
      requester: request.requester.username, // Include the requester's username
      createdAt: request.createdAt, // Include the date
    }));

    res.status(200).json({
      status: "success",
      message: "Pending payment requests fetched successfully.",
      data: {
        requests: formattedRequests, // Only pending requests
        pendingCount: pendingCount, // Total count of pending requests
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch pending payment requests.",
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
};
