const Answer = require('../models/Answer');
const Question = require('../models/Question');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create answer
const createAnswer = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { content } = req.body;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question || question.isDeleted) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      content,
      question: questionId,
      author: req.user._id,
      moderationStatus: req.moderationStatus || 'green'
    });

    await answer.save();

    // Update question answer count
    question.answerCount += 1;
    await question.save();

    // Create notification for question author
    if (question.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: question.author,
        sender: req.user._id,
        type: 'answer',
        title: 'New answer to your question',
        message: `${req.user.username} answered your question: "${question.title}"`,
        relatedQuestion: questionId,
        relatedAnswer: answer._id
      });
      await notification.save();
    }

    // Populate author for response
    await answer.populate('author', 'username avatar reputation');

    res.status(201).json(answer);
  } catch (error) {
    console.error('Create answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get answers for a question
const getAnswers = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const answers = await Answer.find({ 
      question: questionId, 
      isDeleted: false 
    })
      .populate('author', 'username avatar reputation')
      .sort({ isAccepted: -1, voteCount: -1, createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Answer.countDocuments({ 
      question: questionId, 
      isDeleted: false 
    });

    res.json({
      answers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get answers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update answer
const updateAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const answer = await Answer.findById(id);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check ownership
    if (answer.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    answer.content = content;
    answer.moderationStatus = req.moderationStatus || answer.moderationStatus;
    await answer.save();

    await answer.populate('author', 'username avatar reputation');

    res.json(answer);
  } catch (error) {
    console.error('Update answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete answer
const deleteAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check ownership or admin
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    answer.isDeleted = true;
    await answer.save();

    // Update question answer count
    const question = await Question.findById(answer.question);
    if (question) {
      question.answerCount = Math.max(0, question.answerCount - 1);
      await question.save();
    }

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    console.error('Delete answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vote on answer
const voteAnswer = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    const answer = await Answer.findById(id);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    await answer.addVote(req.user._id, voteType);

    res.json({ 
      message: 'Vote recorded successfully',
      voteCount: answer.voteCount
    });
  } catch (error) {
    console.error('Vote answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Accept answer
const acceptAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Get the question to check ownership
    const question = await Question.findById(answer.question);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is question owner
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only question owner can accept answers' });
    }

    // Unaccept previously accepted answer if any
    if (question.acceptedAnswer && question.acceptedAnswer.toString() !== id) {
      const previousAccepted = await Answer.findById(question.acceptedAnswer);
      if (previousAccepted) {
        previousAccepted.isAccepted = false;
        await previousAccepted.save();
      }
    }

    // Accept this answer
    answer.isAccepted = true;
    await answer.save();

    // Update question
    question.acceptedAnswer = answer._id;
    question.isAnswered = true;
    await question.save();

    // Create notification for answer author
    if (answer.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: answer.author,
        sender: req.user._id,
        type: 'accept',
        title: 'Your answer was accepted',
        message: `${req.user.username} accepted your answer to: "${question.title}"`,
        relatedQuestion: question._id,
        relatedAnswer: answer._id
      });
      await notification.save();
    }

    res.json({ 
      message: 'Answer accepted successfully',
      answer: await answer.populate('author', 'username avatar reputation')
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unaccept answer
const unacceptAnswer = async (req, res) => {
  try {
    const { id } = req.params;

    const answer = await Answer.findById(id);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Get the question to check ownership
    const question = await Question.findById(answer.question);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is question owner
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only question owner can unaccept answers' });
    }

    // Unaccept answer
    answer.isAccepted = false;
    await answer.save();

    // Update question
    question.acceptedAnswer = null;
    question.isAnswered = false;
    await question.save();

    res.json({ message: 'Answer unaccepted successfully' });
  } catch (error) {
    console.error('Unaccept answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createAnswer,
  getAnswers,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
  acceptAnswer,
  unacceptAnswer
}; 