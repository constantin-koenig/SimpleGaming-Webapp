
// ========================================================================================
// backend/routes/dashboard/social.js - Social/Community-spezifische Routes  
// ========================================================================================

const express = require('express');
const socialRouter = express.Router();
const User = require('../../models/user.model');

// Freundesliste
socialRouter.get('/friends', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // TODO: Implementiere Freundesliste basierend auf deinem System
    // Beispiel-Struktur:
    const friends = [
      // { id, username, avatar, status, currentGame, lastSeen }
    ];
    
    res.json({
      success: true,
      data: friends
    });
    
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fehler beim Abrufen der Freundesliste' 
    });
  }
});

// Buddy Requests
socialRouter.get('/buddy-requests', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // TODO: Implementiere Buddy-Request-System
    const buddyRequests = [];
    
    res.json({
      success: true,
      data: buddyRequests
    });
    
  } catch (error) {
    console.error('Error fetching buddy requests:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fehler beim Abrufen der Buddy-Anfragen' 
    });
  }
});

// Events (angemeldet)
socialRouter.get('/events/registered', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // TODO: Implementiere Event-System
    const registeredEvents = [];
    
    res.json({
      success: true,
      data: registeredEvents
    });
    
  } catch (error) {
    console.error('Error fetching registered events:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fehler beim Abrufen der angemeldeten Events' 
    });
  }
});

module.exports = socialRouter;