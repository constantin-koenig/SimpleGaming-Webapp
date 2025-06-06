// 1. ENHANCED Gaming Activity Model
// backend/models/gamingActivity.model.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gamingActivitySchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  discordUserId: {
    type: String,
    required: true,
    index: true
  },
  gameName: {
    type: String,
    required: true,
    index: true
  },
  // Normalisierter Spielname für bessere Gruppierung
  gameNameNormalized: {
    type: String,
    required: true,
    index: true
  },
  activityType: {
    type: String,
    enum: ['PLAYING', 'STREAMING'],
    default: 'PLAYING'
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // Minuten
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  // Session-spezifische Daten
  sessionData: {
    platform: String, // Discord, Steam, etc.
    details: String, // z.B. "Playing Solo", "In Lobby"
    state: String, // z.B. Level, Rank
    largeImageKey: String,
    smallImageKey: String
  }
}, { 
  timestamps: true 
});

// Compound Indexes für bessere Performance
gamingActivitySchema.index({ gameNameNormalized: 1, isActive: 1 });
gamingActivitySchema.index({ userId: 1, isActive: 1 });
gamingActivitySchema.index({ startTime: -1, gameNameNormalized: 1 });

// Middleware: Spielname normalisieren
gamingActivitySchema.pre('save', function(next) {
  if (this.gameName) {
    // Normalisierung für bessere Gruppierung
    this.gameNameNormalized = this.gameName
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Sonderzeichen entfernen
      .replace(/\s+/g, '_') // Leerzeichen durch Underscores
      .trim();
  }
  next();
});

// Session beenden und Statistiken aktualisieren
gamingActivitySchema.methods.endSession = async function() {
  if (!this.isActive) return 0;
  
  const endTime = new Date();
  const duration = Math.floor((endTime - this.startTime) / 1000 / 60); // Minuten
  
  this.endTime = endTime;
  this.duration = duration;
  this.isActive = false;
  
  await this.save();
  
  // User-Statistiken aktualisieren
  if (duration > 0) {
    const User = require('./user.model');
    await User.findByIdAndUpdate(this.userId, {
      $inc: { 
        'stats.gamesPlayed': 1,
        'stats.totalGamingMinutes': duration
      },
      $set: { 'stats.lastSeen': endTime },
      $addToSet: { 'preferences.favoriteGames': this.gameName }
    });
    
    console.log(`🎮 Gaming session ended: ${this.gameName} - ${duration} minutes`);
  }
  
  return duration;
};

// Statische Methoden für Gaming-Statistiken
gamingActivitySchema.statics.getPopularGames = async function(timeframe = 'month', limit = 10) {
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
        duration: { $gt: 0 }, // Nur beendete Sessions
        ...(Object.keys(dateFilter).length > 0 && { startTime: dateFilter })
      }
    },
    {
      $group: {
        _id: '$gameNameNormalized',
        originalName: { $first: '$gameName' },
        totalSessions: { $sum: 1 },
        totalMinutes: { $sum: '$duration' },
        totalHours: { $sum: { $divide: ['$duration', 60] } },
        uniquePlayers: { $addToSet: '$userId' },
        lastPlayed: { $max: '$startTime' },
        averageSessionLength: { $avg: '$duration' }
      }
    },
    {
      $project: {
        _id: 0,
        gameName: '$originalName',
        gameKey: '$_id',
        totalSessions: 1,
        totalMinutes: 1,
        totalHours: { $round: ['$totalHours', 1] },
        uniquePlayersCount: { $size: '$uniquePlayers' },
        lastPlayed: 1,
        averageSessionLength: { $round: ['$averageSessionLength', 1] }
      }
    },
    { $sort: { totalSessions: -1, totalMinutes: -1 } },
    { $limit: limit }
  ]);
};

gamingActivitySchema.statics.getCurrentlyPlaying = async function() {
  return await this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: '$gameNameNormalized',
        gameName: { $first: '$gameName' },
        activePlayers: { $addToSet: '$userId' },
        activeCount: { $sum: 1 },
        longestSession: { $max: { $subtract: [new Date(), '$startTime'] } }
      }
    },
    {
      $project: {
        _id: 0,
        gameName: 1,
        gameKey: '$_id',
        activePlayersCount: { $size: '$activePlayers' },
        activeSessionsCount: '$activeCount',
        longestSessionMinutes: { $divide: ['$longestSession', 60000] }
      }
    },
    { $sort: { activePlayersCount: -1 } }
  ]);
};

module.exports = mongoose.model('GamingActivity', gamingActivitySchema);