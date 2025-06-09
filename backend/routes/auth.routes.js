const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

// Discord Auth Route
router.get('/discord', passport.authenticate('discord'));

// Discord Auth Callback - UPDATED
router.get('/discord/callback', 
  passport.authenticate('discord', { failureRedirect: '/' }),
  async (req, res) => {
    try {
      // ✅ Check ob User gerade Admin geworden ist
      const isNewAdmin = req.user.metadata?.firstAdmin && req.user.roles.includes('admin');
      
      // JWT erstellen
      const token = jwt.sign(
        { 
          id: req.user.id, 
          roles: req.user.roles,
          isFirstAdmin: req.user.metadata?.firstAdmin || false
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      // ✅ Query Parameter für Frontend je nach Admin-Status
      let redirectQuery = `token=${token}`;
      
      if (isNewAdmin) {
        redirectQuery += '&newAdmin=true&welcome=true';
        console.log(`🎉 Redirecting new admin ${req.user.username} with welcome message`);
      }
      
      // Token an Frontend weiterleiten
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?${redirectQuery}`);
    } catch (error) {
      console.error('Error in auth callback:', error);
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?error=auth_failed`);
    }
  }
);

// Aktuelle Benutzerinformationen abrufen - UPDATED
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
    
    // ✅ Zusätzliche Admin-Informationen
    const response = {
      ...user.toObject(),
      isFirstAdmin: user.metadata?.firstAdmin || false,
      adminSince: user.metadata?.adminSince || null,
      hasAdminRights: user.roles.includes('admin'),
      // ✅ Server-Status für Admins
      serverInfo: user.roles.includes('admin') ? {
        totalUsers: await User.countDocuments({}),
        totalAdmins: await User.countDocuments({ roles: { $in: ['admin'] } }),
        firstUserDate: user.metadata?.firstUser ? user.createdAt : null
      } : null
    };
    
    res.json(response);
  } catch (err) {
    res.status(401).json({ message: 'Ungültiger Token' });
  }
});

// ✅ NEU: Admin-Status Check Endpoint
router.get('/admin-status', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalAdmins = await User.countDocuments({ roles: { $in: ['admin'] } });
    const firstAdmin = await User.findOne({ 'metadata.firstAdmin': true });
    
    res.json({
      hasUsers: totalUsers > 0,
      hasAdmins: totalAdmins > 0,
      totalUsers: totalUsers,
      totalAdmins: totalAdmins,
      firstAdmin: firstAdmin ? {
        username: firstAdmin.username,
        createdAt: firstAdmin.createdAt,
        adminSince: firstAdmin.metadata?.adminSince
      } : null,
      needsFirstAdmin: totalUsers === 0 || totalAdmins === 0
    });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ 
      hasUsers: false, 
      hasAdmins: false, 
      error: 'Could not check admin status' 
    });
  }
});

// Abmelden
router.get('/logout', (req, res) => {
  req.logout();
  res.json({ message: 'Erfolgreich abgemeldet' });
});

module.exports = router;