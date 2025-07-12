const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {

  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/stackit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/answers', require('./routes/answers'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/tags', require('./routes/tags'));
app.use('/api/users', require('./routes/users'));

// Socket.IO connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Authenticate user
  socket.on('authenticate', (token) => {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      connectedUsers.set(decoded.userId, socket.id);
      socket.userId = decoded.userId;
      console.log('User authenticated:', decoded.userId);
    } catch (error) {
      console.error('Socket authentication error:', error);
    }
  });

  // Handle notifications
  socket.on('join-notifications', (userId) => {
    socket.join(`notifications-${userId}`);
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Make io available to controllers
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io }; 