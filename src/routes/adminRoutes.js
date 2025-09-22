const express = require('express');
const { auth, adminAuth } = require('../middleware/authMiddleware');
const { getAdminRevenue, getAdminStats, getTopCustomers, getTopProducts } = require('../controllers/adminController');

const router = express.Router();

router.get('/revenue', adminAuth, getAdminRevenue);
router.get("/stats", adminAuth, getAdminStats);
router.get("/top-customers", adminAuth, getTopCustomers)
router.get('/top-products', adminAuth, getTopProducts);


module.exports = router;
