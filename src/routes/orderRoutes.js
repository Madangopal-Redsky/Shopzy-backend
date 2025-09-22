const express = require("express");
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getMyOrders,
  updateOrderStatus,
  createPaymentIntent,
} = require("../controllers/orderController");
const { auth, adminAuth } = require("../middleware/authMiddleware");

router.post("/", auth, createOrder);
router.post("/create-payment-intent", auth, createPaymentIntent); 
router.get("/my-orders", auth, getMyOrders);

router.get("/", adminAuth, getAllOrders);
router.put("/:id/status", adminAuth, updateOrderStatus);

module.exports = router;
