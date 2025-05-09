// Benutzermodell
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
    default: ['member']
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);