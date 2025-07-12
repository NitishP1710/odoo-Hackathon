import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../utils/api';
import './Home.css';

const Home = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    tags: '',
    filter: '',
    sort: 'newest'
  });
  const [pagination, setPagination] = useState({});
  const [tags, setTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadQuestions();
    loadTags();
  }, [filters]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`${API_URL}/api/questions?${params}`);
      setQuestions(response.data.questions);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tags/popular`);
      setTags(response.data);
    } catch (error) {
      console.error('Failed to load tags:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getVoteColor = (voteCount) => {
    if (voteCount > 0) return 'positive';
    if (voteCount < 0) return 'negative';
    return 'neutral';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Welcome to StackIt</h1>
        <p>Find answers to your programming questions or help others by answering theirs.</p>
      </div>

      <div className="filters-section">
        <button
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <i className="fas fa-filter"></i>
          Filters
        </button>

        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Sort by:</label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="most-upvoted">Most Upvoted</option>
                <option value="most-answered">Most Answered</option>
                <option value="most-viewed">Most Viewed</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Filter:</label>
              <select
                value={filters.filter}
                onChange={(e) => handleFilterChange('filter', e.target.value)}
              >
                <option value="">All Questions</option>
                <option value="unanswered">Unanswered</option>
                <option value="most-upvoted">Most Upvoted</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Tags:</label>
              <select
                value={filters.tags}
                onChange={(e) => handleFilterChange('tags', e.target.value)}
              >
                <option value="">All Tags</option>
                {tags.map(tag => (
                  <option key={tag._id} value={tag._id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Search:</label>
              <input
                type="text"
                placeholder="Search questions..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="questions-container">
        {questions.length === 0 ? (
          <div className="no-questions">
            <h3>No questions found</h3>
            <p>Try adjusting your filters or be the first to ask a question!</p>
          </div>
        ) : (
          <div className="questions-list">
            {questions.map(question => (
              <div key={question._id} className="question-card">
                <div className="question-stats">
                  <div className={`vote-count ${getVoteColor(question.voteCount)}`}>
                    {question.voteCount}
                    <span>votes</span>
                  </div>
                  <div className="answer-count">
                    {question.answerCount}
                    <span>answers</span>
                  </div>
                  <div className="view-count">
                    {question.viewCount}
                    <span>views</span>
                  </div>
                </div>

                <div className="question-content">
                  <h3 className="question-title">
                    <Link to={`/question/${question._id}`}>
                      {question.title}
                    </Link>
                  </h3>
                  
                  <div className="question-tags">
                    {question.tags.map(tag => (
                      <span key={tag._id} className="tag">
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="question-meta">
                    <span className="author">
                      by {question.author.username}
                    </span>
                    <span className="date">
                      {formatDate(question.createdAt)}
                    </span>
                    {question.isAnswered && (
                      <span className="answered-badge">
                        ✓ Answered
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.current - 1)}
            disabled={pagination.current === 1}
            className="page-button"
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {pagination.current} of {pagination.pages}
          </span>
          
          <button
            onClick={() => handlePageChange(pagination.current + 1)}
            disabled={pagination.current === pagination.pages}
            className="page-button"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Home; 