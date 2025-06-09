// frontend/src/components/public/GameCard.jsx - ENHANCED mit einmaliger Shimmer-Animation
import React, { useState, useEffect } from 'react';

const GameCard = ({ game, delay = 0, isVisible }) => {
  const [shimmerShown, setShimmerShown] = useState(false);

  // Formatiere die Zahlen für bessere Anzeige
  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  const formatHours = (hours) => {
    if (hours >= 1000) {
      return (hours / 1000).toFixed(1) + 'k';
    }
    return hours.toString();
  };

  // Bestimme Badge-Farbe basierend auf Aktivität
  const getBadgeColor = () => {
    if (game.isActive && game.currentPlayers > 0) {
      return 'bg-green-500'; // Live aktiv
    } else if (game.hoursThisWeek > 50) {
      return 'bg-blue-500'; // Sehr beliebt
    } else if (game.sessions > 100) {
      return 'bg-purple-500'; // Etabliert
    }
    return 'bg-gray-500'; // Standard
  };

  const getBadgeText = () => {
    if (game.isActive && game.currentPlayers > 0) {
      return 'Live aktiv';
    } else if (game.hoursThisWeek > 50) {
      return 'Sehr beliebt';
    } else if (game.sessions > 100) {
      return 'Community-Favorit';
    }
    return game.category || 'Game';
  };

  // Session-Länge für Tooltip
  const getSessionInfo = () => {
    if (game.averageSessionLength) {
      return `Ø ${game.averageSessionLength}min pro Session`;
    }
    return 'Keine Session-Daten';
  };

  // Platzhalter-Bild Generator
  

  // Shimmer-Effekt nur einmal beim ersten Anzeigen
  useEffect(() => {
    if (isVisible && !shimmerShown) {
      setShimmerShown(true);
    }
  }, [isVisible, shimmerShown]);

  return (
    <div 
      className={`transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } hover-lift feature-card ${!shimmerShown && isVisible ? 'shimmer' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl overflow-hidden shadow-lg hover:shadow-2xl border border-light-border-primary dark:border-dark-border-primary">
        {/* Game Image mit Live-Indikator */}
        <div className="relative">
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
            <img 
              src={game.image} 
              alt={game.title || game.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          

          {/* Kategorie-Badge */}
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-black bg-opacity-50 text-white">
              {game.category}
            </span>
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30"></div>
        </div>
        
        {/* Card Content */}
        <div className="p-6">
          {/* Game Title */}
          <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-3 line-clamp-2">
            {game.title || game.name}
          </h3>
          
          {/* Statistiken Grid */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Spieler */}
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {game.players || game.uniquePlayers || 0}
              </div>
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Spieler
              </div>
            </div>
            
            {/* Sessions */}
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatNumber(game.sessions || game.totalSessions || 0)}
              </div>
              <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Sessions
              </div>
            </div>
          </div>

          {/* Erweiterte Statistiken */}
          <div className="space-y-2 mb-4">
            {/* Gesamte Spielzeit */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Gesamte Spielzeit:
              </span>
              <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                {formatHours(game.totalHours || Math.floor((game.totalMinutes || 0) / 60))}h
              </span>
            </div>

            {/* Spielzeit diese Woche */}
            {(game.hoursThisWeek !== undefined || game.minutesThisWeek !== undefined) && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Diese Woche:
                </span>
                <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                  {formatHours(game.hoursThisWeek || Math.floor((game.minutesThisWeek || 0) / 60))}h
                </span>
              </div>
            )}

            {/* Durchschnittliche Session-Länge */}
            {game.averageSessionLength && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Ø Session:
                </span>
                <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  {game.averageSessionLength}min
                </span>
              </div>
            )}
          </div>

          {/* Live-Status oder letzte Aktivität */}
          <div className="border-t border-light-border-secondary dark:border-dark-border-secondary pt-4">
            {game.isActive && game.currentPlayers > 0 ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Live aktiv
                  </span>
                </div>
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Gerade gespielt
                </span>
              </div>
            ) : game.lastSeen || game.lastPlayed ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Zuletzt gespielt:
                </span>
                <span className="text-sm text-light-text-primary dark:text-dark-text-primary">
                  {new Date(game.lastSeen || game.lastPlayed).toLocaleDateString('de-DE')}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                  Noch keine Aktivität
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;