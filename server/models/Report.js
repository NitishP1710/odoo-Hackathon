const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contentType: {
    type: String,
    enum: ['question', 'answer', 'comment'],
    required: true
  },
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  reason: {
    type: String,
    required: true,
    enum: ['spam', 'inappropriate', 'offensive', 'duplicate', 'other']
  },
  description: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  moderator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderationAction: {
    type: String,
    enum: ['none', 'warn', 'delete', 'ban_user']
  },
  moderationNotes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Index for efficient querying
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ contentType: 1, contentId: 1 });

module.exports = mongoose.model('Report', reportSchema); 