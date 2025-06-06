// frontend/src/hooks/usePopularGames.js
import { useState, useEffect } from 'react';
import api from '../services/api';

export const usePopularGames = (timeframe = 'week', limit = 4) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get(`/homepage/games/popular?timeframe=${timeframe}&limit=${limit}`);
        
        if (response.data.success) {
          const realGames = response.data.data;
          console.log('📊 Loaded games from backend:', realGames);
          setGames(realGames); // Nur echte Daten aus dem Backend
        } else {
          throw new Error(response.data.message || 'Failed to fetch games');
        }
      } catch (err) {
        console.error('❌ Error fetching popular games:', err);
        setError(err.message);
        setGames([]); // Leeres Array bei Fehlern, keine Fallback-Daten
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [timeframe, limit]);

  return { games, loading, error };
};