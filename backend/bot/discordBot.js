// backend/bot/discordBot.js - UPDATED mit GameStats Integration
const { Client, GatewayIntentBits, Events, ActivityType } = require('discord.js');
const User = require('../models/user.model');
const UserActivity = require('../models/userActivity.model');
const VoiceSession = require('../models/voiceSession.model');
const GameStats = require('../models/gameStats.model'); // ✅ NEU
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

    // Memory cache für Performance
    this.voiceSessions = new Map();
    this.gamingSessions = new Map(); // ✅ ENHANCED: Detaillierteres Gaming-Tracking
    this.presenceCache = new Map();
    this.autoSyncScheduler = null;
    
    this.initializeEventListeners();
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
      await this.initializeGameStats(); // ✅ NEU
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

  // ✅ NEU: Game Stats beim Bot-Start initialisieren
  async initializeGameStats() {
    try {
      console.log('🎮 Initializing game stats from current presences...');
      
      let totalGames = 0;
      let trackedGames = 0;
      
      for (const [guildId, guild] of this.client.guilds.cache) {
        const members = await guild.members.fetch();
        
        for (const [memberId, member] of members) {
          if (member.user.bot) continue;
          
          const presence = member.presence;
          if (presence && presence.activities) {
            const games = presence.activities.filter(activity => 
              activity.type === ActivityType.Playing || 
              activity.type === ActivityType.Streaming
            );
            
            for (const game of games) {
              totalGames++;
              
              // User aus DB holen
              const user = await User.findOne({ discordId: member.user.id });
              if (user) {
                // Game Stats aktualisieren
                await GameStats.updateGameStats(
                  game.name, 
                  user._id.toString(), 
                  'GAME_START'
                );
                
                // Memory Session erstellen
                this.gamingSessions.set(member.user.id, {
                  game: game.name,
                  startTime: new Date(),
                  userId: user._id.toString()
                });
                
                trackedGames++;
              }
            }
          }
        }
      }
      
      console.log(`✅ Game stats initialized: ${trackedGames}/${totalGames} games tracked`);
      
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

  // ✅ ENHANCED: Verbessertes Presence Update Handling mit GameStats
  async handlePresenceUpdate(oldPresence, newPresence) {
    if (!newPresence || !newPresence.member || newPresence.member.user.bot) return;

    const userId = newPresence.member.user.id;
    const username = newPresence.member.user.username;
    
    try {
      const oldStatus = oldPresence?.status || 'offline';
      const newStatus = newPresence.status || 'offline';
      
      // Status-Change loggen
      if (oldStatus !== newStatus) {
        console.log(`👤 ${username}: ${oldStatus} → ${newStatus}`);
      }
      
      // Cache aktualisieren basierend auf neuem Status
      if (['online', 'idle', 'dnd'].includes(newStatus)) {
        this.presenceCache.set(userId, {
          status: newStatus,
          activities: newPresence.activities || [],
          lastSeen: new Date()
        });
        
        await User.findOneAndUpdate(
          { discordId: userId },
          { 'stats.lastSeen': new Date() }
        );
      } else {
        this.presenceCache.delete(userId);
      }

      // ✅ ENHANCED: Gaming-Session tracking mit GameStats
      const user = await User.findOne({ discordId: userId });
      if (!user) return;

      const activities = newPresence.activities || [];
      const games = activities.filter(activity => 
        activity.type === ActivityType.Playing || 
        activity.type === ActivityType.Streaming
      );

      const currentGame = games[0];
      const previousSession = this.gamingSessions.get(userId);

      if (currentGame && !previousSession) {
        // ✅ Neues Spiel gestartet
        this.gamingSessions.set(userId, {
          game: currentGame.name,
          startTime: new Date(),
          userId: user._id.toString()
        });

        // GameStats aktualisieren
        await GameStats.updateGameStats(
          currentGame.name, 
          user._id.toString(), 
          'GAME_START'
        );

        await this.logActivity(user._id, 'GAME_START', {
          gameName: currentGame.name,
          gameType: currentGame.type
        });

        console.log(`🎮 ${username} started playing ${currentGame.name}`);
      } 
      else if (!currentGame && previousSession) {
        // ✅ Spiel beendet
        const duration = Math.floor((new Date() - previousSession.startTime) / 1000 / 60);
        
        await User.findByIdAndUpdate(user._id, {
          $inc: { 'stats.gamesPlayed': 1 },
          'stats.lastSeen': new Date()
        });

        // GameStats aktualisieren
        await GameStats.updateGameStats(
          previousSession.game, 
          user._id.toString(), 
          'GAME_END',
          duration
        );

        await this.logActivity(user._id, 'GAME_END', {
          gameName: previousSession.game,
          duration: duration
        });

        this.gamingSessions.delete(userId);
        console.log(`🎮 ${username} stopped playing ${previousSession.game} after ${duration} minutes`);
      }
      else if (currentGame && previousSession && currentGame.name !== previousSession.game) {
        // ✅ Spiel gewechselt
        const duration = Math.floor((new Date() - previousSession.startTime) / 1000 / 60);
        
        await User.findByIdAndUpdate(user._id, {
          $inc: { 'stats.gamesPlayed': 1 }
        });

        // Altes Spiel beenden
        await GameStats.updateGameStats(
          previousSession.game, 
          user._id.toString(), 
          'GAME_SWITCH',
          duration
        );

        // Neues Spiel starten
        await GameStats.updateGameStats(
          currentGame.name, 
          user._id.toString(), 
          'GAME_START'
        );

        await this.logActivity(user._id, 'GAME_SWITCH', {
          fromGame: previousSession.game,
          toGame: currentGame.name,
          duration: duration
        });

        this.gamingSessions.set(userId, {
          game: currentGame.name,
          startTime: new Date(),
          userId: user._id.toString()
        });

        console.log(`🎮 ${username} switched from ${previousSession.game} to ${currentGame.name}`);
      }
    } catch (error) {
      console.error('Error handling presence update:', error);
    }
  }

  // ✅ NEU: Live Gaming-Stats abrufen
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
            playerIds: []
          });
        }
        
        const gameData = currentGames.get(gameName);
        gameData.currentPlayers++;
        gameData.playerIds.push(userId);
      }

      // Top aktuelle Spiele
      const liveGames = Array.from(currentGames.values())
        .sort((a, b) => b.currentPlayers - a.currentPlayers)
        .slice(0, 10);

      return {
        totalPlayingNow: this.gamingSessions.size,
        activeGames: currentGames.size,
        topLiveGames: liveGames,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error getting live gaming stats:', error);
      return {
        totalPlayingNow: 0,
        activeGames: 0,
        topLiveGames: [],
        timestamp: new Date()
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
        playingMembers,
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
          
          onlineMembers.push({
            id: userId,
            username: member.user.username,
            status: presence.status,
            game: currentGame?.name || null,
            gameType: currentGame?.type || null,
            inVoice: !!member.voice.channel,
            voiceChannel: member.voice.channel?.name || null,
            lastSeen: presence.lastSeen
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

  async restoreActiveSessions() {
    try {
      console.log('🔄 Restoring active voice sessions...');
      
      const result = await VoiceSession.endAllActiveSessionsAndCleanup('restart');
      console.log(`📊 Cleaned up ${result.count} sessions from bot restart (${result.totalMinutes} minutes)`);
      
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

      if (this.voiceSessions.has(member.user.id)) {
        await this.endVoiceSession(member.user.id, 'server_leave');
      }

      // ✅ ENHANCED: Gaming-Session beim Server verlassen beenden
      if (this.gamingSessions.has(member.user.id)) {
        const session = this.gamingSessions.get(member.user.id);
        const duration = Math.floor((new Date() - session.startTime) / 1000 / 60);
        
        await GameStats.updateGameStats(
          session.game, 
          session.userId, 
          'GAME_END',
          duration
        );
        
        this.gamingSessions.delete(member.user.id);
        console.log(`🎮 Ended gaming session for ${member.user.username} (server leave)`);
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
          const duration = Math.floor((new Date() - session.startTime) / 1000 / 60);
          await GameStats.updateGameStats(
            session.game, 
            session.userId, 
            'GAME_END',
            duration
          );
          gamingSessionsEnded++;
        } catch (error) {
          console.error(`Error ending gaming session for ${userId}:`, error);
        }
      }
      console.log(`🎮 Ended ${gamingSessionsEnded} gaming sessions`);
      
      this.voiceSessions.clear();
      this.gamingSessions.clear();
      this.presenceCache.clear();
      
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

  async performMaintenanceCleanup() {
    try {
      console.log('🧹 Performing maintenance cleanup...');
      
      const oldSessions = await VoiceSession.find({
        startTime: { $lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }).populate('userId');
      
      if (oldSessions.length > 0) {
        console.log(`⚠️  Found ${oldSessions.length} sessions older than 24h, cleaning up...`);
        
        for (const session of oldSessions) {
          await session.endSessionAndDelete('maintenance');
        }
        
        console.log(`✅ Maintenance cleanup completed`);
      } else {
        console.log(`✅ No old sessions found, database is clean`);
      }
      
      const remainingSessions = await VoiceSession.countDocuments();
      console.log(`📦 Active voice sessions remaining: ${remainingSessions}`);
      
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
}

module.exports = DiscordBot;