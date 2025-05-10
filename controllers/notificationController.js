const User = require("../models/User");

const Request = require("../models/Request");

const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    // Fetch notifications from the Notification collection
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // Optional: newest first

    res.status(200).json({
      status: "success",
      message: "Notifications fetched successfully.",
      data: notifications,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch notifications.",
      error: err.message,
    });
  }
};


exports.markAllAsSeen = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, seen: false }, { seen: true });

    res.status(200).json({
      status: "success",
      message: "All notifications marked as seen.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to mark notifications as seen.",
      error: err.message,
    });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({ _id: req.params.id, userId: req.user.id });

    if (!notification) {
      return res.status(404).json({ status: "fail", message: "Notification not found." });
    }

    notification.seen = true;
    await notification.save();

    res.status(200).json({ status: "success", message: "Notification marked as read." });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to mark notification as read.",
      error: err.message,
    });
  }
};

exports.dismissNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!notification) {
      return res.status(404).json({ status: "fail", message: "Notification not found." });
    }

    res.status(200).json({ status: "success", message: "Notification dismissed." });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to dismiss notification.",
      error: err.message,
    });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const Request = await Request.findById(req.params.id);

    if (!Request || Request.recipient.toString() !== req.user.id.toString()) {
      return res.status(404).json({
        status: "fail",
        message: "Payment request not found or unauthorized.",
      });
    }

    if (Request.status !== "pending") {
      return res.status(400).json({
        status: "fail",
        message: "Payment request is not pending.",
      });
    }

    // Update the payment request status
    Request.status = "accepted";
    await Request.save();

    // Create a notification for the requester
    await Notification.create({
      userId: Request.requester,
      message: `Your payment request of ₹${Request.amount} has been accepted.`,
      type: "request_accepted",
      transactionId: Request._id,
    });

    res.status(200).json({
      status: "success",
      message: "Payment request accepted.",
      data: Request,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to accept payment request.",
      error: err.message,
    });
  }
};
