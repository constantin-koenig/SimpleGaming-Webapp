// Express App
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');

// Routen importieren
const authRoutes = require('./routes/auth.routes');

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

// Basisroute
app.get('/', (req, res) => {
  res.send('API läuft');
});

module.exports = app;