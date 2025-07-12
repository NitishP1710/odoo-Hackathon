# StackIt - Q&A Platform

A complete MERN stack Q&A application with advanced features including real-time notifications, content moderation, and rich text editing.

## 🚀 Features

### Core Functionalities
- **User Authentication**: Register, login, and profile management
- **Question Management**: Ask, edit, delete, and vote on questions
- **Answer System**: Post answers, vote, and accept best answers
- **Rich Text Editor**: Full-featured editor with formatting, images, and links
- **Tagging System**: Predefined IT-related tags with categorization
- **Search & Filter**: Full-text search with advanced filtering options
- **Voting System**: Upvote/downvote questions and answers
- **Comment System**: Comment on answers with pagination

### Advanced Features
- **Real-time Notifications**: Socket.IO powered notifications for answers, comments, and mentions
- **Content Moderation**: Gemini API integration for automatic content analysis
- **Admin Panel**: Complete moderation dashboard with user management
- **Role-based Access**: Guest, User, and Admin roles with different permissions
- **Mobile Responsive**: Fully responsive design for all devices

### Admin Features
- **Moderation Dashboard**: View flagged content (yellow/red)
- **User Management**: Ban/unban users, update roles
- **Content Moderation**: Delete inappropriate content
- **Broadcast Notifications**: Send announcements to all users
- **System Statistics**: View platform analytics

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** Authentication
- **Socket.IO** for real-time features
- **Gemini API** for content moderation
- **bcryptjs** for password hashing

### Frontend
- **React.js** with JSX
- **React Router** for navigation
- **React Quill** for rich text editing
- **Axios** for API communication
- **Socket.IO Client** for real-time features

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Gemini API key (optional, for content moderation)

### Backend Setup

1. **Navigate to server directory**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp env.example .env
   ```

4. **Configure environment variables**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/stackit
   JWT_SECRET=your-super-secret-jwt-key
   GEMINI_API_KEY=your-gemini-api-key
   CLIENT_URL=http://localhost:3000
   ```

5. **Seed the database with tags**
   ```bash
   node seedTags.js
   ```

6. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## 🗄️ Database Models

### User
- Authentication fields (username, email, password)
- Role-based permissions (guest, user, admin)
- Profile information (avatar, bio, reputation)
- Account status (banned, join date, last seen)

### Question
- Rich text content with moderation status
- Tag associations and voting system
- View count, answer count, and acceptance status
- Full-text search indexing

### Answer
- Rich text content with moderation
- Voting system and acceptance status
- Comment count and relationships

### Comment
- Text content with moderation
- Answer relationships and author tracking

### Notification
- Real-time notification system
- Multiple notification types (answer, comment, mention, etc.)
- Read/unread status tracking

### Tag
- Predefined IT-related tags
- Category organization and usage tracking
- Search indexing

### Report
- Content moderation tracking
- Admin action logging
- Status management

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Questions
- `GET /api/questions` - Get questions with filters
- `POST /api/questions` - Create question
- `GET /api/questions/:id` - Get single question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question
- `POST /api/questions/:id/vote` - Vote on question
- `GET /api/questions/search` - Search questions

### Answers
- `GET /api/answers/question/:questionId` - Get answers for question
- `POST /api/answers/question/:questionId` - Create answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/vote` - Vote on answer
- `POST /api/answers/:id/accept` - Accept answer
- `POST /api/answers/:id/unaccept` - Unaccept answer

### Comments
- `GET /api/comments/answer/:answerId` - Get comments for answer
- `POST /api/comments/answer/:answerId` - Create comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/broadcast` - Admin broadcast

### Admin
- `GET /api/admin/moderation-dashboard` - Get moderation data
- `POST /api/admin/moderate-content` - Moderate content
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:userId/role` - Update user role
- `POST /api/admin/users/:userId/ban` - Ban user
- `POST /api/admin/users/:userId/unban` - Unban user
- `GET /api/admin/stats` - Get system statistics

### Tags
- `GET /api/tags` - Get all tags
- `GET /api/tags/popular` - Get popular tags
- `POST /api/tags` - Create tag (admin)
- `PUT /api/tags/:id` - Update tag (admin)

## 🎨 UI Features

### Responsive Design
- Mobile-first approach
- Tablet and desktop optimization
- Touch-friendly interactions

### Modern UI Components
- Gradient backgrounds and shadows
- Smooth animations and transitions
- Loading states and error handling
- Toast notifications

### Rich Text Editor
- Bold, italic, strikethrough formatting
- Numbered and bullet lists
- Image uploads and embedding
- Link insertion
- Text alignment options
- Emoji support

## 🔒 Security Features

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Token expiration and refresh
- Role-based route protection

### Content Moderation
- Automatic content analysis with Gemini API
- Three-tier moderation system (green/yellow/red)
- Admin review and action system
- User banning for repeated violations

### Data Protection
- Input validation and sanitization
- XSS protection
- CSRF protection
- Rate limiting (can be added)

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB database (local or cloud)
2. Configure environment variables
3. Install dependencies: `npm install`
4. Run database migrations: `node seedTags.js`
5. Start production server: `npm start`

### Frontend Deployment
1. Build the application: `npm run build`
2. Serve static files from a web server
3. Configure API endpoint URLs
4. Set up environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Future Enhancements

- Email notifications
- Advanced search filters
- User reputation system
- Question bookmarking
- Answer editing history
- Mobile app development
- Multi-language support
- Dark mode theme
- Advanced analytics
- API rate limiting 