const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { auth, optionalAuth, requireRole } = require('../middleware/auth');
const { moderateContent } = require('../middleware/moderation');

// Public routes (with optional auth for user-specific features)
router.get('/', optionalAuth, questionController.getQuestions);
router.get('/search', optionalAuth, questionController.searchQuestions);
router.get('/:id', optionalAuth, questionController.getQuestion);

// Protected routes
router.post('/', auth, moderateContent, questionController.createQuestion);
router.put('/:id', auth, moderateContent, questionController.updateQuestion);
router.delete('/:id', auth, questionController.deleteQuestion);
router.post('/:id/vote', auth, questionController.voteQuestion);

module.exports = router; 