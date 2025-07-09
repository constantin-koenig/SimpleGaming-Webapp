const express = require('express');
const router = express.Router();
const User = require('../models/user.model');
const UserActivity = require('../models/userActivity.model');
const { protect } = require('../middleware/auth.middleware');

// Dashboard-Übersicht für angemeldeten Benutzer
router.get('/overview', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-accessToken -refreshToken');
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    // Benutzer-Grunddaten
    const userData = {
      username: user.username,
      avatar: user.avatar,
      level: user.level || 1,
      xp: user.xp || 0,
      xpToNext: user.xpToNext || 1000,
      rank: user.rank || 'Bronze',
      rankColor: user.rankColor || 'from-gray-400 to-gray-600',
      joinDate: user.createdAt,
      lastActive: user.stats?.lastSeen || new Date()
    };

    // Dashboard-Statistiken
    const dashboardStats = {
      totalMessages: user.stats?.messagesCount || 0,
      voiceHours: Math.floor((user.stats?.voiceMinutes || 0) / 60),
      gamesPlayed: user.stats?.gamesPlayed || 0,
      eventsAttended: user.stats?.eventsAttended || 0,
      achievementsUnlocked: user.achievements?.length || 0,
      friendsOnline: 0, // Wird später berechnet
      weeklyProgress: {
        messages: 0, // Wird aus UserActivity berechnet
        voiceTime: 0,
        gamesPlayed: 0
      }
    };

    // Wöchentliche Fortschritte berechnen
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyActivity = await UserActivity.aggregate([
      {
        $match: {
          userId: user._id,
          timestamp: { $gte: weekAgo }
        }
      },
      {
        $group: {
          _id: '$activityType',
          count: { $sum: 1 },
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);

    weeklyActivity.forEach(activity => {
      switch(activity._id) {
        case 'MESSAGE':
          dashboardStats.weeklyProgress.messages = activity.count;
          break;
        case 'VOICE_LEAVE':
          dashboardStats.weeklyProgress.voiceTime = Math.floor((activity.totalDuration || 0) / 60);
          break;
        case 'GAME_END':
          dashboardStats.weeklyProgress.gamesPlayed = activity.count;
          break;
      }
    });

    res.json({
      userData,
      dashboardStats
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ message: 'Fehler beim Laden des Dashboards' });
  }
});

// Gaming-Aktivität für Charts
router.get('/gaming-activity', protect, async (req, res) => {
  try {
    const { timeframe = 'weekly' } = req.query;
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

    let dateFilter = {};
    let groupBy = {};
    
    const now = new Date();
    
    switch(timeframe) {
      case 'daily':
        dateFilter = { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) };
        groupBy = { $hour: '$timestamp' };
        break;
      case 'weekly':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        groupBy = { $dayOfWeek: '$timestamp' };
        break;
      case 'monthly':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        groupBy = { $week: '$timestamp' };
        break;
      case 'alltime':
        dateFilter = { $gte: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000) };
        groupBy = { $month: '$timestamp' };
        break;
    }

    // Gaming-Aktivitäten abrufen
    const gameActivity = await UserActivity.aggregate([
      {
        $match: {
          userId: user._id,
          activityType: { $in: ['GAME_START', 'GAME_END', 'GAME_SWITCH'] },
          timestamp: dateFilter,
          metadata: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            period: groupBy,
            game: '$metadata.game'
          },
          playtime: { $sum: '$duration' }
        }
      },
      {
        $group: {
          _id: '$_id.period',
          games: {
            $push: {
              name: '$_id.game',
              playtime: '$playtime'
            }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Letzte Gaming-Sessions
    const recentSessions = await UserActivity.find({
      userId: user._id,
      activityType: 'GAME_END',
      metadata: { $exists: true, $ne: null }
    })
    .sort({ timestamp: -1 })
    .limit(10)
    .populate('userId', 'username');

    const recentGamingActivity = recentSessions.map(session => ({
      game: session.metadata?.game || 'Unbekannt',
      lastPlayed: session.timestamp,
      duration: session.duration || 0,
      status: 'completed',
      icon: getGameIcon(session.metadata?.game),
      color: getGameColor(session.metadata?.game)
    }));

    res.json({
      gameActivity: formatGameActivity(gameActivity, timeframe),
      recentGamingActivity,
      timeframe
    });
  } catch (error) {
    console.error('Error fetching gaming activity:', error);
    res.status(500).json({ message: 'Fehler beim Laden der Gaming-Aktivität' });
  }
});

// Events-Endpunkte
router.get('/events/registered', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Hier würdest du normalerweise aus einer Events-Tabelle abfragen
    // Für jetzt erstellen wir Mock-Daten basierend auf User-Statistiken
    const registeredEvents = [
      {
        id: 1,
        name: "Minecraft Build Contest",
        date: "2024-06-30",
        time: "20:00",
        participants: 24,
        status: "registered",
        canCancel: true
      },
      {
        id: 2,
        name: "CS2 Tournament",
        date: "2024-07-02", 
        time: "19:30",
        participants: 16,
        status: "registered",
        canCancel: false
      }
    ];

    res.json({ events: registeredEvents });
  } catch (error) {
    console.error('Error fetching registered events:', error);
    res.status(500).json({ message: 'Fehler beim Laden der Events' });
  }
});

// Gaming Buddy Anfragen
router.get('/buddy-requests', protect, async (req, res) => {
  try {
    // Hier würdest du aus einer Buddy-Requests Tabelle abfragen
    // Mock-Daten für jetzt
    const buddyRequests = [
      {
        id: 1,
        username: "ShadowGamer",
        avatar: "/api/placeholder/40/40",
        games: ["Valorant", "CS2"],
        mutual: 3,
        requestDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        username: "MinecraftPro", 
        avatar: "/api/placeholder/40/40",
        games: ["Minecraft", "Terraria"],
        mutual: 1,
        requestDate: new Date(Date.now() - 48 * 60 * 60 * 1000)
      }
    ];

    res.json({ requests: buddyRequests });
  } catch (error) {
    console.error('Error fetching buddy requests:', error);
    res.status(500).json({ message: 'Fehler beim Laden der Buddy-Anfragen' });
  }
});

// Freunde abrufen
router.get('/friends', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Hier würdest du aus einer Friends-Tabelle abfragen
    // Mock-Daten basierend auf Discord-Integration
    const friends = [
      {
        id: 1,
        username: "BestBuddy123",
        avatar: "/api/placeholder/40/40",
        status: "online",
        game: "Valorant",
        lastSeen: null
      },
      {
        id: 2,
        username: "CoopPlayer",
        avatar: "/api/placeholder/40/40", 
        status: "ingame",
        game: "Minecraft",
        lastSeen: null
      },
      {
        id: 3,
        username: "NightOwl",
        avatar: "/api/placeholder/40/40",
        status: "offline", 
        game: null,
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ];

    res.json({ friends });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ message: 'Fehler beim Laden der Freunde' });
  }
});

// Erfolge abrufen
router.get('/achievements', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Standard-Erfolge definieren
    const allAchievements = [
      {
        id: 1,
        name: "First Steps",
        description: "Erste Nachricht im Discord gesendet",
        icon: "💬",
        unlocked: (user.stats?.messagesCount || 0) > 0,
        unlockedAt: user.stats?.messagesCount > 0 ? user.createdAt : null,
        rarity: "common"
      },
      {
        id: 2,
        name: "Voice Chat Master", 
        description: "100 Stunden im Voice Chat verbracht",
        icon: "🎤",
        unlocked: (user.stats?.voiceMinutes || 0) >= 6000,
        unlockedAt: (user.stats?.voiceMinutes || 0) >= 6000 ? new Date() : null,
        rarity: "rare"
      },
      {
        id: 3,
        name: "Social Butterfly",
        description: "500 Nachrichten in einer Woche", 
        icon: "🦋",
        unlocked: (user.stats?.messagesCount || 0) >= 500,
        unlockedAt: (user.stats?.messagesCount || 0) >= 500 ? new Date() : null,
        rarity: "uncommon"
      },
      {
        id: 4,
        name: "Tournament Victor",
        description: "Ein Turnier gewinnen",
        icon: "🏆", 
        unlocked: false,
        unlockedAt: null,
        rarity: "legendary"
      },
      {
        id: 5,
        name: "Night Owl",
        description: "24 Stunden durchgehend online",
        icon: "🦉",
        unlocked: false, 
        unlockedAt: null,
        rarity: "epic"
      }
    ];

    res.json({ achievements: allAchievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Fehler beim Laden der Erfolge' });
  }
});

// Hilfsfunktionen
function getGameIcon(gameName) {
  const icons = {
    'Valorant': '🎯',
    'CS2': '💥', 
    'Counter-Strike 2': '💥',
    'Minecraft': '⛏️',
    'Rust': '🔥',
    'League of Legends': '⚔️',
    'Dota 2': '🛡️'
  };
  return icons[gameName] || '🎮';
}

function getGameColor(gameName) {
  const colors = {
    'Valorant': '#FF4655',
    'CS2': '#F7931E',
    'Counter-Strike 2': '#F7931E', 
    'Minecraft': '#62B47A',
    'Rust': '#CE422B',
    'League of Legends': '#C89B3C',
    'Dota 2': '#FF6046'
  };
  return colors[gameName] || '#6B7280';
}

function formatGameActivity(rawData, timeframe) {
  const labels = {
    daily: ['00:00', '06:00', '12:00', '18:00', '24:00'],
    weekly: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'], 
    monthly: ['W1', 'W2', 'W3', 'W4'],
    alltime: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun']
  };

  const result = {};
  result[timeframe] = labels[timeframe].map((label, index) => {
    const periodData = rawData.find(item => item._id === (index + 1));
    return {
      label,
      games: periodData ? periodData.games.map(game => ({
        name: game.name,
        playtime: game.playtime || 0,
        color: getGameColor(game.name)
      })) : []
    };
  });

  return result;
}

module.exports = router;