// Authentifizierungskontext
import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Token aus localStorage abrufen
  const getToken = () => localStorage.getItem('token');

  // Benutzer laden
  const loadUser = useCallback(async () => {
    const token = getToken();
    
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const { data } = await api.get('/auth/me');
      setUser(data);
    } catch (err) {
      console.error('Fehler beim Laden des Benutzers:', err);
      localStorage.removeItem('token');
      setError('Authentifizierungsfehler. Bitte melde dich erneut an.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Abmelden
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  // Token speichern und Benutzer laden
  const handleAuthCallback = useCallback(async (token) => {
    if (token) {
      localStorage.setItem('token', token);
      await loadUser();
    }
  }, [loadUser]);

  // Bei Seiten-Neustart Benutzer laden
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    logout,
    handleAuthCallback
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};