// Authentifizierungs-Middleware
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Token aus Header holen
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      return res.status(401).json({ message: 'Nicht autorisiert, kein Token' });
    }
    
    // Token verifizieren
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Benutzer aus der DB holen
    req.user = await User.findById(decoded.id).select('-accessToken -refreshToken');
    
    if (!req.user) {
      return res.status(401).json({ message: 'Benutzer nicht gefunden' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Nicht autorisiert, Token ungültig' });
  }
};

// Rollenbasierte Zugriffskontrolle
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ message: 'Keine Berechtigung für diese Aktion' });
    }
    
    const hasRole = req.user.roles.some(role => roles.includes(role));
    
    if (!hasRole) {
      return res.status(403).json({ message: 'Keine Berechtigung für diese Aktion' });
    }
    
    next();
  };
};
