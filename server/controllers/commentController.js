const Comment = require('../models/Comment');
const Answer = require('../models/Answer');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Create comment
const createComment = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { content } = req.body;

    // Check if answer exists
    const answer = await Answer.findById(answerId);
    if (!answer || answer.isDeleted) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const comment = new Comment({
      content,
      answer: answerId,
      author: req.user._id,
      moderationStatus: req.moderationStatus || 'green'
    });

    await comment.save();

    // Update answer comment count
    answer.commentCount += 1;
    await answer.save();

    // Create notification for answer author
    if (answer.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: answer.author,
        sender: req.user._id,
        type: 'comment',
        title: 'New comment on your answer',
        message: `${req.user.username} commented on your answer`,
        relatedAnswer: answerId,
        relatedComment: comment._id
      });
      await notification.save();
    }

    // Check for mentions (@username)
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);
    
    if (mentions) {
      for (const mention of mentions) {
        const username = mention.substring(1);
        const mentionedUser = await User.findOne({ username });
        
        if (mentionedUser && mentionedUser._id.toString() !== req.user._id.toString()) {
          const notification = new Notification({
            recipient: mentionedUser._id,
            sender: req.user._id,
            type: 'mention',
            title: 'You were mentioned in a comment',
            message: `${req.user.username} mentioned you in a comment`,
            relatedAnswer: answerId,
            relatedComment: comment._id
          });
          await notification.save();
        }
      }
    }

    // Populate author for response
    await comment.populate('author', 'username avatar');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get comments for an answer
const getComments = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { page = 1, limit = 5 } = req.query; // Default 5 comments per page

    const skip = (page - 1) * limit;

    const comments = await Comment.find({ 
      answer: answerId, 
      isDeleted: false 
    })
      .populate('author', 'username avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ 
      answer: answerId, 
      isDeleted: false 
    });

    res.json({
      comments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update comment
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.content = content;
    comment.moderationStatus = req.moderationStatus || comment.moderationStatus;
    await comment.save();

    await comment.populate('author', 'username avatar');

    res.json(comment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment || comment.isDeleted) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check ownership or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.isDeleted = true;
    await comment.save();

    // Update answer comment count
    const answer = await Answer.findById(comment.answer);
    if (answer) {
      answer.commentCount = Math.max(0, answer.commentCount - 1);
      await answer.save();
    }

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment
}; 