// backend/models/gameStats.model.js - Neues Model für Game-Statistiken
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const gameStatsSchema = new Schema({
  // Eindeutiger Game-Identifier
  gameId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Game-Informationen
  gameName: {
    type: String,
    required: true,
    index: true
  },
  
  // Normalisierte Namen für bessere Suche
  normalizedName: {
    type: String,
    required: true,
    index: true
  },
  
  // Spiel-Kategorien
  category: {
    type: String,
    default: 'Game'
  },
  
  // Aggregierte Statistiken
  stats: {
    // Anzahl einzigartiger Spieler
    uniquePlayers: { type: Number, default: 0 },
    
    // Gesamte Sessions
    totalSessions: { type: Number, default: 0 },
    
    // Gesamte Spielzeit in Minuten
    totalMinutes: { type: Number, default: 0 },
    
    // Durchschnittliche Session-Länge
    averageSessionLength: { type: Number, default: 0 },
    
    // Sessions in verschiedenen Zeiträumen
    sessionsToday: { type: Number, default: 0 },
    sessionsThisWeek: { type: Number, default: 0 },
    sessionsThisMonth: { type: Number, default: 0 },
    
    // Spielzeit in verschiedenen Zeiträumen (Minuten)
    minutesToday: { type: Number, default: 0 },
    minutesThisWeek: { type: Number, default: 0 },
    minutesThisMonth: { type: Number, default: 0 }
  },
  
  // Aktuelle Aktivität
  currentActivity: {
    // Spieler die gerade spielen
    currentPlayers: { type: Number, default: 0 },
    
    // Liste der aktuell spielenden User IDs
    activePlayerIds: [{ type: String }],
    
    // Letzter Update der aktuellen Aktivität
    lastActivityUpdate: { type: Date, default: Date.now }
  },
  
  // Metadaten
  metadata: {
    // Erste Aufzeichnung
    firstSeen: { type: Date, default: Date.now },
    
    // Letzte Aktivität
    lastSeen: { type: Date, default: Date.now },
    
    // Beliebtheits-Score (berechnet)
    popularityScore: { type: Number, default: 0 },
    
    // Trending-Status
    isTrending: { type: Boolean, default: false },
    
    // Spiel-Image URL (optional)
    imageUrl: String,
    
    // Steam App ID (falls verfügbar)
    steamAppId: String
  }
}, { 
  timestamps: true 
});

// Compound Indexes für Performance
gameStatsSchema.index({ 'stats.totalSessions': -1 });
gameStatsSchema.index({ 'stats.uniquePlayers': -1 });
gameStatsSchema.index({ 'metadata.popularityScore': -1 });
gameStatsSchema.index({ 'metadata.lastSeen': -1 });
gameStatsSchema.index({ 'currentActivity.currentPlayers': -1 });

// Virtual für Stunden-Berechnung
gameStatsSchema.virtual('stats.totalHours').get(function() {
  return Math.floor(this.stats.totalMinutes / 60);
});

gameStatsSchema.virtual('stats.hoursThisWeek').get(function() {
  return Math.floor(this.stats.minutesThisWeek / 60);
});

// Statische Methode zum Aktualisieren der Game-Stats
gameStatsSchema.statics.updateGameStats = async function(gameName, userId, activityType, duration = 0) {
  try {
    if (!gameName || typeof gameName !== 'string' || gameName.trim().length === 0) {
      return null;
    }

    // Namen normalisieren und bereinigen
    const normalizedName = this.normalizeGameName(gameName);
    const gameId = this.generateGameId(normalizedName);
    
    // Zeitstempel für Periode-Berechnungen
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Game-Eintrag finden oder erstellen
    let gameStats = await this.findOne({ gameId });
    
    if (!gameStats) {
      gameStats = await this.create({
        gameId,
        gameName: gameName.trim(),
        normalizedName,
        category: this.categorizeGame(normalizedName),
        metadata: {
          firstSeen: now,
          lastSeen: now
        }
      });
      console.log(`🎮 New game tracked: ${gameName}`);
    }

    // Update-Objekt vorbereiten
    const updates = {
      'metadata.lastSeen': now
    };

    // Je nach Activity-Type verschiedene Updates
    switch (activityType) {
      case 'GAME_START':
        // Spieler zur aktuellen Aktivität hinzufügen
        if (userId && !gameStats.currentActivity.activePlayerIds.includes(userId)) {
          updates['$addToSet'] = { 'currentActivity.activePlayerIds': userId };
          updates['$inc'] = { 
            'currentActivity.currentPlayers': 1,
            'stats.totalSessions': 1
          };
          
          // Prüfen ob Spieler heute schon gespielt hat für unique player count
          const UserActivity = require('./userActivity.model');
          const todayActivity = await UserActivity.findOne({
            userId: mongoose.Types.ObjectId(userId),
            activityType: 'GAME_START',
            'metadata.gameName': gameName,
            timestamp: { $gte: today }
          });
          
          if (!todayActivity) {
            updates['$inc']['stats.uniquePlayers'] = 1;
          }
        }
        break;

      case 'GAME_END':
      case 'GAME_SWITCH':
        // Spieler aus aktueller Aktivität entfernen
        if (userId) {
          updates['$pull'] = { 'currentActivity.activePlayerIds': userId };
          updates['$inc'] = { 
            'currentActivity.currentPlayers': -1,
            'stats.totalMinutes': duration || 0
          };
          
          // Session-Länge aktualisieren
          if (duration > 0) {
            const newTotalSessions = gameStats.stats.totalSessions;
            const newTotalMinutes = gameStats.stats.totalMinutes + duration;
            updates['stats.averageSessionLength'] = Math.floor(newTotalMinutes / Math.max(newTotalSessions, 1));
            
            // Zeitraum-spezifische Updates
            updates['$inc']['stats.minutesToday'] = duration;
            updates['$inc']['stats.minutesThisWeek'] = duration;
            updates['$inc']['stats.minutesThisMonth'] = duration;
          }
        }
        break;
    }

    // Current Players kann nicht unter 0 fallen
    if (updates['$inc'] && updates['$inc']['currentActivity.currentPlayers'] < 0) {
      const currentPlayers = Math.max(0, gameStats.currentActivity.currentPlayers - 1);
      updates['currentActivity.currentPlayers'] = currentPlayers;
      delete updates['$inc']['currentActivity.currentPlayers'];
    }

    // Popularity Score berechnen (Kombination aus Sessions, Spielern und Aktualität)
    const sessionsWeight = gameStats.stats.totalSessions * 2;
    const playersWeight = gameStats.stats.uniquePlayers * 5;
    const recentWeight = (now - gameStats.metadata.lastSeen) < (7 * 24 * 60 * 60 * 1000) ? 10 : 0;
    const currentWeight = gameStats.currentActivity.currentPlayers * 20;
    
    updates['metadata.popularityScore'] = sessionsWeight + playersWeight + recentWeight + currentWeight;
    updates['currentActivity.lastActivityUpdate'] = now;

    // Update ausführen
    gameStats = await this.findOneAndUpdate(
      { gameId },
      updates,
      { new: true, upsert: false }
    );

    return gameStats;
  } catch (error) {
    console.error('Error updating game stats:', error);
    return null;
  }
};

// Statische Methode für Top-Games
gameStatsSchema.statics.getTopGames = async function(timeframe = 'week', limit = 10) {
  try {
    let sortField = 'metadata.popularityScore';
    let matchFilter = {};

    // Mindest-Aktivität Filter
    const minSessions = timeframe === 'all' ? 1 : 2;
    matchFilter['stats.totalSessions'] = { $gte: minSessions };

    // Zeitraum-spezifische Sortierung
    switch (timeframe) {
      case 'today':
        sortField = 'stats.sessionsToday';
        break;
      case 'week':
        sortField = 'stats.sessionsThisWeek';
        break;
      case 'month':
        sortField = 'stats.sessionsThisMonth';
        break;
      case 'popular':
        sortField = 'metadata.popularityScore';
        break;
      case 'active':
        sortField = 'currentActivity.currentPlayers';
        break;
      default:
        sortField = 'stats.totalSessions';
    }

    const pipeline = [
      { $match: matchFilter },
      { $sort: { [sortField]: -1, 'stats.totalSessions': -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          gameId: 1,
          gameName: 1,
          category: 1,
          stats: 1,
          currentActivity: 1,
          metadata: 1,
          // Berechnete Felder
          totalHours: { $floor: { $divide: ['$stats.totalMinutes', 60] } },
          hoursThisWeek: { $floor: { $divide: ['$stats.minutesThisWeek', 60] } },
          isCurrentlyActive: { $gt: ['$currentActivity.currentPlayers', 0] }
        }
      }
    ];

    const topGames = await this.aggregate(pipeline);
    
    return topGames.map(game => ({
      id: game.gameId,
      name: game.gameName,
      category: game.category,
      players: game.stats.uniquePlayers,
      sessions: game.stats.totalSessions,
      totalHours: game.totalHours,
      hoursThisWeek: game.hoursThisWeek,
      currentPlayers: game.currentActivity.currentPlayers,
      isActive: game.isCurrentlyActive,
      popularityScore: game.metadata.popularityScore,
      lastSeen: game.metadata.lastSeen,
      averageSessionLength: game.stats.averageSessionLength,
      image: game.metadata.imageUrl || 'https://via.placeholder.com/300x180'
    }));
  } catch (error) {
    console.error('Error getting top games:', error);
    return [];
  }
};

// Statische Methode zum Bereinigen alter Daten
gameStatsSchema.statics.cleanupOldData = async function() {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Games die länger als 30 Tage inaktiv sind und wenig Sessions haben
    const inactiveGames = await this.find({
      'metadata.lastSeen': { $lt: thirtyDaysAgo },
      'stats.totalSessions': { $lt: 5 }
    });

    if (inactiveGames.length > 0) {
      console.log(`🧹 Cleaning up ${inactiveGames.length} inactive games`);
      await this.deleteMany({
        _id: { $in: inactiveGames.map(g => g._id) }
      });
    }

    // Zeitraum-spezifische Stats zurücksetzen (täglich)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await this.updateMany(
      {},
      {
        $set: {
          'stats.sessionsToday': 0,
          'stats.minutesToday': 0
        }
      }
    );

    console.log('✅ Game stats cleanup completed');
  } catch (error) {
    console.error('Error cleaning up game stats:', error);
  }
};

// Helper-Methoden
gameStatsSchema.statics.normalizeGameName = function(gameName) {
  return gameName
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Sonderzeichen entfernen
    .replace(/\s+/g, ' ') // Multiple spaces zu einem
    .replace(/\b(the|a|an)\b/g, '') // Artikel entfernen
    .trim();
};

gameStatsSchema.statics.generateGameId = function(normalizedName) {
  return normalizedName.replace(/\s+/g, '_');
};

gameStatsSchema.statics.categorizeGame = function(normalizedName) {
  const categories = {
    'FPS': ['call of duty', 'counter strike', 'valorant', 'overwatch', 'battlefield', 'apex legends'],
    'MOBA': ['league of legends', 'dota', 'heroes of the storm'],
    'Battle Royale': ['fortnite', 'pubg', 'apex legends', 'warzone'],
    'Sandbox': ['minecraft', 'terraria', 'roblox'],
    'MMO': ['world of warcraft', 'final fantasy', 'guild wars', 'elder scrolls online'],
    'Strategy': ['civilization', 'age of empires', 'starcraft', 'total war'],
    'Racing': ['forza', 'gran turismo', 'need for speed'],
    'Sports': ['fifa', 'nba', 'madden', 'rocket league'],
    'RPG': ['skyrim', 'witcher', 'cyberpunk', 'fallout', 'dark souls'],
    'Indie': ['among us', 'fall guys', 'hollow knight', 'celeste']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => normalizedName.includes(keyword))) {
      return category;
    }
  }
  
  return 'Game';
};

// Methode für Homepage-Anzeige
gameStatsSchema.statics.getHomepageGames = async function(limit = 6) {
  try {
    // Mix aus populären und aktuell aktiven Games
    const [popularGames, activeGames] = await Promise.all([
      this.getTopGames('popular', Math.ceil(limit * 0.7)),
      this.getTopGames('active', Math.ceil(limit * 0.3))
    ]);

    // Kombinieren und Duplikate entfernen
    const combinedGames = [...popularGames];
    activeGames.forEach(game => {
      if (!combinedGames.find(g => g.id === game.id)) {
        combinedGames.push(game);
      }
    });

    return combinedGames.slice(0, limit);
  } catch (error) {
    console.error('Error getting homepage games:', error);
    return [];
  }
};

module.exports = mongoose.model('GameStats', gameStatsSchema);