import { useState, useEffect } from 'react';
import api from '../services/api'; // Bestehender API-Service

export const useDashboardData = () => {
  const [data, setData] = useState({
    userData: null,
    dashboardStats: null,
    gameActivity: null,
    recentGamingActivity: null,
    registeredEvents: null,
    buddyRequests: null,
    friends: null,
    achievements: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dashboard Overview (User + Stats)
  const fetchDashboardOverview = async () => {
    try {
      const response = await api.get('/dashboard/overview');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  };

  // Gaming Activity
  const fetchGamingActivity = async (timeframe = 'weekly') => {
    try {
      const response = await api.get(`/dashboard/gaming-activity?timeframe=${timeframe}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gaming activity:', error);
      throw error;
    }
  };

  // Registered Events
  const fetchRegisteredEvents = async () => {
    try {
      const response = await api.get('/dashboard/events/registered');
      return response.data;
    } catch (error) {
      console.error('Error fetching registered events:', error);
      throw error;
    }
  };

  // Buddy Requests
  const fetchBuddyRequests = async () => {
    try {
      const response = await api.get('/dashboard/buddy-requests');
      return response.data;
    } catch (error) {
      console.error('Error fetching buddy requests:', error);
      throw error;
    }
  };

  // Friends List
  const fetchFriends = async () => {
    try {
      const response = await api.get('/dashboard/friends');
      return response.data;
    } catch (error) {
      console.error('Error fetching friends:', error);
      throw error;
    }
  };

  // Achievements
  const fetchAchievements = async () => {
    try {
      const response = await api.get('/dashboard/achievements');
      return response.data;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  };

  // Fallback zu Mock-Daten wenn API nicht verfügbar
  const getMockData = () => {
    return {
      userData: {
        username: "GamerPro2024",
        avatar: "/api/placeholder/64/64",
        level: 42,
        xp: 15750,
        xpToNext: 18000,
        rank: "Diamond",
        rankColor: "from-blue-400 to-purple-500",
        joinDate: "2023-03-15",
        lastActive: new Date().toISOString()
      },
      dashboardStats: {
        totalMessages: 2847,
        voiceHours: 156,
        gamesPlayed: 89,
        eventsAttended: 23,
        achievementsUnlocked: 31,
        friendsOnline: 12,
        weeklyProgress: {
          messages: 340,
          voiceTime: 28,
          gamesPlayed: 15
        }
      },
      gameActivity: {
        weekly: [
          { 
            label: 'Mo', 
            games: [
              { name: 'Valorant', playtime: 180, color: '#FF4655' },
              { name: 'CS2', playtime: 120, color: '#F7931E' },
              { name: 'Minecraft', playtime: 90, color: '#62B47A' }
            ]
          },
          { 
            label: 'Di', 
            games: [
              { name: 'CS2', playtime: 240, color: '#F7931E' },
              { name: 'Rust', playtime: 150, color: '#CE422B' },
              { name: 'Valorant', playtime: 60, color: '#FF4655' }
            ]
          },
          { 
            label: 'Mi', 
            games: [
              { name: 'Minecraft', playtime: 300, color: '#62B47A' },
              { name: 'Valorant', playtime: 120, color: '#FF4655' }
            ]
          },
          { 
            label: 'Do', 
            games: [
              { name: 'Valorant', playtime: 210, color: '#FF4655' },
              { name: 'CS2', playtime: 180, color: '#F7931E' },
              { name: 'Rust', playtime: 90, color: '#CE422B' }
            ]
          },
          { 
            label: 'Fr', 
            games: [
              { name: 'CS2', playtime: 360, color: '#F7931E' },
              { name: 'Valorant', playtime: 150, color: '#FF4655' }
            ]
          },
          { 
            label: 'Sa', 
            games: [
              { name: 'Minecraft', playtime: 420, color: '#62B47A' },
              { name: 'Rust', playtime: 240, color: '#CE422B' },
              { name: 'Valorant', playtime: 90, color: '#FF4655' }
            ]
          },
          { 
            label: 'So', 
            games: [
              { name: 'Valorant', playtime: 270, color: '#FF4655' },
              { name: 'CS2', playtime: 180, color: '#F7931E' },
              { name: 'Minecraft', playtime: 120, color: '#62B47A' }
            ]
          }
        ]
      },
      recentGamingActivity: [
        {
          game: 'Valorant',
          lastPlayed: '2024-06-28T14:30:00Z',
          duration: 120,
          status: 'completed',
          icon: '🎯',
          color: '#FF4655'
        },
        {
          game: 'CS2',
          lastPlayed: '2024-06-28T11:15:00Z',
          duration: 85,
          status: 'completed',
          icon: '💥',
          color: '#F7931E'
        },
        {
          game: 'Minecraft',
          lastPlayed: '2024-06-27T20:45:00Z',
          duration: 180,
          status: 'completed',
          icon: '⛏️',
          color: '#62B47A'
        },
        {
          game: 'Rust',
          lastPlayed: '2024-06-27T16:20:00Z',
          duration: 95,
          status: 'completed',
          icon: '🔥',
          color: '#CE422B'
        }
      ],
      registeredEvents: [
        { 
          id: 1, 
          name: "Minecraft Build Contest", 
          date: "2024-06-30", 
          time: "20:00", 
          participants: 24,
          status: "registered",
          canCancel: true
        },
        { 
          id: 2, 
          name: "CS2 Tournament", 
          date: "2024-07-02", 
          time: "19:30", 
          participants: 16,
          status: "registered",
          canCancel: false
        }
      ],
      buddyRequests: [
        {
          id: 1,
          username: "ShadowGamer",
          avatar: "/api/placeholder/40/40",
          games: ["Valorant", "CS2"],
          mutual: 3,
          requestDate: "2024-06-25"
        },
        {
          id: 2,
          username: "MinecraftPro",
          avatar: "/api/placeholder/40/40",
          games: ["Minecraft", "Terraria"],
          mutual: 1,
          requestDate: "2024-06-24"
        }
      ],
      friends: [
        {
          id: 1,
          username: "BestBuddy123",
          avatar: "/api/placeholder/40/40",
          status: "online",
          game: "Valorant",
          lastSeen: null
        },
        {
          id: 2,
          username: "CoopPlayer",
          avatar: "/api/placeholder/40/40",
          status: "ingame",
          game: "Minecraft",
          lastSeen: null
        },
        {
          id: 3,
          username: "NightOwl",
          avatar: "/api/placeholder/40/40",
          status: "offline",
          game: null,
          lastSeen: "vor 2 Stunden"
        }
      ],
      achievements: [
        {
          id: 1,
          name: "First Steps",
          description: "Erste Nachricht im Discord gesendet",
          icon: "💬",
          unlocked: true,
          unlockedAt: "2023-03-15",
          rarity: "common"
        },
        {
          id: 2,
          name: "Voice Chat Master",
          description: "100 Stunden im Voice Chat verbracht",
          icon: "🎤",
          unlocked: true,
          unlockedAt: "2024-06-25",
          rarity: "rare"
        },
        {
          id: 3,
          name: "Social Butterfly",
          description: "500 Nachrichten in einer Woche",
          icon: "🦋",
          unlocked: true,
          unlockedAt: "2024-06-23",
          rarity: "uncommon"
        },
        {
          id: 4,
          name: "Tournament Victor",
          description: "Ein Turnier gewinnen",
          icon: "🏆",
          unlocked: false,
          unlockedAt: null,
          rarity: "legendary"
        },
        {
          id: 5,
          name: "Night Owl",
          description: "24 Stunden durchgehend online",
          icon: "🦉",
          unlocked: false,
          unlockedAt: null,
          rarity: "epic"
        }
      ]
    };
  };

  // Haupt-Funktion zum Laden aller Dashboard-Daten
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Versuche echte API-Daten zu laden
      try {
        // Parallel API-Calls für bessere Performance
        const [
          overviewData,
          gamingData,
          eventsData,
          buddyData,
          friendsData,
          achievementsData
        ] = await Promise.all([
          fetchDashboardOverview(),
          fetchGamingActivity('weekly'),
          fetchRegisteredEvents(),
          fetchBuddyRequests(),
          fetchFriends(),
          fetchAchievements()
        ]);

        setData({
          userData: overviewData.userData,
          dashboardStats: overviewData.dashboardStats,
          gameActivity: gamingData.gameActivity,
          recentGamingActivity: gamingData.recentGamingActivity,
          registeredEvents: eventsData.events || eventsData,
          buddyRequests: buddyData.requests || buddyData,
          friends: friendsData.friends || friendsData,
          achievements: achievementsData.achievements || achievementsData
        });
      } catch (apiError) {
        console.warn('API nicht verfügbar, verwende Mock-Daten:', apiError.message);
        
        // Fallback zu Mock-Daten
        const mockData = getMockData();
        setData(mockData);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard data:', err);
      
      // Auch bei Fehler Mock-Daten verwenden
      const mockData = getMockData();
      setData(mockData);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Funktion zum Neuladen aller Daten
  const refetch = () => {
    fetchDashboardData();
  };

  // Funktion zum Aktualisieren der Gaming-Aktivität mit neuem Zeitraum
  const updateGameActivity = async (timeframe) => {
    try {
      const gamingData = await fetchGamingActivity(timeframe);
      setData(prev => ({
        ...prev,
        gameActivity: gamingData.gameActivity,
        recentGamingActivity: gamingData.recentGamingActivity
      }));
    } catch (err) {
      console.warn('Gaming activity API nicht verfügbar, behalte aktuelle Daten');
      // Bei Fehler aktuelle Daten beibehalten
    }
  };

  // Zusätzliche API-Funktionen für spezifische Actions
  const acceptBuddyRequest = async (requestId) => {
    try {
      await api.post(`/dashboard/buddy-requests/${requestId}/accept`);
      // Buddy-Requests neu laden
      const buddyData = await fetchBuddyRequests();
      setData(prev => ({
        ...prev,
        buddyRequests: buddyData.requests || buddyData
      }));
    } catch (error) {
      console.error('Error accepting buddy request:', error);
    }
  };

  const rejectBuddyRequest = async (requestId) => {
    try {
      await api.post(`/dashboard/buddy-requests/${requestId}/reject`);
      // Buddy-Requests neu laden
      const buddyData = await fetchBuddyRequests();
      setData(prev => ({
        ...prev,
        buddyRequests: buddyData.requests || buddyData
      }));
    } catch (error) {
      console.error('Error rejecting buddy request:', error);
    }
  };

  const cancelEventRegistration = async (eventId) => {
    try {
      await api.delete(`/dashboard/events/${eventId}/register`);
      // Events neu laden
      const eventsData = await fetchRegisteredEvents();
      setData(prev => ({
        ...prev,
        registeredEvents: eventsData.events || eventsData
      }));
    } catch (error) {
      console.error('Error canceling event registration:', error);
    }
  };

  const sendFriendMessage = async (friendId, message) => {
    try {
      await api.post(`/dashboard/friends/${friendId}/message`, { message });
      // Optional: Feedback für User
    } catch (error) {
      console.error('Error sending friend message:', error);
    }
  };

  const inviteFriendToGame = async (friendId, game) => {
    try {
      await api.post(`/dashboard/friends/${friendId}/invite`, { game });
      // Optional: Feedback für User
    } catch (error) {
      console.error('Error inviting friend to game:', error);
    }
  };

  return {
    data,
    loading,
    error,
    refetch,
    updateGameActivity,
    // Action-Funktionen
    acceptBuddyRequest,
    rejectBuddyRequest,
    cancelEventRegistration,
    sendFriendMessage,
    inviteFriendToGame
  };
};