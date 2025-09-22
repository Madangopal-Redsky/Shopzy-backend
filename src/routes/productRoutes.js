const express = require('express');
const { adminAuth, auth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
  createProduct,
  updateProduct,
  getProducts,
  getProduct,
  deleteProduct,
  getProductsByCategory,
} = require('../controllers/productController');

const router = express.Router();

router.get('/', auth, getProducts);
router.get('/:id', auth, getProduct);
router.post('/', adminAuth, upload.fields([{ name: 'images' }]), createProduct);
router.put('/:id', adminAuth, upload.fields([{ name: 'images' }]), updateProduct);
router.get('/category/:slug', auth, getProductsByCategory);
router.delete('/:id', adminAuth, deleteProduct);

module.exports = router;
