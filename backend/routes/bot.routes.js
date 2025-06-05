// backend/routes/bot.routes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// Bot Status
router.get('/status', async (req, res) => {
  try {
    const botManager = req.app.get('botManager');
    
    if (!botManager) {
      return res.json({
        status: 'disabled',
        message: 'Bot ist nicht konfiguriert'
      });
    }

    if (botManager.isRunning()) {
      res.json({
        status: 'online',
        stats: botManager.getStats(),
        message: 'Bot ist online und aktiv'
      });
    } else {
      res.json({
        status: 'offline',
        message: 'Bot ist offline'
      });
    }
  } catch (error) {
    console.error('Error checking bot status:', error);
    res.status(500).json({ 
      status: 'error',
      message: 'Fehler beim Überprüfen des Bot-Status' 
    });
  }
});

// Event-Teilnahme tracken (für Web-App Events)
router.post('/track-event', protect, async (req, res) => {
  try {
    const { eventId, eventName, participationType = 'JOINED' } = req.body;
    const botManager = req.app.get('botManager');
    
    if (!botManager || !botManager.isRunning()) {
      return res.status(503).json({ 
        message: 'Bot ist nicht verfügbar' 
      });
    }

    await botManager.trackEventParticipation(
      req.user.discordId, 
      eventId, 
      eventName, 
      participationType
    );

    res.json({ 
      message: 'Event-Teilnahme erfolgreich getrackt',
      eventId,
      participationType
    });
  } catch (error) {
    console.error('Error tracking event participation:', error);
    res.status(500).json({ 
      message: 'Fehler beim Tracken der Event-Teilnahme' 
    });
  }
});

// Bot-Befehle ausführen (nur für Admins)
router.post('/command', protect, authorize('admin'), async (req, res) => {
  try {
    const { command, parameters } = req.body;
    const botManager = req.app.get('botManager');
    
    if (!botManager || !botManager.isRunning()) {
      return res.status(503).json({ 
        message: 'Bot ist nicht verfügbar' 
      });
    }

    // Hier könnten spezielle Admin-Commands implementiert werden
    switch(command) {
      case 'sync_members':
        await botManager.discordBot.syncAllMembers();
        res.json({ message: 'Mitglieder-Synchronisation gestartet' });
        break;
      
      case 'get_guild_info':
        const guilds = botManager.discordBot.client.guilds.cache;
        const guildInfo = guilds.map(guild => ({
          id: guild.id,
          name: guild.name,
          memberCount: guild.memberCount,
          channels: guild.channels.cache.size
        }));
        res.json({ guilds: guildInfo });
        break;
        
      default:
        res.status(400).json({ message: 'Unbekannter Command' });
    }
  } catch (error) {
    console.error('Error executing bot command:', error);
    res.status(500).json({ 
      message: 'Fehler beim Ausführen des Bot-Commands' 
    });
  }
});

// Discord Server Info
router.get('/guild-info', protect, async (req, res) => {
  try {
    const botManager = req.app.get('botManager');
    
    if (!botManager || !botManager.isRunning()) {
      return res.status(503).json({ 
        message: 'Bot ist nicht verfügbar' 
      });
    }

    const client = botManager.discordBot.client;
    const guilds = client.guilds.cache;
    
    const guildInfo = await Promise.all(
      guilds.map(async guild => {
        try {
          const channels = guild.channels.cache;
          const roles = guild.roles.cache;
          
          return {
            id: guild.id,
            name: guild.name,
            icon: guild.icon,
            memberCount: guild.memberCount,
            channels: {
              total: channels.size,
              text: channels.filter(c => c.type === 0).size,
              voice: channels.filter(c => c.type === 2).size,
              category: channels.filter(c => c.type === 4).size
            },
            roles: roles.size,
            createdAt: guild.createdAt,
            owner: guild.ownerId
          };
        } catch (error) {
          console.error(`Error getting info for guild ${guild.id}:`, error);
          return {
            id: guild.id,
            name: guild.name,
            error: 'Fehler beim Abrufen der Guild-Informationen'
          };
        }
      })
    );

    res.json({ guilds: guildInfo });
  } catch (error) {
    console.error('Error fetching guild info:', error);
    res.status(500).json({ 
      message: 'Fehler beim Abrufen der Server-Informationen' 
    });
  }
});

module.exports = router;