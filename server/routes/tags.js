const express = require('express');
const router = express.Router();
const Tag = require('../models/Tag');
const { auth, requireRole } = require('../middleware/auth');

// Get all active tags
const getTags = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }

    const tags = await Tag.find(query).sort({ usageCount: -1, name: 1 });
    res.json(tags);
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get popular tags
const getPopularTags = async (req, res) => {
  try {
    const tags = await Tag.find({ isActive: true })
      .sort({ usageCount: -1 })
      .limit(20);
    res.json(tags);
  } catch (error) {
    console.error('Get popular tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new tag (admin only)
const createTag = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    const existingTag = await Tag.findOne({ name: name.toLowerCase() });
    if (existingTag) {
      return res.status(400).json({ message: 'Tag already exists' });
    }

    const tag = new Tag({
      name: name.toLowerCase(),
      description,
      category
    });

    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update tag (admin only)
const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, isActive } = req.body;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    const updates = {};
    if (name) updates.name = name.toLowerCase();
    if (description) updates.description = description;
    if (category) updates.category = category;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedTag = await Tag.findByIdAndUpdate(id, updates, { new: true });
    res.json(updatedTag);
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Public routes
router.get('/', getTags);
router.get('/popular', getPopularTags);

// Admin routes
router.post('/', auth, requireRole(['admin']), createTag);
router.put('/:id', auth, requireRole(['admin']), updateTag);

module.exports = router; 