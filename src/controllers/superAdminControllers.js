const { Auth } = require("../models/Auth");
const { Shop } = require("../models/Shop");

exports.getPendingAdmins = async (req, res) => {
  try {
    const pendingAdmins = await Auth.find({
      role: "admin",
      status: "pending",
    }).select("-password");
  
    const superAdmins = await Auth.find({
      role: "super-admin",
      fcmToken: { $ne: "" },
    });
    res.json(pendingAdmins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveAdmin = async (req, res) => {
  try {
    const { adminId } = req.body;
    const admin = await Auth.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.status = "approved";
    admin.approvedBy = req.user.id;
    await admin.save();
    await Shop.create({
      shopName: admin.username,
      shopImage: admin.profileImage || null,
      admin: admin._id,
      products: [],
      description: "",
      address: admin.address,
    });

    if (admin.fcmToken) {
      sendNotification(
        admin.fcmToken,
        "Admin Request Approved",
        "Your admin request has been approved by Super Admin",
        { type: "ADMIN_APPROVED" }
      );
    }

    res.json({ message: "Admin approved and shop created", admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.rejectAdmin = async (req, res) => {
  try {
    const { adminId } = req.body;
    const admin = await Auth.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    admin.status = "rejected";
    await admin.save();

        if (admin.fcmToken) {
      sendNotification(
        admin.fcmToken,
        "Admin Request Rejected",
        "Your admin request has been rejected by Super Admin",
        { type: "ADMIN_REJECTED" }
      );
    }

    res.json({ message: "Admin request rejected" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
