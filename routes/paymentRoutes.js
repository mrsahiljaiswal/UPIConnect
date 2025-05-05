const express = require("express");
const authenticate = require("../middleware/authMiddleware");

const {
  initiatePayment,
  checkBalance,
  // requestRefund,
  getLastTransactions,
  convertAmount
} = require("../controllers/paymentController");

const router = express.Router();

router.use(authenticate);

router.post("/pay", initiatePayment);
router.get("/balance", checkBalance);
// router.post("/refund", requestRefund);
router.get("/transactions", getLastTransactions);
router.get("/convert", convertAmount);

module.exports = router;