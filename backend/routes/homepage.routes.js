// backend/routes/homepage.routes.js - ENHANCED mit echten Homepage-Metriken
const express = require('express');
const router = express.Router();
const ServerStats = require('../models/serverStats.model');
const GameStats = require('../models/gameStats.model');
const VoiceSession = require('../models/voiceSession.model');
const User = require('../models/user.model');

// Öffentliche Homepage-Statistiken (gecacht) mit echten Daten
router.get('/stats', async (req, res) => {
  try {
    const { format = 'full' } = req.query;
    
    if (format === 'quick') {
      const statsScheduler = req.app.get('statsScheduler');
      const quickStats = await statsScheduler?.getQuickStats() || await getQuickStatsDirectly();
      
      return res.json({
        success: true,
        data: quickStats,
        cached: true,
        format: 'quick'
      });
    }
    
    const stats = await ServerStats.getCurrentStats();
    const homepageStats = stats.getHomepageStats();
    
    res.set('Cache-Control', 'public, max-age=300'); // 5 Minuten Cache
    
    res.json({
      success: true,
      data: homepageStats,
      cached: true,
      lastUpdate: stats.system.lastStatsUpdate,
      nextUpdate: new Date(stats.system.lastStatsUpdate.getTime() + 5 * 60 * 1000)
    });
    
  } catch (error) {
    console.error('Error fetching homepage stats:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Server-Statistiken',
      data: getDefaultStats()
    });
  }
});

// ✅ ENHANCED: Live Stats mit echten Homepage-Daten
router.get('/stats/live', async (req, res) => {
  try {
    const botManager = req.app.get('botManager');
    let discordData = {
      onlineMembers: 0,
      activeVoiceSessions: 0,
      currentlyPlaying: 0,
      lastActivity: null,
      botConnected: false
    };

    // Discord Bot Live-Daten abrufen wenn verfügbar
    if (botManager && botManager.isRunning()) {
      try {
        const liveStats = botManager.discordBot.getLiveDiscordStats();
        
        if (liveStats.available) {
          discordData.onlineMembers = liveStats.onlineMembers;
          discordData.currentlyPlaying = liveStats.playingMembers;
          discordData.botConnected = true;
          discordData.dataSource = liveStats.dataSource;
          discordData.cacheSize = liveStats.cacheSize;
          
          console.log(`📊 Live Discord stats: ${liveStats.onlineMembers} online, ${liveStats.playingMembers} playing, ${liveStats.voiceMembers} in voice`);
        } else {
          console.warn('Discord live stats unavailable:', liveStats.reason);
        }
      } catch (botError) {
        console.warn('Discord bot data unavailable:', botError.message);
      }
    }

    // Voice Sessions aus Datenbank (immer verfügbar)
    const activeVoiceSessions = await VoiceSession.countDocuments({ isActive: true });
    discordData.activeVoiceSessions = activeVoiceSessions;

    // Fallback: Schätze Online-User aus DB wenn Discord Bot nicht verfügbar
    if (!discordData.botConnected || discordData.onlineMembers === 0) {
      const recentlyActiveUsers = await User.countDocuments({
        'stats.lastSeen': { $gte: new Date(Date.now() - 15 * 60 * 1000) }
      });
      
      if (!discordData.botConnected) {
        discordData.onlineMembers = Math.max(recentlyActiveUsers, activeVoiceSessions);
      }
    }

    // Letzte Aktivität
    const lastActivity = await User.findOne(
      { 'stats.lastSeen': { $exists: true } },
      { 'stats.lastSeen': 1 },
      { sort: { 'stats.lastSeen': -1 } }
    );

    // ✅ ENHANCED: Gecachte Stats für Homepage-Kontext
    const stats = await ServerStats.getCurrentStats();
    const homepageStats = stats.getHomepageStats();
    
    // Response mit Live-Daten + Homepage-Kontext
    res.json({
      success: true,
      live: {
        onlineMembers: discordData.onlineMembers,
        activeVoiceSessions: discordData.activeVoiceSessions,
        currentlyPlaying: discordData.currentlyPlaying,
        lastActivity: lastActivity?.stats?.lastSeen || null,
        timestamp: new Date(),
        botConnected: discordData.botConnected,
        dataSource: discordData.botConnected ? 'discord_live' : 'database_estimate'
      },
      cached: {
        ...homepageStats,
        // ✅ Zusätzliche Homepage-spezifische Cached Daten
        serverUptimeDays: Math.floor((Date.now() - stats.homepage.serverFoundedDate.getTime()) / (1000 * 60 * 60 * 24)),
        totalBotCommands: stats.homepage.totalBotCommands,
        totalActiveChannels: stats.homepage.totalActiveChannels
      },
      performance: {
        cacheAge: Date.now() - stats.system.lastStatsUpdate.getTime(),
        updateInProgress: req.app.get('statsScheduler')?.updateInProgress || false,
        botStatus: botManager?.isRunning() ? 'online' : 'offline'
      }
    });
    
  } catch (error) {
    console.error('Error fetching live stats:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Live-Statistiken',
      live: {
        onlineMembers: 0,
        activeVoiceSessions: 0,
        currentlyPlaying: 0,
        lastActivity: null,
        timestamp: new Date(),
        botConnected: false,
        dataSource: 'error'
      }
    });
  }
});

// Popular Games Endpoint (unverändert)
router.get('/games/popular', async (req, res) => {
  try {
    const { timeframe = 'week', limit = 6 } = req.query;
    
    const popularGames = await GameStats.getTopGames(timeframe, parseInt(limit));
    
    const formattedGames = popularGames.map((game, index) => ({
      id: game.id || index + 1,
      title: game.name,
      image: game.image || 'https://via.placeholder.com/300x180',
      players: game.players,
      sessions: game.sessions,
      totalHours: game.totalHours,
      hoursThisWeek: game.hoursThisWeek,
      currentPlayers: game.currentPlayers,
      category: game.category,
      isActive: game.isActive,
      averageSessionLength: game.averageSessionLength,
      lastSeen: game.lastSeen
    }));

    if (formattedGames.length === 0) {
      const fallbackGames = [
        {
          id: 1,
          title: 'Minecraft',
          image: 'https://via.placeholder.com/300x180',
          players: 45,
          sessions: 127,
          totalHours: 892,
          hoursThisWeek: 234,
          currentPlayers: 12,
          category: 'Sandbox',
          isActive: true,
          averageSessionLength: 45,
          lastSeen: new Date()
        },
        {
          id: 2,
          title: 'Fortnite',
          image: 'https://via.placeholder.com/300x180',
          players: 38,
          sessions: 95,
          totalHours: 567,
          hoursThisWeek: 156,
          currentPlayers: 8,
          category: 'Battle Royale',
          isActive: true,
          averageSessionLength: 35,
          lastSeen: new Date()
        },
        {
          id: 3,
          title: 'Call of Duty: Warzone',
          image: 'https://via.placeholder.com/300x180',
          players: 31,
          sessions: 78,
          totalHours: 445,
          hoursThisWeek: 123,
          currentPlayers: 5,
          category: 'FPS',
          isActive: true,
          averageSessionLength: 42,
          lastSeen: new Date()
        },
        {
          id: 4,
          title: 'League of Legends',
          image: 'https://via.placeholder.com/300x180',
          players: 27,
          sessions: 89,
          totalHours: 723,
          hoursThisWeek: 198,
          currentPlayers: 7,
          category: 'MOBA',
          isActive: true,
          averageSessionLength: 48,
          lastSeen: new Date()
        }
      ];
      
      res.json({
        success: true,
        data: fallbackGames.slice(0, parseInt(limit)),
        source: 'fallback',
        timeframe,
        message: 'Showing fallback data - gaming stats will be available once Discord bot tracks activities'
      });
    } else {
      res.json({
        success: true,
        data: formattedGames,
        source: 'database',
        timeframe,
        totalGames: formattedGames.length
      });
    }
    
  } catch (error) {
    console.error('Error fetching popular games:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der beliebten Spiele',
      data: []
    });
  }
});

// ✅ ENHANCED: Health Check mit Homepage-Metriken
router.get('/stats/health', async (req, res) => {
  try {
    const statsScheduler = req.app.get('statsScheduler');
    const botManager = req.app.get('botManager');
    
    let schedulerHealth = { healthy: false, message: 'Scheduler not available' };
    let discordHealth = { healthy: false, message: 'Bot not available' };
    let gamingHealth = { healthy: false, message: 'Gaming stats not available' };
    let homepageHealth = { healthy: false, message: 'Homepage stats not available' };
    
    if (statsScheduler) {
      schedulerHealth = await statsScheduler.healthCheck();
    }
    
    if (botManager) {
      const isRunning = botManager.isRunning();
      discordHealth = {
        healthy: isRunning,
        message: isRunning ? 'Bot online' : 'Bot offline',
        connected: isRunning && botManager.discordBot?.client?.isReady(),
        guilds: isRunning ? botManager.discordBot?.client?.guilds?.cache?.size || 0 : 0
      };
    }

    // Gaming Health Check
    try {
      const gameCount = await GameStats.countDocuments({});
      const activeGameSessions = await GameStats.countDocuments({
        'currentActivity.currentPlayers': { $gt: 0 }
      });
      
      gamingHealth = {
        healthy: true,
        message: `${gameCount} games tracked, ${activeGameSessions} currently active`,
        totalGames: gameCount,
        activeGames: activeGameSessions
      };
    } catch (gameError) {
      gamingHealth = {
        healthy: false,
        message: 'Gaming stats database error: ' + gameError.message
      };
    }

    // ✅ NEU: Homepage Health Check
    try {
      const stats = await ServerStats.getCurrentStats();
      const homepageStats = stats.getHomepageStats();
      
      homepageHealth = {
        healthy: true,
        message: `Homepage stats available`,
        metrics: {
          totalMembers: homepageStats.members.total,
          totalMessages: homepageStats.activity.totalMessages,
          voiceHours: homepageStats.activity.totalVoiceHours,
          serverUptimeDays: homepageStats.activity.serverUptimeDays,
          lastUpdate: stats.system.lastStatsUpdate
        }
      };
    } catch (homepageError) {
      homepageHealth = {
        healthy: false,
        message: 'Homepage stats error: ' + homepageError.message
      };
    }
    
    const stats = await ServerStats.getCurrentStats();
    const dbHealth = {
      healthy: !!stats,
      lastUpdate: stats?.system?.lastStatsUpdate,
      recordExists: !!stats
    };
    
    const overallHealthy = schedulerHealth.healthy && dbHealth.healthy && discordHealth.healthy && gamingHealth.healthy && homepageHealth.healthy;
    
    res.json({
      success: true,
      healthy: overallHealthy,
      components: {
        scheduler: schedulerHealth,
        database: dbHealth,
        discord: discordHealth,
        gaming: gamingHealth,
        homepage: homepageHealth // ✅ NEU
      },
      uptime: process.uptime(),
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Error in health check:', error);
    res.status(500).json({
      success: false,
      healthy: false,
      error: error.message
    });
  }
});

// Helper Functions
function getDefaultStats() {
  return {
    members: { total: 0, active: 0, newThisWeek: 0 },
    activity: { 
      totalVoiceHours: 0, 
      totalMessages: 0, 
      activeVoiceSessions: 0, 
      gamesPlayed: 0,
      totalGamingSessions: 0,
      totalGamingHours: 0,
      uniqueGamesPlayed: 0,
      currentlyPlaying: 0,
      serverUptimeDays: 0, // ✅ NEU
      totalEventsAttended: 0
    },
    highlights: { 
      topUsers: [], 
      popularGames: [],
      topGamers: []
    },
    lastUpdate: new Date(),
    fallback: true
  };
}

// ✅ ENHANCED: Quick Stats mit Homepage-Metriken
async function getQuickStatsDirectly() {
  try {
    const User = require('../models/user.model');
    const VoiceSession = require('../models/voiceSession.model');
    const GameStats = require('../models/gameStats.model');
    const UserActivity = require('../models/userActivity.model');
    const ServerStats = require('../models/serverStats.model');
    
    const [totalMembers, activeVoice, userStats, gameStats, messageStats, serverStatsRecord] = await Promise.all([
      User.countDocuments({}),
      VoiceSession.countDocuments({ isActive: true }),
      User.aggregate([
        {
          $group: {
            _id: null,
            totalMessages: { $sum: '$stats.messagesCount' },
            totalVoiceMinutes: { $sum: '$stats.voiceMinutes' },
            totalEventsAttended: { $sum: '$stats.eventsAttended' },
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
      ]),
      GameStats.aggregate([
        {
          $group: {
            _id: null,
            totalGamingSessions: { $sum: '$stats.totalSessions' },
            totalGamingMinutes: { $sum: '$stats.totalMinutes' },
            currentlyPlaying: { $sum: '$currentActivity.currentPlayers' },
            uniqueGames: { $sum: 1 }
          }
        }
      ]),
      UserActivity.countDocuments({
        activityType: 'MESSAGE'
      }),
      // ✅ FIXED: ServerStats für echte Uptime laden
      ServerStats.getCurrentStats()
    ]);
    
    const stats = userStats[0] || {};
    const gaming = gameStats[0] || {};
    
    // ✅ FIXED: Echte Server Uptime berechnen
    let serverUptimeDays = 0;
    if (serverStatsRecord && serverStatsRecord.homepage && serverStatsRecord.homepage.serverFoundedDate) {
      // Verwende die echte Gründungsdatum aus der Datenbank
      const foundedDate = serverStatsRecord.homepage.serverFoundedDate;
      const now = new Date();
      
      // UTC-basierte Berechnung für Konsistenz
      const utc1 = Date.UTC(foundedDate.getFullYear(), foundedDate.getMonth(), foundedDate.getDate());
      const utc2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      
      serverUptimeDays = Math.floor(Math.abs(utc2 - utc1) / (1000 * 60 * 60 * 24));
      
      console.log(`📅 Quick Stats: Real server uptime calculated: ${serverUptimeDays} days (since ${foundedDate.toISOString().split('T')[0]})`);
    } else {
      // Fallback: Default-Datum wenn noch nicht in DB gesetzt
      const defaultFoundedDate = new Date('2024-01-15');
      const now = new Date();
      const utc1 = Date.UTC(defaultFoundedDate.getFullYear(), defaultFoundedDate.getMonth(), defaultFoundedDate.getDate());
      const utc2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      serverUptimeDays = Math.floor(Math.abs(utc2 - utc1) / (1000 * 60 * 60 * 24));
      
      console.log(`📅 Quick Stats: Using fallback server uptime: ${serverUptimeDays} days (since ${defaultFoundedDate.toISOString().split('T')[0]})`);
    }
    
    return {
      members: totalMembers,
      activeMembers: stats.activeMembers || 0,
      // ✅ Homepage-spezifische Metriken
      totalMessages: stats.totalMessages || messageStats || 0,
      voiceHours: Math.floor((stats.totalVoiceMinutes || 0) / 60),
      voiceMinutes: stats.totalVoiceMinutes || 0,
      serverUptimeDays: serverUptimeDays, // ✅ FIXED: Echte Uptime
      totalEventsAttended: stats.totalEventsAttended || 0,
      
      // Live-Daten
      activeVoice: activeVoice,
      
      // Gaming-Stats
      totalGamingSessions: gaming.totalGamingSessions || 0,
      totalGamingHours: Math.floor((gaming.totalGamingMinutes || 0) / 60),
      currentlyPlaying: gaming.currentlyPlaying || 0,
      uniqueGames: gaming.uniqueGames || 0,
      
      lastUpdate: new Date(),
      direct: true
    };
  } catch (error) {
    console.error('Error in direct stats query:', error);
    
    // ✅ FIXED: Auch Fallback mit echter Uptime
    const defaultFoundedDate = new Date('2024-01-15');
    const now = new Date();
    const utc1 = Date.UTC(defaultFoundedDate.getFullYear(), defaultFoundedDate.getMonth(), defaultFoundedDate.getDate());
    const utc2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const fallbackUptimeDays = Math.floor(Math.abs(utc2 - utc1) / (1000 * 60 * 60 * 24));
    
    return {
      members: 0,
      activeMembers: 0,
      totalMessages: 0,
      voiceHours: 0,
      voiceMinutes: 0,
      serverUptimeDays: fallbackUptimeDays, // ✅ Echter Fallback-Wert
      totalEventsAttended: 0,
      activeVoice: 0,
      totalGamingSessions: 0,
      totalGamingHours: 0,
      currentlyPlaying: 0,
      uniqueGames: 0,
      lastUpdate: new Date(),
      direct: true,
      error: true
    };
  }
}

module.exports = router;