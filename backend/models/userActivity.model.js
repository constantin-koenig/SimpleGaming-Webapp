// backend/models/userActivity.model.js
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
      'MESSAGE',           // Nachricht gesendet
      'VOICE_JOIN',        // Voice Channel betreten
      'VOICE_LEAVE',       // Voice Channel verlassen
      'VOICE_SWITCH',      // Voice Channel gewechselt
      'GAME_START',        // Spiel gestartet
      'GAME_END',          // Spiel beendet
      'GAME_SWITCH',       // Spiel gewechselt
      'SERVER_JOIN',       // Server beigetreten
      'SERVER_LEAVE',      // Server verlassen
      'EVENT_JOINED',      // Event beigetreten
      'EVENT_LEFT',        // Event verlassen
      'EVENT_WON',         // Event gewonnen
      'ROLE_ADDED',        // Rolle hinzugefügt
      'ROLE_REMOVED',      // Rolle entfernt
      'REACTION_ADDED',    // Reaktion hinzugefügt
      'REACTION_REMOVED'   // Reaktion entfernt
    ],
    index: true
  },
  metadata: {
    // Flexible Datenstruktur für verschiedene Activity-Types
    type: Schema.Types.Mixed,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  // Für Leistungsoptimierung
  dayKey: {
    type: String,
    index: true
  },
  weekKey: {
    type: String,
    index: true
  },
  monthKey: {
    type: String,
    index: true
  }
}, { 
  timestamps: true,
  // TTL Index für automatisches Löschen alter Aktivitäten (nach 1 Jahr)
  expires: 365 * 24 * 60 * 60 // 1 Jahr in Sekunden
});

// Middleware für automatische Key-Generierung
userActivitySchema.pre('save', function(next) {
  const date = this.timestamp || new Date();
  
  // YYYY-MM-DD Format für Tagesstatistiken
  this.dayKey = date.toISOString().split('T')[0];
  
  // YYYY-WW Format für Wochenstatistiken
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((date - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  this.weekKey = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  
  // YYYY-MM Format für Monatsstatistiken
  this.monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  
  next();
});

// Compound Indexes für bessere Performance
userActivitySchema.index({ userId: 1, activityType: 1, timestamp: -1 });
userActivitySchema.index({ userId: 1, dayKey: 1 });
userActivitySchema.index({ userId: 1, weekKey: 1 });
userActivitySchema.index({ userId: 1, monthKey: 1 });
userActivitySchema.index({ activityType: 1, timestamp: -1 });

// Statische Methoden für Statistiken
userActivitySchema.statics.getActivityStats = async function(userId, timeframe = 'month') {
  const match = { userId: mongoose.Types.ObjectId(userId) };
  
  // Zeitraum-spezifische Filter
  const now = new Date();
  switch (timeframe) {
    case 'day':
      match.dayKey = now.toISOString().split('T')[0];
      break;
    case 'week':
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
      match.weekKey = `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
      break;
    case 'month':
      match.monthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      break;
    case 'all':
      // Keine zusätzlichen Filter
      break;
  }
  
  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$activityType',
        count: { $sum: 1 },
        lastActivity: { $max: '$timestamp' },
        totalDuration: {
          $sum: {
            $cond: {
              if: { $exists: ['$metadata.duration'] },
              then: '$metadata.duration',
              else: 0
            }
          }
        }
      }
    }
  ]);
};

userActivitySchema.statics.getTopActiveUsers = async function(timeframe = 'month', limit = 10) {
  const match = {};
  
  // Zeitraum-spezifische Filter
  const now = new Date();
  switch (timeframe) {
    case 'day':
      match.dayKey = now.toISOString().split('T')[0];
      break;
    case 'week':
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNumber = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
      match.weekKey = `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
      break;
    case 'month':
      match.monthKey = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      break;
  }
  
  return await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: '$userId',
        totalActivities: { $sum: 1 },
        lastActivity: { $max: '$timestamp' },
        activityTypes: { $addToSet: '$activityType' }
      }
    },
    { $sort: { totalActivities: -1 } },
    { $limit: limit },
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
        username: '$user.username',
        avatar: '$user.avatar',
        totalActivities: 1,
        lastActivity: 1,
        activityTypes: 1
      }
    }
  ]);
};

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
          date: '$dayKey',
          type: '$activityType'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        activities: {
          $push: {
            type: '$_id.type',
            count: '$count'
          }
        },
        totalCount: { $sum: '$count' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

module.exports = mongoose.model('UserActivity', userActivitySchema);