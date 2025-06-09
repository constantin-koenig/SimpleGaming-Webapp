// backend/middleware/autoAdmin.middleware.js - NEU
const User = require('../models/user.model');

/**
 * Auto-Admin Middleware - Macht den ersten User automatisch zum Admin
 * Wird nur beim ersten Login/Registrierung ausgeführt
 */
const autoAdminMiddleware = async (req, res, next) => {
  try {
    // Nur wenn User erfolgreich authentifiziert wurde
    if (!req.user) {
      return next();
    }

    // Prüfen ob es bereits einen Admin gibt
    const existingAdmin = await User.findOne({ 
      roles: { $in: ['admin', 'owner'] } 
    });

    if (existingAdmin) {
      // Admin existiert bereits - nichts tun
      console.log(`👤 User ${req.user.username} logged in (Admin already exists)`);
      return next();
    }

    // Kein Admin vorhanden - aktuellen User zum Admin machen
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          roles: ['admin', 'member'],
          'metadata.firstAdmin': true,
          'metadata.adminSince': new Date()
        }
      },
      { new: true }
    );

    if (updatedUser) {
      // User-Objekt in Request aktualisieren
      req.user = updatedUser;
      
      console.log(`🎉 FIRST ADMIN CREATED: ${updatedUser.username} (${updatedUser.discordId})`);
      console.log(`👑 ${updatedUser.username} is now the server administrator!`);
      
      // Optional: Event loggen
      const UserActivity = require('../models/userActivity.model');
      await UserActivity.create({
        userId: updatedUser._id,
        activityType: 'ADMIN_CREATED',
        metadata: {
          type: 'first_admin',
          timestamp: new Date(),
          automatic: true
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error in auto-admin middleware:', error);
    // Fehler nicht weiterleiten - Middleware soll nicht Login blockieren
    next();
  }
};

module.exports = autoAdminMiddleware;