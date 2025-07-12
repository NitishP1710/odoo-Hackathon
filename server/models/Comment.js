const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 500
  },
  answer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Moderation fields
  moderationStatus: {
    type: String,
    enum: ['green', 'yellow', 'red'],
    default: 'green'
  },
  isModerated: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create text index for search
commentSchema.index({ content: 'text' });

module.exports = mongoose.model('Comment', commentSchema); 