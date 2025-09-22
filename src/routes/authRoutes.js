const express = require("express");
const router = express.Router();
const { register, login, getProfile, updateProfile } = require("../controllers/authController");
const { auth } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

router.post("/register",upload.single("profileImage"), register);
router.post("/login", login);

router.get("/profile", auth, getProfile);
router.put("/profile", auth, upload.single("profileImage"), updateProfile);


module.exports = router;
