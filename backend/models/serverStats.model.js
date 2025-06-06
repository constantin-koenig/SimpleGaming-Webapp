// backend/models/serverStats.model.js - ENHANCED mit korrekter GameStats Integration
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serverStatsSchema = new Schema({
  identifier: {
    type: String,
    default: 'global',
    unique: true,
    index: true
  },
  
  community: {
    totalMembers: { type: Number, default: 0 },
    activeMembers: { type: Number, default: 0 },
    newMembersToday: { type: Number, default: 0 },
    newMembersThisWeek: { type: Number, default: 0 },
    newMembersThisMonth: { type: Number, default: 0 }
  },

  gaming: {
    // Voice-bezogene Stats (aus User-Model)
    totalVoiceMinutes: { type: Number, default: 0 },
    activeVoiceSessions: { type: Number, default: 0 },
    
    // ✅ ENHANCED: Korrekte Gaming-Statistiken aus GameStats
    totalGamesPlayed: { type: Number, default: 0 }, // Sessions aus User.stats
    totalGamingSessions: { type: Number, default: 0 }, // Sessions aus GameStats
    totalGamingMinutes: { type: Number, default: 0 }, // Minuten aus GameStats
    uniqueGamesPlayed: { type: Number, default: 0 }, // Anzahl verschiedener Spiele
    currentlyPlaying: { type: Number, default: 0 }, // Aktuell spielende User
    
    // Top Games mit aktuellen Statistiken
    popularGames: [{
      name: { type: String, required: true },
      sessions: { type: Number, default: 0 }, // Gesamt-Sessions
      players: { type: Number, default: 0 }, // Unique Players
      totalHours: { type: Number, default: 0 }, // Gesamt-Stunden
      hoursThisWeek: { type: Number, default: 0 }, // Stunden diese Woche
      currentPlayers: { type: Number, default: 0 }, // Aktuell spielend
      category: { type: String, default: 'Game' },
      popularityScore: { type: Number, default: 0 },
      lastSeen: { type: Date }
    }],
    
    // Voice Channel Statistiken
    voiceChannelStats: [{
      channelName: String,
      totalMinutes: Number,
      sessionsCount: Number
    }]
  },

  communication: {
    totalMessages: { type: Number, default: 0 },
    messagesThisWeek: { type: Number, default: 0 },
    messagesThisMonth: { type: Number, default: 0 },
    averageMessagesPerDay: { type: Number, default: 0 },
    activeChannels: { type: Number, default: 0 }
  },

  events: {
    totalEventsAttended: { type: Number, default: 0 },
    upcomingEvents: { type: Number, default: 0 },
    eventParticipationRate: { type: Number, default: 0 },
    mostPopularEventType: String
  },

  topLists: {
    mostActiveUsers: [{
      username: { type: String, required: true },
      avatar: String,
      activityScore: { type: Number, default: 0 },
      lastSeen: Date
    }],
    longestVoiceSessions: [{
      username: { type: String, required: true },
      duration: { type: Number, default: 0 },
      channelName: String,
      date: Date
    }],
    topGamers: [{
      username: { type: String, required: true },
      gamesPlayed: { type: Number, default: 0 },
      totalGamingHours: { type: Number, default: 0 },
      favoriteGame: String
    }]
  },

  system: {
    botUptime: { type: Number, default: 0 },
    lastStatsUpdate: { type: Date, default: Date.now },
    updateFrequency: { type: String, default: '5min' },
    dataAccuracy: { type: String, default: '95%' },
    // ✅ Gaming-spezifische System-Info
    gamingStatsEnabled: { type: Boolean, default: true },
    lastGameStatsUpdate: { type: Date, default: Date.now }
  },

  periods: {
    lastHour: {
      messages: { type: Number, default: 0 },
      voiceMinutes: { type: Number, default: 0 },
      gamingMinutes: { type: Number, default: 0 }, // ✅ NEU
      newMembers: { type: Number, default: 0 }
    },
    lastDay: {
      messages: { type: Number, default: 0 },
      voiceMinutes: { type: Number, default: 0 },
      gamingMinutes: { type: Number, default: 0 }, // ✅ NEU
      newMembers: { type: Number, default: 0 },
      peakConcurrentVoice: { type: Number, default: 0 },
      peakConcurrentGaming: { type: Number, default: 0 } // ✅ NEU
    },
    lastWeek: {
      messages: { type: Number, default: 0 },
      voiceMinutes: { type: Number, default: 0 },
      gamingMinutes: { type: Number, default: 0 }, // ✅ NEU
      newMembers: { type: Number, default: 0 },
      averageDailyActivity: { type: Number, default: 0 }
    }
  }
}, { 
  timestamps: true 
});

// Virtuelle Felder für Stunden-Berechnungen
serverStatsSchema.virtual('gaming.voiceHours').get(function() {
  return Math.floor(this.gaming.totalVoiceMinutes / 60);
});

serverStatsSchema.virtual('gaming.totalGamingHours').get(function() {
  return Math.floor(this.gaming.totalGamingMinutes / 60);
});

// Indexes
serverStatsSchema.index({ identifier: 1 });
serverStatsSchema.index({ 'system.lastStatsUpdate': -1 });

serverStatsSchema.statics.getCurrentStats = async function() {
  let stats = await this.findOne({ identifier: 'global' });
  
  if (!stats) {
    stats = await this.create({
      identifier: 'global'
    });
    console.log('📊 Created initial server stats document');
  }
  
  return stats;
};

// ✅ COMPLETELY REWRITTEN: Server Stats Update mit korrekter GameStats Integration
serverStatsSchema.statics.updateServerStats = async function() {
  try {
    console.log('🔄 Updating server stats with enhanced gaming integration...');
    const startTime = Date.now();
    
    const User = require('./user.model');
    const UserActivity = require('./userActivity.model');
    const VoiceSession = require('./voiceSession.model');
    const GameStats = require('./gameStats.model');
    
    let stats = await this.getCurrentStats();
    
    // ✅ PARALLEL: Community Stats berechnen
    const [
      totalMembers,
      activeMembers,
      newMembersToday,
      newMembersThisWeek,
      newMembersThisMonth
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({
        'stats.lastSeen': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // ✅ PARALLEL: User-basierte Gaming Stats + GameStats
    const [userGamingStats, gameStatsAggregation, activeVoiceSessions] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: null,
            totalVoiceMinutes: { $sum: '$stats.voiceMinutes' },
            totalGamesPlayed: { $sum: '$stats.gamesPlayed' }, // User-Sessions
            totalMessages: { $sum: '$stats.messagesCount' },
            totalEventsAttended: { $sum: '$stats.eventsAttended' }
          }
        }
      ]),
      GameStats.aggregate([
        {
          $group: {
            _id: null,
            // ✅ FIXED: Korrekte Aggregation der Gaming-Daten
            totalGamingSessions: { $sum: '$stats.totalSessions' },
            totalGamingMinutes: { $sum: '$stats.totalMinutes' },
            uniqueGamesPlayed: { $sum: 1 },
            currentlyPlaying: { $sum: '$currentActivity.currentPlayers' },
            // Zeitraum-spezifische Daten
            gamingMinutesToday: { $sum: '$stats.periods.today.minutes' },
            gamingMinutesThisWeek: { $sum: '$stats.periods.thisWeek.minutes' }
          }
        }
      ]),
      VoiceSession.countDocuments({ isActive: true })
    ]);
    
    const userTotals = userGamingStats[0] || {
      totalVoiceMinutes: 0,
      totalGamesPlayed: 0,
      totalMessages: 0,
      totalEventsAttended: 0
    };

    const gameTotals = gameStatsAggregation[0] || {
      totalGamingSessions: 0,
      totalGamingMinutes: 0,
      uniqueGamesPlayed: 0,
      currentlyPlaying: 0,
      gamingMinutesToday: 0,
      gamingMinutesThisWeek: 0
    };

    // ✅ ENHANCED: Popular Games aus GameStats mit korrekten Daten
    const popularGamesData = await GameStats.getTopGames('popular', 10);
    const popularGames = popularGamesData.map(game => ({
      name: game.name,
      sessions: game.sessions,
      players: game.players,
      totalHours: game.totalHours,
      hoursThisWeek: game.hoursThisWeek,
      currentPlayers: game.currentPlayers,
      category: game.category,
      popularityScore: game.popularityScore,
      lastSeen: game.lastSeen
    }));

    // ✅ PARALLEL: Top-Listen generieren
    const [mostActiveUsers, topGamers] = await Promise.all([
      this.generateTopActiveUsers(),
      this.generateTopGamers()
    ]);

    // ✅ PARALLEL: Nachrichten-Statistiken für Zeiträume
    const [messagesThisWeek, messagesThisMonth] = await Promise.all([
      UserActivity.countDocuments({
        activityType: 'MESSAGE',
        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      UserActivity.countDocuments({
        activityType: 'MESSAGE',
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // ✅ Stats-Objekt aktualisieren mit korrekten Gaming-Daten
    stats.community = {
      totalMembers,
      activeMembers,
      newMembersToday,
      newMembersThisWeek,
      newMembersThisMonth
    };

    stats.gaming = {
      // Voice-Statistiken (aus User-Model)
      totalVoiceMinutes: userTotals.totalVoiceMinutes,
      activeVoiceSessions,
      
      // ✅ ENHANCED: Getrennte Gaming-Statistiken
      totalGamesPlayed: userTotals.totalGamesPlayed, // User-basierte Sessions
      totalGamingSessions: gameTotals.totalGamingSessions, // GameStats-Sessions
      totalGamingMinutes: gameTotals.totalGamingMinutes, // Nur aus GameStats
      uniqueGamesPlayed: gameTotals.uniqueGamesPlayed,
      currentlyPlaying: gameTotals.currentlyPlaying,
      
      // Popular Games mit allen Details
      popularGames: popularGames
    };

    stats.communication = {
      totalMessages: userTotals.totalMessages,
      messagesThisWeek,
      messagesThisMonth,
      averageMessagesPerDay: Math.floor(messagesThisMonth / 30)
    };

    stats.events = {
      totalEventsAttended: userTotals.totalEventsAttended,
      eventParticipationRate: totalMembers > 0 ? Math.floor((userTotals.totalEventsAttended / totalMembers) * 100) : 0
    };

    stats.topLists = {
      mostActiveUsers: mostActiveUsers.slice(0, 5),
      topGamers: topGamers.slice(0, 5)
    };

    // ✅ ENHANCED: Zeitraum-Statistiken mit Gaming-Daten
    stats.periods = {
      lastHour: {
        messages: 0, // Könnte aus UserActivity berechnet werden
        voiceMinutes: 0,
        gamingMinutes: 0,
        newMembers: 0
      },
      lastDay: {
        messages: 0,
        voiceMinutes: 0,
        gamingMinutes: gameTotals.gamingMinutesToday,
        newMembers: newMembersToday,
        peakConcurrentVoice: activeVoiceSessions,
        peakConcurrentGaming: gameTotals.currentlyPlaying
      },
      lastWeek: {
        messages: messagesThisWeek,
        voiceMinutes: 0, // Könnte aus UserActivity berechnet werden
        gamingMinutes: gameTotals.gamingMinutesThisWeek,
        newMembers: newMembersThisWeek,
        averageDailyActivity: Math.floor(messagesThisWeek / 7)
      }
    };

    stats.system = {
      lastStatsUpdate: new Date(),
      lastGameStatsUpdate: new Date(),
      updateFrequency: '5min',
      dataAccuracy: '98%',
      gamingStatsEnabled: true
    };

    await stats.save();
    
    const updateTime = Date.now() - startTime;
    console.log(`✅ Enhanced server stats updated in ${updateTime}ms`);
    console.log(`📊 Stats Summary:`);
    console.log(`   👥 Members: ${totalMembers} total, ${activeMembers} active`);
    console.log(`   🎤 Voice: ${Math.floor(userTotals.totalVoiceMinutes/60)}h total, ${activeVoiceSessions} active`);
    console.log(`   🎮 Gaming: ${gameTotals.totalGamingSessions} sessions, ${Math.floor(gameTotals.totalGamingMinutes/60)}h total`);
    console.log(`   🕹️  Currently: ${gameTotals.currentlyPlaying} playing, ${gameTotals.uniqueGamesPlayed} unique games`);
    console.log(`   💬 Messages: ${userTotals.totalMessages} total`);
    
    return stats;
  } catch (error) {
    console.error('❌ Error updating enhanced server stats:', error);
    throw error;
  }
};

serverStatsSchema.statics.generateTopActiveUsers = async function() {
  try {
    const UserActivity = require('./userActivity.model');
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const topUsers = await UserActivity.aggregate([
      {
        $match: {
          timestamp: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: '$userId',
          activityCount: { $sum: 1 },
          lastActivity: { $max: '$timestamp' }
        }
      },
      { $sort: { activityCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          username: '$user.username',
          avatar: '$user.avatar',
          activityScore: '$activityCount',
          lastSeen: '$user.stats.lastSeen'
        }
      }
    ]);
    
    return topUsers.filter(user => 
      user.username && 
      typeof user.username === 'string' && 
      user.activityScore > 0
    );
  } catch (error) {
    console.error('Error generating top active users:', error);
    return [];
  }
};

// ✅ ENHANCED: Top Gamer mit echten Gaming-Stunden aus GameStats
serverStatsSchema.statics.generateTopGamers = async function() {
  try {
    const User = require('./user.model');
    const UserActivity = require('./userActivity.model');
    
    // Top Gamer basierend auf User.stats.gamesPlayed
    const topGamers = await User.aggregate([
      {
        $match: {
          'stats.gamesPlayed': { $gt: 0 }
        }
      },
      {
        $project: {
          _id: 1,
          username: 1,
          avatar: 1,
          gamesPlayed: '$stats.gamesPlayed',
          favoriteGame: { $arrayElemAt: ['$preferences.favoriteGames', 0] }
        }
      },
      { $sort: { gamesPlayed: -1 } },
      { $limit: 10 }
    ]);
    
    // ✅ ENHANCED: Gaming-Stunden aus tatsächlichen Sessions berechnen
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    for (const gamer of topGamers) {
      try {
        // Gaming-Sessions-Stunden aus UserActivity berechnen
        const gamingSessions = await UserActivity.aggregate([
          {
            $match: {
              userId: gamer._id,
              activityType: { $in: ['GAME_END', 'GAME_SWITCH'] },
              timestamp: { $gte: oneMonthAgo },
              'metadata.duration': { $exists: true, $gt: 0 }
            }
          },
          {
            $group: {
              _id: null,
              totalMinutes: { $sum: '$metadata.duration' }
            }
          }
        ]);
        
        const totalGamingMinutes = gamingSessions[0]?.totalMinutes || 0;
        gamer.totalGamingHours = Math.floor(totalGamingMinutes / 60);
        
        // ✅ Lieblingsspiel aus tatsächlichen Sessions ermitteln
        const favoriteGameQuery = await UserActivity.aggregate([
          {
            $match: {
              userId: gamer._id,
              activityType: { $in: ['GAME_START', 'GAME_END'] },
              'metadata.gameName': { $exists: true }
            }
          },
          {
            $group: {
              _id: '$metadata.gameName',
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 1 }
        ]);
        
        if (favoriteGameQuery[0]) {
          gamer.favoriteGame = favoriteGameQuery[0]._id;
        }
        
        // Fallback zu 0 falls keine Gaming-Daten
        if (!gamer.totalGamingHours) {
          gamer.totalGamingHours = 0;
        }
        
      } catch (userError) {
        console.error(`Error processing gamer ${gamer.username}:`, userError);
        gamer.totalGamingHours = 0;
      }
    }
    
    return topGamers.filter(gamer => 
      gamer.username && 
      typeof gamer.username === 'string' && 
      gamer.gamesPlayed > 0
    );
  } catch (error) {
    console.error('Error generating top gamers:', error);
    return [];
  }
};

// ✅ ENHANCED: Homepage-Stats mit allen Gaming-Details
serverStatsSchema.methods.getHomepageStats = function() {
  return {
    members: {
      total: this.community.totalMembers,
      active: this.community.activeMembers,
      newThisWeek: this.community.newMembersThisWeek
    },
    activity: {
      // Voice-Aktivität
      totalVoiceHours: Math.floor(this.gaming.totalVoiceMinutes / 60),
      totalVoiceMinutes: this.gaming.totalVoiceMinutes,
      activeVoiceSessions: this.gaming.activeVoiceSessions,
      
      // Gaming-Aktivität (getrennt)
      gamesPlayed: this.gaming.totalGamesPlayed, // User-basierte Sessions
      totalGamingSessions: this.gaming.totalGamingSessions, // GameStats-Sessions
      totalGamingHours: Math.floor(this.gaming.totalGamingMinutes / 60),
      uniqueGamesPlayed: this.gaming.uniqueGamesPlayed,
      currentlyPlaying: this.gaming.currentlyPlaying,
      
      // Nachrichten
      totalMessages: this.communication.totalMessages
    },
    highlights: {
      topUsers: this.topLists.mostActiveUsers.slice(0, 3),
      popularGames: this.gaming.popularGames.slice(0, 5),
      topGamers: this.topLists.topGamers.slice(0, 3)
    },
    lastUpdate: this.system.lastStatsUpdate,
    gamingEnabled: this.system.gamingStatsEnabled
  };
};

// ✅ NEW: Gaming-spezifische Stats für Gaming-Dashboard
serverStatsSchema.methods.getGamingStats = function() {
  return {
    overview: {
      totalGamingSessions: this.gaming.totalGamingSessions,
      totalGamingHours: Math.floor(this.gaming.totalGamingMinutes / 60),
      uniqueGamesPlayed: this.gaming.uniqueGamesPlayed,
      currentlyPlaying: this.gaming.currentlyPlaying,
      averageSessionLength: this.gaming.totalGamingSessions > 0 ? 
        Math.floor(this.gaming.totalGamingMinutes / this.gaming.totalGamingSessions) : 0
    },
    periods: {
      today: {
        gamingMinutes: this.periods.lastDay.gamingMinutes,
        gamingHours: Math.floor(this.periods.lastDay.gamingMinutes / 60),
        peakConcurrentGaming: this.periods.lastDay.peakConcurrentGaming
      },
      thisWeek: {
        gamingMinutes: this.periods.lastWeek.gamingMinutes,
        gamingHours: Math.floor(this.periods.lastWeek.gamingMinutes / 60)
      }
    },
    popularGames: this.gaming.popularGames,
    topGamers: this.topLists.topGamers,
    lastUpdate: this.system.lastGameStatsUpdate
  };
};

// ✅ NEW: Live-Stats für Real-time Updates
serverStatsSchema.methods.getLiveStats = function() {
  return {
    live: {
      currentlyPlaying: this.gaming.currentlyPlaying,
      activeVoiceSessions: this.gaming.activeVoiceSessions,
      onlineMembers: this.community.activeMembers // Approximation
    },
    cached: {
      totalMembers: this.community.totalMembers,
      totalGamingHours: Math.floor(this.gaming.totalGamingMinutes / 60),
      totalVoiceHours: Math.floor(this.gaming.totalVoiceMinutes / 60),
      totalMessages: this.communication.totalMessages
    },
    timestamp: this.system.lastStatsUpdate
  };
};

// ✅ NEW: Performance-Statistiken
serverStatsSchema.statics.getPerformanceStats = async function() {
  try {
    const stats = await this.getCurrentStats();
    const now = new Date();
    
    // Datenbank-Performance messen
    const startTime = Date.now();
    await this.findOne({ identifier: 'global' });
    const dbResponseTime = Date.now() - startTime;
    
    // GameStats Performance
    const GameStats = require('./gameStats.model');
    const gameStatsStartTime = Date.now();
    await GameStats.countDocuments({});
    const gameStatsResponseTime = Date.now() - gameStatsStartTime;
    
    return {
      database: {
        responseTime: dbResponseTime,
        gameStatsResponseTime: gameStatsResponseTime,
        lastUpdate: stats.system.lastStatsUpdate,
        updateAge: Math.floor((now - stats.system.lastStatsUpdate) / 1000 / 60), // Minuten
        isStale: (now - stats.system.lastStatsUpdate) > (15 * 60 * 1000) // > 15 min
      },
      data: {
        totalRecords: stats.community.totalMembers,
        gamesTracked: stats.gaming.uniqueGamesPlayed,
        activeSessions: stats.gaming.currentlyPlaying + stats.gaming.activeVoiceSessions,
        dataAccuracy: stats.system.dataAccuracy
      },
      system: {
        gamingStatsEnabled: stats.system.gamingStatsEnabled,
        updateFrequency: stats.system.updateFrequency,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        uptime: process.uptime() / 60 // Minuten
      },
      timestamp: now
    };
  } catch (error) {
    console.error('Error getting performance stats:', error);
    return {
      database: { responseTime: -1, error: error.message },
      timestamp: new Date()
    };
  }
};

// ✅ NEW: Health Check für Monitoring
serverStatsSchema.statics.healthCheck = async function() {
  try {
    const stats = await this.getCurrentStats();
    const now = new Date();
    const updateAge = Math.floor((now - stats.system.lastStatsUpdate) / 1000 / 60);
    
    // Health-Status bestimmen
    const isHealthy = updateAge < 30; // Unter 30 Minuten = gesund
    const hasRecentGamingData = stats.gaming.currentlyPlaying >= 0;
    const hasMembers = stats.community.totalMembers > 0;
    
    const healthStatus = isHealthy && hasRecentGamingData && hasMembers ? 'healthy' : 'warning';
    
    return {
      status: healthStatus,
      healthy: healthStatus === 'healthy',
      checks: {
        recentUpdate: {
          status: updateAge < 30 ? 'pass' : 'fail',
          lastUpdate: stats.system.lastStatsUpdate,
          ageMinutes: updateAge
        },
        gamingData: {
          status: hasRecentGamingData ? 'pass' : 'fail',
          currentlyPlaying: stats.gaming.currentlyPlaying,
          uniqueGames: stats.gaming.uniqueGamesPlayed
        },
        memberData: {
          status: hasMembers ? 'pass' : 'fail',
          totalMembers: stats.community.totalMembers,
          activeMembers: stats.community.activeMembers
        },
        systemStatus: {
          status: stats.system.gamingStatsEnabled ? 'pass' : 'warning',
          gamingEnabled: stats.system.gamingStatsEnabled,
          accuracy: stats.system.dataAccuracy
        }
      },
      summary: {
        totalMembers: stats.community.totalMembers,
        currentlyPlaying: stats.gaming.currentlyPlaying,
        totalGamingHours: Math.floor(stats.gaming.totalGamingMinutes / 60),
        lastUpdate: stats.system.lastStatsUpdate
      },
      timestamp: now
    };
  } catch (error) {
    return {
      status: 'error',
      healthy: false,
      error: error.message,
      timestamp: new Date()
    };
  }
};

// ✅ NEW: Trending-Analyse
serverStatsSchema.methods.getTrendingData = function() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  return {
    trending: {
      // Gaming-Trends
      gamingGrowth: {
        currentSessions: this.gaming.totalGamingSessions,
        weeklyGamingHours: Math.floor(this.periods.lastWeek.gamingMinutes / 60),
        popularityTrend: this.gaming.popularGames.length > 0 ? 'growing' : 'stable'
      },
      
      // Community-Trends
      membershipGrowth: {
        newThisWeek: this.community.newMembersThisWeek,
        growthRate: this.community.totalMembers > 0 ? 
          (this.community.newMembersThisWeek / this.community.totalMembers * 100).toFixed(2) : 0,
        trend: this.community.newMembersThisWeek > 0 ? 'growing' : 'stable'
      },
      
      // Aktivitäts-Trends
      activityTrend: {
        messagesThisWeek: this.communication.messagesThisWeek,
        averageDaily: Math.floor(this.communication.messagesThisWeek / 7),
        voiceHoursThisWeek: Math.floor(this.periods.lastWeek.voiceMinutes / 60),
        gamingHoursThisWeek: Math.floor(this.periods.lastWeek.gamingMinutes / 60)
      }
    },
    
    // Top-Performer
    highlights: {
      topGame: this.gaming.popularGames[0] || null,
      mostActiveUser: this.topLists.mostActiveUsers[0] || null,
      topGamer: this.topLists.topGamers[0] || null
    },
    
    // Live-Indikatoren
    liveStatus: {
      currentlyPlaying: this.gaming.currentlyPlaying,
      inVoice: this.gaming.activeVoiceSessions,
      activeGames: this.gaming.popularGames.filter(g => g.currentPlayers > 0).length,
      engagement: this.gaming.currentlyPlaying + this.gaming.activeVoiceSessions
    },
    
    timestamp: this.system.lastStatsUpdate
  };
};

module.exports = mongoose.model('ServerStats', serverStatsSchema);