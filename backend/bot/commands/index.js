// backend/bot/commands/index.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/user.model');
const UserActivity = require('../../models/userActivity.model');

class BotCommands {
  constructor(client) {
    this.client = client;
    this.commands = new Map();
    this.registerCommands();
  }

  registerCommands() {
    // /stats Command
    this.commands.set('stats', {
      data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Zeige deine Community-Statistiken')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Benutzer dessen Statistiken angezeigt werden sollen')
            .setRequired(false)
        )
        .addStringOption(option =>
          option.setName('timeframe')
            .setDescription('Zeitraum für die Statistiken')
            .setRequired(false)
            .addChoices(
              { name: 'Heute', value: 'day' },
              { name: 'Diese Woche', value: 'week' },
              { name: 'Dieser Monat', value: 'month' },
              { name: 'Gesamt', value: 'all' }
            )
        ),
      execute: async (interaction) => {
        await this.handleStatsCommand(interaction);
      }
    });

    // /leaderboard Command
    this.commands.set('leaderboard', {
      data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Zeige die aktivsten Community-Mitglieder')
        .addStringOption(option =>
          option.setName('timeframe')
            .setDescription('Zeitraum für das Leaderboard')
            .setRequired(false)
            .addChoices(
              { name: 'Heute', value: 'day' },
              { name: 'Diese Woche', value: 'week' },
              { name: 'Dieser Monat', value: 'month' }
            )
        )
        .addStringOption(option =>
          option.setName('type')
            .setDescription('Art der Aktivität')
            .setRequired(false)
            .addChoices(
              { name: 'Nachrichten', value: 'MESSAGE' },
              { name: 'Voice Zeit', value: 'VOICE' },
              { name: 'Gaming', value: 'GAME' },
              { name: 'Gesamt', value: 'all' }
            )
        ),
      execute: async (interaction) => {
        await this.handleLeaderboardCommand(interaction);
      }
    });

    // /profile Command
    this.commands.set('profile', {
      data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Zeige dein Community-Profil')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Benutzer dessen Profil angezeigt werden soll')
            .setRequired(false)
        ),
      execute: async (interaction) => {
        await this.handleProfileCommand(interaction);
      }
    });

    // /activity Command
    this.commands.set('activity', {
      data: new SlashCommandBuilder()
        .setName('activity')
        .setDescription('Zeige deine letzten Aktivitäten')
        .addIntegerOption(option =>
          option.setName('limit')
            .setDescription('Anzahl der Aktivitäten (max 20)')
            .setRequired(false)
            .setMinValue(1)
            .setMaxValue(20)
        ),
      execute: async (interaction) => {
        await this.handleActivityCommand(interaction);
      }
    });

    // Event-Management Commands für Admins
    this.commands.set('event', {
      data: new SlashCommandBuilder()
        .setName('event')
        .setDescription('Event-Management Befehle')
        .addSubcommand(subcommand =>
          subcommand
            .setName('create')
            .setDescription('Erstelle ein neues Event')
            .addStringOption(option =>
              option.setName('name')
                .setDescription('Name des Events')
                .setRequired(true)
            )
            .addStringOption(option =>
              option.setName('description')
                .setDescription('Beschreibung des Events')
                .setRequired(true)
            )
            .addStringOption(option =>
              option.setName('datetime')
                .setDescription('Datum und Zeit (YYYY-MM-DD HH:MM)')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('join')
            .setDescription('Einem Event beitreten')
            .addStringOption(option =>
              option.setName('event_id')
                .setDescription('Event ID')
                .setRequired(true)
            )
        )
        .addSubcommand(subcommand =>
          subcommand
            .setName('leave')
            .setDescription('Ein Event verlassen')
            .addStringOption(option =>
              option.setName('event_id')
                .setDescription('Event ID')
                .setRequired(true)
            )
        ),
      execute: async (interaction) => {
        await this.handleEventCommand(interaction);
      }
    });
  }

  async handleStatsCommand(interaction) {
    try {
      const targetUser = interaction.options.getUser('user') || interaction.user;
      const timeframe = interaction.options.getString('timeframe') || 'month';

      await interaction.deferReply();

      const user = await User.findOne({ discordId: targetUser.id });
      if (!user) {
        return await interaction.editReply('❌ Benutzer nicht in der Datenbank gefunden.');
      }

      const activityStats = await UserActivity.getActivityStats(user._id, timeframe);
      
      // Statistiken verarbeiten
      const stats = {
        messages: 0,
        voiceTime: 0,
        gamesPlayed: 0,
        eventsAttended: 0
      };

      activityStats.forEach(stat => {
        switch(stat._id) {
          case 'MESSAGE':
            stats.messages = stat.count;
            break;
          case 'VOICE_LEAVE':
          case 'VOICE_SWITCH':
            stats.voiceTime += stat.totalDuration;
            break;
          case 'GAME_END':
          case 'GAME_SWITCH':
            stats.gamesPlayed += stat.count;
            break;
          case 'EVENT_JOINED':
            stats.eventsAttended = stat.count;
            break;
        }
      });

      const embed = new EmbedBuilder()
        .setColor('#4F46E5')
        .setTitle(`📊 Statistiken für ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { 
            name: '💬 Nachrichten', 
            value: `${stats.messages + (user.stats?.messagesCount || 0)}`, 
            inline: true 
          },
          { 
            name: '🎤 Voice-Zeit', 
            value: `${Math.floor((stats.voiceTime + (user.stats?.voiceMinutes || 0)) / 60)}h ${(stats.voiceTime + (user.stats?.voiceMinutes || 0)) % 60}m`, 
            inline: true 
          },
          { 
            name: '🎮 Spiele gespielt', 
            value: `${stats.gamesPlayed + (user.stats?.gamesPlayed || 0)}`, 
            inline: true 
          },
          { 
            name: '🎪 Events besucht', 
            value: `${stats.eventsAttended + (user.stats?.eventsAttended || 0)}`, 
            inline: true 
          },
          { 
            name: '⏰ Letzter Login', 
            value: user.stats?.lastSeen ? `<t:${Math.floor(user.stats.lastSeen.getTime() / 1000)}:R>` : 'Unbekannt', 
            inline: true 
          },
          { 
            name: '📅 Zeitraum', 
            value: this.getTimeframeText(timeframe), 
            inline: true 
          }
        )
        .setFooter({ text: 'SimpleGaming Community Stats' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in stats command:', error);
      await interaction.editReply('❌ Fehler beim Abrufen der Statistiken.');
    }
  }

  async handleLeaderboardCommand(interaction) {
    try {
      const timeframe = interaction.options.getString('timeframe') || 'month';
      const type = interaction.options.getString('type') || 'all';

      await interaction.deferReply();

      const topUsers = await UserActivity.getTopActiveUsers(timeframe, 10);
      
      if (topUsers.length === 0) {
        return await interaction.editReply('📊 Keine Aktivitäten im ausgewählten Zeitraum gefunden.');
      }

      const embed = new EmbedBuilder()
        .setColor('#10B981')
        .setTitle(`🏆 Leaderboard - ${this.getTimeframeText(timeframe)}`)
        .setDescription('Die aktivsten Community-Mitglieder:')
        .setFooter({ text: 'SimpleGaming Community Leaderboard' })
        .setTimestamp();

      let description = '';
      topUsers.forEach((user, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        description += `${medal} **${user.username}** - ${user.totalActivities} Aktivitäten\n`;
      });

      embed.setDescription(description);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in leaderboard command:', error);
      await interaction.editReply('❌ Fehler beim Abrufen des Leaderboards.');
    }
  }

  async handleProfileCommand(interaction) {
    try {
      const targetUser = interaction.options.getUser('user') || interaction.user;

      await interaction.deferReply();

      const user = await User.findOne({ discordId: targetUser.id });
      if (!user) {
        return await interaction.editReply('❌ Benutzer nicht in der Datenbank gefunden.');
      }

      // Aktivitätstrends der letzten 7 Tage
      const trends = await UserActivity.getActivityTrends(user._id, 7);
      
      const embed = new EmbedBuilder()
        .setColor('#8B5CF6')
        .setTitle(`👤 Profil von ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { 
            name: '👋 Mitglied seit', 
            value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:D>`, 
            inline: true 
          },
          { 
            name: '💬 Nachrichten gesamt', 
            value: `${user.stats?.messagesCount || 0}`, 
            inline: true 
          },
          { 
            name: '🎤 Voice-Zeit gesamt', 
            value: `${Math.floor((user.stats?.voiceMinutes || 0) / 60)}h ${(user.stats?.voiceMinutes || 0) % 60}m`, 
            inline: true 
          },
          { 
            name: '🎮 Lieblingsspiele', 
            value: user.preferences?.favoriteGames?.join(', ') || 'Keine angegeben', 
            inline: false 
          },
          { 
            name: '🎯 Spielzeiten', 
            value: user.preferences?.gamingTimes?.join(', ') || 'Keine angegeben', 
            inline: false 
          }
        );

      if (trends.length > 0) {
        const activityText = trends.slice(-7).map(day => {
          const date = new Date(day._id);
          return `${date.getDate()}.${date.getMonth() + 1}: ${day.totalCount} Aktivitäten`;
        }).join('\n');
        
        embed.addFields({ 
          name: '📈 Aktivität (letzte 7 Tage)', 
          value: activityText || 'Keine Aktivitäten', 
          inline: false 
        });
      }

      embed.setFooter({ text: 'SimpleGaming Community Profile' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in profile command:', error);
      await interaction.editReply('❌ Fehler beim Abrufen des Profils.');
    }
  }

  async handleActivityCommand(interaction) {
    try {
      const limit = interaction.options.getInteger('limit') || 10;

      await interaction.deferReply();

      const user = await User.findOne({ discordId: interaction.user.id });
      if (!user) {
        return await interaction.editReply('❌ Benutzer nicht in der Datenbank gefunden.');
      }

      const activities = await UserActivity.find({ userId: user._id })
        .sort({ timestamp: -1 })
        .limit(limit);

      if (activities.length === 0) {
        return await interaction.editReply('📊 Keine Aktivitäten gefunden.');
      }

      const embed = new EmbedBuilder()
        .setColor('#F59E0B')
        .setTitle('🔥 Deine letzten Aktivitäten')
        .setFooter({ text: 'SimpleGaming Community Activities' })
        .setTimestamp();

      let description = '';
      activities.forEach(activity => {
        const icon = this.getActivityIcon(activity.activityType);
        const time = `<t:${Math.floor(activity.timestamp.getTime() / 1000)}:R>`;
        const activityText = this.getActivityText(activity);
        description += `${icon} ${activityText} - ${time}\n`;
      });

      embed.setDescription(description);
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error in activity command:', error);
      await interaction.editReply('❌ Fehler beim Abrufen der Aktivitäten.');
    }
  }

  async handleEventCommand(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    try {
      switch(subcommand) {
        case 'create':
          await this.handleEventCreate(interaction);
          break;
        case 'join':
          await this.handleEventJoin(interaction);
          break;
        case 'leave':
          await this.handleEventLeave(interaction);
          break;
      }
    } catch (error) {
      console.error('Error in event command:', error);
      await interaction.editReply('❌ Fehler beim Event-Command.');
    }
  }

  async handleEventCreate(interaction) {
    // Nur Admins können Events erstellen
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return await interaction.reply({ content: '❌ Du hast keine Berechtigung, Events zu erstellen.', ephemeral: true });
    }

    const name = interaction.options.getString('name');
    const description = interaction.options.getString('description');
    const datetime = interaction.options.getString('datetime');

    await interaction.deferReply();

    // Event in der Datenbank erstellen (Event-Model müsste erstellt werden)
    const eventId = `event_${Date.now()}`;
    
    const embed = new EmbedBuilder()
      .setColor('#4F46E5')
      .setTitle(`🎪 Event erstellt: ${name}`)
      .setDescription(description)
      .addFields(
        { name: '📅 Datum & Zeit', value: datetime, inline: true },
        { name: '🆔 Event ID', value: eventId, inline: true },
        { name: '👥 Teilnehmer', value: '0', inline: true }
      )
      .setFooter({ text: 'Nutze /event join um beizutreten!' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }

  async handleEventJoin(interaction) {
    const eventId = interaction.options.getString('event_id');
    await interaction.deferReply();

    // Event-Teilnahme in der Datenbank vermerken
    const user = await User.findOne({ discordId: interaction.user.id });
    if (user) {
      await UserActivity.create({
        userId: user._id,
        activityType: 'EVENT_JOINED',
        metadata: { eventId: eventId }
      });

      await User.findByIdAndUpdate(user._id, {
        $inc: { 'stats.eventsAttended': 1 }
      });
    }

    await interaction.editReply(`✅ Du bist dem Event \`${eventId}\` beigetreten!`);
  }

  async handleEventLeave(interaction) {
    const eventId = interaction.options.getString('event_id');
    await interaction.deferReply();

    const user = await User.findOne({ discordId: interaction.user.id });
    if (user) {
      await UserActivity.create({
        userId: user._id,
        activityType: 'EVENT_LEFT',
        metadata: { eventId: eventId }
      });
    }

    await interaction.editReply(`✅ Du hast das Event \`${eventId}\` verlassen.`);
  }

  getTimeframeText(timeframe) {
    switch(timeframe) {
      case 'day': return 'Heute';
      case 'week': return 'Diese Woche';
      case 'month': return 'Dieser Monat';
      case 'all': return 'Gesamt';
      default: return 'Unbekannt';
    }
  }

  getActivityIcon(activityType) {
    const icons = {
      'MESSAGE': '💬',
      'VOICE_JOIN': '🎤',
      'VOICE_LEAVE': '🔇',
      'VOICE_SWITCH': '🔄',
      'GAME_START': '🎮',
      'GAME_END': '🎯',
      'GAME_SWITCH': '🔄',
      'SERVER_JOIN': '👋',
      'SERVER_LEAVE': '👋',
      'EVENT_JOINED': '🎪',
      'EVENT_LEFT': '🚪',
      'EVENT_WON': '🏆'
    };
    return icons[activityType] || '📊';
  }

  getActivityText(activity) {
    const { activityType, metadata } = activity;
    
    switch(activityType) {
      case 'MESSAGE':
        return `Nachricht in #${metadata.channelName || 'unbekannt'}`;
      case 'VOICE_JOIN':
        return `Voice Channel "${metadata.channelName}" beigetreten`;
      case 'VOICE_LEAVE':
        return `Voice Channel "${metadata.channelName}" verlassen (${metadata.duration}min)`;
      case 'GAME_START':
        return `${metadata.gameName} gestartet`;
      case 'GAME_END':
        return `${metadata.gameName} beendet (${metadata.duration}min)`;
      case 'EVENT_JOINED':
        return `Event beigetreten: ${metadata.eventName || metadata.eventId}`;
      default:
        return activityType.toLowerCase().replace('_', ' ');
    }
  }

  // Alle Commands registrieren
// backend/bot/commands/index.js - UPDATED deployCommands method

async deployCommands(guildId) {
  try {
    const { REST, Routes } = require('discord.js');
    const rest = new REST().setToken(process.env.DISCORD_BOT_TOKEN);

    const commands = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());

    console.log(`🔄 Deploying ${commands.length} application (/) commands...`);

    // Erst versuchen, Application Info zu holen
    const application = await rest.get(Routes.oauth2CurrentApplication());
    console.log(`📱 Application ID: ${application.id}`);

    if (guildId && guildId !== application.id) {
      console.log(`🎯 Deploying to specific guild: ${guildId}`);
      
      try {
        // Guild-spezifische Commands
        const data = await rest.put(
          Routes.applicationGuildCommands(application.id, guildId),
          { body: commands }
        );
        console.log(`✅ Successfully deployed ${data.length} guild commands to ${guildId}`);
      } catch (guildError) {
        console.error(`❌ Guild deployment failed:`, guildError.message);
        console.log(`🔄 Falling back to global commands...`);
        
        // Fallback zu globalen Commands
        const globalData = await rest.put(
          Routes.applicationCommands(application.id),
          { body: commands }
        );
        console.log(`✅ Successfully deployed ${globalData.length} global commands (fallback)`);
      }
    } else {
      console.log(`🌍 Deploying global commands...`);
      
      // Globale Commands
      const data = await rest.put(
        Routes.applicationCommands(application.id),
        { body: commands }
      );
      console.log(`✅ Successfully deployed ${data.length} global commands`);
    }
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
    
    // Detaillierte Fehlerbehandlung
    if (error.code === 50001) {
      console.log(`
🔧 PERMISSION ERROR FIX:

1. Bot Permissions fehlen!
   → Gehe zu Discord Developer Portal
   → OAuth2 > URL Generator  
   → Wähle "bot" UND "applications.commands"
   → Bot mit neuen Permissions neu einladen

2. Oder DISCORD_GUILD_ID ist falsch
   → Developer Mode aktivieren
   → Rechtsklick auf Server → Copy ID
   → .env mit richtiger Server ID aktualisieren

3. Oder setze DEPLOY_COMMANDS=false um Commands zu überspringen
      `);
    } else if (error.code === 50013) {
      console.log('❌ Bot hat keine Administrator-Rechte auf dem Server');
    } else {
      console.log('❌ Unbekannter API-Fehler:', error.code, error.message);
    }
    
    // Commands-Deployment überspringen, aber Bot trotzdem starten
    console.log('⚠️  Commands konnten nicht deployed werden, Bot startet ohne Slash Commands');
  }
}
  // Command Interaction Handler
  async handleInteraction(interaction) {
    if (!interaction.isChatInputCommand()) return;

    const command = this.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error('Error executing command:', error);
      const reply = { content: '❌ Es gab einen Fehler beim Ausführen des Commands.', ephemeral: true };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  }
}

module.exports = BotCommands;