const express = require('express');
const gamingRouter = express.Router();
const User = require('../../models/user.model');
const UserActivity = require('../../models/userActivity.model');
const GameStats = require('../../models/gameStats.model');

// Gaming Activity für Dashboard
gamingRouter.get('/activity', async (req, res) => {
  try {
    const { timeframe = 'weekly' } = req.query;
    const userId = req.user.id;
    
    const gamingActivity = await UserActivity.getGamingSessionStats(userId, timeframe);
    
    res.json({
      success: true,
      data: gamingActivity,
      timeframe
    });
    
  } catch (error) {
    console.error('Error fetching gaming activity:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fehler beim Abrufen der Gaming-Aktivität' 
    });
  }
});

// Recent Gaming Activity für Dashboard
gamingRouter.get('/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;
    
    const recentGaming = await UserActivity.getGamingActivities(userId, 'week', limit);
    
    res.json({
      success: true,
      data: recentGaming
    });
    
  } catch (error) {
    console.error('Error fetching recent gaming:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fehler beim Abrufen der letzten Gaming-Aktivitäten' 
    });
  }
});

module.exports = gamingRouter;
