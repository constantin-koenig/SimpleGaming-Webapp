// backend/app.js - Updated mit Bot Routes
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');

// Routen importieren
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const statsRoutes = require('./routes/stats.routes');
const botRoutes = require('./routes/bot.routes');

// Umgebungsvariablen laden
require('dotenv').config();

// MongoDB verbinden
connectDB();

// Passport konfigurieren
require('./config/passport');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(morgan('dev'));

// Session-Konfiguration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    maxAge: 60 * 60 * 1000 // 1 Stunde
  }
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Routen
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/bot', botRoutes);

// Bot Status Endpoint
app.get('/api/bot/status', (req, res) => {
  const botManager = req.app.get('botManager');
  if (botManager && botManager.isRunning()) {
    res.json({
      status: 'online',
      stats: botManager.getStats()
    });
  } else {
    res.json({
      status: 'offline',
      stats: null
    });
  }
});

// Basisroute
app.get('/', (req, res) => {
  res.json({
    message: 'SimpleGaming API läuft',
    version: '1.0.0',
    endpoints: [
      '/api/auth',
      '/api/users', 
      '/api/stats',
      '/api/bot'
    ]
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route nicht gefunden',
    path: req.originalUrl
  });
});

// Error Handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    message: 'Interner Server Fehler',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

module.exports = app;