const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    minlength: 20
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  isAccepted: {
    type: Boolean,
    default: false
  },
  commentCount: {
    type: Number,
    default: 0
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
answerSchema.index({ content: 'text' });

// Calculate vote count
answerSchema.methods.calculateVoteCount = function() {
  return this.votes.upvotes.length - this.votes.downvotes.length;
};

// Check if user has voted
answerSchema.methods.hasUserVoted = function(userId) {
  return this.votes.upvotes.includes(userId) || this.votes.downvotes.includes(userId);
};

// Add vote
answerSchema.methods.addVote = function(userId, voteType) {
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

// Accept answer
answerSchema.methods.accept = function() {
  this.isAccepted = true;
  return this.save();
};

// Unaccept answer
answerSchema.methods.unaccept = function() {
  this.isAccepted = false;
  return this.save();
};

module.exports = mongoose.model('Answer', answerSchema); 