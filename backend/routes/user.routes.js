// backend/routes/user.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const UserActivity = require('../models/userActivity.model');
const { protect, authorize } = require('../middleware/auth.middleware');

// Benutzer-Profil abrufen
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-accessToken -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen des Profils' });
  }
});

// Benutzer-Profil aktualisieren
router.put('/profile', protect, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        preferences: preferences,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-accessToken -refreshToken');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Aktualisieren des Profils' });
  }
});

// Benutzer-Statistiken abrufen
router.get('/stats', protect, async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Aktivitätsstatistiken für Zeitraum
    const activityStats = await UserActivity.getActivityStats(user._id, timeframe);
    
    // Aktivitätstrends
    const trends = await UserActivity.getActivityTrends(user._id, 30);

    res.json({
      baseStats: user.stats,
      activityStats: activityStats,
      trends: trends,
      timeframe: timeframe
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Statistiken' });
  }
});

// Benutzer-Aktivitäten abrufen
router.get('/activities', protect, async (req, res) => {
  try {
    const { limit = 20, type, offset = 0 } = req.query;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    const query = { userId: user._id };
    if (type) {
      query.activityType = type;
    }

    const activities = await UserActivity.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await UserActivity.countDocuments(query);

    res.json({
      activities: activities,
      total: total,
      hasMore: (parseInt(offset) + activities.length) < total
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Aktivitäten' });
  }
});

// Auto-Sync manuell triggern (nur für Admins)
router.post('/trigger-sync', protect, authorize('admin'), async (req, res) => {
  try {
    const { type = 'daily' } = req.body;
    const botManager = req.app.get('botManager');
    
    if (!botManager || !botManager.isRunning()) {
      return res.status(503).json({ 
        message: 'Bot ist nicht verfügbar' 
      });
    }

    const result = await botManager.discordBot.triggerManualSync(type);
    
    res.json(result);
  } catch (error) {
    console.error('Error triggering manual sync:', error);
    res.status(500).json({ 
      message: 'Fehler beim Auslösen des manuellen Syncs' 
    });
  }
});

// Auto-Sync Status abrufen
router.get('/sync-status', protect, async (req, res) => {
  try {
    const botManager = req.app.get('botManager');
    
    if (!botManager || !botManager.isRunning()) {
      return res.json({
        enabled: false,
        message: 'Bot ist nicht verfügbar'
      });
    }

    const status = botManager.discordBot.getAutoSyncStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting sync status:', error);
    res.status(500).json({ 
      message: 'Fehler beim Abrufen des Sync-Status' 
    });
  }
});

module.exports = router;