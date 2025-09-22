const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const { saveFcmToken } = require('../controllers/notificationController');
const { Auth } = require('../models/Auth');
const sendNotification = require('../../utils/sendNotification');

const router = express.Router();
router.post('/save-token', auth, saveFcmToken);

router.post("/test", auth, async (req, res) => {
  try {
    const user = await Auth.findById(req.user.id);
    if (!user || !user.fcmToken) {
      return res.status(404).json({ message: "User FCM token not found" });
    }

    await sendNotification(
      user.fcmToken,
      "🔥 Test Notification",
      "Your backend is working!",
      { type: "TEST" }
    );

    res.json({ message: "Notification sent" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
