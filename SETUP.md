# StackIt Q&A Application - Setup Guide

## Overview

StackIt is a full-featured Q&A platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) with advanced features including AI-powered content moderation, real-time notifications, and comprehensive admin tools.

## Features

### Core Features
- **User Authentication**: JWT-based authentication with role-based access control
- **Rich Text Editor**: Quill.js integration for formatted questions and answers
- **Voting System**: Upvote/downvote questions and answers
- **Answer Acceptance**: Question authors can accept best answers
- **Tagging System**: Categorize questions with tags
- **Comments**: Add comments to questions and answers
- **Search & Filtering**: Full-text search with advanced filters
- **Pagination**: Efficient content loading

### Advanced Features
- **AI Content Moderation**: Gemini API integration for automatic content screening
- **Real-time Notifications**: Socket.IO for instant updates
- **Admin Panel**: Comprehensive moderation tools
- **User Management**: Ban/unban users, role management
- **Broadcast Messages**: Send announcements to all users
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.IO** for real-time features
- **Google Gemini API** for content moderation
- **bcryptjs** for password hashing

### Frontend
- **React.js** with hooks and context
- **React Router** for navigation
- **React Quill** for rich text editing
- **Axios** for API communication
- **Socket.IO Client** for real-time features

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google Cloud account (for Gemini API)

## Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd StackIt
```

### 2. Backend Setup

Navigate to the server directory:
```bash
cd server
```

Install dependencies:
```bash
npm install
```

Create environment file:
```bash
cp env.example .env
```

Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stackit
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
```

Start the server:
```bash
npm start
```

### 3. Frontend Setup

Navigate to the client directory:
```bash
cd ../client
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm start
```

### 4. Database Setup

Ensure MongoDB is running and create the database:
```bash
# MongoDB will be created automatically when the server starts
```

Seed initial tags (optional):
```bash
cd server
node seedTags.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get all questions (with filters)
- `POST /api/questions` - Create new question
- `GET /api/questions/:id` - Get question details
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question

### Answers
- `POST /api/questions/:id/answers` - Add answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer
- `POST /api/questions/:id/accept-answer` - Accept answer

### Comments
- `POST /api/questions/:id/comments` - Add comment to question
- `POST /api/answers/:id/comments` - Add comment to answer

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/ban` - Ban/unban user
- `PUT /api/admin/users/:id/role` - Change user role
- `POST /api/admin/moderate` - Moderate content
- `POST /api/admin/broadcast` - Send broadcast message

## User Roles

### Guest
- View questions and answers
- Search and filter content
- Register/login

### User
- All guest features
- Ask questions
- Provide answers
- Vote on content
- Add comments
- Accept answers (for own questions)
- Edit own content

### Admin
- All user features
- Access admin panel
- Moderate content
- Manage users
- Send broadcast messages
- View platform statistics

## Content Moderation

The application uses Google's Gemini API for automatic content moderation:

1. **Automatic Screening**: All new content is screened before posting
2. **Manual Review**: Flagged content goes to admin moderation queue
3. **Admin Actions**: Admins can approve/reject content
4. **User Management**: Ban/unban users for violations

## Real-time Features

- **Live Notifications**: Instant updates for votes, comments, answers
- **Broadcast Messages**: Admin announcements to all users
- **Socket.IO Integration**: WebSocket connections for real-time updates

## Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Heroku, Vercel, or similar platform
4. Set up CORS for frontend communication

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to Netlify, Vercel, or similar platform
3. Configure environment variables for API endpoints

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Server-side validation for all inputs
- **CORS Configuration**: Cross-origin resource sharing setup
- **Rate Limiting**: API rate limiting (can be added)
- **Content Moderation**: AI-powered content screening

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Future Enhancements

- **Email Notifications**: Email alerts for important events
- **Advanced Search**: Elasticsearch integration
- **File Uploads**: Image and file attachments
- **Mobile App**: React Native mobile application
- **Analytics Dashboard**: Detailed usage analytics
- **API Documentation**: Swagger/OpenAPI documentation
- **Testing Suite**: Comprehensive unit and integration tests

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file

2. **Gemini API Errors**
   - Verify API key is correct
   - Check API quota and billing

3. **CORS Errors**
   - Ensure backend CORS is configured
   - Check frontend API endpoint URLs

4. **Socket.IO Connection Issues**
   - Verify Socket.IO server is running
   - Check client connection configuration

### Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Open an issue on GitHub

## License

This project is licensed under the MIT License. 