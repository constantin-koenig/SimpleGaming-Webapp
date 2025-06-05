// backend/scripts/accurateSync.js
const mongoose = require('mongoose');
const User = require('../models/user.model');
const { Client, GatewayIntentBits, ChannelType } = require('discord.js');
require('dotenv').config();

class AccurateStatsSync {
  constructor() {
    this.client = null;
  }

  async connectDatabase() {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error);
      process.exit(1);
    }
  }

  async initializeBot() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
      ]
    });

    await this.client.login(process.env.DISCORD_BOT_TOKEN);
    
    await new Promise(resolve => {
      if (this.client.isReady()) {
        resolve();
      } else {
        this.client.once('ready', resolve);
      }
    });
    
    console.log(`✅ Bot ready. Found ${this.client.guilds.cache.size} guilds`);
  }

  // ECHTE Nachrichten zählen - das einzige was historisch möglich ist
  async scanAllMessages(guildId, maxMessagesPerChannel = 5000) {
    console.log('📊 Starting REAL message history scan...');
    console.log('💡 Note: Only messages can be scanned historically. Voice, gaming, and events require live tracking.');
    
    const guild = this.client.guilds.cache.get(guildId) || this.client.guilds.cache.first();
    if (!guild) {
      console.error('❌ No guild found');
      return;
    }

    console.log(`🏰 Scanning guild: ${guild.name}`);
    
    // Alle Text-Channels finden
    const textChannels = guild.channels.cache.filter(c => 
      c.type === ChannelType.GuildText && 
      c.permissionsFor(guild.members.me).has(['ViewChannel', 'ReadMessageHistory'])
    );
    
    console.log(`📝 Found ${textChannels.size} accessible text channels`);
    
    const userStats = new Map();
    let totalMessagesScanned = 0;
    let channelsCompleted = 0;

    for (const [channelId, channel] of textChannels) {
      try {
        console.log(`\n🔍 Scanning #${channel.name}...`);
        
        let lastMessageId = null;
        let channelMessageCount = 0;
        let hasMoreMessages = true;

        while (hasMoreMessages && channelMessageCount < maxMessagesPerChannel) {
          const options = { limit: 100 };
          if (lastMessageId) {
            options.before = lastMessageId;
          }

          try {
            const messages = await channel.messages.fetch(options);
            
            if (messages.size === 0) {
              hasMoreMessages = false;
              break;
            }

            messages.forEach(message => {
              if (!message.author.bot) {
                const userId = message.author.id;
                const currentStats = userStats.get(userId) || {
                  username: message.author.username,
                  messages: 0,
                  charactersTyped: 0,
                  firstMessage: message.createdAt,
                  lastMessage: message.createdAt
                };

                currentStats.messages++;
                currentStats.charactersTyped += message.content.length;
                
                if (message.createdAt < currentStats.firstMessage) {
                  currentStats.firstMessage = message.createdAt;
                }
                if (message.createdAt > currentStats.lastMessage) {
                  currentStats.lastMessage = message.createdAt;
                }

                userStats.set(userId, currentStats);
              }
            });

            lastMessageId = messages.last().id;
            channelMessageCount += messages.size;
            totalMessagesScanned += messages.size;
            
            // Progress anzeigen
            if (channelMessageCount % 1000 === 0) {
              console.log(`   📈 ${channelMessageCount} messages scanned in #${channel.name}`);
            }
            
            // Rate limiting für Discord API
            await new Promise(resolve => setTimeout(resolve, 1000)); // 1 Sekunde Pause
            
          } catch (fetchError) {
            console.error(`   ❌ Error fetching messages: ${fetchError.message}`);
            break;
          }
        }

        channelsCompleted++;
        console.log(`✅ #${channel.name}: ${channelMessageCount} messages (${channelsCompleted}/${textChannels.size} channels complete)`);
        
      } catch (channelError) {
        console.error(`❌ Error scanning #${channel.name}:`, channelError.message);
      }
    }

    console.log(`\n💾 Updating database with ${userStats.size} users...`);
    console.log(`📊 Total messages scanned: ${totalMessagesScanned}`);

    // Datenbank aktualisieren - NUR Messages
    let updated = 0;
    for (const [discordId, stats] of userStats) {
      try {
        const user = await User.findOne({ discordId });
        if (user) {
          await User.findByIdAndUpdate(user._id, {
            $set: {
              'stats.messagesCount': stats.messages,
              'stats.lastSeen': stats.lastMessage
            }
          });

          updated++;
          console.log(`✅ ${stats.username}: ${stats.messages} messages, ${Math.floor(stats.charactersTyped/1000)}k characters`);
        } else {
          console.log(`⚠️  User ${stats.username} (${discordId}) not found in database`);
        }
      } catch (error) {
        console.error(`❌ Error updating ${stats.username}:`, error.message);
      }
    }

    console.log(`\n🎉 Message sync completed!`);
    console.log(`📊 Updated ${updated} users with real message counts`);
    console.log(`💡 Voice, gaming, and event stats will be tracked live going forward`);
    
    return userStats;
  }

  // Statistiken validieren und korrigieren
  async validateAndFixStats() {
    console.log('🔍 Validating and fixing statistics...');
    
    const users = await User.find({});
    console.log(`📊 Checking ${users.length} users...`);
    
    let fixedCount = 0;
    
    for (const user of users) {
      let needsUpdate = false;
      const updates = {};
      
      // Null/undefined Werte korrigieren
      if (!user.stats) {
        updates.stats = {
          messagesCount: 0,
          voiceMinutes: 0,
          gamesPlayed: 0,
          eventsAttended: 0,
          lastSeen: new Date()
        };
        needsUpdate = true;
      } else {
        if (typeof user.stats.messagesCount !== 'number') {
          updates['stats.messagesCount'] = 0;
          needsUpdate = true;
        }
        if (typeof user.stats.voiceMinutes !== 'number') {
          updates['stats.voiceMinutes'] = 0;
          needsUpdate = true;
        }
        if (typeof user.stats.gamesPlayed !== 'number') {
          updates['stats.gamesPlayed'] = 0;
          needsUpdate = true;
        }
        if (typeof user.stats.eventsAttended !== 'number') {
          updates['stats.eventsAttended'] = 0;
          needsUpdate = true;
        }
        if (!user.stats.lastSeen) {
          updates['stats.lastSeen'] = new Date();
          needsUpdate = true;
        }
      }
      
      if (needsUpdate) {
        await User.findByIdAndUpdate(user._id, { $set: updates });
        fixedCount++;
        console.log(`🔧 Fixed stats for ${user.username}`);
      }
    }
    
    console.log(`✅ Fixed ${fixedCount} users with invalid stats`);
  }

  async cleanup() {
    if (this.client) {
      this.client.destroy();
    }
    await mongoose.disconnect();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const sync = new AccurateStatsSync();
  
  try {
    await sync.connectDatabase();
    await sync.initializeBot();

    const guildId = args[1] || process.env.DISCORD_GUILD_ID;

    switch (command) {
      case 'messages':
        const maxMessages = parseInt(args[2]) || 5000;
        await sync.scanAllMessages(guildId, maxMessages);
        break;

      case 'fix':
        await sync.validateAndFixStats();
        break;

      default:
        console.log(`
📊 Accurate Message Sync Tool

Usage:
  node scripts/accurateSync.js <command> [guildId] [options]

Commands:
  messages [guildId] [maxPerChannel]  - Scan real message history (only thing possible historically)
  fix                                 - Fix invalid/null stats

Examples:
  node scripts/accurateSync.js messages
  node scripts/accurateSync.js messages 123456789 10000
  node scripts/accurateSync.js fix

Note: 
- Only message counts can be synced historically
- Voice, gaming, and events require live tracking by the bot
- The bot will track all new activities automatically going forward
        `);
    }

  } catch (error) {
    console.error('❌ Sync failed:', error);
  } finally {
    await sync.cleanup();
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = AccurateStatsSync;