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

    // ✅ FIXED: Berechne die Anzahl unterschiedlicher Spiele die der User gespielt hat
    const uniqueGamesCount = await calculateUniqueGamesPlayed(req.user.id);

    // ✅ FIXED: Vollständige Benutzer-Grunddaten mit Discord-Infos für Avatar
    const userData = {
      id: user._id,
      username: user.username,
      discordId: user.discordId,
      avatar: user.avatar,
      discriminator: user.discriminator,
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
      isOnline: user.isOnline || false,
      email: user.email || null,
      guilds: user.guilds || []
    };

    // ✅ FIXED: Dashboard-Statistiken mit korrekter Spiele-Zählung
    const dashboardStats = {
      totalMessages: user.stats?.messagesCount || 0,
      voiceHours: Math.floor((user.stats?.voiceMinutes || 0) / 60),
      gamesPlayed: uniqueGamesCount, // ✅ FIXED: Anzahl unterschiedlicher Spiele statt Sessions
      achievementsUnlocked: user.achievements?.length || 0,
      friendsOnline: 0,
      
      // Basis Weekly Progress (vereinfacht)
      weeklyProgress: await calculateBasicWeeklyProgress(user._id)
    };

    res.json({
      success: true,
      data: {
        userData,
        dashboardStats,
        achievements: user.achievements || []
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

// ✅ NEW: Funktion um die Anzahl unterschiedlicher Spiele zu berechnen
async function calculateUniqueGamesPlayed(userId) {
  try {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Finde alle unterschiedlichen Spiele die der User gespielt hat
    const uniqueGames = await UserActivity.aggregate([
      {
        $match: {
          userId: userObjectId,
          activityType: { $in: ['GAME_START', 'GAME_END', 'GAME_SWITCH'] },
          'metadata.gameName': { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$metadata.gameName' // Gruppiere nach Spielnamen
        }
      },
      {
        $count: 'uniqueGamesCount' // Zähle die Gruppen
      }
    ]);

    // Rückgabe der Anzahl oder 0 falls keine Spiele gefunden
    return uniqueGames.length > 0 ? uniqueGames[0].uniqueGamesCount : 0;
    
  } catch (error) {
    console.error('Error calculating unique games played:', error);
    return 0;
  }
}

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
      messages: weeklyActivities.filter(a => a.activityType === 'MESSAGE').length,
      voiceMinutes: weeklyActivities
        .filter(a => a.activityType === 'VOICE_LEAVE')
        .reduce((sum, a) => sum + (a.metadata?.duration || 0), 0),
      gamesPlayed: weeklyActivities.filter(a => a.activityType === 'GAME_END').length,
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