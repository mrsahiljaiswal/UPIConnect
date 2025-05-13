const express = require("express");
const {
  getProgress,
  updateProgress,
  updateBookmarks,
} = require("../controllers/finlearnController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/finlearn/progress
router.get("/progress", authenticate, getProgress);

// PATCH /api/finlearn/progress
router.patch("/progress", authenticate, updateProgress);

// PATCH /api/finlearn/bookmarks
router.patch("/bookmarks", authenticate, updateBookmarks);

module.exports = router;