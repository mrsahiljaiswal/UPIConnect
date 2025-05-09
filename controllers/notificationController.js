const User = require("../models/User");

exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("notifications");

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Notifications fetched successfully.",
      data: user.notifications,
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
    const user = await User.findById(req.user.id);
    const notification = user.notifications.id(req.params.id);

    if (!notification) {
      return res.status(404).json({ status: "fail", message: "Notification not found." });
    }

    notification.seen = true;
    await user.save();

    res.status(200).json({ status: "success", message: "Notification marked as read." });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Failed to mark notification as read.", error: err.message });
  }
};

exports.dismissNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ status: "fail", message: "User not found." });
    }

    // Find the index of the notification to remove
    const notificationIndex = user.notifications.findIndex(
      (notification) => notification._id.toString() === req.params.id
    );

    if (notificationIndex === -1) {
      return res.status(404).json({ status: "fail", message: "Notification not found." });
    }

    // Remove the notification using splice
    user.notifications.splice(notificationIndex, 1);
    await user.save();

    res.status(200).json({ status: "success", message: "Notification dismissed." });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to dismiss notification.",
      error: err.message,
    });
  }
};
