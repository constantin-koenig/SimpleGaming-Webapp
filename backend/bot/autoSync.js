// backend/bot/autoSync.js
const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/user.model');
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');

class AutoSyncScheduler {
  constructor(botManager) {
    this.botManager = botManager;
    this.isRunning = false;
    this.lastSyncTime = null;
    this.scheduledTasks = [];
  }

  // Automatischen Sync starten
  start() {
    console.log('⏰ Starting auto-sync scheduler...');

    // Täglich um 3:00 Uhr morgens (wenig Traffic)
    const dailySync = cron.schedule('0 3 * * *', async () => {
      await this.performAutoSync('daily');
    }, {
      scheduled: false,
      timezone: 'Europe/Berlin'
    });

    // Wöchentlich sonntags um 2:00 Uhr (großer Sync)
    const weeklySync = cron.schedule('0 2 * * 0', async () => {
      await this.performAutoSync('weekly');
    }, {
      scheduled: false,
      timezone: 'Europe/Berlin'
    });

    this.scheduledTasks.push(dailySync, weeklySync);

    // Tasks starten
    dailySync.start();
    weeklySync.start();

    console.log('✅ Auto-sync scheduled:');
    console.log('   📅 Daily: 3:00 AM (quick sync)');
    console.log('   📅 Weekly: Sunday 2:00 AM (full sync)');
  }

  // Sync durchführen ohne Live-Tracking zu unterbrechen
  async performAutoSync(type = 'daily') {
    if (this.isRunning) {
      console.log('⚠️  Auto-sync already running, skipping...');
      return;
    }

    console.log(`\n🔄 Starting ${type} auto-sync...`);
    this.isRunning = true;
    this.lastSyncTime = new Date();

    try {
      // Separate Client für Sync (um Live-Bot nicht zu stören)
      const syncClient = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent
        ]
      });

      await syncClient.login(process.env.DISCORD_BOT_TOKEN);
      
      // Warten bis ready
      await new Promise(resolve => {
        if (syncClient.isReady()) {
          resolve();
        } else {
          syncClient.once('ready', resolve);
        }
      });

      console.log('🤖 Sync bot connected');

      // Sync-Parameter je nach Typ
      const syncParams = {
        daily: { maxMessagesPerChannel: 1000, maxChannels: 5 },
        weekly: { maxMessagesPerChannel: 5000, maxChannels: -1 }
      };

      const params = syncParams[type] || syncParams.daily;

      // Message-Sync durchführen
      await this.syncMessages(syncClient, params);

      // Stats validieren
      await this.validateStats();

      // Sync Client sauber schließen
      syncClient.destroy();

      console.log(`✅ ${type} auto-sync completed successfully`);
      
      // Sync-Statistiken loggen
      await this.logSyncStats(type);

    } catch (error) {
      console.error(`❌ Auto-sync failed:`, error);
    } finally {
      this.isRunning = false;
    }
  }

  // Message-Sync (basierend auf accurateSync aber optimiert)
  async syncMessages(client, params) {
    const guild = client.guilds.cache.first();
    if (!guild) {
      console.log('❌ No guild found for sync');
      return;
    }

    console.log(`📊 Syncing messages in ${guild.name}`);

    // Text-Channels finden
    let textChannels = guild.channels.cache.filter(c => 
      c.type === ChannelType.GuildText && 
      c.permissionsFor(guild.members.me).has(['ViewChannel', 'ReadMessageHistory'])
    );

    // Bei daily sync nur aktive Channels
    if (params.maxChannels > 0) {
      textChannels = textChannels.first(params.maxChannels);
    }

    console.log(`📝 Syncing ${textChannels.size} channels`);

    const userMessageCounts = new Map();
    let totalScanned = 0;

    for (const [channelId, channel] of textChannels) {
      try {
        console.log(`🔍 Syncing #${channel.name}...`);
        
        // Nur neue Nachrichten seit letztem Sync
        const lastSync = this.lastSyncTime || new Date(Date.now() - 24 * 60 * 60 * 1000); // 24h zurück
        
        let lastMessageId = null;
        let channelCount = 0;
        let foundOldMessage = false;

        while (channelCount < params.maxMessagesPerChannel && !foundOldMessage) {
          const options = { limit: 100 };
          if (lastMessageId) options.before = lastMessageId;

          const messages = await channel.messages.fetch(options);
          if (messages.size === 0) break;

          for (const [messageId, message] of messages) {
            // Stop wenn Nachricht älter als letzter Sync
            if (message.createdAt < lastSync) {
              foundOldMessage = true;
              break;
            }

            if (!message.author.bot) {
              const current = userMessageCounts.get(message.author.id) || 0;
              userMessageCounts.set(message.author.id, current + 1);
            }
          }

          lastMessageId = messages.last().id;
          channelCount += messages.size;
          totalScanned += messages.size;
          
          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log(`   ✅ ${channelCount} messages scanned`);
      } catch (error) {
        console.error(`   ❌ Error in #${channel.name}:`, error.message);
      }
    }

    console.log(`📊 Total: ${totalScanned} messages from ${userMessageCounts.size} users`);

    // Datenbank aktualisieren (ADDITIVE - keine Überschreibung!)
    let updated = 0;
    for (const [discordId, newMessages] of userMessageCounts) {
      try {
        // WICHTIG: $inc statt $set um Live-Daten nicht zu verlieren!
        const result = await User.findOneAndUpdate(
          { discordId: discordId },
          { 
            $inc: { 'stats.messagesCount': newMessages },
            $set: { 'stats.lastSeen': new Date() }
          },
          { new: true }
        );

        if (result) {
          updated++;
          console.log(`📈 ${result.username}: +${newMessages} messages (total: ${result.stats.messagesCount})`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${discordId}:`, error.message);
      }
    }

    console.log(`✅ Updated ${updated} users with new message counts`);
  }

  // Stats validieren ohne Live-Daten zu verlieren
  async validateStats() {
    console.log('🔍 Validating stats...');
    
    const usersWithInvalidStats = await User.find({
      $or: [
        { 'stats.messagesCount': { $exists: false } },
        { 'stats.voiceMinutes': { $exists: false } },
        { 'stats.gamesPlayed': { $exists: false } },
        { 'stats.eventsAttended': { $exists: false } },
        { 'stats.messagesCount': null },
        { 'stats.voiceMinutes': null },
        { 'stats.gamesPlayed': null },
        { 'stats.eventsAttended': null }
      ]
    });

    if (usersWithInvalidStats.length > 0) {
      console.log(`🔧 Fixing ${usersWithInvalidStats.length} users with invalid stats`);
      
      for (const user of usersWithInvalidStats) {
        const updates = {};
        
        if (typeof user.stats?.messagesCount !== 'number') {
          updates['stats.messagesCount'] = 0;
        }
        if (typeof user.stats?.voiceMinutes !== 'number') {
          updates['stats.voiceMinutes'] = 0;
        }
        if (typeof user.stats?.gamesPlayed !== 'number') {
          updates['stats.gamesPlayed'] = 0;
        }
        if (typeof user.stats?.eventsAttended !== 'number') {
          updates['stats.eventsAttended'] = 0;
        }
        if (!user.stats?.lastSeen) {
          updates['stats.lastSeen'] = new Date();
        }

        if (Object.keys(updates).length > 0) {
          await User.findByIdAndUpdate(user._id, { $set: updates });
          console.log(`   🔧 Fixed ${user.username}`);
        }
      }
    }

    console.log('✅ Stats validation completed');
  }

  // Sync-Statistiken loggen
  async logSyncStats(type) {
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments({
      'stats.lastSeen': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    const totalMessages = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$stats.messagesCount' } } }
    ]);

    console.log(`\n📊 Sync Summary (${type}):`);
    console.log(`   👥 Total users: ${totalUsers}`);
    console.log(`   🟢 Active users (7d): ${activeUsers}`);
    console.log(`   💬 Total messages: ${totalMessages[0]?.total || 0}`);
    console.log(`   ⏰ Sync completed at: ${new Date().toLocaleString('de-DE')}`);
  }

  // Manueller Sync trigger
  async triggerManualSync(type = 'daily') {
    if (this.isRunning) {
      return { success: false, message: 'Sync already running' };
    }

    console.log(`🔄 Manual ${type} sync triggered`);
    await this.performAutoSync(type);
    
    return { 
      success: true, 
      message: `${type} sync completed`,
      lastSync: this.lastSyncTime
    };
  }

  // Status abrufen
  getStatus() {
    return {
      isRunning: this.isRunning,
      lastSyncTime: this.lastSyncTime,
      scheduledTasks: this.scheduledTasks.map(task => ({
        running: task.running,
        options: task.options
      }))
    };
  }

  // Scheduler stoppen
  stop() {
    console.log('🛑 Stopping auto-sync scheduler...');
    
    this.scheduledTasks.forEach(task => {
      if (task.running) {
        task.stop();
      }
    });
    
    this.scheduledTasks = [];
    console.log('✅ Auto-sync scheduler stopped');
  }
}

module.exports = AutoSyncScheduler;