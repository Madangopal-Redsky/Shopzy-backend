const { Category } = require("../models/Category");

const createCategory = async (req, res) => {
  const { name } = req.body;
  try {
    const cat = new Category({
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      admin: req.user.id,
    });
    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCategories = async (req, res) => {
  try {
    let categories;
      categories = await Category.find().sort({ name: 1 });

    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const updateCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Category.findOneAndUpdate(
      { _id: id, admin: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Category not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({
      _id: req.params.id,
      admin: req.user.id,
    });
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
