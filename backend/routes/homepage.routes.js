// backend/routes/homepage.routes.js
const express = require('express');
const router = express.Router();
const ServerStats = require('../models/serverStats.model');

// Öffentliche Homepage-Statistiken (gecacht)
router.get('/stats', async (req, res) => {
  try {
    const { format = 'full' } = req.query;
    
    if (format === 'quick') {
      // Schnelle API für einfache Zahlen
      const statsScheduler = req.app.get('statsScheduler');
      const quickStats = await statsScheduler?.getQuickStats() || await getQuickStatsDirectly();
      
      return res.json({
        success: true,
        data: quickStats,
        cached: true,
        format: 'quick'
      });
    }
    
    // Vollständige Homepage-Stats (Standard)
    const stats = await ServerStats.getCurrentStats();
    const homepageStats = stats.getHomepageStats();
    
    // Cache-Header setzen (15 Minuten)
    res.set('Cache-Control', 'public, max-age=900');
    
    res.json({
      success: true,
      data: homepageStats,
      cached: true,
      lastUpdate: stats.system.lastStatsUpdate,
      nextUpdate: new Date(stats.system.lastStatsUpdate.getTime() + 15 * 60 * 1000)
    });
    
  } catch (error) {
    console.error('Error fetching homepage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Server-Statistiken',
      data: getDefaultStats() // Fallback-Daten
    });
  }
});

// Live Stats für Admin/Dashboard (aktueller Status)
router.get('/stats/live', async (req, res) => {
  try {
    const VoiceSession = require('../models/voiceSession.model');
    const User = require('../models/user.model');
    
    // Aktuelle Live-Daten
    const activeVoiceSessions = await VoiceSession.countDocuments({ isActive: true });
    const onlineMembers = await User.countDocuments({
      'stats.lastSeen': { $gte: new Date(Date.now() - 15 * 60 * 1000) } // 15 min
    });
    
    // Gecachte Stats für Kontext
    const stats = await ServerStats.getCurrentStats();
    const homepageStats = stats.getHomepageStats();
    
    res.json({
      success: true,
      live: {
        activeVoiceSessions,
        onlineMembers,
        timestamp: new Date()
      },
      cached: homepageStats,
      performance: {
        cacheAge: Date.now() - stats.system.lastStatsUpdate.getTime(),
        updateInProgress: req.app.get('statsScheduler')?.updateInProgress || false
      }
    });
    
  } catch (error) {
    console.error('Error fetching live stats:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Live-Statistiken'
    });
  }
});

// Trending/Popular Content für Homepage
router.get('/trending', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const stats = await ServerStats.getCurrentStats();
    
    const trending = {
      popularGames: stats.gaming.popularGames.slice(0, parseInt(limit)),
      topUsers: stats.topLists.mostActiveUsers.slice(0, parseInt(limit)),
      recentActivity: {
        newMembers: stats.community.newMembersThisWeek,
        messagesThisWeek: stats.communication.messagesThisWeek,
        voiceMinutesThisWeek: stats.periods.lastWeek.voiceMinutes
      },
      highlights: {
        totalVoiceHours: Math.floor(stats.gaming.totalVoiceMinutes / 60),
        totalMembers: stats.community.totalMembers,
        activeNow: stats.gaming.activeVoiceSessions
      }
    };
    
 
    res.set('Cache-Control', 'public, max-age=900');
    
    res.json({
      success: true,
      data: trending,
      lastUpdate: stats.system.lastStatsUpdate
    });
    
  } catch (error) {
    console.error('Error fetching trending data:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Trending-Daten'
    });
  }
});

// Manueller Stats-Update (nur für Admins)
router.post('/stats/refresh', async (req, res) => {
  try {
    // TODO: Hier sollte Auth-Middleware für Admins stehen
    // const { protect, authorize } = require('../middleware/auth.middleware');
    
    const statsScheduler = req.app.get('statsScheduler');
    
    if (!statsScheduler) {
      return res.status(503).json({
        success: false,
        message: 'Stats-Scheduler ist nicht verfügbar'
      });
    }
    
    const result = await statsScheduler.triggerManualUpdate('manual_api');
    
    res.json({
      success: result.success,
      message: result.message,
      duration: result.duration,
      timestamp: result.timestamp
    });
    
  } catch (error) {
    console.error('Error triggering manual stats update:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim manuellen Stats-Update'
    });
  }
});

// Health Check für Stats-System
router.get('/stats/health', async (req, res) => {
  try {
    const statsScheduler = req.app.get('statsScheduler');
    
    let schedulerHealth = { healthy: false, message: 'Scheduler not available' };
    
    if (statsScheduler) {
      schedulerHealth = await statsScheduler.healthCheck();
    }
    
    // Database Health Check
    const stats = await ServerStats.getCurrentStats();
    const dbHealth = {
      healthy: !!stats,
      lastUpdate: stats?.system?.lastStatsUpdate,
      recordExists: !!stats
    };
    
    // Overall Health
    const overallHealthy = schedulerHealth.healthy && dbHealth.healthy;
    
    res.json({
      success: true,
      healthy: overallHealthy,
      components: {
        scheduler: schedulerHealth,
        database: dbHealth
      },
      uptime: process.uptime(),
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Error in stats health check:', error);
    res.status(500).json({
      success: false,
      healthy: false,
      error: error.message
    });
  }
});

// Helper: Fallback Stats wenn DB nicht verfügbar
function getDefaultStats() {
  return {
    members: {
      total: 0,
      active: 0,
      newThisWeek: 0
    },
    activity: {
      totalVoiceHours: 0,
      totalMessages: 0,
      activeVoiceSessions: 0,
      gamesPlayed: 0
    },
    highlights: {
      topUsers: [],
      popularGames: []
    },
    lastUpdate: new Date(),
    fallback: true
  };
}

// Helper: Direkte DB-Abfrage für Quick Stats
async function getQuickStatsDirectly() {
  try {
    const User = require('../models/user.model');
    const VoiceSession = require('../models/voiceSession.model');
    
    const [totalMembers, activeVoice, userStats] = await Promise.all([
      User.countDocuments({}),
      VoiceSession.countDocuments({ isActive: true }),
      User.aggregate([
        {
          $group: {
            _id: null,
            totalMessages: { $sum: '$stats.messagesCount' },
            totalVoiceMinutes: { $sum: '$stats.voiceMinutes' },
            activeMembers: {
              $sum: {
                $cond: [
                  { $gte: ['$stats.lastSeen', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);
    
    const stats = userStats[0] || {};
    
    return {
      members: totalMembers,
      activeMembers: stats.activeMembers || 0,
      voiceHours: Math.floor((stats.totalVoiceMinutes || 0) / 60),
      voiceMinutes: stats.totalVoiceMinutes || 0,
      messages: stats.totalMessages || 0,
      activeVoice: activeVoice,
      lastUpdate: new Date(),
      direct: true
    };
  } catch (error) {
    console.error('Error in direct stats query:', error);
    return null;
  }
}

module.exports = router;