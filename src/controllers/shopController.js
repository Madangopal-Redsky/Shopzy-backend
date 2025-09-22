const { Shop } = require("../models/Shop");
const { Auth } = require("../models/Auth"); 

exports.getMyShop = async (req, res) => {
  try {
    let shop = await Shop.findOne({ admin: req.user.id })
  .populate({
    path: "products",
    populate: {
      path: "category",
      model: "Category",
      select: "name slug",
    },
  });

    if (!shop) {
      const admin = await Auth.findById(req.user.id).select("username profileImage role");
      if (!admin || admin.role !== "admin") {
        return res.status(403).json({ message: "Only admins can have shops" });
      }

      shop = await Shop.create({
        admin: req.user.id,
        shopName: admin.username,
        profileImage: admin.profileImage,
        products: [],
        description: admin.address || "",
      });
    }

    res.json(shop);
  } catch (err) {
    console.error("Get My Shop Error:", err.message);
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate({
  path: "products",
  populate: {
    path: "category",
    model: "Category",
    select: "name slug",
  },
});

    res.json(shops);
  } catch (err) {
    console.error("Get All Shops Error:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateShop = async (req, res) => {
  try {
    const { shopName, description, profileImage } = req.body;

    let shop = await Shop.findOne({ admin: req.user.id });
    if (!shop) {
      shop = await Shop.create({
        admin: req.user.id,
        shopName: shopName || "My Shop",
        description,
        profileImage,
        products: [],
      });
    } else {
      shop.shopName = shopName || shop.shopName;
      shop.description = description || shop.description;
      shop.profileImage = profileImage || shop.profileImage;
      await shop.save();
    }

    res.json(shop);
  } catch (err) {
    console.error("Update Shop Error:", err);
    res.status(500).json({ message: err.message });
  }
};
