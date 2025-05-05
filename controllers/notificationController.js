const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id,
      seen: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      data: notifications,
      timestamp: new Date().toISOString(),
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
