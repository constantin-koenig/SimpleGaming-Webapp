// backend/models/user.model.js - UPDATED: Metadata für Admin-Tracking
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  discordId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  discriminator: String,
  email: String,
  avatar: String,
  guilds: [Object],
  accessToken: String,
  refreshToken: String,
  roles: {
    type: [String],
    default: ['member'],
    enum: ['member', 'moderator', 'admin', 'owner'] // ✅ Erweiterte Rollen
  },
  stats: {
    messagesCount: { type: Number, default: 0 },
    voiceMinutes: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    eventsAttended: { type: Number, default: 0 },
    lastSeen: Date
  },
  preferences: {
    favoriteGames: [String],
    lookingForPlayers: { type: Boolean, default: false },
    gamingTimes: [String]
  },
  // ✅ NEU: Metadata für Admin-Tracking
  metadata: {
    firstAdmin: { type: Boolean, default: false },
    firstUser: { type: Boolean, default: false },
    adminSince: Date,
    promotedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastPromotion: Date,
    // Weitere Metadaten...
    joinSource: { type: String, default: 'discord' },
    ipAddress: String, // Optional für Security
    userAgent: String  // Optional für Security
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// ✅ Virtual für Admin-Check
userSchema.virtual('isAdmin').get(function() {
  return this.roles.includes('admin') || this.roles.includes('owner');
});

// ✅ Methode für Rollen-Management
userSchema.methods.addRole = function(role) {
  if (!this.roles.includes(role)) {
    this.roles.push(role);
  }
  return this;
};

userSchema.methods.removeRole = function(role) {
  this.roles = this.roles.filter(r => r !== role);
  return this;
};

userSchema.methods.hasRole = function(role) {
  return this.roles.includes(role);
};

// ✅ Static Method für ersten Admin-Check
userSchema.statics.needsFirstAdmin = async function() {
  const adminCount = await this.countDocuments({ roles: { $in: ['admin', 'owner'] } });
  const userCount = await this.countDocuments({});
  
  return {
    needsAdmin: adminCount === 0,
    hasUsers: userCount > 0,
    adminCount: adminCount,
    userCount: userCount
  };
};

module.exports = mongoose.model('User', userSchema);