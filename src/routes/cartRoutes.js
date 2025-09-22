const express = require("express");
const { auth } = require("../middleware/authMiddleware");
const { addToCart, getCart, removeFromCart } = require("../controllers/cartController");

const router = express.Router();

router.post("/", auth, addToCart);
router.get("/", auth, getCart);
router.delete("/:productId", auth, removeFromCart);

module.exports = router;
