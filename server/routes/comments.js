const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { auth, optionalAuth } = require('../middleware/auth');
const { moderateContent } = require('../middleware/moderation');

// Public routes (with optional auth for user-specific features)
router.get('/answer/:answerId', optionalAuth, commentController.getComments);

// Protected routes
router.post('/answer/:answerId', auth, moderateContent, commentController.createComment);
router.put('/:id', auth, moderateContent, commentController.updateComment);
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router; 