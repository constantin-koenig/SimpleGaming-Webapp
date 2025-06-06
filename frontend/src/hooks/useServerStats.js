// frontend/src/hooks/useServerStats.js
import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useServerStats = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 15 * 60 * 1000, // 15 Minuten
    format = 'full' // 'full' oder 'quick'
  } = options;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Stats vom Server abrufen
  const fetchStats = useCallback(async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        setLoading(true);
      }
      setError(null);

      const endpoint = format === 'quick' 
        ? '/homepage/stats?format=quick'
        : '/homepage/stats';

      const response = await api.get(endpoint);
      
      if (response.data.success) {
        setStats(response.data.data);
        setLastUpdate(new Date(response.data.lastUpdate || response.data.data.lastUpdate));
      } else {
        throw new Error(response.data.message || 'Failed to fetch stats');
      }
    } catch (err) {
      console.error('Error fetching server stats:', err);
      setError(err.message || 'Fehler beim Laden der Statistiken');
      
      // Fallback-Daten bei Fehler
      if (!stats) {
        setStats({
          members: { total: 0, active: 0, newThisWeek: 0 },
          activity: { 
            totalVoiceHours: 0, 
            totalMessages: 0, 
            activeVoiceSessions: 0, 
            gamesPlayed: 0 
          },
          highlights: { topUsers: [], popularGames: [] },
          lastUpdate: new Date(),
          fallback: true
        });
      }
    } finally {
      setLoading(false);
    }
  }, [format, stats]);

  // Live Stats abrufen (für Dashboard)
  const fetchLiveStats = useCallback(async () => {
    try {
      const response = await api.get('/homepage/stats/live');
      
      if (response.data.success) {
        return {
          live: response.data.live,
          cached: response.data.cached,
          performance: response.data.performance
        };
      }
    } catch (err) {
      console.error('Error fetching live stats:', err);
      return null;
    }
  }, []);

  // Trending Data abrufen
  const fetchTrending = useCallback(async (limit = 5) => {
    try {
      const response = await api.get(`/homepage/trending?limit=${limit}`);
      
      if (response.data.success) {
        return response.data.data;
      }
    } catch (err) {
      console.error('Error fetching trending data:', err);
      return null;
    }
  }, []);

  // Manueller Refresh
  const refreshStats = useCallback(async () => {
    await fetchStats(true);
  }, [fetchStats]);

  // Health Check
  const checkHealth = useCallback(async () => {
    try {
      const response = await api.get('/homepage/stats/health');
      return response.data;
    } catch (err) {
      console.error('Error checking stats health:', err);
      return { healthy: false, error: err.message };
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Auto-refresh Setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStats(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchStats]);

  // Berechne Alter der Daten
  const getDataAge = useCallback(() => {
    if (!lastUpdate) return null;
    return Math.floor((Date.now() - lastUpdate.getTime()) / 1000 / 60); // Minuten
  }, [lastUpdate]);

  // Formatierte Stats für UI
  const formattedStats = stats ? {
    ...stats,
    formatted: {
      members: {
        total: stats.members?.total?.toLocaleString() || '0',
        active: stats.members?.active?.toLocaleString() || '0',
        newThisWeek: stats.members?.newThisWeek?.toLocaleString() || '0'
      },
      activity: {
        totalVoiceHours: stats.activity?.totalVoiceHours?.toLocaleString() || '0',
        totalMessages: stats.activity?.totalMessages?.toLocaleString() || '0',
        activeVoiceSessions: stats.activity?.activeVoiceSessions?.toLocaleString() || '0',
        gamesPlayed: stats.activity?.gamesPlayed?.toLocaleString() || '0'
      }
    }
  } : null;

  return {
    // Daten
    stats: formattedStats,
    rawStats: stats,
    loading,
    error,
    lastUpdate,
    
    // Computed
    dataAge: getDataAge(),
    isStale: getDataAge() > 30, // Über 30 Minuten alt
    
    // Aktionen
    refresh: refreshStats,
    fetchLiveStats,
    fetchTrending,
    checkHealth,
    
    // Utils
    formatNumber: (num) => num?.toLocaleString() || '0',
    formatDuration: (minutes) => {
      if (!minutes) return '0h 0m';
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
  };
};

// Spezieller Hook für Live-Daten (häufigere Updates)
export const useLiveStats = (refreshInterval = 30000) => { // 30 Sekunden
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLive = useCallback(async () => {
    try {
      const response = await api.get('/homepage/stats/live');
      if (response.data.success) {
        setLiveData(response.data);
      }
    } catch (err) {
      console.error('Error fetching live data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchLive, refreshInterval]);

  return {
    liveData,
    loading,
    refresh: fetchLive,
    activeVoice: liveData?.live?.activeVoiceSessions || 0,
    onlineMembers: liveData?.live?.onlineMembers || 0
  };
};

// Hook für Trending Content
export const useTrending = () => {
  const [trending, setTrending] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await api.get('/homepage/trending');
        if (response.data.success) {
          setTrending(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching trending:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return { trending, loading };
};