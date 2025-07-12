const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Tag = require('../models/Tag');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Create question
const createQuestion = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    // Validate tags
    if (!tags || tags.length === 0) {
      return res.status(400).json({ message: 'At least one tag is required' });
    }

    // Verify tags exist
    const tagObjects = await Tag.find({ _id: { $in: tags }, isActive: true });
    if (tagObjects.length !== tags.length) {
      return res.status(400).json({ message: 'Invalid tags provided' });
    }

    const question = new Question({
      title,
      content,
      author: req.user._id,
      tags,
      moderationStatus: req.moderationStatus || 'green'
    });

    await question.save();

    // Update tag usage counts
    await Tag.updateMany(
      { _id: { $in: tags } },
      { $inc: { usageCount: 1 } }
    );

    // Populate author and tags for response
    await question.populate('author', 'username avatar');
    await question.populate('tags', 'name');

    res.status(201).json(question);
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all questions with pagination and filters
const getQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      tags,
      filter,
      sort = 'newest'
    } = req.query;

    const query = { isDeleted: false };

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Apply filters
    if (filter === 'unanswered') {
      query.answerCount = 0;
    } else if (filter === 'most-upvoted') {
      // Will be handled in sorting
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'most-upvoted':
        sortObj = { voteCount: -1 };
        break;
      case 'most-answered':
        sortObj = { answerCount: -1 };
        break;
      case 'most-viewed':
        sortObj = { viewCount: -1 };
        break;
      default:
        sortObj = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const questions = await Question.find(query)
      .populate('author', 'username avatar')
      .populate('tags', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single question
const getQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id)
      .populate('author', 'username avatar reputation joinDate')
      .populate('tags', 'name description')
      .populate('acceptedAnswer');

    if (!question || question.isDeleted) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment view count
    question.viewCount += 1;
    await question.save();

    // Get answers with pagination
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const answers = await Answer.find({ 
      question: id, 
      isDeleted: false 
    })
      .populate('author', 'username avatar reputation')
      .sort({ isAccepted: -1, voteCount: -1, createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalAnswers = await Answer.countDocuments({ 
      question: id, 
      isDeleted: false 
    });

    res.json({
      question,
      answers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(totalAnswers / limit),
        total: totalAnswers,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update question
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check ownership
    if (question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Validate tags if provided
    if (tags) {
      if (tags.length === 0) {
        return res.status(400).json({ message: 'At least one tag is required' });
      }

      const tagObjects = await Tag.find({ _id: { $in: tags }, isActive: true });
      if (tagObjects.length !== tags.length) {
        return res.status(400).json({ message: 'Invalid tags provided' });
      }
    }

    const updates = {};
    if (title) updates.title = title;
    if (content) updates.content = content;
    if (tags) updates.tags = tags;
    updates.moderationStatus = req.moderationStatus || question.moderationStatus;

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    )
      .populate('author', 'username avatar')
      .populate('tags', 'name');

    res.json(updatedQuestion);
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete question
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check ownership or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    question.isDeleted = true;
    await question.save();

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vote on question
const voteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType } = req.body; // 'upvote' or 'downvote'

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({ message: 'Invalid vote type' });
    }

    const question = await Question.findById(id);
    if (!question || question.isDeleted) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.addVote(req.user._id, voteType);

    res.json({ 
      message: 'Vote recorded successfully',
      voteCount: question.voteCount
    });
  } catch (error) {
    console.error('Vote question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search questions
const searchQuestions = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const query = {
      $text: { $search: q },
      isDeleted: false
    };

    const skip = (page - 1) * limit;

    const questions = await Question.find(query)
      .populate('author', 'username avatar')
      .populate('tags', 'name')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Search questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createQuestion,
  getQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
  voteQuestion,
  searchQuestions
}; 