const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { Auth } = require("../models/Auth");

dotenv.config();

const auth = async(req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "redskyecommerceapp");
    
    req.user = { id: decoded.id, role: decoded.role };
    
    const user = await Auth.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.status === "rejected") {
      return res.status(403).json({ message: "Your account has been rejected. Contact support." });
    }

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied, admin only" });
    }
    next();
  });
};

const superAdminAuth = (req, res, next) => {
    if (req.user.role !== "super-admin") {
      return res.status(403).json({ message: "Access denied, super admin only" });
    }
    next();

};

module.exports = { auth, adminAuth, superAdminAuth };
