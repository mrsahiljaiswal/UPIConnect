const express = require("express");
const router = express.Router();
const { addOrUpdateExpense, getExpenses } = require("../controllers/expenseController");
const authenticate = require("../middleware/authMiddleware");

router.post("/add", authenticate, addOrUpdateExpense);
router.get("/", authenticate, getExpenses);

module.exports = router;