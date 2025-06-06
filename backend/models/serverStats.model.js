// backend/models/serverStats.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serverStatsSchema = new Schema({
  // Eindeutiger Identifier - immer 'global' für server-weite Stats
  identifier: {
    type: String,
    default: 'global',
    unique: true,
    index: true
  },
  
  // Community Zahlen
  community: {
    totalMembers: { type: Number, default: 0 },
    activeMembers: { type: Number, default: 0 }, // Aktiv in letzten 7 Tagen
    newMembersToday: { type: Number, default: 0 },
    newMembersThisWeek: { type: Number, default: 0 },
    newMembersThisMonth: { type: Number, default: 0 }
  },

  // Gaming Statistiken
  gaming: {
    totalVoiceMinutes: { type: Number, default: 0 },
    totalGamesPlayed: { type: Number, default: 0 },
    activeVoiceSessions: { type: Number, default: 0 },
    popularGames: [{
      name: { type: String, required: true },
      playCount: { type: Number, default: 0 },
      lastPlayed: { type: Date }
    }],
    voiceChannelStats: [{
      channelName: String,
      totalMinutes: Number,
      sessionsCount: Number
    }]
  },

  // Kommunikation
  communication: {
    totalMessages: { type: Number, default: 0 },
    messagesThisWeek: { type: Number, default: 0 },
    messagesThisMonth: { type: Number, default: 0 },
    averageMessagesPerDay: { type: Number, default: 0 },
    activeChannels: { type: Number, default: 0 }
  },

  // Events & Aktivitäten
  events: {
    totalEventsAttended: { type: Number, default: 0 },
    upcomingEvents: { type: Number, default: 0 },
    eventParticipationRate: { type: Number, default: 0 }, // Prozent
    mostPopularEventType: String
  },

  // Top-Listen (für Homepage Highlights)
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
      favoriteGame: String
    }]
  },

  // Performance & System
  system: {
    botUptime: { type: Number, default: 0 }, // in Stunden
    lastStatsUpdate: { type: Date, default: Date.now },
    updateFrequency: { type: String, default: '15min' }, // Wie oft Updates
    dataAccuracy: { type: String, default: '95%' } // Genauigkeit der Daten
  },

  // Zeitstempel für verschiedene Perioden
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

// Virtual field für Voice-Stunden (berechnet aus Minuten)
serverStatsSchema.virtual('gaming.voiceHours').get(function() {
  return Math.floor(this.gaming.totalVoiceMinutes / 60);
});

// Index für schnelle Abfragen
serverStatsSchema.index({ identifier: 1 });
serverStatsSchema.index({ 'system.lastStatsUpdate': -1 });

// Statische Methode zum Abrufen der aktuellen Stats
serverStatsSchema.statics.getCurrentStats = async function() {
  let stats = await this.findOne({ identifier: 'global' });
  
  if (!stats) {
    // Erstelle initiale Stats wenn nicht vorhanden
    stats = await this.create({
      identifier: 'global'
    });
    console.log('📊 Created initial server stats document');
  }
  
  return stats;
};

// Statische Methode zum Aktualisieren der Stats
serverStatsSchema.statics.updateServerStats = async function() {
  try {
    console.log('🔄 Updating server stats...');
    const startTime = Date.now();
    
    const User = require('./user.model');
    const UserActivity = require('./userActivity.model');
    const VoiceSession = require('./voiceSession.model');
    
    // Aktuelle Stats holen oder erstellen
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

    // Gaming Stats aggregieren
    const gamingStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalVoiceMinutes: { $sum: '$stats.voiceMinutes' },
          totalGamesPlayed: { $sum: '$stats.gamesPlayed' },
          totalMessages: { $sum: '$stats.messagesCount' },
          totalEventsAttended: { $sum: '$stats.eventsAttended' }
        }
      }
    ]);
    
    const totals = gamingStats[0] || {
      totalVoiceMinutes: 0,
      totalGamesPlayed: 0,
      totalMessages: 0,
      totalEventsAttended: 0
    };

    // Aktive Voice Sessions
    const activeVoiceSessions = await VoiceSession.countDocuments({ isActive: true });

    // Top-Listen generieren
    const mostActiveUsers = await this.generateTopActiveUsers();
    const topGamers = await this.generateTopGamers();
    
    // Popular Games aus Activities
    const popularGames = await this.generatePopularGames();

    // Nachrichten-Statistiken für Zeiträume
    const messagesThisWeek = await UserActivity.countDocuments({
      activityType: 'MESSAGE',
      timestamp: { $gte: oneWeekAgo }
    });
    
    const messagesThisMonth = await UserActivity.countDocuments({
      activityType: 'MESSAGE',
      timestamp: { $gte: oneMonthAgo }
    });

    // Stats-Objekt aktualisieren
    stats.community = {
      totalMembers,
      activeMembers,
      newMembersToday,
      newMembersThisWeek,
      newMembersThisMonth
    };

    stats.gaming = {
      totalVoiceMinutes: totals.totalVoiceMinutes,
      totalGamesPlayed: totals.totalGamesPlayed,
      activeVoiceSessions,
      popularGames: popularGames.slice(0, 10) // Top 10
    };

    stats.communication = {
      totalMessages: totals.totalMessages,
      messagesThisWeek,
      messagesThisMonth,
      averageMessagesPerDay: Math.floor(messagesThisMonth / 30)
    };

    stats.events = {
      totalEventsAttended: totals.totalEventsAttended,
      eventParticipationRate: totalMembers > 0 ? Math.floor((totals.totalEventsAttended / totalMembers) * 100) : 0
    };

    stats.topLists = {
      mostActiveUsers: mostActiveUsers.slice(0, 5),
      topGamers: topGamers.slice(0, 5)
    };

    stats.system = {
      lastStatsUpdate: new Date(),
      updateFrequency: '15min',
      dataAccuracy: '98%'
    };

    // Speichern
    await stats.save();
    
    const updateTime = Date.now() - startTime;
    console.log(`✅ Server stats updated in ${updateTime}ms`);
    console.log(`📊 Stats: ${totalMembers} members, ${activeMembers} active, ${Math.floor(totals.totalVoiceMinutes/60)}h voice`);
    
    return stats;
  } catch (error) {
    console.error('❌ Error updating server stats:', error);
    throw error;
  }
};

// Helper: Top aktive User generieren
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
          _id: 0, // _id ausschließen
          username: '$user.username',
          avatar: '$user.avatar',
          activityScore: '$activityCount',
          lastSeen: '$user.stats.lastSeen'
        }
      }
    ]);
    
    // Nur User mit gültigen Daten zurückgeben
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

// Helper: Top Gamer generieren
serverStatsSchema.statics.generateTopGamers = async function() {
  try {
    const User = require('./user.model');
    
    const topGamers = await User.aggregate([
      {
        $match: {
          'stats.gamesPlayed': { $gt: 0 }
        }
      },
      {
        $project: {
          _id: 0, // _id ausschließen
          username: 1,
          avatar: 1,
          gamesPlayed: '$stats.gamesPlayed',
          favoriteGame: { $arrayElemAt: ['$preferences.favoriteGames', 0] }
        }
      },
      { $sort: { gamesPlayed: -1 } },
      { $limit: 10 }
    ]);
    
    // Nur Gamer mit gültigen Daten
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

// Helper: Beliebte Spiele generieren
serverStatsSchema.statics.generatePopularGames = async function() {
  try {
    const UserActivity = require('./userActivity.model');
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const popularGames = await UserActivity.aggregate([
      {
        $match: {
          activityType: { $in: ['GAME_START', 'GAME_END'] },
          timestamp: { $gte: oneMonthAgo },
          'metadata.gameName': { $exists: true, $ne: null, $ne: '' }
        }
      },
      {
        $group: {
          _id: '$metadata.gameName',
          playCount: { $sum: 1 },
          lastPlayed: { $max: '$timestamp' }
        }
      },
      {
        $project: {
          _id: 0, // Wichtig: _id ausschließen um Mongoose-Konflikt zu vermeiden
          name: '$_id',
          playCount: 1,
          lastPlayed: 1
        }
      },
      { $sort: { playCount: -1 } },
      { $limit: 15 }
    ]);
    
    // Zusätzliche Bereinigung: Nur gültige Spiele
    return popularGames.filter(game => 
      game.name && 
      typeof game.name === 'string' && 
      game.name.length > 0 &&
      game.name !== 'Unknown' &&
      !game.name.includes('Visual Studio') // Dev-Tools ausschließen
    );
  } catch (error) {
    console.error('Error generating popular games:', error);
    return [];
  }
};

// Methode für kompakte Homepage-Stats
serverStatsSchema.methods.getHomepageStats = function() {
  return {
    members: {
      total: this.community.totalMembers,
      active: this.community.activeMembers,
      newThisWeek: this.community.newMembersThisWeek
    },
    activity: {
      totalVoiceHours: Math.floor(this.gaming.totalVoiceMinutes / 60), // Berechnet aus Minuten
      totalVoiceMinutes: this.gaming.totalVoiceMinutes,
      totalMessages: this.communication.totalMessages,
      activeVoiceSessions: this.gaming.activeVoiceSessions,
      gamesPlayed: this.gaming.totalGamesPlayed
    },
    highlights: {
      topUsers: this.topLists.mostActiveUsers.slice(0, 3),
      popularGames: this.gaming.popularGames.slice(0, 5)
    },
    lastUpdate: this.system.lastStatsUpdate
  };
};

module.exports = mongoose.model('ServerStats', serverStatsSchema);