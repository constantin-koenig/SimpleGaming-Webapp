// backend/models/userActivity.model.js - FIXED: Mit Gaming-Support
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userActivitySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // ✅ ENHANCED: Erweiterte Activity-Types für Gaming
  activityType: {
    type: String,
    required: true,
    enum: [
      // Bestehende Activity-Types
      'MESSAGE',
      'VOICE_JOIN',
      'VOICE_LEAVE',
      'VOICE_SWITCH',
      'SERVER_JOIN',
      'SERVER_LEAVE',
      'EVENT_JOINED',
      'EVENT_LEFT',
      'EVENT_WON',
      
      // ✅ NEW: Gaming Activity-Types
      'GAME_START',
      'GAME_END',
      'GAME_SWITCH',
      'PRESENCE_UPDATE'
    ],
    index: true
  },
  
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // ✅ ENHANCED: Erweiterte Metadata für Gaming-Activities
  metadata: {
    // Voice-bezogene Metadaten
    channelId: String,
    channelName: String,
    guildId: String,
    duration: Number, // Minuten
    
    // ✅ Gaming-bezogene Metadaten
    gameName: String,
    gameType: String, // ActivityType.Playing, ActivityType.Streaming
    fromGame: String, // Bei GAME_SWITCH
    toGame: String,   // Bei GAME_SWITCH
    sessionId: String,
    
    // Message-bezogene Metadaten
    messageLength: Number,
    hasAttachments: Boolean,
    
    // Event-bezogene Metadaten
    eventId: String,
    eventName: String,
    
    // Server-bezogene Metadaten
    guildName: String,
    
    // Zusätzliche Daten
    details: Schema.Types.Mixed
  }
}, { 
  timestamps: true 
});

// Compound Indexes für Performance
userActivitySchema.index({ userId: 1, timestamp: -1 });
userActivitySchema.index({ userId: 1, activityType: 1, timestamp: -1 });
userActivitySchema.index({ activityType: 1, timestamp: -1 });
userActivitySchema.index({ timestamp: -1 });

// ✅ ENHANCED: Gaming-spezifische Methoden
userActivitySchema.statics.getActivityStats = async function(userId, timeframe = 'month') {
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
    case 'all':
      dateFilter = {}; // Keine Zeitbegrenzung
      break;
  }
  
  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        ...(Object.keys(dateFilter).length > 0 && { timestamp: dateFilter })
      }
    },
    {
      $group: {
        _id: '$activityType',
        count: { $sum: 1 },
        totalDuration: { 
          $sum: { 
            $cond: [
              { $ifNull: ['$metadata.duration', false] },
              '$metadata.duration',
              0
            ]
          }
        },
        lastActivity: { $max: '$timestamp' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// ✅ ENHANCED: Gaming-Aktivitäten abrufen
userActivitySchema.statics.getGamingActivities = async function(userId, timeframe = 'month', limit = 20) {
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
  
  return await this.find({
    userId: mongoose.Types.ObjectId(userId),
    activityType: { $in: ['GAME_START', 'GAME_END', 'GAME_SWITCH'] },
    ...(Object.keys(dateFilter).length > 0 && { timestamp: dateFilter })
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .select('activityType metadata timestamp');
};

// ✅ Top Gaming-User ermitteln
userActivitySchema.statics.getTopGamingUsers = async function(timeframe = 'month', limit = 10) {
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
  
  return await this.aggregate([
    {
      $match: {
        activityType: { $in: ['GAME_START', 'GAME_END', 'GAME_SWITCH'] },
        'metadata.gameName': { $exists: true },
        ...(Object.keys(dateFilter).length > 0 && { timestamp: dateFilter })
      }
    },
    {
      $group: {
        _id: '$userId',
        gamingSessions: { $sum: 1 },
        totalGamingMinutes: { 
          $sum: { 
            $cond: [
              { $and: [
                { $eq: ['$activityType', 'GAME_END'] },
                { $ifNull: ['$metadata.duration', false] }
              ]},
              '$metadata.duration',
              0
            ]
          }
        },
        uniqueGames: { $addToSet: '$metadata.gameName' },
        lastGamingActivity: { $max: '$timestamp' }
      }
    },
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
        userId: '$_id',
        username: '$user.username',
        avatar: '$user.avatar',
        gamingSessions: 1,
        totalGamingHours: { $divide: ['$totalGamingMinutes', 60] },
        uniqueGamesCount: { $size: '$uniqueGames' },
        lastGamingActivity: 1
      }
    },
    { $sort: { totalGamingHours: -1, gamingSessions: -1 } },
    { $limit: limit }
  ]);
};

// Top aktive User (bestehende Methode erweitert)
userActivitySchema.statics.getTopActiveUsers = async function(timeframe = 'month', limit = 10) {
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
  
  return await this.aggregate([
    {
      $match: {
        ...(Object.keys(dateFilter).length > 0 && { timestamp: dateFilter })
      }
    },
    {
      $group: {
        _id: '$userId',
        totalActivities: { $sum: 1 },
        // ✅ Verschiedene Activity-Typen zählen
        messageCount: {
          $sum: { $cond: [{ $eq: ['$activityType', 'MESSAGE'] }, 1, 0] }
        },
        voiceActivities: {
          $sum: { $cond: [{ $in: ['$activityType', ['VOICE_JOIN', 'VOICE_LEAVE']] }, 1, 0] }
        },
        gamingActivities: {
          $sum: { $cond: [{ $in: ['$activityType', ['GAME_START', 'GAME_END', 'GAME_SWITCH']] }, 1, 0] }
        },
        lastActivity: { $max: '$timestamp' }
      }
    },
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
        userId: '$_id',
        username: '$user.username',
        avatar: '$user.avatar',
        totalActivities: 1,
        messageCount: 1,
        voiceActivities: 1,
        gamingActivities: 1,
        lastActivity: 1,
        // ✅ Activity-Score berechnen (Gaming wird höher gewichtet)
        activityScore: {
          $add: [
            '$messageCount',
            { $multiply: ['$voiceActivities', 2] },
            { $multiply: ['$gamingActivities', 3] }
          ]
        }
      }
    },
    { $sort: { activityScore: -1, totalActivities: -1 } },
    { $limit: limit }
  ]);
};

// Aktivitätstrends über Zeit
userActivitySchema.statics.getActivityTrends = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        totalCount: { $sum: 1 },
        messageCount: {
          $sum: { $cond: [{ $eq: ['$activityType', 'MESSAGE'] }, 1, 0] }
        },
        voiceCount: {
          $sum: { $cond: [{ $in: ['$activityType', ['VOICE_JOIN', 'VOICE_LEAVE']] }, 1, 0] }
        },
        gamingCount: {
          $sum: { $cond: [{ $in: ['$activityType', ['GAME_START', 'GAME_END', 'GAME_SWITCH']] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        totalCount: 1,
        messageCount: 1,
        voiceCount: 1,
        gamingCount: 1
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// ✅ NEW: Gaming-Session-Statistiken
userActivitySchema.statics.getGamingSessionStats = async function(userId, timeframe = 'month') {
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
  
  return await this.aggregate([
    {
      $match: {
        userId: mongoose.Types.ObjectId(userId),
        activityType: 'GAME_END',
        'metadata.gameName': { $exists: true },
        'metadata.duration': { $exists: true, $gt: 0 },
        ...(Object.keys(dateFilter).length > 0 && { timestamp: dateFilter })
      }
    },
    {
      $group: {
        _id: '$metadata.gameName',
        sessionsCount: { $sum: 1 },
        totalMinutes: { $sum: '$metadata.duration' },
        totalHours: { $sum: { $divide: ['$metadata.duration', 60] } },
        averageSessionLength: { $avg: '$metadata.duration' },
        lastPlayed: { $max: '$timestamp' }
      }
    },
    {
      $project: {
        _id: 0,
        gameName: '$_id',
        sessionsCount: 1,
        totalMinutes: 1,
        totalHours: { $round: ['$totalHours', 1] },
        averageSessionLength: { $round: ['$averageSessionLength', 1] },
        lastPlayed: 1
      }
    },
    { $sort: { totalHours: -1, sessionsCount: -1 } }
  ]);
};

module.exports = mongoose.model('UserActivity', userActivitySchema);