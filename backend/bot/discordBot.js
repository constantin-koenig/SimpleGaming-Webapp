// backend/bot/discordBot.js - FIXED: Korrekte GameStats Integration
const { Client, GatewayIntentBits, Events, ActivityType } = require('discord.js');
const User = require('../models/user.model');
const UserActivity = require('../models/userActivity.model');
const VoiceSession = require('../models/voiceSession.model');
const GameStats = require('../models/gameStats.model');
const AutoSyncScheduler = require('./autoSync');

class DiscordBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildPresences
      ]
    });

    // ✅ ENHANCED: Bessere Memory-Verwaltung für Gaming-Sessions
    this.voiceSessions = new Map();
    this.gamingSessions = new Map(); // userId -> { game, startTime, userId, sessionId }
    this.presenceCache = new Map();
    this.autoSyncScheduler = null;
    
    // ✅ Performance-Counter
    this.stats = {
      gamingSessionsStarted: 0,
      gamingSessionsEnded: 0,
      totalGamingMinutes: 0,
      presenceUpdates: 0
    };
    
    this.initializeEventListeners();
    this.startDailyResetScheduler();
  }

  // ✅ NEW: Daily Reset Scheduler für GameStats
  startDailyResetScheduler() {
    // Jeden Tag um 00:01 Uhr
    const scheduleDaily = require('node-cron');
    scheduleDaily.schedule('1 0 * * *', async () => {
      try {
        console.log('🗓️  Starting daily game stats reset...');
        const resetCount = await GameStats.performDailyReset();
        console.log(`✅ Daily reset completed: ${resetCount} games processed`);
      } catch (error) {
        console.error('❌ Error in daily reset:', error);
      }
    }, {
      timezone: 'Europe/Berlin'
    });
    
    console.log('⏰ Daily reset scheduler initialized');
  }

  initializeEventListeners() {
    this.client.once(Events.ClientReady, async () => {
      console.log(`✅ Discord Bot ist online als ${this.client.user.tag}`);
      
      this.client.user.setActivity('SimpleGaming Community', { 
        type: ActivityType.Watching 
      });

      await this.restoreActiveSessions();
      await this.syncAllMembers();
      await this.initializePresenceCache();
      await this.initializeGameStats();
      this.startAutoSync();
      
      console.log('🔐 Bot Intents aktiv:', this.getActiveIntents());
    });

    this.client.on(Events.MessageCreate, (message) => {
      this.handleMessage(message);
    });

    this.client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      this.handleVoiceStateUpdate(oldState, newState);
    });

    this.client.on(Events.GuildMemberAdd, (member) => {
      this.handleMemberJoin(member);
    });

    this.client.on(Events.GuildMemberRemove, (member) => {
      this.handleMemberLeave(member);
    });

    this.client.on(Events.PresenceUpdate, (oldPresence, newPresence) => {
      this.handlePresenceUpdate(oldPresence, newPresence);
    });

    this.client.on('error', (error) => {
      console.error('Discord Bot Error:', error);
    });
  }

  // ✅ ENHANCED: Verbesserte Game Stats Initialisierung
  async initializeGameStats() {
    try {
      console.log('🎮 Initializing game stats from current presences...');
      
      let totalPresences = 0;
      let gamingPresences = 0;
      let trackedGames = 0;
      
      for (const [guildId, guild] of this.client.guilds.cache) {
        console.log(`🔍 Scanning presences in guild: ${guild.name}`);
        
        const members = await guild.members.fetch();
        
        for (const [memberId, member] of members) {
          if (member.user.bot) continue;
          
          totalPresences++;
          const presence = member.presence;
          
          if (presence && presence.activities) {
            const games = presence.activities.filter(activity => 
              activity.type === ActivityType.Playing || 
              activity.type === ActivityType.Streaming
            );
            
            if (games.length > 0) {
              gamingPresences++;
              
              for (const game of games) {
                try {
                  // User aus DB holen
                  const user = await User.findOne({ discordId: member.user.id });
                  if (user) {
                    // ✅ FIXED: Korrekte GameStats Initialisierung
                    await GameStats.updateGameStats(
                      game.name, 
                      user._id.toString(), 
                      'GAME_START'
                    );
                    
                    // Memory Session erstellen
                    this.gamingSessions.set(member.user.id, {
                      game: game.name,
                      startTime: new Date(),
                      userId: user._id.toString(),
                      sessionId: `init_${Date.now()}_${member.user.id}`
                    });
                    
                    trackedGames++;
                    console.log(`🎮 Initialized: ${user.username} playing ${game.name}`);
                  } else {
                    console.warn(`⚠️  User ${member.user.username} not found in database`);
                  }
                } catch (gameError) {
                  console.error(`❌ Error initializing game for ${member.user.username}:`, gameError.message);
                }
              }
            }
          }
        }
      }
      
      console.log(`✅ Game stats initialized:`);
      console.log(`   📊 Total presences scanned: ${totalPresences}`);
      console.log(`   🎮 Gaming presences found: ${gamingPresences}`);
      console.log(`   ✅ Games tracked: ${trackedGames}`);
      
      // Cleanup-Task starten
      setInterval(async () => {
        await GameStats.cleanupOldData();
      }, 24 * 60 * 60 * 1000); // Täglich
      
    } catch (error) {
      console.error('❌ Error initializing game stats:', error);
    }
  }

  async initializePresenceCache() {
    try {
      console.log('🔄 Initializing presence cache...');
      
      let totalMembers = 0;
      let onlineMembers = 0;
      
      for (const [guildId, guild] of this.client.guilds.cache) {
        console.log(`📊 Scanning presence in guild: ${guild.name}`);
        
        const members = await guild.members.fetch();
        
        for (const [memberId, member] of members) {
          if (member.user.bot) continue;
          
          totalMembers++;
          
          const presence = member.presence;
          if (presence && ['online', 'idle', 'dnd'].includes(presence.status)) {
            onlineMembers++;
            this.presenceCache.set(member.user.id, {
              status: presence.status,
              activities: presence.activities || [],
              lastSeen: new Date()
            });
          }
        }
      }
      
      console.log(`✅ Presence cache initialized: ${onlineMembers}/${totalMembers} members online`);
      
      setInterval(() => {
        this.refreshPresenceCache();
      }, 5 * 60 * 1000);
      
    } catch (error) {
      console.error('❌ Error initializing presence cache:', error);
    }
  }

  async refreshPresenceCache() {
    try {
      console.log('🔄 Refreshing presence cache...');
      
      const oldSize = this.presenceCache.size;
      const newCache = new Map();
      let onlineCount = 0;
      
      for (const [guildId, guild] of this.client.guilds.cache) {
        const members = guild.members.cache;
        
        for (const [memberId, member] of members) {
          if (member.user.bot) continue;
          
          const presence = member.presence;
          if (presence && ['online', 'idle', 'dnd'].includes(presence.status)) {
            newCache.set(member.user.id, {
              status: presence.status,
              activities: presence.activities || [],
              lastSeen: new Date()
            });
            onlineCount++;
          }
        }
      }
      
      this.presenceCache = newCache;
      
      console.log(`✅ Presence cache refreshed: ${onlineCount} online (was ${oldSize})`);
      
    } catch (error) {
      console.error('❌ Error refreshing presence cache:', error);
    }
  }

  getActiveIntents() {
    const intents = [];
    const intentBits = this.client.options.intents;
    
    if (intentBits.has(GatewayIntentBits.Guilds)) intents.push('Guilds');
    if (intentBits.has(GatewayIntentBits.GuildMembers)) intents.push('GuildMembers');
    if (intentBits.has(GatewayIntentBits.GuildMessages)) intents.push('GuildMessages');
    if (intentBits.has(GatewayIntentBits.GuildPresences)) intents.push('GuildPresences ✅');
    if (intentBits.has(GatewayIntentBits.GuildVoiceStates)) intents.push('GuildVoiceStates');
    
    return intents;
  }

  // ✅ COMPLETELY REWRITTEN: Presence Update Handler mit korrekter GameStats Integration
  async handlePresenceUpdate(oldPresence, newPresence) {
    if (!newPresence || !newPresence.member || newPresence.member.user.bot) return;

    const userId = newPresence.member.user.id;
    const username = newPresence.member.user.username;
    
    try {
      this.stats.presenceUpdates++;
      
      const oldStatus = oldPresence?.status || 'offline';
      const newStatus = newPresence.status || 'offline';
      
      // Status-Change loggen (nur bei größeren Änderungen)
      if (oldStatus !== newStatus && ['online', 'offline'].includes(newStatus)) {
        console.log(`👤 ${username}: ${oldStatus} → ${newStatus}`);
      }
      
      // Cache aktualisieren basierend auf neuem Status
      if (['online', 'idle', 'dnd'].includes(newStatus)) {
        this.presenceCache.set(userId, {
          status: newStatus,
          activities: newPresence.activities || [],
          lastSeen: new Date()
        });
        
        // User lastSeen aktualisieren
        await User.findOneAndUpdate(
          { discordId: userId },
          { 'stats.lastSeen': new Date() }
        );
      } else {
        this.presenceCache.delete(userId);
      }

      // ✅ FIXED: Gaming-Session tracking mit korrekter GameStats Integration
      const user = await User.findOne({ discordId: userId });
      if (!user) {
        console.warn(`⚠️  User ${username} not found in database`);
        return;
      }

      // Alte und neue Gaming-Aktivitäten extrahieren
      const oldGames = this.extractGamingActivities(oldPresence?.activities || []);
      const newGames = this.extractGamingActivities(newPresence.activities || []);
      
      const previousSession = this.gamingSessions.get(userId);
      const currentGame = newGames[0]; // Erstes Spiel falls mehrere

      // ✅ SCENARIO 1: Neues Spiel gestartet (kein vorheriges Spiel)
      if (currentGame && !previousSession) {
        await this.startGamingSession(user, currentGame, userId, username);
      } 
      // ✅ SCENARIO 2: Spiel beendet (hatte Spiel, jetzt keins)
      else if (!currentGame && previousSession) {
        await this.endGamingSession(user, previousSession, userId, username);
      }
      // ✅ SCENARIO 3: Spiel gewechselt (anderes Spiel)
      else if (currentGame && previousSession && currentGame.name !== previousSession.game) {
        await this.switchGamingSession(user, previousSession, currentGame, userId, username);
      }
      // ✅ SCENARIO 4: Gleiches Spiel weiterhin gespielt (keine Aktion nötig)
      else if (currentGame && previousSession && currentGame.name === previousSession.game) {
        // Spiel läuft weiter - keine Aktion nötig
        // console.log(`🎮 ${username} continues playing ${currentGame.name}`);
      }

    } catch (error) {
      console.error(`❌ Error handling presence update for ${username}:`, error);
    }
  }

  // ✅ NEW: Gaming-Aktivitäten aus Activities extrahieren
  extractGamingActivities(activities) {
    return activities.filter(activity => 
      activity.type === ActivityType.Playing || 
      activity.type === ActivityType.Streaming
    );
  }

  // ✅ NEW: Gaming-Session starten
  async startGamingSession(user, game, userId, username) {
    try {
      const sessionId = `session_${Date.now()}_${userId}`;
      const startTime = new Date();
      
      // Memory Session erstellen
      this.gamingSessions.set(userId, {
        game: game.name,
        startTime: startTime,
        userId: user._id.toString(),
        sessionId: sessionId
      });

      // ✅ GameStats aktualisieren
      await GameStats.updateGameStats(
        game.name, 
        user._id.toString(), 
        'GAME_START'
      );

      // UserActivity loggen
      await this.logActivity(user._id, 'GAME_START', {
        gameName: game.name,
        gameType: game.type,
        sessionId: sessionId
      });

      this.stats.gamingSessionsStarted++;
      console.log(`🎮 ${username} started playing ${game.name} (Session: ${this.gamingSessions.size})`);
      
    } catch (error) {
      console.error(`❌ Error starting gaming session for ${username}:`, error);
    }
  }

  // ✅ NEW: Gaming-Session beenden
  async endGamingSession(user, previousSession, userId, username) {
    try {
      const endTime = new Date();
      const duration = Math.floor((endTime - previousSession.startTime) / 1000 / 60); // Minuten
      
      // User-Statistiken aktualisieren
      if (duration > 0) {
        await User.findByIdAndUpdate(user._id, {
          $inc: { 'stats.gamesPlayed': 1 },
          $set: { 'stats.lastSeen': endTime }
        });
      }

      // ✅ GameStats aktualisieren mit korrekter Duration
      await GameStats.updateGameStats(
        previousSession.game, 
        user._id.toString(), 
        'GAME_END',
        duration
      );

      // UserActivity loggen
      await this.logActivity(user._id, 'GAME_END', {
        gameName: previousSession.game,
        duration: duration,
        sessionId: previousSession.sessionId
      });

      // Memory Session entfernen
      this.gamingSessions.delete(userId);
      
      this.stats.gamingSessionsEnded++;
      this.stats.totalGamingMinutes += duration;
      
      console.log(`🎮 ${username} stopped playing ${previousSession.game} after ${duration} minutes (Sessions: ${this.gamingSessions.size})`);
      
    } catch (error) {
      console.error(`❌ Error ending gaming session for ${username}:`, error);
    }
  }

  // ✅ NEW: Gaming-Session wechseln
  async switchGamingSession(user, previousSession, newGame, userId, username) {
    try {
      const switchTime = new Date();
      const duration = Math.floor((switchTime - previousSession.startTime) / 1000 / 60); // Minuten
      
      // Altes Spiel beenden
      if (duration > 0) {
        await User.findByIdAndUpdate(user._id, {
          $inc: { 'stats.gamesPlayed': 1 }
        });
      }

      // ✅ Altes Spiel in GameStats beenden
      await GameStats.updateGameStats(
        previousSession.game, 
        user._id.toString(), 
        'GAME_SWITCH',
        duration
      );

      // UserActivity für Switch loggen
      await this.logActivity(user._id, 'GAME_SWITCH', {
        fromGame: previousSession.game,
        toGame: newGame.name,
        duration: duration,
        oldSessionId: previousSession.sessionId
      });

      // ✅ Neues Spiel in GameStats starten
      const newSessionId = `session_${Date.now()}_${userId}`;
      await GameStats.updateGameStats(
        newGame.name, 
        user._id.toString(), 
        'GAME_START'
      );

      // Memory Session aktualisieren
      this.gamingSessions.set(userId, {
        game: newGame.name,
        startTime: switchTime,
        userId: user._id.toString(),
        sessionId: newSessionId
      });

      this.stats.gamingSessionsEnded++;
      this.stats.gamingSessionsStarted++;
      this.stats.totalGamingMinutes += duration;

      console.log(`🎮 ${username} switched from ${previousSession.game} to ${newGame.name} (${duration}min played)`);
      
    } catch (error) {
      console.error(`❌ Error switching gaming session for ${username}:`, error);
    }
  }

  // ✅ ENHANCED: Live Gaming-Stats mit korrekten Daten
  async getLiveGamingStats() {
    try {
      // Aktuelle Spieler aus Memory
      const currentGames = new Map();
      
      for (const [userId, session] of this.gamingSessions) {
        const gameName = session.game;
        if (!currentGames.has(gameName)) {
          currentGames.set(gameName, {
            name: gameName,
            currentPlayers: 0,
            playerIds: [],
            totalDuration: 0
          });
        }
        
        const gameData = currentGames.get(gameName);
        gameData.currentPlayers++;
        gameData.playerIds.push(userId);
        
        // Session-Dauer berechnen
        const sessionDuration = Math.floor((Date.now() - session.startTime.getTime()) / 1000 / 60);
        gameData.totalDuration += sessionDuration;
      }

      // Top aktuelle Spiele
      const liveGames = Array.from(currentGames.values())
        .sort((a, b) => b.currentPlayers - a.currentPlayers)
        .slice(0, 10)
        .map(game => ({
          ...game,
          averageDuration: game.currentPlayers > 0 ? Math.floor(game.totalDuration / game.currentPlayers) : 0
        }));

      return {
        totalPlayingNow: this.gamingSessions.size,
        activeGames: currentGames.size,
        topLiveGames: liveGames,
        timestamp: new Date(),
        performance: {
          sessionsStarted: this.stats.gamingSessionsStarted,
          sessionsEnded: this.stats.gamingSessionsEnded,
          totalMinutes: this.stats.totalGamingMinutes,
          presenceUpdates: this.stats.presenceUpdates
        }
      };
    } catch (error) {
      console.error('Error getting live gaming stats:', error);
      return {
        totalPlayingNow: 0,
        activeGames: 0,
        topLiveGames: [],
        timestamp: new Date(),
        error: error.message
      };
    }
  }

  getLiveDiscordStats() {
    try {
      if (!this.client.isReady()) {
        return {
          available: false,
          reason: 'Bot not ready'
        };
      }

      let totalMembers = 0;
      let onlineMembers = 0;
      let playingMembers = 0;
      let voiceMembers = 0;

      for (const [guildId, guild] of this.client.guilds.cache) {
        const members = guild.members.cache;
        
        for (const [memberId, member] of members) {
          if (member.user.bot) continue;
          
          totalMembers++;
          
          const cachedPresence = this.presenceCache.get(member.user.id);
          if (cachedPresence) {
            onlineMembers++;
            
            const isPlaying = cachedPresence.activities.some(activity => 
              activity.type === ActivityType.Playing || activity.type === ActivityType.Streaming
            );
            if (isPlaying) playingMembers++;
          }
          
          if (member.voice.channel) {
            voiceMembers++;
          }
        }
      }

      return {
        available: true,
        totalMembers,
        onlineMembers,
        playingMembers: this.gamingSessions.size, // ✅ Korrekte Zahl aus Memory
        voiceMembers,
        cacheSize: this.presenceCache.size,
        timestamp: new Date(),
        dataSource: 'discord_live'
      };
    } catch (error) {
      console.error('Error getting live Discord stats:', error);
      return {
        available: false,
        reason: error.message
      };
    }
  }

  getOnlineMembersDetail() {
    try {
      const onlineMembers = [];
      
      for (const [userId, presence] of this.presenceCache) {
        const member = this.findMemberByUserId(userId);
        if (member) {
          const currentGame = presence.activities.find(activity => 
            activity.type === ActivityType.Playing || activity.type === ActivityType.Streaming
          );
          
          // Gaming Session Info aus Memory
          const gamingSession = this.gamingSessions.get(userId);
          
          onlineMembers.push({
            id: userId,
            username: member.user.username,
            status: presence.status,
            game: currentGame?.name || null,
            gameType: currentGame?.type || null,
            inVoice: !!member.voice.channel,
            voiceChannel: member.voice.channel?.name || null,
            lastSeen: presence.lastSeen,
            // ✅ Gaming Session Details
            gamingSession: gamingSession ? {
              game: gamingSession.game,
              duration: Math.floor((Date.now() - gamingSession.startTime.getTime()) / 1000 / 60),
              startTime: gamingSession.startTime
            } : null
          });
        }
      }
      
      return onlineMembers.sort((a, b) => b.lastSeen - a.lastSeen);
    } catch (error) {
      console.error('Error getting online members detail:', error);
      return [];
    }
  }

  findMemberByUserId(userId) {
    for (const [guildId, guild] of this.client.guilds.cache) {
      const member = guild.members.cache.get(userId);
      if (member) return member;
    }
    return null;
  }

  // ✅ ENHANCED: Alle aktiven Sessions beim Bot-Stopp korrekt beenden
  async restoreActiveSessions() {
    try {
      console.log('🔄 Restoring active voice sessions...');
      
      const result = await VoiceSession.endAllActiveSessionsAndCleanup('restart');
      console.log(`📊 Cleaned up ${result.count} voice sessions from bot restart (${result.totalMinutes} minutes)`);
      
      const guilds = this.client.guilds.cache;
      let activeUsers = 0;
      
      for (const [guildId, guild] of guilds) {
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2);
        
        for (const [channelId, channel] of voiceChannels) {
          for (const [memberId, member] of channel.members) {
            if (!member.user.bot) {
              await this.startVoiceSession(member.user.id, channel);
              activeUsers++;
            }
          }
        }
      }
      
      console.log(`🎤 Found ${activeUsers} users currently in voice channels`);
      
    } catch (error) {
      console.error('❌ Error restoring voice sessions:', error);
    }
  }

  async startVoiceSession(discordUserId, channel) {
    try {
      const user = await User.findOne({ discordId: discordUserId });
      if (!user) return;

      const existingSession = await VoiceSession.findOne({ 
        discordUserId: discordUserId, 
        isActive: true 
      });
      
      if (existingSession) {
        console.log(`⚠️  User ${discordUserId} already has active session, ending old one`);
        await existingSession.endSessionAndDelete('switch');
      }

      const session = await VoiceSession.create({
        userId: user._id,
        discordUserId: discordUserId,
        channelId: channel.id,
        channelName: channel.name,
        guildId: channel.guild.id,
        startTime: new Date()
      });

      this.voiceSessions.set(discordUserId, {
        sessionId: session._id,
        startTime: session.startTime,
        channelId: channel.id,
        channelName: channel.name
      });

      console.log(`🎤 ${user.username} joined voice: ${channel.name}`);
      
      await this.logActivity(user._id, 'VOICE_JOIN', {
        channelId: channel.id,
        channelName: channel.name,
        guildId: channel.guild.id
      });
      
      return session;
    } catch (error) {
      console.error('Error starting voice session:', error);
    }
  }

  async endVoiceSession(discordUserId, reason = 'left') {
    try {
      const user = await User.findOne({ discordId: discordUserId });
      if (!user) return;

      this.voiceSessions.delete(discordUserId);

      const session = await VoiceSession.findOne({ 
        discordUserId: discordUserId, 
        isActive: true 
      });

      if (session) {
        const duration = await session.endSessionAndDelete(reason);
        console.log(`🎤 ${user.username} left voice after ${duration} minutes (session deleted)`);
        return duration;
      } else {
        console.log(`⚠️  No active session found for ${user.username}`);
      }
    } catch (error) {
      console.error('Error ending voice session:', error);
    }
    
    return 0;
  }

  startAutoSync() {
    if (process.env.AUTO_SYNC_ENABLED === 'true') {
      this.autoSyncScheduler = new AutoSyncScheduler(this);
      this.autoSyncScheduler.start();
      console.log('⏰ Auto-sync scheduler enabled');
    } else {
      console.log('⏰ Auto-sync disabled (set AUTO_SYNC_ENABLED=true to enable)');
    }
  }

  async handleMessage(message) {
    if (message.author.bot) return;

    try {
      const user = await User.findOne({ discordId: message.author.id });
      if (!user) return;

      await User.findByIdAndUpdate(user._id, {
        $inc: { 'stats.messagesCount': 1 },
        'stats.lastSeen': new Date()
      });

      await this.logActivity(user._id, 'MESSAGE', {
        channelId: message.channel.id,
        channelName: message.channel.name,
        messageLength: message.content.length,
        hasAttachments: message.attachments.size > 0
      });

    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async handleVoiceStateUpdate(oldState, newState) {
    const userId = newState.member?.user.id || oldState.member?.user.id;
    if (!userId || newState.member?.user.bot || oldState.member?.user.bot) return;

    try {
      if (!oldState.channelId && newState.channelId) {
        await this.startVoiceSession(userId, newState.channel);
      }
      else if (oldState.channelId && !newState.channelId) {
        await this.endVoiceSession(userId, 'left');
      }
      else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        await this.endVoiceSession(userId, 'switch');
        await this.startVoiceSession(userId, newState.channel);
        
        console.log(`🔄 ${newState.member.user.username} switched from ${oldState.channel.name} to ${newState.channel.name}`);
      }
    } catch (error) {
      console.error('Error handling voice state update:', error);
    }
  }

  async handleMemberJoin(member) {
    try {
      let user = await User.findOne({ discordId: member.user.id });
      
      if (!user) {
        user = await User.create({
          discordId: member.user.id,
          username: member.user.username,
          discriminator: member.user.discriminator,
          avatar: member.user.avatar,
          guilds: [{
            id: member.guild.id,
            name: member.guild.name,
            joinedAt: member.joinedAt
          }]
        });
        
        console.log(`👋 New member joined: ${member.user.username}`);
      } else {
        await User.findByIdAndUpdate(user._id, {
          username: member.user.username,
          discriminator: member.user.discriminator,
          avatar: member.user.avatar,
          updatedAt: new Date()
        });
      }

      await this.logActivity(user._id, 'SERVER_JOIN', {
        guildId: member.guild.id,
        guildName: member.guild.name
      });

    } catch (error) {
      console.error('Error handling member join:', error);
    }
  }

  async handleMemberLeave(member) {
    try {
      const user = await User.findOne({ discordId: member.user.id });
      if (!user) return;

      // Voice Session beenden falls aktiv
      if (this.voiceSessions.has(member.user.id)) {
        await this.endVoiceSession(member.user.id, 'server_leave');
      }

      // ✅ ENHANCED: Gaming-Session beim Server verlassen beenden
      if (this.gamingSessions.has(member.user.id)) {
        const session = this.gamingSessions.get(member.user.id);
        await this.endGamingSession(user, session, member.user.id, member.user.username);
      }

      this.presenceCache.delete(member.user.id);

      await this.logActivity(user._id, 'SERVER_LEAVE', {
        guildId: member.guild.id,
        guildName: member.guild.name
      });

      console.log(`👋 Member left: ${member.user.username}`);
    } catch (error) {
      console.error('Error handling member leave:', error);
    }
  }

  async syncAllMembers() {
    try {
      const guilds = this.client.guilds.cache;
      
      for (const [guildId, guild] of guilds) {
        console.log(`🔄 Syncing members from guild: ${guild.name}`);
        
        const members = await guild.members.fetch();
        
        for (const [memberId, member] of members) {
          if (member.user.bot) continue;
          
          let user = await User.findOne({ discordId: member.user.id });
          
          if (!user) {
            user = await User.create({
              discordId: member.user.id,
              username: member.user.username,
              discriminator: member.user.discriminator,
              avatar: member.user.avatar,
              guilds: [{
                id: guild.id,
                name: guild.name,
                joinedAt: member.joinedAt
              }]
            });
          } else {
            await User.findByIdAndUpdate(user._id, {
              username: member.user.username,
              discriminator: member.user.discriminator,
              avatar: member.user.avatar,
              updatedAt: new Date()
            });
          }
        }
      }
      
      console.log(`✅ Member sync completed`);
    } catch (error) {
      console.error('Error syncing members:', error);
    }
  }

  async logActivity(userId, activityType, metadata = {}) {
    try {
      // ✅ FIXED: Nur UserActivity verwenden, nicht GamingActivity
      await UserActivity.create({
        userId: userId,
        activityType: activityType,
        metadata: metadata,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }

  async trackEventParticipation(discordUserId, eventId, eventName, participationType = 'JOINED') {
    try {
      const user = await User.findOne({ discordId: discordUserId });
      if (!user) return;

      if (participationType === 'JOINED') {
        await User.findByIdAndUpdate(user._id, {
          $inc: { 'stats.eventsAttended': 1 }
        });
      }

      await this.logActivity(user._id, `EVENT_${participationType}`, {
        eventId: eventId,
        eventName: eventName
      });

      console.log(`🎪 Event ${participationType}: ${user.username} - ${eventName}`);
    } catch (error) {
      console.error('Error tracking event participation:', error);
    }
  }

  async start() {
    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
    } catch (error) {
      console.error('Failed to start Discord bot:', error);
      process.exit(1);
    }
  }

  async stop() {
    try {
      if (this.autoSyncScheduler) {
        this.autoSyncScheduler.stop();
      }

      console.log('🔄 Ending all active sessions and cleaning up...');
      
      // ✅ Voice Sessions beenden
      const voiceResult = await VoiceSession.endAllActiveSessionsAndCleanup('shutdown');
      console.log(`📊 Cleaned up ${voiceResult.count} voice sessions (${voiceResult.totalMinutes} minutes)`);
      
      // ✅ Gaming Sessions beenden
      let gamingSessionsEnded = 0;
      for (const [userId, session] of this.gamingSessions) {
        try {
          const user = await User.findOne({ discordId: userId });
          if (user) {
            await this.endGamingSession(user, session, userId, user.username);
            gamingSessionsEnded++;
          }
        } catch (error) {
          console.error(`Error ending gaming session for ${userId}:`, error);
        }
      }
      console.log(`🎮 Ended ${gamingSessionsEnded} gaming sessions`);
      
      this.voiceSessions.clear();
      this.gamingSessions.clear();
      this.presenceCache.clear();
      
      // Final Stats
      console.log(`📊 Bot Statistics:`);
      console.log(`   🎮 Gaming sessions started: ${this.stats.gamingSessionsStarted}`);
      console.log(`   🎮 Gaming sessions ended: ${this.stats.gamingSessionsEnded}`);
      console.log(`   ⏱️  Total gaming minutes: ${this.stats.totalGamingMinutes}`);
      console.log(`   📡 Presence updates: ${this.stats.presenceUpdates}`);
      
      this.client.destroy();
      console.log('🔴 Discord bot stopped');
    } catch (error) {
      console.error('Error stopping bot:', error);
    }
  }

  async getVoiceStats() {
    try {
      const stats = await VoiceSession.getCurrentStats();
      
      return {
        activeSessionsOnly: true,
        activeSessions: stats?.activeSessionsCount || 0,
        channelDistribution: stats?.channelDistribution || [],
        memoryCache: this.voiceSessions.size,
        databaseSize: stats?.activeSessionsCount || 0,
        note: 'Historical sessions are deleted after stats update to keep database minimal'
      };
    } catch (error) {
      console.error('Error getting voice stats:', error);
      return null;
    }
  }

  // ✅ NEW: Gaming Stats für Admin-Interface
  async getGamingStats() {
    try {
      const [currentlyPlaying, topGames, sessionStats] = await Promise.all([
        GameStats.getTopGames('active', 10),
        GameStats.getTopGames('week', 10),
        GameStats.aggregate([
          {
            $group: {
              _id: null,
              totalGames: { $sum: 1 },
              totalSessions: { $sum: '$stats.totalSessions' },
              totalMinutes: { $sum: '$stats.totalMinutes' },
              activeGames: {
                $sum: {
                  $cond: [{ $gt: ['$currentActivity.currentPlayers', 0] }, 1, 0]
                }
              }
            }
          }
        ])
      ]);

      const stats = sessionStats[0] || {};

      return {
        // Live-Daten aus Memory
        memoryStats: {
          activeSessionsCount: this.gamingSessions.size,
          activePlayers: Array.from(this.gamingSessions.keys()),
          currentGames: Array.from(new Set(Array.from(this.gamingSessions.values()).map(s => s.game)))
        },
        
        // Datenbank-Statistiken
        databaseStats: {
          totalGames: stats.totalGames || 0,
          totalSessions: stats.totalSessions || 0,
          totalHours: Math.floor((stats.totalMinutes || 0) / 60),
          activeGames: stats.activeGames || 0
        },
        
        // Top-Listen
        currentlyPlaying: currentlyPlaying,
        topGamesThisWeek: topGames,
        
        // Performance
        performance: {
          sessionsStarted: this.stats.gamingSessionsStarted,
          sessionsEnded: this.stats.gamingSessionsEnded,
          totalMinutesTracked: this.stats.totalGamingMinutes,
          presenceUpdatesProcessed: this.stats.presenceUpdates
        },
        
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting gaming stats:', error);
      return {
        error: error.message,
        memoryStats: { activeSessionsCount: 0 },
        databaseStats: { totalGames: 0 }
      };
    }
  }

  async performMaintenanceCleanup() {
    try {
      console.log('🧹 Performing maintenance cleanup...');
      
      // Voice Sessions Cleanup
      const oldVoiceSessions = await VoiceSession.find({
        startTime: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).populate('userId');
      
      if (oldVoiceSessions.length > 0) {
        console.log(`⚠️  Found ${oldVoiceSessions.length} voice sessions older than 24h, cleaning up...`);
        
        for (const session of oldVoiceSessions) {
          await session.endSessionAndDelete('maintenance');
        }
        
        console.log(`✅ Voice maintenance cleanup completed`);
      }

      // ✅ Gaming Stats Cleanup
      const cleanedGames = await GameStats.cleanupOldData();
      console.log(`🎮 Cleaned up ${cleanedGames} old games`);

      // ✅ Memory Consistency Check
      let memoryInconsistencies = 0;
      for (const [userId, session] of this.gamingSessions) {
        const user = await User.findOne({ discordId: userId });
        if (!user) {
          console.warn(`⚠️  Gaming session for unknown user ${userId}, removing from memory`);
          this.gamingSessions.delete(userId);
          memoryInconsistencies++;
        }
      }

      if (memoryInconsistencies > 0) {
        console.log(`🔧 Fixed ${memoryInconsistencies} memory inconsistencies`);
      }
      
      const remainingVoiceSessions = await VoiceSession.countDocuments();
      console.log(`📦 Active voice sessions remaining: ${remainingVoiceSessions}`);
      console.log(`🎮 Active gaming sessions in memory: ${this.gamingSessions.size}`);
      
    } catch (error) {
      console.error('Error during maintenance cleanup:', error);
    }
  }

  async triggerManualSync(type = 'daily') {
    if (this.autoSyncScheduler) {
      return await this.autoSyncScheduler.triggerManualSync(type);
    }
    return { success: false, message: 'Auto-sync not enabled' };
  }

  getAutoSyncStatus() {
    if (this.autoSyncScheduler) {
      return this.autoSyncScheduler.getStatus();
    }
    return { enabled: false };
  }

  // ✅ NEW: Detaillierte Bot-Statistiken
  getBotStats() {
    return {
      // Discord-Verbindung
      connection: {
        ready: this.client.isReady(),
        guilds: this.client.guilds?.cache?.size || 0,
        uptime: this.client.uptime ? Math.floor(this.client.uptime / 1000 / 60) : 0,
        ping: this.client.ws?.ping || -1
      },
      
      // Memory-Status
      memory: {
        voiceSessions: this.voiceSessions.size,
        gamingSessions: this.gamingSessions.size,
        presenceCache: this.presenceCache.size
      },
      
      // Performance-Counter
      performance: {
        gamingSessionsStarted: this.stats.gamingSessionsStarted,
        gamingSessionsEnded: this.stats.gamingSessionsEnded,
        totalGamingMinutes: this.stats.totalGamingMinutes,
        presenceUpdates: this.stats.presenceUpdates
      },
      
      // Aktueller Status
      current: {
        onlineMembers: this.presenceCache.size,
        playingMembers: this.gamingSessions.size,
        voiceMembers: this.voiceSessions.size,
        activeGames: new Set(Array.from(this.gamingSessions.values()).map(s => s.game)).size
      },
      
      timestamp: new Date()
    };
  }
}

module.exports = DiscordBot;