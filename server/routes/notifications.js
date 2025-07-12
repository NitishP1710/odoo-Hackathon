const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth, requireRole } = require('../middleware/auth');

// Protected routes
router.get('/', auth, notificationController.getNotifications);
router.get('/unread-count', auth, notificationController.getUnreadCount);
router.put('/:id/read', auth, notificationController.markAsRead);
router.put('/mark-all-read', auth, notificationController.markAllAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);

// Admin routes
router.post('/broadcast', auth, requireRole(['admin']), notificationController.broadcastNotification);

module.exports = router; 