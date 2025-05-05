const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const TokenBlacklist = require("../models/TokenBlacklist");
const { generateToken } = require("../utils/jwtUtils");
const {
    getUsernameFromId,
    getIdFromUsername,
    populateUserMaps,
    updateUserMap
  } = require("../utils/userMaps");
  

const getTimestamp = () => new Date().toISOString();

exports.signup = async (req, res) => {
  try {
    const { email, phone, username, password } = req.body;

    if (!email || !phone || !username || !password) {
      return res.status(400).json({
        status: "error",
        message: "All fields are required",
        errorCode: "400",
        timestamp: getTimestamp()
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        status: "error",
        message: "User already exists",
        errorCode: "409",
        timestamp: getTimestamp()
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, phone, username, password: hashedPassword });
    await newUser.save();

    // ✅ Update the in-memory user maps
    updateUserMap(newUser._id.toString(), newUser.username);

    res.status(201).json({
      status: "success",
      message: "User account created successfully.",
      data: {
        userId: newUser._id,
        username: newUser.username,
        email: newUser.email
      },
      timestamp: getTimestamp()
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      errorCode: "500",
      timestamp: getTimestamp()
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username and password are required",
        errorCode: "400",
        timestamp: getTimestamp()
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found. Please register first.",
        errorCode: "404",
        timestamp: getTimestamp()
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials.",
        errorCode: "401",
        timestamp: getTimestamp()
      });
    }

    const token = generateToken({ id: user._id, username: user.username });

    res.status(200).json({
      status: "success",
      message: "User logged in successfully.",
      data: {
        userId: user._id,
        authToken: token,
        expiresIn: 3600
      },
      timestamp: getTimestamp()
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      errorCode: "500",
      timestamp: getTimestamp()
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "No token provided",
        errorCode: "400",
        timestamp: getTimestamp()
      });
    }

    const decoded = jwt.decode(token);
    if (!decoded) {
      return res.status(400).json({
        status: "error",
        message: "Logout failed. Invalid or expired token.",
        errorCode: "400",
        timestamp: getTimestamp()
      });
    }

    const expiresAt = new Date(decoded.exp * 1000);
    await TokenBlacklist.create({ token, expiresAt });

    res.status(200).json({
      status: "success",
      message: "User logged out successfully.",
      timestamp: getTimestamp()
    });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
      errorCode: "500",
      timestamp: getTimestamp()
    });
  }
};
