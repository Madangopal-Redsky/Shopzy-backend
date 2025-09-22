const { Auth } = require("../models/Auth");

exports.saveFcmToken = async (req, res) => {
  try {
    
    const { fcmToken } = req.body;
    console.log("fcmToken::", fcmToken);
    
    const user = await Auth.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fcmToken = fcmToken;
    await user.save();

    res.json({ message: "FCM token saved successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
