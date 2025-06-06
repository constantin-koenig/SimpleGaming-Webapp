// backend/bot/discordBot.js - OPTIMIERT für minimale DB-Größe
const { Client, GatewayIntentBits, Events, ActivityType } = require('discord.js');
const User = require('../models/user.model');
const UserActivity = require('../models/userActivity.model');
const VoiceSession = require('../models/voiceSession.model');
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

    // Nur In-Memory Cache für Performance, keine redundante DB-Speicherung
    this.voiceSessions = new Map(); // discordUserId -> { sessionId, startTime, channelName }
    this.gamingSessions = new Map(); // discordUserId -> { game, startTime }
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
      this.syncAllMembers();
      this.startAutoSync();
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

  // Aktive Sessions beim Bot-Start wiederherstellen
  async restoreActiveSessions() {
    try {
      console.log('🔄 Restoring active voice sessions...');
      
      // Alle alten aktiven Sessions beenden und LÖSCHEN
      const result = await VoiceSession.endAllActiveSessionsAndCleanup('restart');
      console.log(`📊 Cleaned up ${result.count} sessions from bot restart (${result.totalMinutes} minutes)`);
      
      // Aktuelle Voice-States scannen und neue Sessions starten
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
      
      // DB-Größe nach Cleanup loggen
      const remainingSessions = await VoiceSession.countDocuments();
      console.log(`📦 Voice sessions in database: ${remainingSessions} (should equal active users)`);
      
    } catch (error) {
      console.error('❌ Error restoring voice sessions:', error);
    }
  }

  // Voice-Session starten (nur für aktive Sessions)
  async startVoiceSession(discordUserId, channel) {
    try {
      const user = await User.findOne({ discordId: discordUserId });
      if (!user) return;

      // Prüfen ob bereits eine aktive Session existiert
      const existingSession = await VoiceSession.findOne({ 
        discordUserId: discordUserId, 
        isActive: true 
      });
      
      if (existingSession) {
        console.log(`⚠️  User ${discordUserId} already has active session, ending old one`);
        await existingSession.endSessionAndDelete('switch');
        // Session wurde automatisch gelöscht
      }

      // Neue Session erstellen (wird automatisch als active=true erstellt)
      const session = await VoiceSession.create({
        userId: user._id,
        discordUserId: discordUserId,
        channelId: channel.id,
        channelName: channel.name,
        guildId: channel.guild.id,
        startTime: new Date()
      });

      // In Memory-Cache für schnellen Zugriff
      this.voiceSessions.set(discordUserId, {
        sessionId: session._id,
        startTime: session.startTime,
        channelId: channel.id,
        channelName: channel.name
      });

      console.log(`🎤 ${user.username} joined voice: ${channel.name}`);
      
      // Voice JOIN Activity loggen
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

  // Voice-Session beenden und LÖSCHEN
  async endVoiceSession(discordUserId, reason = 'left') {
    try {
      const user = await User.findOne({ discordId: discordUserId });
      if (!user) return;

      // Session aus Memory-Cache entfernen
      this.voiceSessions.delete(discordUserId);

      // Aktive Session finden, Stats aktualisieren und LÖSCHEN
      const session = await VoiceSession.findOne({ 
        discordUserId: discordUserId, 
        isActive: true 
      });

      if (session) {
        // endSessionAndDelete aktualisiert automatisch User-Stats und löscht die Session
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

  // Auto-Sync Scheduler starten
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

      // Nachrichtenzähler erhöhen
      await User.findByIdAndUpdate(user._id, {
        $inc: { 'stats.messagesCount': 1 },
        'stats.lastSeen': new Date()
      });

      // Detaillierte Aktivität speichern (für Analytics)
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
      // User betritt Voice Channel
      if (!oldState.channelId && newState.channelId) {
        await this.startVoiceSession(userId, newState.channel);
      }
      
      // User verlässt Voice Channel
      else if (oldState.channelId && !newState.channelId) {
        await this.endVoiceSession(userId, 'left');
      }
      
      // User wechselt Voice Channel
      else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        // Alte Session beenden und löschen
        await this.endVoiceSession(userId, 'switch');
        
        // Neue Session starten
        await this.startVoiceSession(userId, newState.channel);
        
        console.log(`🔄 ${newPresence.member.user.username} switched from ${oldState.channel.name} to ${newState.channel.name}`);
      }
    } catch (error) {
      console.error('Error handling voice state update:', error);
    }
  }

  async handlePresenceUpdate(oldPresence, newPresence) {
    if (!newPresence || !newPresence.member) return;

    const userId = newPresence.member.user.id;
    
    try {
      const user = await User.findOne({ discordId: userId });
      if (!user) return;

      const activities = newPresence.activities || [];
      const games = activities.filter(activity => 
        activity.type === ActivityType.Playing || 
        activity.type === ActivityType.Streaming
      );

      // Gaming-Session tracking (nur im Memory, keine DB)
      const currentGame = games[0];
      const previousSession = this.gamingSessions.get(userId);

      if (currentGame && !previousSession) {
        // Neue Gaming-Session gestartet
        this.gamingSessions.set(userId, {
          game: currentGame.name,
          startTime: new Date()
        });

        await this.logActivity(user._id, 'GAME_START', {
          gameName: currentGame.name,
          gameType: currentGame.type
        });

        console.log(`🎮 ${newPresence.member.user.username} started playing ${currentGame.name}`);
      } 
      else if (!currentGame && previousSession) {
        // Gaming-Session beendet - Stats aktualisieren und Memory löschen
        const duration = Math.floor((new Date() - previousSession.startTime) / 1000 / 60);
        
        await User.findByIdAndUpdate(user._id, {
          $inc: { 'stats.gamesPlayed': 1 },
          'stats.lastSeen': new Date()
        });

        await this.logActivity(user._id, 'GAME_END', {
          gameName: previousSession.game,
          duration: duration
        });

        this.gamingSessions.delete(userId); // Memory cleanup
        console.log(`🎮 ${newPresence.member.user.username} stopped playing ${previousSession.game} after ${duration} minutes`);
      }
      else if (currentGame && previousSession && currentGame.name !== previousSession.game) {
        // Spiel gewechselt
        const duration = Math.floor((new Date() - previousSession.startTime) / 1000 / 60);
        
        await User.findByIdAndUpdate(user._id, {
          $inc: { 'stats.gamesPlayed': 1 }
        });

        await this.logActivity(user._id, 'GAME_SWITCH', {
          fromGame: previousSession.game,
          toGame: currentGame.name,
          duration: duration
        });

        this.gamingSessions.set(userId, {
          game: currentGame.name,
          startTime: new Date()
        });

        console.log(`🎮 ${newPresence.member.user.username} switched from ${previousSession.game} to ${currentGame.name}`);
      }
    } catch (error) {
      console.error('Error handling presence update:', error);
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

      // Aktive Sessions beenden und löschen
      if (this.voiceSessions.has(member.user.id)) {
        await this.endVoiceSession(member.user.id, 'server_leave');
      }

      if (this.gamingSessions.has(member.user.id)) {
        this.gamingSessions.delete(member.user.id); // Memory cleanup
      }

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

      console.log('🔄 Ending all active voice sessions and cleaning up database...');
      
      // Alle aktiven Voice-Sessions beenden und LÖSCHEN
      const result = await VoiceSession.endAllActiveSessionsAndCleanup('shutdown');
      console.log(`📊 Cleaned up ${result.count} voice sessions (${result.totalMinutes} minutes)`);
      
      // Memory caches leeren
      this.voiceSessions.clear();
      this.gamingSessions.clear();
      
      this.client.destroy();
      console.log('🔴 Discord bot stopped');
    } catch (error) {
      console.error('Error stopping bot:', error);
    }
  }

  // Optimierte Voice-Statistiken (nur aktive Sessions)
  async getVoiceStats() {
    try {
      const stats = await VoiceSession.getCurrentStats();
      
      return {
        activeSessionsOnly: true, // Indikator dass nur aktive Sessions getrackt werden
        activeSessions: stats?.activeSessionsCount || 0,
        channelDistribution: stats?.channelDistribution || [],
        memoryCache: this.voiceSessions.size,
        databaseSize: stats?.activeSessionsCount || 0, // Sollte sehr klein sein
        note: 'Historical sessions are deleted after stats update to keep database minimal'
      };
    } catch (error) {
      console.error('Error getting voice stats:', error);
      return null;
    }
  }

  // Manual cleanup für sehr alte Sessions (Maintenance)
  async performMaintenanceCleanup() {
    try {
      console.log('🧹 Performing maintenance cleanup...');
      
      // Finde Sessions die älter als 24 Stunden sind (sollte normalerweise keine geben)
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
      
      // Log finale DB-Größe
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