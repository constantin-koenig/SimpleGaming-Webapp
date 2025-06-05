// backend/server.js - Updated mit Bot Integration
const app = require('./app');
const BotManager = require('./bot');

const PORT = process.env.PORT || 5000;

// Bot Manager initialisieren
const botManager = new BotManager();

async function startServer() {
  try {
    // Express Server starten
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf Port ${PORT}`);
    });

    // Discord Bot starten (falls konfiguriert)
    if (process.env.DISCORD_BOT_TOKEN) {
      const botStarted = await botManager.start();
      if (botStarted) {
        console.log('🤖 Discord Bot integration enabled');
        
        // Bot Manager global verfügbar machen
        app.set('botManager', botManager);
      } else {
        console.log('⚠️  Discord Bot failed to start, continuing without bot features');
      }
    } else {
      console.log('⚠️  No Discord Bot Token provided, bot features disabled');
    }

    // Graceful Shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 SIGTERM received, shutting down gracefully');
      
      // Bot stoppen
      await botManager.stop();
      
      // Server schließen
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      console.log('🛑 SIGINT received, shutting down gracefully');
      
      // Bot stoppen
      await botManager.stop();
      
      // Server schließen
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();