// backend/models/userActivity.model.js - FIXED: ObjectId Probleme behoben
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userActivitySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  activityType: {
    type: String,
    required: true,
    enum: [
      'MESSAGE',
      'VOICE_JOIN',
      'VOICE_LEAVE',
      'VOICE_SWITCH',
      'SERVER_JOIN',
      'SERVER_LEAVE',
      'EVENT_JOINED',
      'EVENT_LEFT',
      'EVENT_WON',
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
  
  metadata: {
    channelId: String,
    channelName: String,
    guildId: String,
    duration: Number,
    gameName: String,
    gameType: String,
    fromGame: String,
    toGame: String,
    sessionId: String,
    messageLength: Number,
    hasAttachments: Boolean,
    eventId: String,
    eventName: String,
    guildName: String,
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

// ✅ FIXED: Gaming-Session-Statistiken mit korrektem ObjectId
userActivitySchema.statics.getGamingSessionStats = async function(userId, timeframe = 'month') {
  const now = new Date();
  let dateFilter = {};
  
  switch(timeframe) {
    case 'day':
      dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      break;
    case 'week':
    case 'weekly':
      dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      break;
    case 'month':
    case 'monthly':
      dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
      break;
  }
  
  // ✅ FIX: Korrekte ObjectId Konvertierung
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  return await this.aggregate([
    {
      $match: {
        userId: userObjectId,
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

// ✅ FIXED: Gaming-Aktivitäten abrufen mit korrektem ObjectId
userActivitySchema.statics.getGamingActivities = async function(userId, timeframe = 'month', limit = 20) {
  const now = new Date();
  let dateFilter = {};
  
  switch(timeframe) {
    case 'day':
      dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      break;
    case 'week':
    case 'weekly':
      dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      break;
    case 'month':
    case 'monthly':
      dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
      break;
  }
  
  // ✅ FIX: Korrekte ObjectId Konvertierung
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  return await this.find({
    userId: userObjectId,
    activityType: { $in: ['GAME_START', 'GAME_END', 'GAME_SWITCH'] },
    ...(Object.keys(dateFilter).length > 0 && { timestamp: dateFilter })
  })
  .sort({ timestamp: -1 })
  .limit(limit)
  .select('activityType metadata timestamp');
};

// ✅ FIXED: Activity Stats mit korrektem ObjectId
userActivitySchema.statics.getActivityStats = async function(userId, timeframe = 'month') {
  const now = new Date();
  let dateFilter = {};
  
  switch(timeframe) {
    case 'day':
      dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      break;
    case 'week':
    case 'weekly':
      dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      break;
    case 'month':
    case 'monthly':
      dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
      break;
    case 'all':
      dateFilter = {};
      break;
  }
  
  // ✅ FIX: Korrekte ObjectId Konvertierung
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  return await this.aggregate([
    {
      $match: {
        userId: userObjectId,
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

// ✅ FIXED: Activity Trends mit korrektem ObjectId
userActivitySchema.statics.getActivityTrends = async function(userId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  // ✅ FIX: Korrekte ObjectId Konvertierung
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  return await this.aggregate([
    {
      $match: {
        userId: userObjectId,
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

// ✅ FIXED: Top Gaming Users mit korrektem ObjectId
userActivitySchema.statics.getTopGamingUsers = async function(timeframe = 'month', limit = 10) {
  const now = new Date();
  let dateFilter = {};
  
  switch(timeframe) {
    case 'day':
      dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      break;
    case 'week':
    case 'weekly':
      dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      break;
    case 'month':
    case 'monthly':
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

// ✅ FIXED: Top Active Users mit korrektem ObjectId
userActivitySchema.statics.getTopActiveUsers = async function(timeframe = 'month', limit = 10) {
  const now = new Date();
  let dateFilter = {};
  
  switch(timeframe) {
    case 'day':
      dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
      break;
    case 'week':
    case 'weekly':
      dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
      break;
    case 'month':
    case 'monthly':
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

module.exports = mongoose.model('UserActivity', userActivitySchema);