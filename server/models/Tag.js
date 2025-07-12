const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['Web Development', 'Programming', 'Data Science', 'DevOps', 'Mobile Development', 'Other'],
    required: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create text index for search
tagSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Tag', tagSchema); 