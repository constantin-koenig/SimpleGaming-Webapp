// backend/routes/homepage.routes.js - ENHANCED mit Gaming-Stats Integration
const express = require('express');
const router = express.Router();
const ServerStats = require('../models/serverStats.model');
const GameStats = require('../models/gameStats.model'); // ✅ NEU
const VoiceSession = require('../models/voiceSession.model');
const User = require('../models/user.model');

// Öffentliche Homepage-Statistiken (gecacht)
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
      nextUpdate: new Date(stats.system.lastStatsUpdate.getTime() + 5 * 60 * 1000) // 5 Minuten
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

// ✅ NEU: Enhanced Live Stats mit Gaming-Integration
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

    // Gecachte Stats für Kontext
    const stats = await ServerStats.getCurrentStats();
    const homepageStats = stats.getHomepageStats();
    
    // Response mit Live-Daten
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
      cached: homepageStats,
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

// ✅ NEU: Popular Games Endpoint mit echten Daten
router.get('/games/popular', async (req, res) => {
  try {
    const { timeframe = 'week', limit = 6 } = req.query;
    
    // Beliebte Spiele aus GameStats
    const popularGames = await GameStats.getTopGames(timeframe, parseInt(limit));
    
    // Format für Frontend anpassen
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

    // Fallback-Daten wenn keine echten Spiele verfügbar
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

// ✅ NEU: Live Gaming Activity
router.get('/games/live', async (req, res) => {
  try {
    const botManager = req.app.get('botManager');
    
    if (!botManager || !botManager.isRunning()) {
      return res.json({
        success: true,
        data: {
          totalPlayingNow: 0,
          activeGames: 0,
          topLiveGames: [],
          message: 'Bot offline - keine Live-Gaming-Daten verfügbar'
        }
      });
    }

    // Live Gaming Stats vom Bot
    const liveGamingStats = await botManager.discordBot.getLiveGamingStats();
    
    res.json({
      success: true,
      data: liveGamingStats,
      timestamp: new Date()
    });
    
  } catch (error) {
    console.error('Error fetching live gaming stats:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Live-Gaming-Daten',
      data: {
        totalPlayingNow: 0,
        activeGames: 0,
        topLiveGames: []
      }
    });
  }
});

// Discord Server Info für Live-Status
router.get('/discord/status', async (req, res) => {
  try {
    const botManager = req.app.get('botManager');
    
    if (!botManager || !botManager.isRunning()) {
      return res.json({
        success: true,
        status: 'offline',
        message: 'Discord Bot ist offline',
        data: {
          connected: false,
          guilds: 0,
          members: 0,
          channels: 0
        }
      });
    }

    const client = botManager.discordBot.client;
    
    if (!client.isReady()) {
      return res.json({
        success: true,
        status: 'connecting',
        message: 'Discord Bot verbindet...',
        data: {
          connected: false,
          guilds: 0,
          members: 0,
          channels: 0
        }
      });
    }

    const guilds = client.guilds.cache;
    let totalMembers = 0;
    let totalChannels = 0;
    let onlineMembers = 0;
    let voiceMembers = 0;

    const guildData = [];

    for (const [guildId, guild] of guilds) {
      try {
        const members = guild.members.cache;
        const channels = guild.channels.cache;
        
        const onlineInGuild = members.filter(member => 
          !member.user.bot && 
          member.presence?.status && 
          ['online', 'idle', 'dnd'].includes(member.presence.status)
        ).size;

        const voiceInGuild = channels
          .filter(channel => channel.type === 2)
          .reduce((total, channel) => total + channel.members.size, 0);

        totalMembers += members.size;
        totalChannels += channels.size;
        onlineMembers += onlineInGuild;
        voiceMembers += voiceInGuild;

        guildData.push({
          id: guild.id,
          name: guild.name,
          members: members.size,
          onlineMembers: onlineInGuild,
          voiceMembers: voiceInGuild,
          channels: channels.size
        });
      } catch (guildError) {
        console.warn(`Error processing guild ${guild.name}:`, guildError.message);
      }
    }

    res.json({
      success: true,
      status: 'online',
      message: 'Discord Bot ist verbunden',
      data: {
        connected: true,
        guilds: guilds.size,
        members: totalMembers,
        onlineMembers: onlineMembers,
        voiceMembers: voiceMembers,
        channels: totalChannels,
        uptime: Math.floor(client.uptime / 1000 / 60),
        ping: client.ws.ping,
        guildDetails: guildData
      },
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error fetching Discord status:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen des Discord-Status',
      status: 'error'
    });
  }
});

// ✅ ENHANCED: Trending Data mit Gaming-Integration
router.get('/trending', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const stats = await ServerStats.getCurrentStats();
    
    // Live-Daten für Trending
    const activeVoice = await VoiceSession.countDocuments({ isActive: true });
    const recentlyActive = await User.countDocuments({
      'stats.lastSeen': { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });

    // ✅ Gaming-Trends aus GameStats
    const [trendingGames, weeklyTopGames] = await Promise.all([
      GameStats.getTopGames('active', 3),
      GameStats.getTopGames('week', 5)
    ]);

    const trending = {
      popularGames: stats.gaming.popularGames.slice(0, parseInt(limit)),
      trendingGames: trendingGames.slice(0, 3),
      weeklyTopGames: weeklyTopGames.slice(0, 5),
      topUsers: stats.topLists.mostActiveUsers.slice(0, parseInt(limit)),
      recentActivity: {
        newMembers: stats.community.newMembersThisWeek,
        messagesThisWeek: stats.communication.messagesThisWeek,
        voiceMinutesThisWeek: stats.periods.lastWeek.voiceMinutes,
        gamingSessionsThisWeek: stats.gaming.totalGamingSessions,
        activeNow: activeVoice,
        recentlyActive: recentlyActive,
        currentlyPlaying: stats.gaming.currentlyPlaying
      },
      highlights: {
        totalVoiceHours: Math.floor(stats.gaming.totalVoiceMinutes / 60),
        totalGamingHours: stats.gaming.totalGamingHours,
        totalMembers: stats.community.totalMembers,
        uniqueGamesPlayed: stats.gaming.uniqueGamesPlayed,
        activeNow: activeVoice,
        peakActivity: stats.periods.lastDay.peakConcurrentVoice || 0
      },
      liveIndicators: {
        trend: recentlyActive > stats.community.activeMembers ? 'up' : 'down',
        momentum: recentlyActive / Math.max(stats.community.activeMembers, 1),
        gamingTrend: stats.gaming.currentlyPlaying > 0 ? 'active' : 'quiet',
        timestamp: new Date()
      }
    };
    
    res.set('Cache-Control', 'public, max-age=300');
    
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

// Voice Activity Endpoint für Realtime-Updates
router.get('/voice/activity', async (req, res) => {
  try {
    const sessions = await VoiceSession.find({ isActive: true })
      .populate('userId', 'username avatar discordId')
      .sort({ startTime: -1 });

    const channelActivity = {};
    
    sessions.forEach(session => {
      if (!channelActivity[session.channelId]) {
        channelActivity[session.channelId] = {
          channelId: session.channelId,
          channelName: session.channelName,
          guildId: session.guildId,
          members: [],
          memberCount: 0,
          totalDuration: 0
        };
      }
      
      const duration = Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60);
      
      channelActivity[session.channelId].members.push({
        username: session.userId?.username || 'Unknown',
        avatar: session.userId?.avatar,
        duration: duration,
        startTime: session.startTime
      });
      
      channelActivity[session.channelId].memberCount++;
      channelActivity[session.channelId].totalDuration += duration;
    });

    res.json({
      success: true,
      data: {
        totalActiveSessions: sessions.length,
        channels: Object.values(channelActivity),
        lastUpdate: new Date()
      }
    });

  } catch (error) {
    console.error('Error fetching voice activity:', error);
    res.status(500).json({
      success: false,
      message: 'Fehler beim Abrufen der Voice-Aktivität'
    });
  }
});

// Health Check mit Gaming-Status
router.get('/stats/health', async (req, res) => {
  try {
    const statsScheduler = req.app.get('statsScheduler');
    const botManager = req.app.get('botManager');
    
    let schedulerHealth = { healthy: false, message: 'Scheduler not available' };
    let discordHealth = { healthy: false, message: 'Bot not available' };
    let gamingHealth = { healthy: false, message: 'Gaming stats not available' };
    
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

    // ✅ Gaming Health Check
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
    
    const stats = await ServerStats.getCurrentStats();
    const dbHealth = {
      healthy: !!stats,
      lastUpdate: stats?.system?.lastStatsUpdate,
      recordExists: !!stats
    };
    
    const overallHealthy = schedulerHealth.healthy && dbHealth.healthy && discordHealth.healthy && gamingHealth.healthy;
    
    res.json({
      success: true,
      healthy: overallHealthy,
      components: {
        scheduler: schedulerHealth,
        database: dbHealth,
        discord: discordHealth,
        gaming: gamingHealth
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
      currentlyPlaying: 0
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

async function getQuickStatsDirectly() {
  try {
    const User = require('../models/user.model');
    const VoiceSession = require('../models/voiceSession.model');
    const GameStats = require('../models/gameStats.model');
    
    const [totalMembers, activeVoice, userStats, gameStats] = await Promise.all([
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
      ])
    ]);
    
    const stats = userStats[0] || {};
    const gaming = gameStats[0] || {};
    
    return {
      members: totalMembers,
      activeMembers: stats.activeMembers || 0,
      voiceHours: Math.floor((stats.totalVoiceMinutes || 0) / 60),
      voiceMinutes: stats.totalVoiceMinutes || 0,
      messages: stats.totalMessages || 0,
      activeVoice: activeVoice,
      // ✅ Gaming-Stats hinzugefügt
      totalGamingSessions: gaming.totalGamingSessions || 0,
      totalGamingHours: Math.floor((gaming.totalGamingMinutes || 0) / 60),
      currentlyPlaying: gaming.currentlyPlaying || 0,
      uniqueGames: gaming.uniqueGames || 0,
      lastUpdate: new Date(),
      direct: true
    };
  } catch (error) {
    console.error('Error in direct stats query:', error);
    return null;
  }
}

module.exports = router;