const express = require("express");
const router = express.Router();
const { markAsRead, dismissNotification, getNotifications } = require("../controllers/notificationController");
const authenticate = require("../middleware/authMiddleware");

router.get("/", authenticate, getNotifications); // Fetch notifications
router.patch("/mark-as-read/:id", authenticate, markAsRead);
router.delete("/dismiss/:id", authenticate, dismissNotification);

module.exports = router;
