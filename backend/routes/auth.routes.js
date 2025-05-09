// Authentifizierungsrouten
const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Discord Auth Route
router.get('/discord', passport.authenticate('discord'));

// Discord Auth Callback
router.get('/discord/callback', 
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req, res) => {
    // JWT erstellen
    const token = jwt.sign(
      { id: req.user.id, roles: req.user.roles },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Token an Frontend weiterleiten
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

// Aktuelle Benutzerinformationen abrufen
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Kein Token vorhanden' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-accessToken -refreshToken');
    
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Ungültiger Token' });
  }
});

// Abmelden
router.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Erfolgreich abgemeldet' });
});

module.exports = router;