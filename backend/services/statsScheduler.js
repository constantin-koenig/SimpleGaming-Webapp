// backend/services/statsScheduler.js
const cron = require('node-cron');
const ServerStats = require('../models/serverStats.model');

class StatsScheduler {
  constructor() {
    this.scheduledTasks = [];
    this.isRunning = false;
    this.lastUpdateTime = null;
    this.updateInProgress = false;
  }

  start() {
    console.log('📊 Starting stats update scheduler...');

    // Alle 15 Minuten - Haupt-Update für Homepage
    const mainUpdate = cron.schedule('*/5 * * * *', async () => {
      await this.performStatsUpdate('main');
    }, {
      scheduled: false,
      timezone: 'Europe/Berlin'
    });

    // Täglich um 4 Uhr - Vollständige Neuberechnung
    const dailyUpdate = cron.schedule('0 4 * * *', async () => {
      await this.performStatsUpdate('daily');
    }, {
      scheduled: false,
      timezone: 'Europe/Berlin'
    });

    this.scheduledTasks.push(mainUpdate, dailyUpdate);

    // Tasks starten
    mainUpdate.start();
    dailyUpdate.start();

    this.isRunning = true;

    console.log('✅ Stats scheduler started:');
    console.log('   🔄 Main updates: Every 15 minutes');
    console.log('   📅 Daily recalculation: 4:00 AM');

    // Initialer Update beim Start
    setTimeout(() => {
      this.performStatsUpdate('initial');
    }, 5000); // 5 Sekunden nach Start
  }

  async performStatsUpdate(type = 'main') {
    if (this.updateInProgress) {
      console.log(`⏭️  Stats update (${type}) skipped - update already in progress`);
      return;
    }

    console.log(`🔄 Starting ${type} stats update...`);
    this.updateInProgress = true;
    const startTime = Date.now();

    try {
      // Stats aktualisieren
      const stats = await ServerStats.updateServerStats();
      
      this.lastUpdateTime = new Date();
      const updateDuration = Date.now() - startTime;

      console.log(`✅ ${type} stats update completed in ${updateDuration}ms`);
      
      // Kurze Zusammenfassung loggen
      this.logUpdateSummary(stats, type, updateDuration);

      return {
        success: true,
        type,
        duration: updateDuration,
        timestamp: this.lastUpdateTime
      };

    } catch (error) {
      console.error(`❌ ${type} stats update failed:`, error);
      return {
        success: false,
        type,
        error: error.message,
        timestamp: new Date()
      };
    } finally {
      this.updateInProgress = false;
    }
  }

  logUpdateSummary(stats, type, duration) {
    const summary = stats.getHomepageStats();
    
    console.log(`📈 ${type.toUpperCase()} UPDATE SUMMARY:`);
    console.log(`   👥 Members: ${summary.members.total} total, ${summary.members.active} active`);
    console.log(`   🎤 Voice: ${summary.activity.totalVoiceHours}h total, ${summary.activity.activeVoiceSessions} active`);
    console.log(`   💬 Messages: ${summary.activity.totalMessages} total`);
    console.log(`   🎮 Games: ${summary.activity.gamesPlayed} sessions`);
    console.log(`   ⏱️  Update took: ${duration}ms`);

    // Bei daily update zusätzliche Details
    if (type === 'daily') {
      console.log(`   📊 New members this week: ${stats.community.newMembersThisWeek}`);
      console.log(`   🔥 Top user: ${summary.highlights.topUsers[0]?.username || 'N/A'}`);
      console.log(`   🎯 Popular game: ${summary.highlights.popularGames[0]?.name || 'N/A'}`);
    }
  }

  // Manueller Update-Trigger
  async triggerManualUpdate(type = 'manual') {
    if (this.updateInProgress) {
      return {
        success: false,
        message: 'Update bereits in Bearbeitung',
        inProgress: true
      };
    }

    console.log(`🔄 Manual ${type} stats update triggered`);
    const result = await this.performStatsUpdate(type);

    return {
      success: result.success,
      message: result.success ? 
        `${type} stats update completed in ${result.duration}ms` : 
        `Update failed: ${result.error}`,
      ...result
    };
  }

  // Status des Schedulers
  getStatus() {
    return {
      isRunning: this.isRunning,
      updateInProgress: this.updateInProgress,
      lastUpdateTime: this.lastUpdateTime,
      tasksCount: this.scheduledTasks.length,
      scheduledTasks: this.scheduledTasks.map(task => ({
        running: task.running,
        options: task.options
      }))
    };
  }

  // Cache für häufige Abfragen
  async getCachedStats() {
    try {
      const stats = await ServerStats.getCurrentStats();
      
      // Prüfen ob Stats zu alt sind (über 30 Minuten)
      const statsAge = Date.now() - stats.system.lastStatsUpdate.getTime();
      const maxAge = 30 * 60 * 1000; // 30 Minuten
      
      if (statsAge > maxAge) {
        console.log(`⚠️  Stats are ${Math.floor(statsAge / 60000)} minutes old, triggering update`);
        // Async update triggern, aber nicht warten
        this.performStatsUpdate('cache_refresh').catch(console.error);
      }
      
      return stats.getHomepageStats();
    } catch (error) {
      console.error('Error getting cached stats:', error);
      return null;
    }
  }

  // Scheduler stoppen
  stop() {
    console.log('🛑 Stopping stats scheduler...');
    
    this.scheduledTasks.forEach(task => {
      if (task.running) {
        task.stop();
      }
    });
    
    this.scheduledTasks = [];
    this.isRunning = false;
    
    console.log('✅ Stats scheduler stopped');
  }

  // Scheduler Health Check
  async healthCheck() {
    const stats = await ServerStats.getCurrentStats();
    const now = new Date();
    const lastUpdate = stats.system.lastStatsUpdate;
    const timeSinceUpdate = now - lastUpdate;
    
    // Warnung wenn Stats älter als 1 Stunde
    const isHealthy = timeSinceUpdate < (60 * 60 * 1000);
    
    return {
      healthy: isHealthy,
      lastUpdate: lastUpdate,
      timeSinceUpdate: Math.floor(timeSinceUpdate / 60000), // Minuten
      updateInProgress: this.updateInProgress,
      schedulerRunning: this.isRunning,
      message: isHealthy ? 
        'Stats are up to date' : 
        `Stats are ${Math.floor(timeSinceUpdate / 60000)} minutes old`
    };
  }

  // Performance-optimierte Methode für API-Endpoints
  async getQuickStats() {
    try {
      // Nur die wichtigsten Stats für schnelle API-Antworten
      const stats = await ServerStats.findOne(
        { identifier: 'global' },
        {
          'community.totalMembers': 1,
          'community.activeMembers': 1,
          'gaming.totalVoiceHours': 1,
          'communication.totalMessages': 1,
          'gaming.activeVoiceSessions': 1,
          'system.lastStatsUpdate': 1
        }
      );
      
      if (!stats) return null;
      
      return {
        members: stats.community.totalMembers,
        activeMembers: stats.community.activeMembers,
        voiceHours: Math.floor(stats.gaming.totalVoiceMinutes / 60),
        messages: stats.communication.totalMessages,
        activeVoice: stats.gaming.activeVoiceSessions,
        lastUpdate: stats.system.lastStatsUpdate,
        cached: true
      };
    } catch (error) {
      console.error('Error getting quick stats:', error);
      return null;
    }
  }
}

module.exports = StatsScheduler;