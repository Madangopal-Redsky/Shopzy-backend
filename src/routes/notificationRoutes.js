const express = require('express');
const { auth } = require('../middleware/authMiddleware');
const { saveFcmToken } = require('../controllers/notificationController');
const { Auth } = require('../models/Auth');
const sendNotification = require('../../utils/sendNotification');

const router = express.Router();
router.post('/save-token', auth, saveFcmToken);

module.exports = router;
