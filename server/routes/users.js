const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth');
const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

// Get user profile
router.get('/:userId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:userId', auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { username, email, bio } = req.body;
    const user = await User.findById(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if username is already taken
    if (username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Check if email is already taken
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already taken' });
      }
    }

    user.username = username;
    user.email = email;
    user.bio = bio;

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user account
router.delete('/:userId', auth, async (req, res) => {
  try {
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's questions and answers
    await Question.deleteMany({ author: req.params.userId });
    await Answer.deleteMany({ author: req.params.userId });

    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's questions
router.get('/:userId/questions', auth, async (req, res) => {
  try {
    const questions = await Question.find({ author: req.params.userId })
      .populate('tags', 'name')
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's answers
router.get('/:userId/answers', auth, async (req, res) => {
  try {
    const answers = await Answer.find({ author: req.params.userId })
      .populate('question', 'title')
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 