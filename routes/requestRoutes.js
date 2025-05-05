const express = require("express");
const router = express.Router();
const { createRequest, acceptRequest, rejectRequest, getMyRequests } = require("../controllers/requestController");
const authenticate = require("../middleware/authMiddleware"); // assuming this exists

router.post("/", authenticate, createRequest);
router.post("/accept/:id", authenticate, acceptRequest);
router.post("/reject/:id", authenticate, rejectRequest);
router.get("/", authenticate, getMyRequests);

module.exports = router;
