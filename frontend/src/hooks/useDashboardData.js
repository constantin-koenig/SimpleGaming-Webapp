// frontend/src/hooks/useDashboardData.js - OHNE EVENTS
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

  const [selectedWeek, setSelectedWeek] = useState(() => new Date());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());

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

  // ✅ OHNE EVENTS: Activity Overview
  const fetchActivityOverview = useCallback(async (timeframe = 'weekly', weekDate = null, monthDate = null) => {
    try {
      setActivityLoading(true);
      
      const params = new URLSearchParams({ timeframe });
      
      if (timeframe === 'weekly' && weekDate) {
        const validWeekDate = weekDate instanceof Date ? weekDate : new Date(weekDate);
        if (!isNaN(validWeekDate.getTime())) {
          const localDateString = `${validWeekDate.getFullYear()}-${String(validWeekDate.getMonth() + 1).padStart(2, '0')}-${String(validWeekDate.getDate()).padStart(2, '0')}`;
          params.append('weekDate', localDateString);
        }
      }
      
      if (timeframe === 'monthly' && monthDate) {
        const validMonthDate = monthDate instanceof Date ? monthDate : new Date(monthDate);
        if (!isNaN(validMonthDate.getTime())) {
          const localDateString = `${validMonthDate.getFullYear()}-${String(validMonthDate.getMonth() + 1).padStart(2, '0')}-${String(validMonthDate.getDate()).padStart(2, '0')}`;
          params.append('monthDate', localDateString);
        }
      }
      
      const response = await api.get(`/dashboard/activity/overview?${params.toString()}`);
      
      // ✅ OHNE EVENTS: Verarbeite nur messages, voice, gaming
      const processedData = response.data.data.map(period => ({
        ...period,
        messages: period.messages || { value: 0, change: 0 },
        voice: period.voice || { value: 0, change: 0 },
        gaming: period.gaming || { value: 0, change: 0 }
        // events entfernt
      }));
      
      return { activityData: processedData };
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
        friends: friends.data.data || [],
        buddyRequests: buddyRequests.data.data || [],
        registeredEvents: registeredEvents.data.data || []
      };
    } catch (error) {
      console.error('Error fetching social data:', error);
      // Fallback zu leeren Arrays
      return {
        friends: [],
        buddyRequests: [],
        registeredEvents: []
      };
    }
  }, []);

  // Initial data load
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const overviewData = await fetchDashboardOverview();
      const activityData = await fetchActivityOverview('weekly', selectedWeek);
      const socialData = await fetchSocialData();

      setData({
        userData: overviewData.userData,
        dashboardStats: overviewData.dashboardStats,
        activityData: activityData.activityData,
        registeredEvents: socialData.registeredEvents,
        buddyRequests: socialData.buddyRequests,
        friends: socialData.friends,
        achievements: overviewData.achievements || []
      });

    } catch (error) {
      setError(error.message || 'Fehler beim Laden der Dashboard-Daten');
    } finally {
      setLoading(false);
    }
  }, [fetchDashboardOverview, fetchActivityOverview, fetchSocialData, selectedWeek]);

  // ✅ OHNE EVENTS: Activity data update
  const updateActivityData = useCallback(async (timeframe, targetDate = null) => {
    try {
      setActivityLoading(true);
      
      let weekDate = null;
      let monthDate = null;
      
      if (timeframe === 'weekly') {
        weekDate = targetDate || selectedWeek;
        if (targetDate) {
          setSelectedWeek(new Date(targetDate));
        }
      } else if (timeframe === 'monthly') {
        monthDate = targetDate || selectedMonth;
        if (targetDate) {
          setSelectedMonth(new Date(targetDate));
        }
      }
      
      const newActivityData = await fetchActivityOverview(timeframe, weekDate, monthDate);
      
      setData(prevData => ({
        ...prevData,
        activityData: newActivityData.activityData
      }));
      
      return newActivityData;
    } catch (error) {
      setError(`Fehler beim Laden der ${timeframe}-Daten: ${error.message}`);
      throw error;
    } finally {
      setActivityLoading(false);
    }
  }, [fetchActivityOverview, selectedWeek, selectedMonth]);

  // Navigation functions
  const navigateWeek = useCallback(async (direction) => {
    try {
      let directionMultiplier;
      if (typeof direction === 'string') {
        directionMultiplier = direction === 'next' ? 1 : -1;
      } else {
        directionMultiplier = direction;
      }
      
      const currentWeek = selectedWeek instanceof Date ? selectedWeek : new Date(selectedWeek);
      if (isNaN(currentWeek.getTime())) {
        return;
      }
      
      const newWeek = new Date(currentWeek);
      newWeek.setDate(newWeek.getDate() + (directionMultiplier * 7));
      
      await updateActivityData('weekly', newWeek);
    } catch (error) {
      setError('Fehler beim Navigieren zwischen Wochen');
    }
  }, [selectedWeek, updateActivityData]);

  const navigateMonth = useCallback(async (direction) => {
    try {
      let directionMultiplier;
      if (typeof direction === 'string') {
        directionMultiplier = direction === 'next' ? 1 : -1;
      } else {
        directionMultiplier = direction;
      }
      
      const currentMonth = selectedMonth instanceof Date ? selectedMonth : new Date(selectedMonth);
      if (isNaN(currentMonth.getTime())) {
        return;
      }
      
      const newMonth = new Date(currentMonth);
      newMonth.setMonth(newMonth.getMonth() + directionMultiplier);
      
      await updateActivityData('monthly', newMonth);
    } catch (error) {
      setError('Fehler beim Navigieren zwischen Monaten');
    }
  }, [selectedMonth, updateActivityData]);

  const goToCurrentWeek = useCallback(async () => {
    try {
      const currentWeek = new Date();
      await updateActivityData('weekly', currentWeek);
    } catch (error) {
      setError('Fehler beim Wechseln zur aktuellen Woche');
    }
  }, [updateActivityData]);

  const goToCurrentMonth = useCallback(async () => {
    try {
      const currentMonth = new Date();
      await updateActivityData('monthly', currentMonth);
    } catch (error) {
      setError('Fehler beim Wechseln zum aktuellen Monat');
    }
  }, [updateActivityData]);

  // Social Actions
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
  }, []);

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
    
    // Navigation Actions
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