const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/authMiddleware");
const { getMyShop, updateShop, getAllShops } = require("../controllers/shopController");

router.get("/", getAllShops);

router.get("/", auth, getMyShop);
router.put("/myShop", auth, updateShop);

module.exports = router;
