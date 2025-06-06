// backend/routes/homepage.routes.js - ENHANCED mit Discord Live-Status
const express = require('express');
const router = express.Router();
const ServerStats = require('../models/serverStats.model');
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
      data: getDefaultStats()
    });
  }
});

// NEUE Enhanced Live Stats Route mit Discord-Integration
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
        // ✅ Neue optimierte Methode verwenden
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
        'stats.lastSeen': { $gte: new Date(Date.now() - 15 * 60 * 1000) } // 15 min
      });
      
      // Wenn Discord Bot offline, nutze DB-basierte Schätzung
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

    // Bot-Statistiken sammeln
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
          .filter(channel => channel.type === 2) // Voice channels
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
        uptime: Math.floor(client.uptime / 1000 / 60), // Minuten
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

// Trending Data mit Live-Ergänzungen
router.get('/trending', async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const stats = await ServerStats.getCurrentStats();
    
    // Live-Daten für Trending
    const activeVoice = await VoiceSession.countDocuments({ isActive: true });
    const recentlyActive = await User.countDocuments({
      'stats.lastSeen': { $gte: new Date(Date.now() - 60 * 60 * 1000) } // 1 Stunde
    });

    const trending = {
      popularGames: stats.gaming.popularGames.slice(0, parseInt(limit)),
      topUsers: stats.topLists.mostActiveUsers.slice(0, parseInt(limit)),
      recentActivity: {
        newMembers: stats.community.newMembersThisWeek,
        messagesThisWeek: stats.communication.messagesThisWeek,
        voiceMinutesThisWeek: stats.periods.lastWeek.voiceMinutes,
        activeNow: activeVoice,
        recentlyActive: recentlyActive
      },
      highlights: {
        totalVoiceHours: Math.floor(stats.gaming.totalVoiceMinutes / 60),
        totalMembers: stats.community.totalMembers,
        activeNow: activeVoice,
        peakActivity: stats.periods.lastDay.peakConcurrentVoice || 0
      },
      liveIndicators: {
        trend: recentlyActive > stats.community.activeMembers ? 'up' : 'down',
        momentum: recentlyActive / Math.max(stats.community.activeMembers, 1),
        timestamp: new Date()
      }
    };
    
    res.set('Cache-Control', 'public, max-age=300'); // 5 Minuten Cache
    
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

    // Gruppiere nach Channels
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

// Health Check mit Discord-Status
router.get('/stats/health', async (req, res) => {
  try {
    const statsScheduler = req.app.get('statsScheduler');
    const botManager = req.app.get('botManager');
    
    let schedulerHealth = { healthy: false, message: 'Scheduler not available' };
    let discordHealth = { healthy: false, message: 'Bot not available' };
    
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
    
    const stats = await ServerStats.getCurrentStats();
    const dbHealth = {
      healthy: !!stats,
      lastUpdate: stats?.system?.lastStatsUpdate,
      recordExists: !!stats
    };
    
    const overallHealthy = schedulerHealth.healthy && dbHealth.healthy && discordHealth.healthy;
    
    res.json({
      success: true,
      healthy: overallHealthy,
      components: {
        scheduler: schedulerHealth,
        database: dbHealth,
        discord: discordHealth
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

// Helper: Fallback Stats
function getDefaultStats() {
  return {
    members: { total: 0, active: 0, newThisWeek: 0 },
    activity: { 
      totalVoiceHours: 0, 
      totalMessages: 0, 
      activeVoiceSessions: 0, 
      gamesPlayed: 0 
    },
    highlights: { topUsers: [], popularGames: [] },
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

// Debug-Route für Presence Tracking (nur Development)
router.get('/debug/presence', async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ message: 'Not found' });
  }

  try {
    const botManager = req.app.get('botManager');
    
    if (!botManager || !botManager.isRunning()) {
      return res.json({
        error: 'Bot not running',
        available: false
      });
    }

    const debugInfo = botManager.discordBot.getPresenceDebugInfo();
    
    // Optional: Force refresh
    if (req.query.refresh === 'true') {
      const refreshedInfo = await botManager.discordBot.forceRefreshPresenceCache();
      return res.json({
        success: true,
        action: 'force_refreshed',
        before: debugInfo,
        after: refreshedInfo
      });
    }

    res.json({
      success: true,
      debug: debugInfo,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error in presence debug:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;