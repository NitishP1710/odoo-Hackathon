const User = require('../models/User');
const Question = require('../models/Question');
const Answer = require('../models/Answer');
const Comment = require('../models/Comment');
const Report = require('../models/Report');
const Tag = require('../models/Tag');
const { analyzeContent } = require('../middleware/moderation');

// Get moderation dashboard data
const getModerationDashboard = async (req, res) => {
  try {
    // Get flagged content
    const flaggedQuestions = await Question.find({
      moderationStatus: { $in: ['yellow', 'red'] },
      isDeleted: false
    }).populate('author', 'username');

    const flaggedAnswers = await Answer.find({
      moderationStatus: { $in: ['yellow', 'red'] },
      isDeleted: false
    }).populate('author', 'username').populate('question', 'title');

    const flaggedComments = await Comment.find({
      moderationStatus: { $in: ['yellow', 'red'] },
      isDeleted: false
    }).populate('author', 'username').populate('answer', 'content');

    // Get pending reports
    const pendingReports = await Report.find({ status: 'pending' })
      .populate('reporter', 'username')
      .populate('moderator', 'username');

    // Get banned users
    const bannedUsers = await User.find({ isBanned: true })
      .select('username email joinDate');

    res.json({
      flaggedContent: {
        questions: flaggedQuestions,
        answers: flaggedAnswers,
        comments: flaggedComments
      },
      pendingReports,
      bannedUsers,
      stats: {
        totalFlagged: flaggedQuestions.length + flaggedAnswers.length + flaggedComments.length,
        pendingReports: pendingReports.length,
        bannedUsers: bannedUsers.length
      }
    });
  } catch (error) {
    console.error('Get moderation dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Moderate content
const moderateContent = async (req, res) => {
  try {
    const { contentType, contentId, action, reason } = req.body;

    let content;
    let contentModel;

    switch (contentType) {
      case 'question':
        contentModel = Question;
        break;
      case 'answer':
        contentModel = Answer;
        break;
      case 'comment':
        contentModel = Comment;
        break;
      default:
        return res.status(400).json({ message: 'Invalid content type' });
    }

    content = await contentModel.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Apply moderation action
    switch (action) {
      case 'approve':
        content.moderationStatus = 'green';
        content.isModerated = true;
        break;
      case 'delete':
        content.isDeleted = true;
        break;
      case 'ban_user':
        content.isDeleted = true;
        const user = await User.findById(content.author);
        if (user) {
          user.isBanned = true;
          await user.save();
        }
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    await content.save();

    // Create report record
    const report = new Report({
      reporter: req.user._id,
      contentType,
      contentId,
      reason: reason || 'admin_moderation',
      status: 'resolved',
      moderator: req.user._id,
      moderationAction: action,
      moderationNotes: `Moderated by ${req.user.username}`
    });
    await report.save();

    res.json({ 
      message: 'Content moderated successfully',
      action,
      contentId
    });
  } catch (error) {
    console.error('Moderate content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Ban user
const banUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = true;
    await user.save();

    // Create report for the ban
    const report = new Report({
      reporter: req.user._id,
      contentType: 'user',
      contentId: userId,
      reason: reason || 'admin_ban',
      status: 'resolved',
      moderator: req.user._id,
      moderationAction: 'ban_user',
      moderationNotes: `User banned by ${req.user.username}: ${reason}`
    });
    await report.save();

    res.json({ 
      message: 'User banned successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Unban user
const unbanUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = false;
    await user.save();

    res.json({ 
      message: 'User unbanned successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['guest', 'user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ 
      message: 'User role updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get system statistics
const getSystemStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalQuestions = await Question.countDocuments({ isDeleted: false });
    const totalAnswers = await Answer.countDocuments({ isDeleted: false });
    const totalComments = await Comment.countDocuments({ isDeleted: false });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const flaggedContent = await Question.countDocuments({ 
      moderationStatus: { $in: ['yellow', 'red'] },
      isDeleted: false
    }) + await Answer.countDocuments({ 
      moderationStatus: { $in: ['yellow', 'red'] },
      isDeleted: false
    }) + await Comment.countDocuments({ 
      moderationStatus: { $in: ['yellow', 'red'] },
      isDeleted: false
    });

    res.json({
      totalUsers,
      totalQuestions,
      totalAnswers,
      totalComments,
      bannedUsers,
      flaggedContent,
      activeUsers: totalUsers - bannedUsers
    });
  } catch (error) {
    console.error('Get system stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getModerationDashboard,
  moderateContent,
  banUser,
  unbanUser,
  getAllUsers,
  updateUserRole,
  getSystemStats
}; 