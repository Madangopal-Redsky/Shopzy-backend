const express = require("express");
const router = express.Router();
const { auth, superAdminAuth } = require("../middleware/authMiddleware");
const { getPendingAdmins, approveAdmin, rejectAdmin } = require("../controllers/superAdminControllers");


router.get("/pending", auth, superAdminAuth, getPendingAdmins);
router.post("/approve", auth, superAdminAuth, approveAdmin);
router.post("/reject", auth, superAdminAuth, rejectAdmin);

module.exports = router;
