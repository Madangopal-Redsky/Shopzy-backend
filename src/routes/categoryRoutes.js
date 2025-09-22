const express = require('express');
const { adminAuth, auth } = require('../middleware/authMiddleware');
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');

const router = express.Router();

router.get('/', auth, getCategories);
router.post('/', adminAuth, createCategory);
router.put('/:id', adminAuth, updateCategory);
router.delete('/:id', adminAuth, deleteCategory);

module.exports = router;
