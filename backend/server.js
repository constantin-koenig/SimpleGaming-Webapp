// backend/server.js - Updated mit Stats Scheduler
const app = require('./app');
const BotManager = require('./bot');
const StatsScheduler = require('./services/statsScheduler');

const PORT = process.env.PORT || 5000;

// Managers initialisieren
const botManager = new BotManager();
const statsScheduler = new StatsScheduler();

async function startServer() {
  try {
    // Express Server starten
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server läuft auf Port ${PORT}`);
    });

    // Stats Scheduler global verfügbar machen
    app.set('statsScheduler', statsScheduler);

    // Discord Bot starten (falls konfiguriert)
    if (process.env.DISCORD_BOT_TOKEN) {
      const botStarted = await botManager.start();
      if (botStarted) {
        console.log('🤖 Discord Bot integration enabled');
        app.set('botManager', botManager);
      } else {
        console.log('⚠️  Discord Bot failed to start, continuing without bot features');
      }
    } else {
      console.log('⚠️  No Discord Bot Token provided, bot features disabled');
    }

    // Stats Scheduler starten
    try {
      statsScheduler.start();
      console.log('📊 Stats Scheduler started successfully');
    } catch (error) {
      console.error('❌ Failed to start Stats Scheduler:', error);
      console.log('⚠️  Continuing without automated stats updates');
    }

    // Initial health check nach 10 Sekunden
    setTimeout(async () => {
      try {
        const health = await statsScheduler.healthCheck();
        if (health.healthy) {
          console.log('✅ Stats system is healthy');
        } else {
          console.log(`⚠️  Stats system health issue: ${health.message}`);
        }
      } catch (error) {
        console.log('⚠️  Could not perform initial health check');
      }
    }, 10000);

    // Graceful Shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`🛑 ${signal} received, shutting down gracefully`);
      
      try {
        // Stats Scheduler stoppen
        if (statsScheduler) {
          console.log('📊 Stopping stats scheduler...');
          statsScheduler.stop();
        }

        // Bot stoppen
        if (botManager) {
          console.log('🤖 Stopping Discord bot...');
          await botManager.stop();
        }

        // Server schließen
        server.close(() => {
          console.log('✅ Server closed gracefully');
          process.exit(0);
        });

        // Force exit nach 30 Sekunden
        setTimeout(() => {
          console.log('⚠️  Force shutdown after timeout');
          process.exit(1);
        }, 30000);

      } catch (error) {
        console.error('❌ Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Unhandled Rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
      // Nicht beenden, nur loggen
    });

    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    console.log('\n🎉 SimpleGaming Server fully started!');
    console.log('📍 Available endpoints:');
    console.log('   🏠 Homepage Stats: /api/homepage/stats');
    console.log('   📊 Live Stats: /api/homepage/stats/live');
    console.log('   🔥 Trending: /api/homepage/trending');
    console.log('   ❤️  Health Check: /api/homepage/stats/health');
    
    if (process.env.DISCORD_BOT_TOKEN) {
      console.log('   🤖 Bot Status: /api/bot/status');
    }

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();