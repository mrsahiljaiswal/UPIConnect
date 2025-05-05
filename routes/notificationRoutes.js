const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const checkBlacklist = require("../middleware/checkBlacklist");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", checkBlacklist, authMiddleware, notificationController.getNotifications);
router.put("/seen", checkBlacklist, authMiddleware, notificationController.markAllAsSeen);

module.exports = router;
