const express = require('express');
const router = express.Router()
const { getUserNotifications } = require('../controllers/notificationsController');
const verifyToken = require('../middleware/verifyToken');  // Add your token verification middleware
const notifications = require('../data/notifications');

// router.get('/notifications', verifyToken, getUserNotifications);  // Use verifyToken middleware here
router.get('/notifications', (req, res) => {
    console.log("Notifications before sending to front end: ", notifications);
    res.json({success: true, notifications})
})

module.exports = router;
