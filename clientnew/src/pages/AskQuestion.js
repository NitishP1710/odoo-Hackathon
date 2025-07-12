import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { TINYMCE_API_KEY, TINYMCE_CONFIG } from '../utils/tinymceConfig';
import API_URL from '../utils/api';
import './AskQuestion.css';

const AskQuestion = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tags`);
      setAvailableTags(response.data);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const handleTagToggle = (tagId) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (selectedTags.length === 0) {
      setError('Please select at least one tag');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/questions`, {
        title: title.trim(),
        content,
        tags: selectedTags
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate(`/question/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating question');
    } finally {
      setLoading(false);
    }
  };

  const handleEditorChange = (content) => {
    setContent(content);
  };

  return (
    <div className="ask-question">
      <div className="ask-question-container">
        <h1>Ask a Question</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question? Be specific."
              maxLength={300}
            />
            <small>{title.length}/300 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <Editor
              apiKey={TINYMCE_API_KEY}
              value={content}
              onEditorChange={handleEditorChange}
              init={TINYMCE_CONFIG}
              placeholder="Provide details about your question..."
            />
          </div>

          <div className="form-group">
            <label>Tags *</label>
            <div className="tags-container">
              {availableTags.map(tag => (
                <button
                  key={tag._id}
                  type="button"
                  className={`tag-button ${selectedTags.includes(tag._id) ? 'selected' : ''}`}
                  onClick={() => handleTagToggle(tag._id)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
            <small>Select relevant tags to help others find your question</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AskQuestion; 