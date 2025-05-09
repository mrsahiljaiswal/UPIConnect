const notificationRoutes = require("./routes/notificationRoutes");
require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const requestRoutes = require("./routes/requestRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const { populateUserMaps } = require("./utils/userMaps");
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// If you want to allow credentials (cookies, headers), use:
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Middleware
app.use(express.json());

// Connect to DB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api", paymentRoutes);
app.use("/api/expenses", expenseRoutes);

// Start Server
app.listen(PORT, async () => {
  try {
    await populateUserMaps();
    console.log("✅ Server running on http://localhost:" + PORT);
    console.log("✅ User maps initialized.");
  } catch (err) {
    console.error("❌ Failed to initialize user maps:", err.message);
  }
});
