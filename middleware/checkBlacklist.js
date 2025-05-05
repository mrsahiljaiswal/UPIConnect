const TokenBlacklist = require("../models/TokenBlacklist");

const checkBlacklist = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  const isBlacklisted = await TokenBlacklist.findOne({ token });
  if (isBlacklisted) {
    return res.status(401).json({ message: "Token is blacklisted. Please log in again." });
  }

  next();
};

module.exports = checkBlacklist;
