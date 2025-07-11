// frontend/src/hooks/useDashboardData.js - UPDATED: Mit Datums-Navigation
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useDashboardData = () => {
  const [data, setData] = useState({
    userData: null,
    dashboardStats: null,
    activityData: null,
    gamingActivity: null,
    recentGamingActivity: null,
    registeredEvents: null,
    buddyRequests: null,
    friends: null,
    achievements: null
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityLoading, setActivityLoading] = useState(false);

  // ✅ NEW: Aktuell ausgewählte Woche/Monat
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Dashboard Overview (Basis-Daten)
  const fetchDashboardOverview = useCallback(async () => {
    try {
      const response = await api.get('/dashboard/overview');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }, []);

  // ✅ UPDATED: Activity Overview mit optionalen Datums-Parametern
  const fetchActivityOverview = useCallback(async (timeframe = 'weekly', weekDate = null, monthDate = null) => {
    try {
      setActivityLoading(true);
      
      // API-Parameter aufbauen
      let params = `timeframe=${timeframe}`;
      if (timeframe === 'weekly' && weekDate) {
        params += `&weekDate=${weekDate.toISOString()}`;
      }
      if (timeframe === 'monthly' && monthDate) {
        params += `&monthDate=${monthDate.toISOString()}`;
      }
      
      console.log(`🔄 Fetching activity data: ${params}`);
      const response = await api.get(`/dashboard/activity/overview?${params}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching activity overview:', error);
      throw error;
    } finally {
      setActivityLoading(false);
    }
  }, []);

  // Social-bezogene Daten
  const fetchSocialData = useCallback(async () => {
    try {
      const [friends, buddyRequests, registeredEvents] = await Promise.all([
        api.get('/dashboard/social/friends'),
        api.get('/dashboard/social/buddy-requests'),
        api.get('/dashboard/social/events/registered')
      ]);

      return {
        friends: friends.data.data,
        buddyRequests: buddyRequests.data.data,
        registeredEvents: registeredEvents.data.data
      };
    } catch (error) {
      console.error('Error fetching social data:', error);
      throw error;
    }
  }, []);

  // Initial data load
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🚀 Loading initial dashboard data...');

      const overviewData = await fetchDashboardOverview();
      console.log('✅ Overview data loaded:', overviewData);

      const activityData = await fetchActivityOverview('weekly', selectedWeek);
      console.log('✅ Activity data loaded:', activityData);

      const socialData = await fetchSocialData();
      console.log('✅ Social data loaded:', socialData);

      setData({
        userData: overviewData.userData,
        dashboardStats: overviewData.dashboardStats,
        activityData: activityData.activityData,
        gamingActivity: null,
        recentGamingActivity: null,
        registeredEvents: socialData.registeredEvents,
        buddyRequests: socialData.buddyRequests,
        friends: socialData.friends,
        achievements: []
      });

      console.log('🎉 Dashboard data loaded successfully');

    } catch (error) {
      console.error('❌ Error loading initial dashboard data:', error);
      setError(error.message);
      
      // Fallback data
      setData({
        userData: {
          id: 'mock-user',
          username: 'Mock User',
          avatar: null,
          level: 1,
          xp: 0,
          xpToNext: 1000,
          rank: 'Bronze',
          rankColor: 'from-gray-400 to-gray-600',
          joinDate: new Date('2024-01-15'),
          lastActive: new Date(),
          roles: ['member']
        },
        dashboardStats: {
          totalMessages: 0,
          voiceHours: 0,
          gamesPlayed: 0,
          eventsAttended: 0,
          achievementsUnlocked: 0,
          friendsOnline: 0,
          weeklyProgress: { messages: 0, voiceTime: 0, gamesPlayed: 0 }
        },
        activityData: null,
        gamingActivity: null,
        recentGamingActivity: null,
        registeredEvents: [],
        buddyRequests: [],
        friends: [],
        achievements: []
      });
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardOverview, fetchActivityOverview, fetchSocialData, selectedWeek]);

  // ✅ UPDATED: Activity data mit präzisen Zeiträumen
  const updateActivityData = useCallback(async (timeframe, targetDate = null) => {
    try {
      setActivityLoading(true);
      console.log(`🔄 Updating activity data for timeframe: ${timeframe}`, { targetDate });
      
      let weekDate = null;
      let monthDate = null;
      
      if (timeframe === 'weekly') {
        weekDate = targetDate || selectedWeek;
        setSelectedWeek(weekDate);
      } else if (timeframe === 'monthly') {
        monthDate = targetDate || selectedMonth;
        setSelectedMonth(monthDate);
      }
      
      const newActivityData = await fetchActivityOverview(timeframe, weekDate, monthDate);
      console.log('✅ New activity data:', newActivityData);
      
      setData(prevData => ({
        ...prevData,
        activityData: newActivityData.activityData
      }));
      
      return newActivityData;
    } catch (error) {
      console.error('❌ Error updating activity data:', error);
      setError(`Fehler beim Laden der ${timeframe}-Daten: ${error.message}`);
      throw error;
    } finally {
      setActivityLoading(false);
    }
  }, [fetchActivityOverview, selectedWeek, selectedMonth]);

  // ✅ NEW: Navigation functions
  const navigateWeek = useCallback(async (direction) => {
    const newWeek = new Date(selectedWeek);
    newWeek.setDate(newWeek.getDate() + (direction * 7));
    
    console.log(`📅 Navigating week ${direction > 0 ? 'forward' : 'backward'} to:`, newWeek);
    await updateActivityData('weekly', newWeek);
  }, [selectedWeek, updateActivityData]);

  const navigateMonth = useCallback(async (direction) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    
    console.log(`📅 Navigating month ${direction > 0 ? 'forward' : 'backward'} to:`, newMonth);
    await updateActivityData('monthly', newMonth);
  }, [selectedMonth, updateActivityData]);

  const goToCurrentWeek = useCallback(async () => {
    const currentWeek = new Date();
    console.log('📅 Going to current week:', currentWeek);
    await updateActivityData('weekly', currentWeek);
  }, [updateActivityData]);

  const goToCurrentMonth = useCallback(async () => {
    const currentMonth = new Date();
    console.log('📅 Going to current month:', currentMonth);
    await updateActivityData('monthly', currentMonth);
  }, [updateActivityData]);

  // Social Actions (bestehend)
  const acceptBuddyRequest = useCallback(async (requestId) => {
    try {
      await api.post(`/dashboard/social/buddy-requests/${requestId}/accept`);
      const socialData = await fetchSocialData();
      setData(prevData => ({
        ...prevData,
        buddyRequests: socialData.buddyRequests,
        friends: socialData.friends
      }));
    } catch (error) {
      console.error('Error accepting buddy request:', error);
      throw error;
    }
  }, [fetchSocialData]);

  const rejectBuddyRequest = useCallback(async (requestId) => {
    try {
      await api.post(`/dashboard/social/buddy-requests/${requestId}/reject`);
      const socialData = await fetchSocialData();
      setData(prevData => ({
        ...prevData,
        buddyRequests: socialData.buddyRequests
      }));
    } catch (error) {
      console.error('Error rejecting buddy request:', error);
      throw error;
    }
  }, [fetchSocialData]);

  const cancelEventRegistration = useCallback(async (eventId) => {
    try {
      await api.delete(`/dashboard/social/events/${eventId}/registration`);
      const socialData = await fetchSocialData();
      setData(prevData => ({
        ...prevData,
        registeredEvents: socialData.registeredEvents
      }));
    } catch (error) {
      console.error('Error canceling event registration:', error);
      throw error;
    }
  }, [fetchSocialData]);

  const sendFriendMessage = useCallback(async (friendId, message) => {
    try {
      await api.post(`/dashboard/social/friends/${friendId}/message`, { message });
    } catch (error) {
      console.error('Error sending friend message:', error);
      throw error;
    }
  }, []);

  const inviteFriendToGame = useCallback(async (friendId, gameInfo) => {
    try {
      await api.post(`/dashboard/social/friends/${friendId}/game-invite`, gameInfo);
    } catch (error) {
      console.error('Error inviting friend to game:', error);
      throw error;
    }
  }, []);

  const refetch = useCallback(async () => {
    await loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return {
    // Daten
    data,
    loading,
    error,
    activityLoading,
    
    // Aktuelle Zeitraum-Auswahl
    selectedWeek,
    selectedMonth,
    
    // Basis-Actions
    refetch,
    
    // Activity-spezifische Actions
    updateActivityData,
    
    // ✅ NEW: Navigation Actions
    navigateWeek,
    navigateMonth,
    goToCurrentWeek,
    goToCurrentMonth,
    
    // Social Actions
    acceptBuddyRequest,
    rejectBuddyRequest,
    cancelEventRegistration,
    sendFriendMessage,
    inviteFriendToGame,
    
    // Utility-Functions
    fetchActivityOverview,
    fetchSocialData
  };
};

export default useDashboardData;