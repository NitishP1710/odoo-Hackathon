const axios = require('axios');

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const analyzeContent = async (content) => {
  try {
    if (!GEMINI_API_KEY) {
      console.warn('Gemini API key not configured, skipping content analysis');
      return 'green';
    }

    const prompt = `
    Analyze the following content and categorize it as:
    - "green" (safe, appropriate content)
    - "yellow" (slightly vulgar or inappropriate but not severe)
    - "red" (vulgar, offensive, or inappropriate content)

    Content: ${content}

    Respond with only one word: green, yellow, or red.
    `;

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = response.data.candidates[0].content.parts[0].text.trim().toLowerCase();
    
    if (['green', 'yellow', 'red'].includes(result)) {
      return result;
    }
    
    return 'green'; // Default to safe if analysis fails
  } catch (error) {
    console.error('Gemini API error:', error.message);
    return 'green'; // Default to safe on error
  }
};

const moderateContent = async (req, res, next) => {
  try {
    const content = req.body.content || req.body.title || '';
    
    if (content) {
      const moderationStatus = await analyzeContent(content);
      req.moderationStatus = moderationStatus;
    }
    
    next();
  } catch (error) {
    console.error('Moderation error:', error);
    req.moderationStatus = 'green'; // Default to safe
    next();
  }
};

module.exports = { moderateContent, analyzeContent }; 