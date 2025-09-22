const jwt = require("jsonwebtoken");
const { Shop } = require("../models/Shop");
const dotenv = require("dotenv");
const { Auth } = require("../models/Auth");
const path = require("path");
const fs = require("fs");
const sendNotification = require("../../utils/sendNotification");

dotenv.config();

const register = async (req, res) => {
  
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    gender,
    role,
    address,
    phone,
  } = req.body;

  try {
    const exists = await Auth.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (req.file) {
      profileImage = `/uploads/${req.file.filename}`;
    } else if (req.body.profileImage) {
      const savedPath = saveProfileImageFromBase64(req.body.profileImage);
      profileImage = `${savedPath}`;
    }

    const user = new Auth({
      firstName: role === "admin" ? "" : firstName,
      lastName: role === "admin" ? "" : lastName,
      username,
      email,
      password,
      gender: role === "admin" ? "" : gender,
      role,
      profileImage,
      address,
      phone,
      status: role === "admin" ? "pending" : "approved",
    });

    await user.save();
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "redskyecommerceapp",
      { expiresIn: "7d" }
    );
    if(user.role ==="admin"){
      const users = await Auth.find({ role: "super-admin", fcmToken: { $ne: "" } });
          users.forEach((u) => {
            sendNotification(
              u.fcmToken,
              "Shop Request",
              `Admin name "${user.username}}" has request to add their shop`,
              { type: "HIGH_DISCOUNT" }
            );
          });
    }

   

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        gender: user.gender,
        profileImage: user.profileImage || "",
        address: user.address,
        phone: user.phone,
      },
    });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Auth.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    if (user.role === "admin" && user.status === "pending") {
      return res.status(403).json({ message: "Your account is pending approval by Super Admin." });
    }
    if (user.role === "admin" && user.status === "rejected") {
      return res.status(403).json({ message: "Your account request was rejected. Sign up again." });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "redskyecommerceapp",
      { expiresIn: "7d" }
    );


    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        gender: user.gender,
        profileImage: user.profileImage || "",
        address: user.address,
        phone: user.phone,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await Auth.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    let shop = null;
    if (user.role === "admin") {
      shop = await Shop.findOne({ admin: user._id });
    }

    res.json({
      user: user.toObject(),
      shop,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const saveProfileImageFromBase64 = (base64Data) => {
  try {
    let matches = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
    let ext = '.jpg';
    let data = base64Data;

    if (matches) {
      ext = '.' + matches[1].split('/')[1];
      data = matches[2];
    }

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const destPath = path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads', filename);

    const buffer = Buffer.from(data, 'base64');

    fs.writeFileSync(destPath, buffer);

    return `/uploads/${filename}`;
  } catch (err) {
    console.error("Failed to save profile image:", err);
    return "";
  }
};


const updateProfile = async (req, res) => {
  try {
    const user = await Auth.findById(req.user.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.username = req.body.username || user.username;
    user.gender = req.body.gender || user.gender;
    user.phone = req.body.phone || user.phone;

    user.address = {
      street: req.body["address[street]"] || req.body.street || user.address?.street,
      city: req.body["address[city]"] || req.body.city || user.address?.city,
      state: req.body["address[state]"] || req.body.state || user.address?.state,
      country: req.body["address[country]"] || req.body.country || user.address?.country,
      postalCode: req.body["address[postalCode]"] || req.body.postalCode || user.address?.postalCode,
    };

     if (req.file) {
      user.profileImage = `/uploads/${req.file.filename}`;
    } else if (req.body.profileImage) {
      const savedPath = saveProfileImageFromBase64(req.body.profileImage);
      user.profileImage = `${savedPath}`;
    }
    await user.save();

    if (user.role === "admin") {
      const shopDescription =
        req.body.description || req.body.shopDescription || "";

      await Shop.findOneAndUpdate(
        { admin: user._id },
        {
          shopName: user.username,
          shopImage: user.profileImage,
          description: shopDescription,
          address: user.address,
        },
        { new: true }
      );
    }

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("Update error", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


module.exports = { register, login, getProfile, updateProfile };
