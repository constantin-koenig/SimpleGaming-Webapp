// Hook für den Zugriff auf den Auth-Kontext
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth muss innerhalb eines AuthProvider verwendet werden');
  }
  
  return context;
};
