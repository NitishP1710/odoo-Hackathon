const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    minlength: 20
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
    required: true
  }],
  votes: {
    upvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    downvotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  voteCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  answerCount: {
    type: Number,
    default: 0
  },
  isAnswered: {
    type: Boolean,
    default: false
  },
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
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
  },
  // Search and filtering
  searchScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create text index for full-text search
questionSchema.index({
  title: 'text',
  content: 'text'
});

// Calculate vote count
questionSchema.methods.calculateVoteCount = function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
};

// Check if user has voted
questionSchema.methods.hasUserVoted = function(userId) {
  return this.votes.upvotes.includes(userId) || this.votes.downvotes.includes(userId);
};

// Add vote
questionSchema.methods.addVote = function(userId, voteType) {
  // Remove existing vote if any
  this.votes.upvotes = this.votes.upvotes.filter(id => id.toString() !== userId.toString());
  this.votes.downvotes = this.votes.downvotes.filter(id => id.toString() !== userId.toString());
  
  // Add new vote
  if (voteType === 'upvote') {
    this.votes.upvotes.push(userId);
  } else if (voteType === 'downvote') {
    this.votes.downvotes.push(userId);
  }
  
  this.voteCount = this.calculateVoteCount();
  return this.save();
};

module.exports = mongoose.model('Question', questionSchema); 