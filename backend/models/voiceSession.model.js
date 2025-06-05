// backend/models/voiceSession.model.js
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
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // in Minuten
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  // Metadaten
  metadata: {
    botRestart: { type: Boolean, default: false },
    userLeft: { type: Boolean, default: false },
    channelSwitch: { type: Boolean, default: false }
  }
}, { 
  timestamps: true 
});

// Index für Performance
voiceSessionSchema.index({ discordUserId: 1, isActive: 1 });
voiceSessionSchema.index({ startTime: -1 });

// Methode zum Beenden einer Session
voiceSessionSchema.methods.endSession = async function(reason = 'left') {
  if (!this.isActive) return this.duration;
  
  this.endTime = new Date();
  this.duration = Math.floor((this.endTime - this.startTime) / 1000 / 60); // Minuten
  this.isActive = false;
  this.metadata.userLeft = reason === 'left';
  this.metadata.channelSwitch = reason === 'switch';
  this.metadata.botRestart = reason === 'restart';
  
  await this.save();
  return this.duration;
};

// Statische Methode zum Abrufen aktiver Sessions
voiceSessionSchema.statics.getActiveSessions = function() {
  return this.find({ isActive: true });
};

// Statische Methode zum Beenden aller aktiven Sessions (bei Bot-Restart)
voiceSessionSchema.statics.endAllActiveSessions = async function(reason = 'restart') {
  const activeSessions = await this.find({ isActive: true });
  let totalMinutes = 0;
  
  for (const session of activeSessions) {
    const duration = await session.endSession(reason);
    totalMinutes += duration;
  }
  
  return { count: activeSessions.length, totalMinutes };
};

module.exports = mongoose.model('VoiceSession', voiceSessionSchema);