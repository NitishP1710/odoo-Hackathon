import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { TINYMCE_CONFIG } from '../utils/tinymceConfig';
import API_URL from '../utils/api';
import './QuestionDetail.css';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answerContent, setAnswerContent] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuestionDetails();
  }, [id]);

  const fetchQuestionDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/questions/${id}`);
      setQuestion(response.data.question);
      setAnswers(response.data.answers);
    } catch (err) {
      setError('Question not found');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type, itemId, itemType) => {
    if (!user) {
      addNotification('Please login to vote', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const endpoint = itemType === 'question'
        ? `${API_URL}/api/questions/${itemId}/vote`
        : `${API_URL}/api/answers/${itemId}/vote`;

      const response = await axios.post(endpoint, { voteType: type }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (itemType === 'question') {
        setQuestion(prev => ({
          ...prev,
          voteCount: response.data.voteCount,
        }));
      } else {
        setAnswers(answers.map(ans =>
          ans._id === itemId
            ? { ...ans, voteCount: response.data.voteCount }
            : ans
        ));
      }

      addNotification('Vote recorded', 'success');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Error voting', 'error');
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!user || question?.author?._id !== user._id) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/answers/${answerId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await fetchQuestionDetails();
      addNotification('Answer accepted', 'success');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Error accepting answer', 'error');
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!answerContent.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/api/answers/question/${id}`, {
        content: answerContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAnswers([...answers, response.data]);
      setAnswerContent('');
      setShowAnswerForm(false);
      addNotification('Answer posted successfully', 'success');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Error posting answer', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitComment = async (e, itemId, itemType) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = itemType === 'question'
        ? `${API_URL}/api/questions/${itemId}/comments`
        : `${API_URL}/api/answers/${itemId}/comments`;

      const response = await axios.post(endpoint, {
        content: commentContent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (itemType === 'question') {
        setQuestion(prev => ({
          ...prev,
          comments: [...(prev.comments || []), response.data]
        }));
      } else {
        setAnswers(prev =>
          prev.map(ans =>
            ans._id === itemId
              ? { ...ans, comments: [...(ans.comments || []), response.data] }
              : ans
          )
        );
      }

      setCommentContent('');
      setShowCommentForm(null);
      addNotification('Comment posted successfully', 'success');
    } catch (err) {
      addNotification(err.response?.data?.message || 'Error posting comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditorChange = (content) => {
    setAnswerContent(content);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error || !question) return <div className="error">{error || 'Question not found'}</div>;

  return (
    <div className="question-detail">
      <div className="question-detail-container">
        <div className="question-section">
          <div className="question-header">
            <h1>{question.title}</h1>
            <div className="question-meta">
              <span>Asked {formatDate(question.createdAt)}</span>
              <span>by {question.author?.username}</span>
              <span>{question.views} views</span>
            </div>
          </div>

          <div className="question-content">
            <div className="vote-section">
              <button onClick={() => handleVote('upvote', question._id, 'question')}>▲</button>
              <span className="vote-count">
                {(question.voteCount?.upvotes || 0) - (question.voteCount?.downvotes || 0)}
              </span>
              <button onClick={() => handleVote('downvote', question._id, 'question')}>▼</button>
            </div>

            <div className="content-main">
              <div className="content-text" dangerouslySetInnerHTML={{ __html: question.content }} />
              <div className="tags">
                {(question.tags || []).map(tag => (
                  <span key={tag._id} className="tag">{tag.name}</span>
                ))}
              </div>

              <div className="question-actions">
                <button className="btn-secondary" onClick={() => setShowCommentForm('question')}>Add Comment</button>
                {user && user._id === question.author?._id && (
                  <button className="btn-secondary" onClick={() => navigate(`/edit-question/${question._id}`)}>Edit</button>
                )}
              </div>

              {showCommentForm === 'question' && (
                <div className="comment-form">
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="Add a comment..."
                    rows="3"
                  />
                  <div className="comment-actions">
                    <button className="btn-secondary" onClick={() => setShowCommentForm(null)}>Cancel</button>
                    <button className="btn-primary" onClick={(e) => handleSubmitComment(e, question._id, 'question')} disabled={submitting}>
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              )}

              <div className="comments">
                {(question.comments || []).map(comment => (
                  <div key={comment._id} className="comment">
                    <div className="comment-content">{comment.content}</div>
                    <div className="comment-meta">
                      <span>{comment.author?.username}</span>
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Answers */}
        <div className="answers-section">
          <h2>{answers.length} Answer{answers.length !== 1 ? 's' : ''}</h2>
          {answers.map(answer => (
            <div key={answer._id} className={`answer ${answer.isAccepted ? 'accepted' : ''}`}>
              <div className="vote-section">
                <button onClick={() => handleVote('upvote', answer._id, 'answer')}>▲</button>
                <span className="vote-count">
                  {(answer.voteCount?.upvotes || 0) - (answer.voteCount?.downvotes || 0)}
                </span>
                <button onClick={() => handleVote('downvote', answer._id, 'answer')}>▼</button>
                {answer.isAccepted && <div className="accepted-badge">✓</div>}
              </div>

              <div className="content-main">
                <div className="content-text" dangerouslySetInnerHTML={{ __html: answer.content }} />
                <div className="answer-actions">
                  {user && question.author?._id === user._id && !question.acceptedAnswer && (
                    <button className="btn-primary" onClick={() => handleAcceptAnswer(answer._id)}>Accept Answer</button>
                  )}
                  <button className="btn-secondary" onClick={() => setShowCommentForm(answer._id)}>Add Comment</button>
                </div>

                {showCommentForm === answer._id && (
                  <div className="comment-form">
                    <textarea
                      value={commentContent}
                      onChange={(e) => setCommentContent(e.target.value)}
                      placeholder="Add a comment..."
                      rows="3"
                    />
                    <div className="comment-actions">
                      <button className="btn-secondary" onClick={() => setShowCommentForm(null)}>Cancel</button>
                      <button className="btn-primary" onClick={(e) => handleSubmitComment(e, answer._id, 'answer')} disabled={submitting}>
                        {submitting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="comments">
                  {(answer.comments || []).map(comment => (
                    <div key={comment._id} className="comment">
                      <div className="comment-content">{comment.content}</div>
                      <div className="comment-meta">
                        <span>{comment.author?.username}</span>
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Answer Form */}
        {user && (
          <div className="answer-form-section">
            <h3>Your Answer</h3>
            {!showAnswerForm ? (
              <button className="btn-primary" onClick={() => setShowAnswerForm(true)}>Write an Answer</button>
            ) : (
              <form onSubmit={handleSubmitAnswer}>
                <Editor
                  apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
                  value={answerContent}
                  onEditorChange={handleEditorChange}
                  init={TINYMCE_CONFIG}
                />
                <div className="form-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowAnswerForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Posting...' : 'Post Answer'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
