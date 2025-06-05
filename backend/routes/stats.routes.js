// backend/routes/stats.routes.js
const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const UserActivity = require('../models/userActivity.model');
const { protect } = require('../middleware/auth.middleware');

// Community-Statistiken
router.get('/community', async (req, res) => {
  try {
    const { timeframe = 'month' } = req.query;
    
    // Gesamt-Mitgliederzahl
    const totalMembers = await User.countDocuments({});
    
    // Aktive Mitglieder im Zeitraum
    const now = new Date();
    let dateFilter = {};
    
    switch(timeframe) {
      case 'day':
        dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
        break;
      case 'week':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
    }

    const activeMembers = await User.countDocuments({
      'stats.lastSeen': dateFilter
    });

    // Top aktivste Benutzer
    const topUsers = await UserActivity.getTopActiveUsers(timeframe, 10);

    // Aktivitäts-Übersicht
    const activityOverview = await UserActivity.aggregate([
      {
        $match: timeframe !== 'all' ? {
          timestamp: dateFilter
        } : {}
      },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Gesamt-Statistiken aus User-Collection
    const totalStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalMessages: { $sum: '$stats.messagesCount' },
          totalVoiceMinutes: { $sum: '$stats.voiceMinutes' },
          totalGamesPlayed: { $sum: '$stats.gamesPlayed' },
          totalEventsAttended: { $sum: '$stats.eventsAttended' }
        }
      }
    ]);

    res.json({
      totalMembers,
      activeMembers,
      topUsers,
      activityOverview,
      totalStats: totalStats[0] || {
        totalMessages: 0,
        totalVoiceMinutes: 0,
        totalGamesPlayed: 0,
        totalEventsAttended: 0
      },
      timeframe
    });
  } catch (error) {
    console.error('Error fetching community stats:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Community-Statistiken' });
  }
});

// Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { timeframe = 'month', type = 'all', limit = 20 } = req.query;
    
    let pipeline = [];
    
    // Zeitraum-Filter
    const now = new Date();
    let dateFilter = {};
    
    switch(timeframe) {
      case 'day':
        dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
        break;
      case 'week':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'month':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
    }

    if (type === 'messages') {
      // Nachrichten-Leaderboard
      pipeline = [
        { $sort: { 'stats.messagesCount': -1 } },
        { $limit: parseInt(limit) },
        {
          $project: {
            username: 1,
            avatar: 1,
            discordId: 1,
            value: '$stats.messagesCount',
            type: 'messages'
          }
        }
      ];
    } else if (type === 'voice') {
      // Voice-Zeit-Leaderboard
      pipeline = [
        { $sort: { 'stats.voiceMinutes': -1 } },
        { $limit: parseInt(limit) },
        {
          $project: {
            username: 1,
            avatar: 1,
            discordId: 1,
            value: '$stats.voiceMinutes',
            type: 'voice'
          }
        }
      ];
    } else if (type === 'gaming') {
      // Gaming-Leaderboard
      pipeline = [
        { $sort: { 'stats.gamesPlayed': -1 } },
        { $limit: parseInt(limit) },
        {
          $project: {
            username: 1,
            avatar: 1,
            discordId: 1,
            value: '$stats.gamesPlayed',
            type: 'gaming'
          }
        }
      ];
    } else {
      // Allgemeines Aktivitäts-Leaderboard
      const topUsers = await UserActivity.getTopActiveUsers(timeframe, parseInt(limit));
      return res.json({
        leaderboard: topUsers,
        type: 'activity',
        timeframe
      });
    }

    const leaderboard = await User.aggregate(pipeline);

    res.json({
      leaderboard,
      type,
      timeframe
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen des Leaderboards' });
  }
});

// Aktivitätstrends für Charts
router.get('/trends', protect, async (req, res) => {
  try {
    const { days = 30, userId } = req.query;
    
    const targetUserId = userId || req.user.id;
    const user = await User.findById(targetUserId);
    
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    const trends = await UserActivity.getActivityTrends(user._id, parseInt(days));
    
    res.json({
      trends,
      days: parseInt(days),
      userId: targetUserId
    });
  } catch (error) {
    console.error('Error fetching activity trends:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Aktivitätstrends' });
  }
});

module.exports = router;