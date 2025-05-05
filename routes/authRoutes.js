const express = require("express");
const { signup, login, logout } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");
const checkBlacklist = require("../middleware/checkBlacklist");
const calculateBalance = require("../utils/calculateBalance"); // make sure path is correct
const User = require("../models/User");

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);

// Logout (secured)
router.post("/logout", authenticate, checkBlacklist, logout);

// Protected route example
router.get("/protected", authenticate, checkBlacklist, (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Access granted to protected route.",
    user: req.user,
    timestamp: new Date().toISOString()
  });
});

// Get current logged-in user
router.get("/current-user", authenticate, checkBlacklist, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("username email");
      if (!user) {
        return res.status(404).json({
          status: "fail",
          message: "User not found.",
          timestamp: new Date().toISOString(),
        });
      }
  
      const { finalBalance } = await calculateBalance(req.user.id);
  
      res.status(200).json({
        status: "success",
        message: "Current user details fetched successfully.",
        data: {
          userId: req.user.id,
          username: user.username,
          email: user.email,
          balance: finalBalance,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        message: "Failed to fetch current user details.",
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

module.exports = router;
