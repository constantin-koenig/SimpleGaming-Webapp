// backend/bot/index.js - UPDATED mit besserer Fehlerbehandlung
const DiscordBot = require('./discordBot');
const BotCommands = require('./commands');

class BotManager {
  constructor() {
    this.discordBot = null;
    this.commands = null;
  }

  async start() {
    try {
      console.log('🤖 Starting Discord Bot...');
      
      // Validierung der Umgebungsvariablen
      if (!process.env.DISCORD_BOT_TOKEN) {
        console.log('⚠️  DISCORD_BOT_TOKEN not found, skipping bot startup');
        return false;
      }

      // Discord Bot initialisieren
      this.discordBot = new DiscordBot();
      
      // Commands initialisieren
      this.commands = new BotCommands(this.discordBot.client);
      
      // Interaction Handler registrieren
      this.discordBot.client.on('interactionCreate', async (interaction) => {
        await this.commands.handleInteraction(interaction);
      });

      // Bot starten
      await this.discordBot.start();
      
      // Commands deployen (nur wenn explizit aktiviert)
      if (process.env.DEPLOY_COMMANDS === 'true') {
        console.log('🔧 DEPLOY_COMMANDS is true, attempting to deploy commands...');
        
        // Guild ID validieren
        const guildId = process.env.DISCORD_GUILD_ID;
        if (guildId && guildId !== process.env.DISCORD_CLIENT_ID) {
          console.log(`🎯 Using Guild ID: ${guildId}`);
          await this.commands.deployCommands(guildId);
        } else {
          console.log('⚠️  Invalid DISCORD_GUILD_ID, deploying globally...');
          await this.commands.deployCommands();
        }
      } else {
        console.log('⏭️  Skipping command deployment (DEPLOY_COMMANDS not set to true)');
        console.log('💡 To enable commands: Set DEPLOY_COMMANDS=true in .env');
      }

      console.log('✅ Discord Bot successfully started!');
      return true;
    } catch (error) {
      console.error('❌ Failed to start Discord Bot:', error);
      
      // Bot-spezifische Fehlerbehandlung
      if (error.message.includes('TOKEN_INVALID')) {
        console.log('🔑 Bot Token ist ungültig! Überprüfe DISCORD_BOT_TOKEN in .env');
      } else if (error.message.includes('DISALLOWED_INTENTS')) {
        console.log('🔧 Bot Intents nicht aktiviert! Aktiviere sie im Discord Developer Portal');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        console.log('🌐 Netzwerk-Problem: Überprüfe Internetverbindung');
      }
      
      return false;
    }
  }

  async stop() {
    try {
      if (this.discordBot) {
        await this.discordBot.stop();
        console.log('🛑 Discord Bot stopped');
      }
    } catch (error) {
      console.error('Error stopping Discord Bot:', error);
    }
  }

  // Methode für Event-Tracking von der Web-App aus
  async trackEventParticipation(discordUserId, eventId, eventName, participationType = 'JOINED') {
    if (this.discordBot) {
      return await this.discordBot.trackEventParticipation(discordUserId, eventId, eventName, participationType);
    }
  }

  // Status des Bots
  isRunning() {
    return this.discordBot && this.discordBot.client && this.discordBot.client.isReady();
  }

  // Bot-Statistiken
  getStats() {
    if (!this.isRunning()) return null;

    const client = this.discordBot.client;
    return {
      guilds: client.guilds.cache.size,
      users: client.users.cache.size,
      channels: client.channels.cache.size,
      uptime: client.uptime,
      ping: client.ws.ping
    };
  }

  // Validierung der Bot-Konfiguration
  validateConfig() {
    const issues = [];
    
    if (!process.env.DISCORD_BOT_TOKEN) {
      issues.push('DISCORD_BOT_TOKEN fehlt');
    }
    
    if (process.env.DISCORD_GUILD_ID === process.env.DISCORD_CLIENT_ID) {
      issues.push('DISCORD_GUILD_ID ist identisch mit DISCORD_CLIENT_ID (falsche Server ID)');
    }
    
    return issues;
  }
}

module.exports = BotManager;