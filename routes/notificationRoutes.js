const express = require("express");
const {
  getNotifications,
  markAllAsSeen,
  markAsRead,
  dismissNotification,
} = require("../controllers/notificationController");
const authenticate = require("../middleware/authMiddleware");
const router = express.Router();

// Fetch all notifications
router.get("/", authenticate, getNotifications);

// Mark all notifications as seen
router.patch("/mark-all-as-seen", authenticate, markAllAsSeen);

// Mark a specific notification as read
router.patch("/mark-as-read/:id", authenticate, markAsRead);

// Dismiss a specific notification
router.delete("/dismiss/:id", authenticate, dismissNotification);

module.exports = router;
