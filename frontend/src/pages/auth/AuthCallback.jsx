// Callback-Seite für Discord OAuth
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthCallback = () => {
  const { handleAuthCallback } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Token aus URL-Parameter holen
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (!token) {
          setError('Kein Authentifizierungstoken erhalten');
          return;
        }
        
        // Token im AuthContext speichern
        await handleAuthCallback(token);
        
        // Zum Dashboard weiterleiten
        navigate('/dashboard');
      } catch (err) {
        console.error('Authentifizierungsfehler:', err);
        setError('Bei der Authentifizierung ist ein Fehler aufgetreten');
      }
    };
    
    processAuth();
  }, [handleAuthCallback, location.search, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-md p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-2">Fehler</h2>
            <p className="text-white mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              Zurück zur Startseite
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-md p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Anmeldung läuft...</h2>
          <p className="text-gray-300 mb-6">Du wirst gleich weitergeleitet.</p>
          <div className="flex justify-center">
            <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;