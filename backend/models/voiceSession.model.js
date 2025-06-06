// backend/models/voiceSession.model.js - OPTIMIERT für minimale DB-Größe
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const voiceSessionSchema = new Schema({
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
  channelId: {
    type: String,
    required: true
  },
  channelName: {
    type: String,
    required: true
  },
  guildId: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  // Nur für aktive Sessions - kein endTime oder duration gespeichert
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, { 
  timestamps: true 
});

// Compound Index für Performance - nur aktive Sessions
voiceSessionSchema.index({ discordUserId: 1, isActive: 1 });
voiceSessionSchema.index({ isActive: 1, startTime: 1 });

// Methode zum Beenden einer Session - LÖSCHT die Session nach Stats-Update
voiceSessionSchema.methods.endSessionAndDelete = async function(reason = 'left') {
  if (!this.isActive) return 0;
  
  const endTime = new Date();
  const duration = Math.floor((endTime - this.startTime) / 1000 / 60); // Minuten
  
  // User-Stats SOFORT aktualisieren
  if (duration > 0) {
    const User = require('./user.model');
    await User.findByIdAndUpdate(this.userId, {
      $inc: { 'stats.voiceMinutes': duration },
      $set: { 'stats.lastSeen': endTime }
    });
    
    console.log(`🎤 Voice session ended: ${duration} minutes added to user stats`);
  }
  
  // UserActivity für Tracking loggen (optional, für detaillierte Logs)
  const UserActivity = require('./userActivity.model');
  await UserActivity.create({
    userId: this.userId,
    activityType: 'VOICE_LEAVE',
    metadata: {
      channelId: this.channelId,
      channelName: this.channelName,
      duration: duration,
      reason: reason
    }
  });
  
  // Session LÖSCHEN (nicht deaktivieren!)
  await this.deleteOne();
  
  return duration;
};

// Statische Methode zum Abrufen aller aktiven Sessions
voiceSessionSchema.statics.getActiveSessions = function() {
  return this.find({ isActive: true }).populate('userId', 'username discordId');
};

// Statische Methode zum Beenden aller aktiven Sessions und LÖSCHEN
voiceSessionSchema.statics.endAllActiveSessionsAndCleanup = async function(reason = 'restart') {
  const activeSessions = await this.find({ isActive: true }).populate('userId');
  let totalMinutes = 0;
  let processedCount = 0;
  
  console.log(`🔄 Processing ${activeSessions.length} active voice sessions...`);
  
  for (const session of activeSessions) {
    try {
      const duration = await session.endSessionAndDelete(reason);
      totalMinutes += duration;
      processedCount++;
      
      if (processedCount % 10 === 0) {
        console.log(`   📊 Processed ${processedCount}/${activeSessions.length} sessions`);
      }
    } catch (error) {
      console.error(`❌ Error processing session for user ${session.userId?.username}:`, error.message);
    }
  }
  
  console.log(`✅ Cleanup completed: ${processedCount} sessions processed, ${totalMinutes} total minutes`);
  
  return { count: processedCount, totalMinutes };
};

// Statische Methode für Statistiken (ohne historische Sessions)
voiceSessionSchema.statics.getCurrentStats = async function() {
  try {
    const activeCount = await this.countDocuments({ isActive: true });
    
    // Channel-Verteilung der aktiven Sessions
    const channelStats = await this.aggregate([
      { $match: { isActive: true } },
      { 
        $group: {
          _id: { channelId: '$channelId', channelName: '$channelName' },
          userCount: { $sum: 1 },
          avgDuration: { 
            $avg: { 
              $divide: [
                { $subtract: [new Date(), '$startTime'] },
                60000 // Millisekunden zu Minuten
              ]
            }
          }
        }
      },
      { $sort: { userCount: -1 } }
    ]);
    
    return {
      activeSessionsCount: activeCount,
      channelDistribution: channelStats,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error getting current voice stats:', error);
    return null;
  }
};

// Middleware für automatische Bereinigung sehr alter Sessions (Failsafe)
voiceSessionSchema.pre('save', function(next) {
  // Wenn eine Session älter als 24 Stunden ist, automatisch beenden
  // (sollte normalerweise nicht passieren, aber als Failsafe)
  const now = new Date();
  const sessionAge = now - this.startTime;
  const maxAge = 24 * 60 * 60 * 1000; // 24 Stunden
  
  if (sessionAge > maxAge) {
    console.warn(`⚠️  Found session older than 24h for user ${this.discordUserId}, will be cleaned up`);
    // Diese Session wird beim nächsten Cleanup automatisch beendet
  }
  
  next();
});

module.exports = mongoose.model('VoiceSession', voiceSessionSchema);