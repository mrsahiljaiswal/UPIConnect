const jwt = require("jsonwebtoken");
const TokenBlacklist = require("../models/TokenBlacklist");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    // 1. Check blacklist
    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({ message: "Access denied. Token has been logged out." });
    }

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user info (including username)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      username: decoded.username, // ✅ Ensure JWT includes this at login
    };

    next(); // ✅ Go to the next middleware or route
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = authenticate;
