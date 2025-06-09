// backend/models/serverStats.model.js - ENHANCED mit echten Homepage-Metriken
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
    
    // Gaming-Statistiken aus GameStats
    totalGamesPlayed: { type: Number, default: 0 }, // Sessions aus User.stats
    totalGamingSessions: { type: Number, default: 0 }, // Sessions aus GameStats
    totalGamingMinutes: { type: Number, default: 0 }, // Minuten aus GameStats
    uniqueGamesPlayed: { type: Number, default: 0 }, // Anzahl verschiedener Spiele
    currentlyPlaying: { type: Number, default: 0 }, // Aktuell spielende User
    
    // Top Games mit aktuellen Statistiken
    popularGames: [{
      name: { type: String, required: true },
      sessions: { type: Number, default: 0 },
      players: { type: Number, default: 0 },
      totalHours: { type: Number, default: 0 },
      hoursThisWeek: { type: Number, default: 0 },
      currentPlayers: { type: Number, default: 0 },
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

  // ✅ NEU: Homepage-spezifische Metriken
  homepage: {
    // Server Uptime seit Gründung
    serverFoundedDate: { type: Date, default: () => new Date('2024-01-15') }, // Anpassbar
    
    // Bot Commands (für mögliche zukünftige Nutzung)
    totalBotCommands: { type: Number, default: 0 },
    botCommandsThisWeek: { type: Number, default: 0 },
    
    // Channel-Aktivität
    totalActiveChannels: { type: Number, default: 0 },
    
    // Community-Projekte/Achievements
    communityAchievements: { type: Number, default: 0 }
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
    // Gaming-spezifische System-Info
    gamingStatsEnabled: { type: Boolean, default: true },
    lastGameStatsUpdate: { type: Date, default: Date.now }
  },

  periods: {
    lastHour: {
      messages: { type: Number, default: 0 },
      voiceMinutes: { type: Number, default: 0 },
      gamingMinutes: { type: Number, default: 0 },
      newMembers: { type: Number, default: 0 }
    },
    lastDay: {
      messages: { type: Number, default: 0 },
      voiceMinutes: { type: Number, default: 0 },
      gamingMinutes: { type: Number, default: 0 },
      newMembers: { type: Number, default: 0 },
      peakConcurrentVoice: { type: Number, default: 0 },
      peakConcurrentGaming: { type: Number, default: 0 }
    },
    lastWeek: {
      messages: { type: Number, default: 0 },
      voiceMinutes: { type: Number, default: 0 },
      gamingMinutes: { type: Number, default: 0 },
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

// ✅ NEU: Virtuelles Feld für Server Uptime
serverStatsSchema.virtual('homepage.serverUptimeDays').get(function() {
  const foundedDate = this.homepage.serverFoundedDate || new Date('2024-01-15');
  const now = new Date();
  return Math.floor((now.getTime() - foundedDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Indexes
serverStatsSchema.index({ identifier: 1 });
serverStatsSchema.index({ 'system.lastStatsUpdate': -1 });

serverStatsSchema.statics.getCurrentStats = async function() {
  let stats = await this.findOne({ identifier: 'global' });
  
  if (!stats) {
    stats = await this.create({
      identifier: 'global',
      homepage: {
        serverFoundedDate: new Date('2024-01-15'), // Setze dein echtes Gründungsdatum
        totalBotCommands: 0,
        totalActiveChannels: 0,
        communityAchievements: 0
      }
    });
    console.log('📊 Created initial server stats document with homepage metrics');
  }
  
  return stats;
};

// ✅ COMPLETELY REWRITTEN: Server Stats Update mit Homepage-Metriken
serverStatsSchema.statics.updateServerStats = async function() {
  try {
    console.log('🔄 Updating server stats with homepage metrics...');
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
            totalGamesPlayed: { $sum: '$stats.gamesPlayed' },
            totalMessages: { $sum: '$stats.messagesCount' },
            totalEventsAttended: { $sum: '$stats.eventsAttended' }
          }
        }
      ]),
      GameStats.aggregate([
        {
          $group: {
            _id: null,
            totalGamingSessions: { $sum: '$stats.totalSessions' },
            totalGamingMinutes: { $sum: '$stats.totalMinutes' },
            uniqueGamesPlayed: { $sum: 1 },
            currentlyPlaying: { $sum: '$currentActivity.currentPlayers' },
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

    // ✅ NEU: Homepage-spezifische Berechnungen
    const [
      totalBotCommands,
      activeChannelsStats,
      messagesThisWeek,
      messagesThisMonth
    ] = await Promise.all([
      // Bot Commands aus UserActivity
      UserActivity.countDocuments({
        activityType: { $in: ['BOT_COMMAND', 'SLASH_COMMAND'] }
      }),
      
      // Aktive Channels (basierend auf Voice/Message Aktivität)
      UserActivity.aggregate([
        {
          $match: {
            'metadata.channelId': { $exists: true },
            timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: '$metadata.channelId'
          }
        }
      ]),
      
      // Nachrichten für Zeiträume
      UserActivity.countDocuments({
        activityType: 'MESSAGE',
        timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      UserActivity.countDocuments({
        activityType: 'MESSAGE',
        timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // ✅ Popular Games aus GameStats
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

    // ✅ Stats-Objekt aktualisieren
    stats.community = {
      totalMembers,
      activeMembers,
      newMembersToday,
      newMembersThisWeek,
      newMembersThisMonth
    };

    stats.gaming = {
      totalVoiceMinutes: userTotals.totalVoiceMinutes,
      activeVoiceSessions,
      totalGamesPlayed: userTotals.totalGamesPlayed,
      totalGamingSessions: gameTotals.totalGamingSessions,
      totalGamingMinutes: gameTotals.totalGamingMinutes,
      uniqueGamesPlayed: gameTotals.uniqueGamesPlayed,
      currentlyPlaying: gameTotals.currentlyPlaying,
      popularGames: popularGames
    };

    stats.communication = {
      totalMessages: userTotals.totalMessages,
      messagesThisWeek,
      messagesThisMonth,
      averageMessagesPerDay: Math.floor(messagesThisMonth / 30),
      activeChannels: activeChannelsStats.length
    };

    // ✅ NEU: Homepage-Metriken aktualisieren
    stats.homepage = {
      serverFoundedDate: stats.homepage.serverFoundedDate || new Date('2024-01-15'),
      totalBotCommands: totalBotCommands,
      botCommandsThisWeek: 0, // Könnte aus UserActivity berechnet werden
      totalActiveChannels: activeChannelsStats.length,
      communityAchievements: 0 // Manuell oder basierend auf Events
    };

    stats.events = {
      totalEventsAttended: userTotals.totalEventsAttended,
      eventParticipationRate: totalMembers > 0 ? Math.floor((userTotals.totalEventsAttended / totalMembers) * 100) : 0
    };

    stats.topLists = {
      mostActiveUsers: mostActiveUsers.slice(0, 5),
      topGamers: topGamers.slice(0, 5)
    };

    // Zeitraum-Statistiken
    stats.periods = {
      lastHour: {
        messages: 0,
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
        voiceMinutes: 0,
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
    console.log(`✅ Enhanced server stats with homepage metrics updated in ${updateTime}ms`);
    console.log(`📊 Homepage Stats Summary:`);
    console.log(`   👥 Members: ${totalMembers} total, ${activeMembers} active`);
    console.log(`   💬 Messages: ${userTotals.totalMessages} total`);
    console.log(`   🎤 Voice: ${Math.floor(userTotals.totalVoiceMinutes/60)}h total`);
    console.log(`   📅 Server Uptime: ${Math.floor((Date.now() - stats.homepage.serverFoundedDate.getTime()) / (1000 * 60 * 60 * 24))} days`);
    console.log(`   🤖 Bot Commands: ${totalBotCommands} total`);
    console.log(`   📺 Active Channels: ${activeChannelsStats.length}`);
    
    return stats;
  } catch (error) {
    console.error('❌ Error updating enhanced server stats:', error);
    throw error;
  }
};

// Bestehende Methoden beibehalten...
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

serverStatsSchema.statics.generateTopGamers = async function() {
  try {
    const User = require('./user.model');
    const UserActivity = require('./userActivity.model');
    
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
    
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    for (const gamer of topGamers) {
      try {
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

// ✅ ENHANCED: Homepage-Stats mit echten Daten
serverStatsSchema.methods.getHomepageStats = function() {
  return {
    members: {
      total: this.community.totalMembers,
      active: this.community.activeMembers,
      newThisWeek: this.community.newMembersThisWeek
    },
    activity: {
      // ✅ Echte Homepage-Metriken
      totalMessages: this.communication.totalMessages,
      totalVoiceHours: Math.floor(this.gaming.totalVoiceMinutes / 60),
      totalVoiceMinutes: this.gaming.totalVoiceMinutes,
      activeVoiceSessions: this.gaming.activeVoiceSessions,
      
      // Gaming-Aktivität
      gamesPlayed: this.gaming.totalGamesPlayed,
      totalGamingSessions: this.gaming.totalGamingSessions,
      totalGamingHours: Math.floor(this.gaming.totalGamingMinutes / 60),
      uniqueGamesPlayed: this.gaming.uniqueGamesPlayed,
      currentlyPlaying: this.gaming.currentlyPlaying,
      
      // ✅ Server Uptime (virtuelles Feld)
      serverUptimeDays: this.homepage.serverUptimeDays,
      
      // Events
      totalEventsAttended: this.events.totalEventsAttended
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

module.exports = mongoose.model('ServerStats', serverStatsSchema);