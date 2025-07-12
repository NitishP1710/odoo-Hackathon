const express = require('express');
const router = express.Router();
const answerController = require('../controllers/answerController');
const { auth, optionalAuth } = require('../middleware/auth');
const { moderateContent } = require('../middleware/moderation');

// Public routes (with optional auth for user-specific features)
router.get('/question/:questionId', optionalAuth, answerController.getAnswers);

// Protected routes
router.post('/question/:questionId', auth, moderateContent, answerController.createAnswer);
router.put('/:id', auth, moderateContent, answerController.updateAnswer);
router.delete('/:id', auth, answerController.deleteAnswer);
router.post('/:id/vote', auth, answerController.voteAnswer);
router.post('/:id/accept', auth, answerController.acceptAnswer);
router.post('/:id/unaccept', auth, answerController.unacceptAnswer);

module.exports = router; 