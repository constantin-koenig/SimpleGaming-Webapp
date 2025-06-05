// backend/bot/discordBot.js
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

    this.voiceSessions = new Map(); // In-Memory Cache für Performance
    this.gamingSessions = new Map(); // Verfolgt Gaming-Sessions
    this.autoSyncScheduler = null; // Auto-Sync Scheduler
    
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Bot ist bereit
    this.client.once(Events.ClientReady, async () => {
      console.log(`✅ Discord Bot ist online als ${this.client.user.tag}`);
      
      // Bot Status setzen
      this.client.user.setActivity('SimpleGaming Community', { 
        type: ActivityType.Watching 
      });

      // Aktive Voice-Sessions beim Start wiederherstellen
      await this.restoreActiveSessions();

      // Alle Mitglieder beim Start synchronisieren
      this.syncAllMembers();

      // Auto-Sync Scheduler starten
      this.startAutoSync();
    });

    // Neue Nachrichten verfolgen
    this.client.on(Events.MessageCreate, (message) => {
      this.handleMessage(message);
    });

    // Voice State Changes verfolgen
    this.client.on(Events.VoiceStateUpdate, (oldState, newState) => {
      this.handleVoiceStateUpdate(oldState, newState);
    });

    // Mitglied tritt Server bei
    this.client.on(Events.GuildMemberAdd, (member) => {
      this.handleMemberJoin(member);
    });

    // Mitglied verlässt Server
    this.client.on(Events.GuildMemberRemove, (member) => {
      this.handleMemberLeave(member);
    });

    // Presence Updates (Gaming Activity)
    this.client.on(Events.PresenceUpdate, (oldPresence, newPresence) => {
      this.handlePresenceUpdate(oldPresence, newPresence);
    });

    // Fehlerbehandlung
    this.client.on('error', (error) => {
      console.error('Discord Bot Error:', error);
    });
  }

  // Aktive Voice-Sessions beim Bot-Start wiederherstellen
  async restoreActiveSessions() {
    try {
      console.log('🔄 Restoring active voice sessions...');
      
      // Alle alten aktiven Sessions beenden (Bot war offline)
      const result = await VoiceSession.endAllActiveSessions('restart');
      console.log(`📊 Ended ${result.count} sessions from bot restart (${result.totalMinutes} minutes)`);
      
      // User-Stats mit den beendeten Sessions aktualisieren
      if (result.totalMinutes > 0) {
        const endedSessions = await VoiceSession.find({ 
          'metadata.botRestart': true,
          endTime: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Letzte 5 Minuten
        }).populate('userId');
        
        for (const session of endedSessions) {
          if (session.userId && session.duration > 0) {
            await User.findByIdAndUpdate(session.userId._id, {
              $inc: { 'stats.voiceMinutes': session.duration }
            });
            console.log(`📈 Added ${session.duration} minutes to ${session.userId.username}`);
          }
        }
      }
      
      // Aktuelle Voice-States scannen und neue Sessions starten
      const guilds = this.client.guilds.cache;
      let activeUsers = 0;
      
      for (const [guildId, guild] of guilds) {
        const voiceChannels = guild.channels.cache.filter(c => c.type === 2); // Voice channels
        
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

  // Voice-Session starten
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
        await existingSession.endSession('switch');
        await User.findByIdAndUpdate(user._id, {
          $inc: { 'stats.voiceMinutes': existingSession.duration }
        });
      }

      // Neue Session erstellen
      const session = await VoiceSession.create({
        userId: user._id,
        discordUserId: discordUserId,
        channelId: channel.id,
        channelName: channel.name,
        guildId: channel.guild.id,
        startTime: new Date()
      });

      // In Memory-Cache speichern für Performance
      this.voiceSessions.set(discordUserId, {
        sessionId: session._id,
        startTime: session.startTime,
        channelId: channel.id,
        channelName: channel.name
      });

      console.log(`🎤 ${user.username} joined voice: ${channel.name}`);
      
      return session;
    } catch (error) {
      console.error('Error starting voice session:', error);
    }
  }

  // Voice-Session beenden
  async endVoiceSession(discordUserId, reason = 'left') {
    try {
      const user = await User.findOne({ discordId: discordUserId });
      if (!user) return;

      // Session aus Cache entfernen
      this.voiceSessions.delete(discordUserId);

      // Aktive Session in DB finden und beenden
      const session = await VoiceSession.findOne({ 
        discordUserId: discordUserId, 
        isActive: true 
      });

      if (session) {
        const duration = await session.endSession(reason);
        
        if (duration > 0) {
          // User-Stats aktualisieren
          await User.findByIdAndUpdate(user._id, {
            $inc: { 'stats.voiceMinutes': duration },
            $set: { 'stats.lastSeen': new Date() }
          });

          console.log(`🎤 ${user.username} left voice after ${duration} minutes`);
          
          // UserActivity loggen
          await this.logActivity(user._id, 'VOICE_LEAVE', {
            channelId: session.channelId,
            channelName: session.channelName,
            duration: duration,
            reason: reason
          });
        }
        
        return duration;
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
    // Ignoriere Bot-Nachrichten
    if (message.author.bot) return;

    try {
      // Benutzer in DB finden
      const user = await User.findOne({ discordId: message.author.id });
      if (!user) return;

      // Nachrichtenzähler erhöhen
      await User.findByIdAndUpdate(user._id, {
        $inc: { 'stats.messagesCount': 1 },
        'stats.lastSeen': new Date()
      });

      // Detaillierte Aktivität speichern
      await this.logActivity(user._id, 'MESSAGE', {
        channelId: message.channel.id,
        channelName: message.channel.name,
        messageLength: message.content.length,
        hasAttachments: message.attachments.size > 0
      });

      console.log(`📝 Message logged for ${message.author.username}`);
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
        
        await this.logActivity(
          (await User.findOne({ discordId: userId }))?._id,
          'VOICE_JOIN',
          {
            channelId: newState.channelId,
            channelName: newState.channel.name,
            guildId: newState.guild.id
          }
        );
      }
      
      // User verlässt Voice Channel
      else if (oldState.channelId && !newState.channelId) {
        await this.endVoiceSession(userId, 'left');
      }
      
      // User wechselt Voice Channel
      else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
        // Alte Session beenden
        await this.endVoiceSession(userId, 'switch');
        
        // Neue Session starten
        await this.startVoiceSession(userId, newState.channel);
        
        console.log(`🔄 ${newState.member.user.username} switched from ${oldState.channel.name} to ${newState.channel.name}`);
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

      // Gaming-Session tracking
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
        // Gaming-Session beendet
        const duration = Math.floor((new Date() - previousSession.startTime) / 1000 / 60);
        
        await User.findByIdAndUpdate(user._id, {
          $inc: { 'stats.gamesPlayed': 1 },
          'stats.lastSeen': new Date()
        });

        await this.logActivity(user._id, 'GAME_END', {
          gameName: previousSession.game,
          duration: duration
        });

        this.gamingSessions.delete(userId);
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
      // Prüfen ob Benutzer bereits existiert
      let user = await User.findOne({ discordId: member.user.id });
      
      if (!user) {
        // Neuen Benutzer erstellen
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
        // Benutzer-Info aktualisieren
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

      // Aktive Sessions beenden
      if (this.voiceSessions.has(member.user.id)) {
        const session = this.voiceSessions.get(member.user.id);
        const duration = Math.floor((new Date() - session.startTime) / 1000 / 60);
        
        await User.findByIdAndUpdate(user._id, {
          $inc: { 'stats.voiceMinutes': duration }
        });

        this.voiceSessions.delete(member.user.id);
      }

      if (this.gamingSessions.has(member.user.id)) {
        this.gamingSessions.delete(member.user.id);
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
            // Neuen Benutzer erstellen
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
            // Benutzer-Info aktualisieren
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

  // Statistiken für Events
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

  // Bot starten
  async start() {
    try {
      await this.client.login(process.env.DISCORD_BOT_TOKEN);
    } catch (error) {
      console.error('Failed to start Discord bot:', error);
      process.exit(1);
    }
  }

  // Bot stoppen
  async stop() {
    try {
      // Auto-Sync Scheduler stoppen
      if (this.autoSyncScheduler) {
        this.autoSyncScheduler.stop();
      }

      console.log('🔄 Ending all active voice sessions...');
      
      // Alle aktiven Voice-Sessions beenden
      const result = await VoiceSession.endAllActiveSessions('shutdown');
      console.log(`📊 Ended ${result.count} voice sessions (${result.totalMinutes} minutes)`);
      
      // User-Stats mit den beendeten Sessions aktualisieren
      if (result.totalMinutes > 0) {
        const endedSessions = await VoiceSession.find({ 
          'metadata.botRestart': true,
          endTime: { $gte: new Date(Date.now() - 2 * 60 * 1000) } // Letzte 2 Minuten
        }).populate('userId');
        
        for (const session of endedSessions) {
          if (session.userId && session.duration > 0) {
            await User.findByIdAndUpdate(session.userId._id, {
              $inc: { 'stats.voiceMinutes': session.duration }
            });
          }
        }
      }

      this.client.destroy();
      console.log('🔴 Discord bot stopped');
    } catch (error) {
      console.error('Error stopping bot:', error);
    }
  }

  // Voice-Statistiken abrufen
  async getVoiceStats() {
    try {
      const activeSessionsCount = await VoiceSession.countDocuments({ isActive: true });
      const totalSessions = await VoiceSession.countDocuments({});
      const totalMinutes = await VoiceSession.aggregate([
        { $match: { isActive: false } },
        { $group: { _id: null, total: { $sum: '$duration' } } }
      ]);

      return {
        activeSessions: activeSessionsCount,
        totalSessions: totalSessions,
        totalMinutes: totalMinutes[0]?.total || 0,
        memoryCache: this.voiceSessions.size
      };
    } catch (error) {
      console.error('Error getting voice stats:', error);
      return null;
    }
  }

  // Auto-Sync manuell triggern
  async triggerManualSync(type = 'daily') {
    if (this.autoSyncScheduler) {
      return await this.autoSyncScheduler.triggerManualSync(type);
    }
    return { success: false, message: 'Auto-sync not enabled' };
  }

  // Auto-Sync Status abrufen
  getAutoSyncStatus() {
    if (this.autoSyncScheduler) {
      return this.autoSyncScheduler.getStatus();
    }
    return { enabled: false };
  }
}

module.exports = DiscordBot;