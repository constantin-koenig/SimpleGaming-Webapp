// backend/routes/dashboard.routes.js - UPDATED: Mit Unterrouten
const express = require('express');
const mongoose = require('mongoose'); // ✅ FIX: mongoose importieren
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

// ✅ SIMPLIFIED: Haupt-Dashboard Overview (nur Basis-Daten)
router.get('/overview', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-accessToken -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Benutzer-Grunddaten
    const userData = {
      id: user._id,
      username: user.username,
      avatar: user.avatar,
      level: user.level || 1,
      xp: user.xp || 0,
      xpToNext: user.xpToNext || 1000,
      rank: user.rank || 'Bronze',
      rankColor: user.rankColor || 'from-gray-400 to-gray-600',
      joinDate: user.createdAt,
      lastActive: user.stats?.lastSeen || new Date(),
      roles: user.roles || ['member']
    };

    // Basis Dashboard-Statistiken (für Stat-Cards)
    const dashboardStats = {
      totalMessages: user.stats?.messagesCount || 0,
      voiceHours: Math.floor((user.stats?.voiceMinutes || 0) / 60),
      gamesPlayed: user.stats?.gamesPlayed || 0,
      eventsAttended: user.stats?.eventsAttended || 0,
      achievementsUnlocked: user.achievements?.length || 0,
      friendsOnline: 0, // Wird über /social/friends geholt
      
      // Basis Weekly Progress (vereinfacht)
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

// ✅ HELPER: Basis Weekly Progress (schnell und einfach)
async function calculateBasicWeeklyProgress(userId) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  try {
    const weeklyActivity = await UserActivity.aggregate([
      {
        $match: {
          userId: userId,
          timestamp: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          totalDuration: { 
            $sum: { 
              $ifNull: ['$metadata.duration', 0] 
            }
          }
        }
      }
    ]);

    const progress = {
      messages: 0,
      voiceTime: 0,
      gamesPlayed: 0
    };

    weeklyActivity.forEach(activity => {
      switch(activity._id) {
        case 'MESSAGE':
          progress.messages = activity.count;
          break;
        case 'VOICE_LEAVE':
          progress.voiceTime = activity.totalDuration;
          break;
        case 'GAME_END':
          progress.gamesPlayed = activity.count;
          break;
      }
    });

    return progress;
  } catch (error) {
    console.error('Error calculating weekly progress:', error);
    return { messages: 0, voiceTime: 0, gamesPlayed: 0 };
  }
}

module.exports = router;


