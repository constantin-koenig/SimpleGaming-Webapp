// frontend/src/hooks/useServerStats.js - ENHANCED für Live-Daten
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

export const useServerStats = (options = {}) => {
  const {
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 Minuten für normale Stats
    format = 'full'
  } = options;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

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

  const refreshStats = useCallback(async () => {
    await fetchStats(true);
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchStats(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchStats]);

  const getDataAge = useCallback(() => {
    if (!lastUpdate) return null;
    return Math.floor((Date.now() - lastUpdate.getTime()) / 1000 / 60);
  }, [lastUpdate]);

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
    stats: formattedStats,
    rawStats: stats,
    loading,
    error,
    lastUpdate,
    dataAge: getDataAge(),
    isStale: getDataAge() > 30,
    refresh: refreshStats
  };
};

// NEUER Hook für Live-Daten mit 1-Minute Updates
export const useLiveStats = (options = {}) => {
  const {
    refreshInterval = 60000, // ✅ 1 Minute statt 15 Sekunden
    autoRefresh = true
  } = options;

  const [liveData, setLiveData] = useState({
    onlineMembers: 0,
    activeVoiceSessions: 0,
    currentlyPlaying: 0,
    lastActivity: null,
    timestamp: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  const lastFetchRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  const fetchLiveData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);
      setConnectionStatus('fetching');

      const response = await api.get('/homepage/stats/live');
      
      if (response.data.success) {
        const newData = {
          onlineMembers: response.data.live.onlineMembers || 0,
          activeVoiceSessions: response.data.live.activeVoiceSessions || 0,
          currentlyPlaying: response.data.live.currentlyPlaying || 0,
          lastActivity: response.data.live.lastActivity,
          timestamp: new Date(response.data.live.timestamp),
          cached: response.data.cached,
          performance: response.data.performance
        };

        setLiveData(newData);
        lastFetchRef.current = Date.now();
        retryCountRef.current = 0;
        setConnectionStatus('connected');
      } else {
        throw new Error(response.data.message || 'Failed to fetch live stats');
      }
    } catch (err) {
      console.error('Error fetching live stats:', err);
      setError(err.message);
      setConnectionStatus('error');
      
      retryCountRef.current += 1;
      
      // Exponential backoff bei Fehlern
      if (retryCountRef.current < maxRetries) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 30000);
        setTimeout(() => fetchLiveData(false), retryDelay);
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchLiveData(true);
  }, [fetchLiveData]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchLiveData(false);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchLiveData]);

  // Connection health check
  useEffect(() => {
    const healthCheck = setInterval(() => {
      const timeSinceLastFetch = Date.now() - (lastFetchRef.current || 0);
      const expectedInterval = refreshInterval + 5000; // 5s Toleranz
      
      if (timeSinceLastFetch > expectedInterval && connectionStatus === 'connected') {
        setConnectionStatus('stale');
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(healthCheck);
  }, [refreshInterval, connectionStatus]);

  const getConnectionStatusInfo = () => {
    switch (connectionStatus) {
      case 'connected':
        return { 
          color: 'green', 
          text: 'Live', 
          icon: '●' 
        };
      case 'fetching':
        return { 
          color: 'yellow', 
          text: 'Aktualisiert...', 
          icon: '○' 
        };
      case 'stale':
        return { 
          color: 'orange', 
          text: 'Verbindung instabil', 
          icon: '◐' 
        };
      case 'error':
        return { 
          color: 'red', 
          text: 'Offline', 
          icon: '●' 
        };
      default:
        return { 
          color: 'gray', 
          text: 'Verbinde...', 
          icon: '○' 
        };
    }
  };

  return {
    // Live-Daten
    onlineMembers: liveData.onlineMembers,
    activeVoiceSessions: liveData.activeVoiceSessions,
    currentlyPlaying: liveData.currentlyPlaying,
    lastActivity: liveData.lastActivity,
    timestamp: liveData.timestamp,
    
    // Status
    loading,
    error,
    connectionStatus,
    connectionInfo: getConnectionStatusInfo(),
    
    // Performance Info
    performance: liveData.performance,
    cacheAge: liveData.performance?.cacheAge ? Math.floor(liveData.performance.cacheAge / 1000 / 60) : null,
    
    // Actions
    refresh: () => fetchLiveData(true),
    
    // Utils
    isOnline: connectionStatus === 'connected',
    isStale: connectionStatus === 'stale',
    hasError: connectionStatus === 'error',
    
    // Formatted data
    formattedData: {
      onlineMembers: liveData.onlineMembers.toLocaleString(),
      activeVoiceSessions: liveData.activeVoiceSessions.toLocaleString(),
      currentlyPlaying: liveData.currentlyPlaying.toLocaleString()
    }
  };
};

// Hook für animierte Zahlen-Updates
export const useAnimatedCounter = (targetValue, duration = 2000, shouldAnimate = true) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef(null);
  const lastTargetRef = useRef(0);

  useEffect(() => {
    if (!shouldAnimate || targetValue === lastTargetRef.current) return;

    setIsAnimating(true);
    const startValue = lastTargetRef.current;
    const difference = targetValue - startValue;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const newValue = Math.floor(startValue + (difference * easeOut));
      
      setCurrentValue(newValue);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentValue(targetValue);
        setIsAnimating(false);
        lastTargetRef.current = targetValue;
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration, shouldAnimate]);

  useEffect(() => {
    if (!shouldAnimate) {
      setCurrentValue(targetValue);
      lastTargetRef.current = targetValue;
    }
  }, [targetValue, shouldAnimate]);

  return { 
    value: currentValue, 
    isAnimating,
    formatted: currentValue.toLocaleString()
  };
};