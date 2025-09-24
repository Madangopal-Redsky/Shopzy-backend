const { Product } = require("../models/Product");
const { Category } = require("../models/Category");
const { Shop } = require("../models/Shop");
const sendNotification = require("../../utils/sendNotification");
const { Auth } = require("../models/Auth");

const createProduct = async (req, res) => {
  try {
    const body = req.body;

    let category;
    if (body.categoryName) {
      category = await Category.findOne({
        name: body.categoryName,
      });

      if (!category) {
        category = await Category.create({
          name: body.categoryName,
          slug: body.categoryName.toLowerCase().replace(/\s+/g, "-"),
          admin: req.user.id,
        });
      }
      body.category = category._id;
    }
    
    if (req.files?.images) {
      const files = req.files.images;
      body.images = files.map((f) => `/${f.path}`);
      body.thumbnail = body.images[0];
    }

    body.admin = req.user.id;

    const prod = new Product(body);

     if (prod.discountPercentage && prod.discountPercentage >= 50) {
       const users = await Auth.find({ role: "user", fcmToken: { $ne: "" } });
       users.forEach((u) => {
         sendNotification(
           u.fcmToken,
           "Huge Discount!",
           `Product "${prod.title}" has a discount of ${prod.discount}% in ${prod.admin.username}`,
           { type: "HIGH_DISCOUNT", productId: prod._id.toString() }
         );
       });
     }    
    await prod.save();

    let shop = await Shop.findOne({ admin: req.user.id });
    
    if (!shop) {
      shop = await Shop.create({
        admin: req.user.id,
        shopName: req.user.username,
        profileImage: req.user.profileImage,
        products: [prod._id],
      });
    } else {
      shop.products.push(prod._id);
      await shop.save();
    }

    res.json(prod);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {

    let body = req.body;

    if (body.tags) {
      try {
        body.tags = JSON.parse(body.tags);
      } catch {
        body.tags = [];
      }
    }
    if (body.categoryName) {
      let category = await Category.findOne({ name: body.categoryName });
      if (!category) {
        category = await Category.create({
          name: body.categoryName,
          slug: body.categoryName.toLowerCase().replace(/\s+/g, "-"),
          admin: req.user.id,
        });
      }
      body.category = category._id;
    }
    if (req.files && req.files.length > 0) {
      body.images = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ error: err.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { q } = req.query;
    let filter = {};

    if (req.user.role === "admin") {
      filter.admin = req.user.id;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { tags: { $in: [new RegExp(q, "i")] } },
        { brand: { $regex: q, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .populate({
        path: "category",
        populate: {
          path: "admin",
          model: "Auth",
          select: "username profileImage",
        },
      })
      .populate({
        path: "admin",
        model: "Auth",
        select: "username profileImage",
      })
      .sort({ createdAt: -1 });

    res.json({ total: products.length, data: products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate({
      path: "category",
      populate: {
        path: "admin",
        model: "Auth",
        select: "username profileImage",
      },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const filter = { category: category._id };

    if (
      req.user.role === "admin" &&
      category.admin.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const products = await Product.find(filter)
      .populate({
        path: "category",
        populate: {
          path: "admin",
          model: "Auth",
          select: "username profileImage",
        },
      })
      .sort({ createdAt: -1 });

    res.json({ total: products.length, data: products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.admin.toString() !== req.user.id)
      return res.status(403).json({ message: "Access denied" });

    await product.deleteOne();

    await Shop.findOneAndUpdate(
      { admin: req.user.id },
      { $pull: { products: product._id } }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getProducts,
  getProduct,
  getProductsByCategory,
  deleteProduct,
};
