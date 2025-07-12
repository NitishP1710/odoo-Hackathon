const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { auth, requireRole } = require('../middleware/auth');

// All routes require admin role
router.use(auth, requireRole(['admin']));

// Moderation routes
router.get('/moderation-dashboard', adminController.getModerationDashboard);
router.post('/moderate-content', adminController.moderateContent);

// User management routes
router.get('/users', adminController.getAllUsers);
router.put('/users/:userId/role', adminController.updateUserRole);
router.post('/users/:userId/ban', adminController.banUser);
router.post('/users/:userId/unban', adminController.unbanUser);

// System statistics
router.get('/stats', adminController.getSystemStats);

module.exports = router; 