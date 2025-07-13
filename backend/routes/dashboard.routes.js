// backend/routes/dashboard.routes.js - UPDATED: Mit discordId für Avatar-Support
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/user.model');
const UserActivity = require('../models/userActivity.model');
const { protect } = require('../middleware/auth.middleware');

// ✅ IMPORT: Unterrouten
const activityRoutes = require('./dashboard/activity');
const gamingRoutes = require('./dashboard/gaming');
const socialRoutes = require('./dashboard/social');

// ✅ MOUNT: Unterrouten
router.use('/activity', protect, activityRoutes);
router.use('/gaming', protect, gamingRoutes);
router.use('/social', protect, socialRoutes);

// ✅ SIMPLIFIED: Haupt-Dashboard Overview (nur Basis-Daten) - FIXED: Avatar-Daten
router.get('/overview', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-accessToken -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // ✅ FIXED: Vollständige Benutzer-Grunddaten mit Discord-Infos für Avatar
    const userData = {
      id: user._id,
      username: user.username,
      discordId: user.discordId, // ✅ FIX: Für Avatar-URLs benötigt
      avatar: user.avatar,        // ✅ FIX: Avatar-Hash von Discord
      discriminator: user.discriminator, // ✅ FIX: Discord Discriminator
      level: user.level || 1,
      xp: user.xp || 0,
      xpToNext: user.xpToNext || 1000,
      xpFromMessages: user.xpBreakdown?.messages || 0,
      xpFromGames: user.xpBreakdown?.games || 0,
      xpFromAchievements: user.xpBreakdown?.achievements || 0,
      rank: user.rank || 'Bronze',
      rankColor: user.rankColor || 'from-gray-400 to-gray-600',
      joinDate: user.createdAt,
      lastActive: user.stats?.lastSeen || new Date(),
      roles: user.roles || ['member'],
      isOnline: user.isOnline || false, // ✅ FIX: Online-Status für Avatar
      
      // ✅ ZUSÄTZLICHE Discord-Infos falls vorhanden
      email: user.email || null,
      guilds: user.guilds || []
    };

    // Basis Dashboard-Statistiken (für Stat-Cards) - OHNE EVENTS
    const dashboardStats = {
      totalMessages: user.stats?.messagesCount || 0,
      voiceHours: Math.floor((user.stats?.voiceMinutes || 0) / 60),
      gamesPlayed: user.stats?.gamesPlayed || 0,
      achievementsUnlocked: user.achievements?.length || 0,
      friendsOnline: 0, // Wird über /social/friends geholt
      
      // Basis Weekly Progress (vereinfacht) - OHNE EVENTS
      weeklyProgress: await calculateBasicWeeklyProgress(user._id)
    };

    res.json({
      success: true,
      data: {
        userData,
        dashboardStats
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fehler beim Abrufen der Dashboard-Übersicht',
      error: error.message 
    });
  }
});

// ✅ HELPER: Basis Weekly Progress berechnen - OHNE EVENTS
async function calculateBasicWeeklyProgress(userId) {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyActivities = await UserActivity.find({
      userId: userId,
      timestamp: { $gte: startOfWeek }
    });

    const weeklyStats = {
      messages: weeklyActivities.filter(a => a.activityType === 'message').length,
      voiceMinutes: weeklyActivities
        .filter(a => a.activityType === 'voice')
        .reduce((sum, a) => sum + (a.metadata?.duration || 0), 0),
      gamesPlayed: weeklyActivities.filter(a => a.activityType === 'gaming').length,
      xpGained: weeklyActivities.reduce((sum, a) => sum + (a.xpGained || 0), 0)
    };

    return weeklyStats;
  } catch (error) {
    console.error('Error calculating weekly progress:', error);
    return {
      messages: 0,
      voiceMinutes: 0,
      gamesPlayed: 0,
      xpGained: 0
    };
  }
}

module.exports = router;