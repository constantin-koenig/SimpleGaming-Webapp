// backend/models/gameStats.model.js - FIXED: Korrekte Zeitraum-Berechnung
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
  
  // ✅ FIXED: Verbesserte Statistiken mit korrekten Zeiträumen
  stats: {
    // Anzahl einzigartiger Spieler (gesamt)
    uniquePlayers: { type: Number, default: 0 },
    
    // Gesamte Sessions
    totalSessions: { type: Number, default: 0 },
    
    // Gesamte Spielzeit in Minuten
    totalMinutes: { type: Number, default: 0 },
    
    // Durchschnittliche Session-Länge in Minuten
    averageSessionLength: { type: Number, default: 0 },
    
    // ✅ ENHANCED: Detaillierte Zeitraum-Statistiken
    periods: {
      today: {
        sessions: { type: Number, default: 0 },
        minutes: { type: Number, default: 0 },
        uniquePlayers: [{ type: String }], // Array der User IDs
        lastReset: { type: Date, default: () => new Date().setHours(0,0,0,0) }
      },
      thisWeek: {
        sessions: { type: Number, default: 0 },
        minutes: { type: Number, default: 0 },
        uniquePlayers: [{ type: String }],
        lastReset: { type: Date, default: () => {
          const now = new Date();
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Montag als Wochenstart
          return new Date(now.setDate(diff)).setHours(0,0,0,0);
        }}
      },
      thisMonth: {
        sessions: { type: Number, default: 0 },
        minutes: { type: Number, default: 0 },
        uniquePlayers: [{ type: String }],
        lastReset: { type: Date, default: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
      }
    }
  },
  
  // Aktuelle Aktivität
  currentActivity: {
    // Spieler die gerade spielen
    currentPlayers: { type: Number, default: 0 },
    
    // Liste der aktuell spielenden User IDs mit Startzeit
    activePlayerIds: [{
      userId: { type: String, required: true },
      startTime: { type: Date, default: Date.now }
    }],
    
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
gameStatsSchema.index({ 'stats.periods.today.sessions': -1 });
gameStatsSchema.index({ 'stats.periods.thisWeek.sessions': -1 });

// ✅ Helper-Methode für Wochenbeginn (statisch gemacht)
gameStatsSchema.statics.getWeekStart = function() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Montag als Wochenstart
  return new Date(now.setDate(diff)).setHours(0,0,0,0);
};

// ✅ FIXED: Korrekte Zeitraum-Überprüfung und Reset
gameStatsSchema.methods.checkAndResetPeriods = async function() {
  const now = new Date();
  let needsUpdate = false;
  
  // Today Reset (um Mitternacht)
  const todayStart = new Date().setHours(0,0,0,0);
  if (this.stats.periods.today.lastReset < todayStart) {
    this.stats.periods.today = {
      sessions: 0,
      minutes: 0,
      uniquePlayers: [],
      lastReset: new Date(todayStart)
    };
    needsUpdate = true;
    console.log(`🗓️  Reset daily stats for ${this.gameName}`);
  }
  
  // Week Reset (Montag um Mitternacht)
  const weekStart = new Date(gameStatsSchema.statics.getWeekStart());
  if (this.stats.periods.thisWeek.lastReset < weekStart) {
    this.stats.periods.thisWeek = {
      sessions: 0,
      minutes: 0,
      uniquePlayers: [],
      lastReset: weekStart
    };
    needsUpdate = true;
    console.log(`🗓️  Reset weekly stats for ${this.gameName}`);
  }
  
  // Month Reset (1. des Monats um Mitternacht)
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  if (this.stats.periods.thisMonth.lastReset < monthStart) {
    this.stats.periods.thisMonth = {
      sessions: 0,
      minutes: 0,
      uniquePlayers: [],
      lastReset: monthStart
    };
    needsUpdate = true;
    console.log(`🗓️  Reset monthly stats for ${this.gameName}`);
  }
  
  if (needsUpdate) {
    await this.save();
  }
  
  return needsUpdate;
};

// ✅ FIXED: Komplett überarbeitete updateGameStats Methode
gameStatsSchema.statics.updateGameStats = async function(gameName, userId, activityType, duration = 0) {
  try {
    if (!gameName || typeof gameName !== 'string' || gameName.trim().length === 0) {
      console.warn('Invalid game name provided to updateGameStats');
      return null;
    }

    if (!userId || typeof userId !== 'string') {
      console.warn('Invalid user ID provided to updateGameStats');
      return null;
    }

    // Namen normalisieren und bereinigen
    const normalizedName = this.normalizeGameName(gameName);
    const gameId = this.generateGameId(normalizedName);
    
    const now = new Date();

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

    // Zeitraum-Resets prüfen
    await gameStats.checkAndResetPeriods();

    console.log(`🎮 Processing ${activityType} for ${gameName} (User: ${userId}, Duration: ${duration}min)`);

    // Je nach Activity-Type verschiedene Updates
    switch (activityType) {
      case 'GAME_START':
        await this.handleGameStart(gameStats, userId, now);
        break;

      case 'GAME_END':
      case 'GAME_SWITCH':
        await this.handleGameEnd(gameStats, userId, duration, now);
        break;

      default:
        console.warn(`Unknown activity type: ${activityType}`);
        return gameStats;
    }

    // Popularity Score neu berechnen
    gameStats.metadata.popularityScore = this.calculatePopularityScore(gameStats);
    gameStats.metadata.lastSeen = now;
    gameStats.currentActivity.lastActivityUpdate = now;

    await gameStats.save();
    
    console.log(`✅ Updated game stats for ${gameName}: ${gameStats.stats.totalSessions} sessions, ${Math.floor(gameStats.stats.totalMinutes/60)}h total`);
    
    return gameStats;
  } catch (error) {
    console.error('Error updating game stats:', error);
    return null;
  }
};

// ✅ FIXED: Game Start Handler
gameStatsSchema.statics.handleGameStart = async function(gameStats, userId, now) {
  // Prüfen ob User bereits spielt (Duplikat-Sessions vermeiden)
  const isAlreadyPlaying = gameStats.currentActivity.activePlayerIds.some(
    player => player.userId === userId
  );
  
  if (isAlreadyPlaying) {
    console.log(`⚠️  User ${userId} is already playing ${gameStats.gameName}`);
    return;
  }

  // User zur aktuellen Aktivität hinzufügen
  gameStats.currentActivity.activePlayerIds.push({
    userId: userId,
    startTime: now
  });
  gameStats.currentActivity.currentPlayers = gameStats.currentActivity.activePlayerIds.length;

  // Session-Zähler erhöhen
  gameStats.stats.totalSessions += 1;
  gameStats.stats.periods.today.sessions += 1;
  gameStats.stats.periods.thisWeek.sessions += 1;
  gameStats.stats.periods.thisMonth.sessions += 1;

  // Unique Players für Zeiträume tracken
  if (!gameStats.stats.periods.today.uniquePlayers.includes(userId)) {
    gameStats.stats.periods.today.uniquePlayers.push(userId);
  }
  if (!gameStats.stats.periods.thisWeek.uniquePlayers.includes(userId)) {
    gameStats.stats.periods.thisWeek.uniquePlayers.push(userId);
  }
  if (!gameStats.stats.periods.thisMonth.uniquePlayers.includes(userId)) {
    gameStats.stats.periods.thisMonth.uniquePlayers.push(userId);
  }

  // Gesamt-Unique-Players aktualisieren (vereinfacht)
  gameStats.stats.uniquePlayers = Math.max(
    gameStats.stats.uniquePlayers,
    gameStats.stats.periods.thisMonth.uniquePlayers.length
  );

  console.log(`▶️  ${userId} started playing ${gameStats.gameName} (${gameStats.currentActivity.currentPlayers} now playing)`);
};

// ✅ FIXED: Game End Handler mit korrekter Spielzeit-Berechnung
gameStatsSchema.statics.handleGameEnd = async function(gameStats, userId, duration, now) {
  // User aus aktueller Aktivität entfernen
  const playerIndex = gameStats.currentActivity.activePlayerIds.findIndex(
    player => player.userId === userId
  );
  
  if (playerIndex === -1) {
    console.warn(`⚠️  User ${userId} was not playing ${gameStats.gameName}`);
    return;
  }

  const playerSession = gameStats.currentActivity.activePlayerIds[playerIndex];
  gameStats.currentActivity.activePlayerIds.splice(playerIndex, 1);
  gameStats.currentActivity.currentPlayers = gameStats.currentActivity.activePlayerIds.length;

  // ✅ FIXED: Spielzeit korrekt berechnen
  let sessionDuration = duration;
  
  // Falls keine Duration übergeben wurde, aus Startzeit berechnen
  if (!sessionDuration || sessionDuration <= 0) {
    sessionDuration = Math.floor((now - playerSession.startTime) / 1000 / 60);
  }
  
  // Mindestdauer: 1 Minute, Maximaldauer: 8 Stunden (480 min)
  sessionDuration = Math.max(1, Math.min(sessionDuration, 480));

  console.log(`⏹️  ${userId} stopped playing ${gameStats.gameName} after ${sessionDuration} minutes`);

  // ✅ Spielzeit zu allen Zeiträumen hinzufügen
  gameStats.stats.totalMinutes += sessionDuration;
  gameStats.stats.periods.today.minutes += sessionDuration;
  gameStats.stats.periods.thisWeek.minutes += sessionDuration;
  gameStats.stats.periods.thisMonth.minutes += sessionDuration;

  // ✅ Durchschnittliche Session-Länge neu berechnen
  if (gameStats.stats.totalSessions > 0) {
    gameStats.stats.averageSessionLength = Math.floor(
      gameStats.stats.totalMinutes / gameStats.stats.totalSessions
    );
  }

  console.log(`📊 Total game time for ${gameStats.gameName}: ${Math.floor(gameStats.stats.totalMinutes/60)}h ${gameStats.stats.totalMinutes%60}m`);
};

// ✅ ENHANCED: Popularity Score Berechnung
gameStatsSchema.statics.calculatePopularityScore = function(gameStats) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Gewichtung verschiedener Faktoren
  const sessionsWeight = gameStats.stats.totalSessions * 2;
  const playersWeight = gameStats.stats.uniquePlayers * 5;
  const hoursWeight = Math.floor(gameStats.stats.totalMinutes / 60) * 1;
  const recentWeight = (gameStats.metadata.lastSeen > oneWeekAgo) ? 20 : 0;
  const currentWeight = gameStats.currentActivity.currentPlayers * 50;
  const weeklyActivityWeight = gameStats.stats.periods.thisWeek.sessions * 3;
  
  return Math.floor(
    sessionsWeight + 
    playersWeight + 
    hoursWeight + 
    recentWeight + 
    currentWeight +
    weeklyActivityWeight
  );
};

// ✅ ENHANCED: Verbesserte Top-Games Methode
gameStatsSchema.statics.getTopGames = async function(timeframe = 'week', limit = 10) {
  try {
    let sortField = 'metadata.popularityScore';
    let matchFilter = {};

    // Mindest-Aktivität Filter je nach Zeitraum
    switch (timeframe) {
      case 'today':
        sortField = 'stats.periods.today.sessions';
        matchFilter['stats.periods.today.sessions'] = { $gte: 1 };
        break;
      case 'week':
        sortField = 'stats.periods.thisWeek.sessions';
        matchFilter['stats.periods.thisWeek.sessions'] = { $gte: 1 };
        break;
      case 'month':
        sortField = 'stats.periods.thisMonth.sessions';
        matchFilter['stats.periods.thisMonth.sessions'] = { $gte: 1 };
        break;
      case 'active':
        sortField = 'currentActivity.currentPlayers';
        matchFilter['currentActivity.currentPlayers'] = { $gt: 0 };
        break;
      case 'popular':
        sortField = 'metadata.popularityScore';
        matchFilter['stats.totalSessions'] = { $gte: 3 };
        break;
      default:
        sortField = 'stats.totalSessions';
        matchFilter['stats.totalSessions'] = { $gte: 1 };
    }

    const pipeline = [
      { $match: matchFilter },
      { $sort: { [sortField]: -1, 'stats.totalSessions': -1, 'metadata.lastSeen': -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          gameId: 1,
          gameName: 1,
          category: 1,
          stats: 1,
          currentActivity: 1,
          metadata: 1,
          // ✅ Korrekte Stunden-Berechnungen
          totalHours: { $floor: { $divide: ['$stats.totalMinutes', 60] } },
          hoursToday: { $floor: { $divide: ['$stats.periods.today.minutes', 60] } },
          hoursThisWeek: { $floor: { $divide: ['$stats.periods.thisWeek.minutes', 60] } },
          hoursThisMonth: { $floor: { $divide: ['$stats.periods.thisMonth.minutes', 60] } },
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
      hoursToday: game.hoursToday,
      hoursThisWeek: game.hoursThisWeek,
      hoursThisMonth: game.hoursThisMonth,
      currentPlayers: game.currentActivity.currentPlayers,
      isActive: game.isCurrentlyActive,
      popularityScore: game.metadata.popularityScore,
      lastSeen: game.metadata.lastSeen,
      averageSessionLength: game.stats.averageSessionLength,
      image: game.metadata.imageUrl || 'https://via.placeholder.com/300x180',
      // ✅ Zeitraum-spezifische Sessions
      sessionsToday: game.stats.periods.today.sessions,
      sessionsThisWeek: game.stats.periods.thisWeek.sessions,
      sessionsThisMonth: game.stats.periods.thisMonth.sessions
    }));
  } catch (error) {
    console.error('Error getting top games:', error);
    return [];
  }
};

// ✅ ENHANCED: Cleanup mit korrekter Zeitraum-Behandlung
gameStatsSchema.statics.performDailyReset = async function() {
  try {
    console.log('🗓️  Performing daily reset of game stats...');
    
    const now = new Date();
    const todayStart = new Date().setHours(0,0,0,0);
    const weekStart = new Date(gameStatsSchema.statics.getWeekStart());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Alle Games für Reset finden
    const allGames = await this.find({});
    let resetCount = 0;
    
    for (const game of allGames) {
      let needsUpdate = false;
      
      // Today Reset
      if (game.stats.periods.today.lastReset < todayStart) {
        game.stats.periods.today = {
          sessions: 0,
          minutes: 0,
          uniquePlayers: [],
          lastReset: new Date(todayStart)
        };
        needsUpdate = true;
      }
      
      // Week Reset (falls nötig)
      if (game.stats.periods.thisWeek.lastReset < weekStart) {
        game.stats.periods.thisWeek = {
          sessions: 0,
          minutes: 0,
          uniquePlayers: [],
          lastReset: weekStart
        };
        needsUpdate = true;
      }
      
      // Month Reset (falls nötig)
      if (game.stats.periods.thisMonth.lastReset < monthStart) {
        game.stats.periods.thisMonth = {
          sessions: 0,
          minutes: 0,
          uniquePlayers: [],
          lastReset: monthStart
        };
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await game.save();
        resetCount++;
      }
    }
    
    console.log(`✅ Daily reset completed: ${resetCount} games reset`);
    return resetCount;
  } catch (error) {
    console.error('Error performing daily reset:', error);
    return 0;
  }
};

// Statische Methode zum Bereinigen alter Daten
gameStatsSchema.statics.cleanupOldData = async function() {
  try {
    console.log('🧹 Cleaning up old game data...');
    
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Games die länger als 30 Tage inaktiv sind und sehr wenig Sessions haben
    const result = await this.deleteMany({
      'metadata.lastSeen': { $lt: thirtyDaysAgo },
      'stats.totalSessions': { $lt: 3 },
      'currentActivity.currentPlayers': 0
    });

    console.log(`🗑️  Cleaned up ${result.deletedCount} inactive games`);
    
    return result.deletedCount;
  } catch (error) {
    console.error('Error cleaning up game stats:', error);
    return 0;
  }
};

// Helper-Methoden (unverändert aber optimiert)
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