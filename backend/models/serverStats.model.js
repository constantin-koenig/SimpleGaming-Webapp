// backend/models/serverStats.model.js - UPDATED mit GameStats Integration
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
    totalVoiceMinutes: { type: Number, default: 0 },
    totalGamesPlayed: { type: Number, default: 0 },
    activeVoiceSessions: { type: Number, default: 0 },
    // ✅ ENHANCED: Bessere Gaming-Statistiken
    totalGamingSessions: { type: Number, default: 0 },
    totalGamingHours: { type: Number, default: 0 },
    uniqueGamesPlayed: { type: Number, default: 0 },
    currentlyPlaying: { type: Number, default: 0 },
    popularGames: [{
      name: { type: String, required: true },
      playCount: { type: Number, default: 0 },
      uniquePlayers: { type: Number, default: 0 },
      totalHours: { type: Number, default: 0 },
      currentPlayers: { type: Number, default: 0 },
      category: { type: String, default: 'Game' },
      lastPlayed: { type: Date }
    }],
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
    updateFrequency: { type: String, default: '15min' },
    dataAccuracy: { type: String, default: '95%' }
  },

  periods: {
    lastHour: {
      messages: { type: Number, default: 0 },
      voiceMinutes: { type: Number, default: 0 },
      newMembers: { type: Number, default: 0 }
    },
    lastDay: {
      messages: { type: Number, default: 0 },
      voiceMinutes: { type: Number, default: 0 },
      newMembers: { type: Number, default: 0 },
      peakConcurrentVoice: { type: Number, default: 0 }
    },
    lastWeek: {
      messages: { type: Number, default: 0 },
      voiceMinutes: { type: Number, default: 0 },
      newMembers: { type: Number, default: 0 },
      averageDailyActivity: { type: Number, default: 0 }
    }
  }
}, { 
  timestamps: true 
});

serverStatsSchema.virtual('gaming.voiceHours').get(function() {
  return Math.floor(this.gaming.totalVoiceMinutes / 60);
});

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

// ✅ ENHANCED: Server Stats Update mit GameStats Integration
serverStatsSchema.statics.updateServerStats = async function() {
  try {
    console.log('🔄 Updating server stats...');
    const startTime = Date.now();
    
    const User = require('./user.model');
    const UserActivity = require('./userActivity.model');
    const VoiceSession = require('./voiceSession.model');
    const GameStats = require('./gameStats.model'); // ✅ NEU
    
    let stats = await this.getCurrentStats();
    
    // Community Stats berechnen
    const totalMembers = await User.countDocuments({});
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const activeMembers = await User.countDocuments({
      'stats.lastSeen': { $gte: sevenDaysAgo }
    });
    
    // Neue Mitglieder Zeiträume
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const newMembersToday = await User.countDocuments({
      createdAt: { $gte: oneDayAgo }
    });
    const newMembersThisWeek = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });
    const newMembersThisMonth = await User.countDocuments({
      createdAt: { $gte: oneMonthAgo }
    });

    // ✅ ENHANCED: Gaming Stats aus User + GameStats aggregieren
    const [userGamingStats, gameStatsData] = await Promise.all([
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
            currentlyPlaying: { $sum: '$currentActivity.currentPlayers' }
          }
        }
      ])
    ]);
    
    const userTotals = userGamingStats[0] || {
      totalVoiceMinutes: 0,
      totalGamesPlayed: 0,
      totalMessages: 0,
      totalEventsAttended: 0
    };

    const gameTotals = gameStatsData[0] || {
      totalGamingSessions: 0,
      totalGamingMinutes: 0,
      uniqueGamesPlayed: 0,
      currentlyPlaying: 0
    };

    // ✅ Aktive Voice Sessions
    const activeVoiceSessions = await VoiceSession.countDocuments({ isActive: true });

    // ✅ Popular Games aus GameStats holen
    const popularGames = await GameStats.getHomepageGames(10);

    // ✅ Top-Listen generieren
    const [mostActiveUsers, topGamers] = await Promise.all([
      this.generateTopActiveUsers(),
      this.generateTopGamers()
    ]);

    // Nachrichten-Statistiken für Zeiträume
    const messagesThisWeek = await UserActivity.countDocuments({
      activityType: 'MESSAGE',
      timestamp: { $gte: oneWeekAgo }
    });
    
    const messagesThisMonth = await UserActivity.countDocuments({
      activityType: 'MESSAGE',
      timestamp: { $gte: oneMonthAgo }
    });

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
      totalGamesPlayed: userTotals.totalGamesPlayed,
      activeVoiceSessions,
      // ✅ NEU: Erweiterte Gaming-Stats
      totalGamingSessions: gameTotals.totalGamingSessions,
      totalGamingHours: Math.floor(gameTotals.totalGamingMinutes / 60),
      uniqueGamesPlayed: gameTotals.uniqueGamesPlayed,
      currentlyPlaying: gameTotals.currentlyPlaying,
      popularGames: popularGames.map(game => ({
        name: game.name,
        playCount: game.sessions,
        uniquePlayers: game.players,
        totalHours: game.totalHours,
        currentPlayers: game.currentPlayers,
        category: game.category,
        lastPlayed: game.lastSeen
      }))
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

    stats.system = {
      lastStatsUpdate: new Date(),
      updateFrequency: '5min',
      dataAccuracy: '98%'
    };

    await stats.save();
    
    const updateTime = Date.now() - startTime;
    console.log(`✅ Server stats updated in ${updateTime}ms`);
    console.log(`📊 Stats: ${totalMembers} members, ${activeMembers} active, ${Math.floor(userTotals.totalVoiceMinutes/60)}h voice, ${gameTotals.currentlyPlaying} playing`);
    
    return stats;
  } catch (error) {
    console.error('❌ Error updating server stats:', error);
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

// ✅ ENHANCED: Top Gamer mit Gaming-Stunden
serverStatsSchema.statics.generateTopGamers = async function() {
  try {
    const User = require('./user.model');
    const GameStats = require('./gameStats.model');
    
    // Kombination aus User-Stats und detaillierten Gaming-Sessions
    const topGamers = await User.aggregate([
      {
        $match: {
          'stats.gamesPlayed': { $gt: 0 }
        }
      },
      {
        $project: {
          _id: 0,
          username: 1,
          avatar: 1,
          gamesPlayed: '$stats.gamesPlayed',
          favoriteGame: { $arrayElemAt: ['$preferences.favoriteGames', 0] }
        }
      },
      { $sort: { gamesPlayed: -1 } },
      { $limit: 10 }
    ]);
    
    // ✅ Gaming-Stunden aus UserActivity berechnen
    const UserActivity = require('./userActivity.model');
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    for (const gamer of topGamers) {
      try {
        const User = require('./user.model');
        const user = await User.findOne({ username: gamer.username });
        
        if (user) {
          // Gaming-Sessions-Stunden berechnen
          const gamingSessions = await UserActivity.aggregate([
            {
              $match: {
                userId: user._id,
                activityType: { $in: ['GAME_END', 'GAME_SWITCH'] },
                timestamp: { $gte: oneMonthAgo },
                'metadata.duration': { $exists: true }
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
          
          // Lieblingsspiel aus tatsächlichen Sessions ermitteln
          const favoriteGameQuery = await UserActivity.aggregate([
            {
              $match: {
                userId: user._id,
                activityType: 'GAME_START',
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

// ✅ ENHANCED: Homepage-Stats mit Gaming-Details
serverStatsSchema.methods.getHomepageStats = function() {
  return {
    members: {
      total: this.community.totalMembers,
      active: this.community.activeMembers,
      newThisWeek: this.community.newMembersThisWeek
    },
    activity: {
      totalVoiceHours: Math.floor(this.gaming.totalVoiceMinutes / 60),
      totalVoiceMinutes: this.gaming.totalVoiceMinutes,
      totalMessages: this.communication.totalMessages,
      activeVoiceSessions: this.gaming.activeVoiceSessions,
      gamesPlayed: this.gaming.totalGamesPlayed,
      // ✅ NEU: Erweiterte Gaming-Stats für Homepage
      totalGamingSessions: this.gaming.totalGamingSessions,
      totalGamingHours: this.gaming.totalGamingHours,
      uniqueGamesPlayed: this.gaming.uniqueGamesPlayed,
      currentlyPlaying: this.gaming.currentlyPlaying
    },
    highlights: {
      topUsers: this.topLists.mostActiveUsers.slice(0, 3),
      popularGames: this.gaming.popularGames.slice(0, 5),
      topGamers: this.topLists.topGamers.slice(0, 3)
    },
    lastUpdate: this.system.lastStatsUpdate
  };
};

module.exports = mongoose.model('ServerStats', serverStatsSchema);