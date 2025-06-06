// backend/app.js - Updated mit Homepage Routes
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
const homepageRoutes = require('./routes/homepage.routes'); // NEU

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
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));

// Session-Konfiguration
app.use(session({
  secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
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

// API Routen
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/bot', botRoutes);
app.use('/api/homepage', homepageRoutes); // NEU - Homepage Stats

// Bot Status Endpoint (Legacy Support)
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

// Stats Scheduler Status (für Monitoring)
app.get('/api/scheduler/status', async (req, res) => {
  try {
    const statsScheduler = req.app.get('statsScheduler');
    
    if (!statsScheduler) {
      return res.json({
        status: 'disabled',
        message: 'Stats Scheduler ist nicht verfügbar'
      });
    }

    const status = statsScheduler.getStatus();
    const health = await statsScheduler.healthCheck();

    res.json({
      status: 'enabled',
      ...status,
      health: health,
      message: 'Stats Scheduler läuft'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Basisroute mit API-Übersicht
app.get('/', (req, res) => {
  res.json({
    message: 'SimpleGaming API läuft',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users', 
      stats: '/api/stats',
      bot: '/api/bot',
      homepage: '/api/homepage',
      scheduler: '/api/scheduler'
    },
    features: {
      discord_bot: !!process.env.DISCORD_BOT_TOKEN,
      stats_scheduler: true,
      auto_sync: process.env.AUTO_SYNC_ENABLED === 'true'
    },
    status: 'operational'
  });
});

// API Documentation Route
app.get('/api', (req, res) => {
  res.json({
    title: 'SimpleGaming API Documentation',
    version: '1.0.0',
    endpoints: {
      'Homepage Stats': {
        'GET /api/homepage/stats': 'Gecachte Server-Statistiken für Homepage',
        'GET /api/homepage/stats?format=quick': 'Schnelle Stats (nur Zahlen)',
        'GET /api/homepage/stats/live': 'Live-Daten + gecachte Stats',
        'GET /api/homepage/trending': 'Trending Content und Popular Items',
        'GET /api/homepage/stats/health': 'Health Check des Stats-Systems',
        'POST /api/homepage/stats/refresh': 'Manueller Stats-Update (Admin)'
      },
      'User Management': {
        'GET /api/auth/me': 'Aktuelle Benutzerinformationen',
        'GET /api/users/profile': 'Benutzerprofil',
        'PUT /api/users/profile': 'Profil aktualisieren',
        'GET /api/users/stats': 'Benutzer-Statistiken',
        'GET /api/users/activities': 'Benutzer-Aktivitäten'
      },
      'Community Stats': {
        'GET /api/stats/community': 'Community-Statistiken',
        'GET /api/stats/leaderboard': 'Leaderboards',
        'GET /api/stats/trends': 'Aktivitätstrends'
      },
      'Bot Integration': {
        'GET /api/bot/status': 'Discord Bot Status',
        'POST /api/bot/track-event': 'Event-Teilnahme tracken',
        'GET /api/bot/guild-info': 'Discord Server Informationen'
      }
    },
    cache_info: {
      homepage_stats: '15 minutes',
      trending_data: '30 minutes',
      live_stats: 'No cache'
    }
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route nicht gefunden',
    path: req.originalUrl,
    suggestion: 'Besuche /api für verfügbare Endpoints'
  });
});

// Error Handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  
  // Verschiedene Error-Types behandeln
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validierungsfehler',
      details: error.message
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Ungültige ID',
      details: 'Die angegebene ID ist nicht gültig'
    });
  }
  
  if (error.code === 11000) {
    return res.status(409).json({
      message: 'Konflikt - Daten bereits vorhanden',
      details: 'Ein Eintrag mit diesen Daten existiert bereits'
    });
  }

  res.status(500).json({
    message: 'Interner Server Fehler',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;