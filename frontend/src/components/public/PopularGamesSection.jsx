// frontend/src/components/public/PopularGamesSection.jsx
import React from 'react';
import GameCard from './GameCard';

const PopularGamesSection = ({ games, loading, error, enhancedStats, isVisible }) => {
  return (
    <div 
      id="games" 
      className={`py-16 bg-light-bg-secondary dark:bg-dark-bg-secondary transition-all duration-1000 pattern-fade ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase gradient-text">Spiele</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary sm:text-4xl neon-glow">
            Beliebte Spiele bei SimpleGaming
          </p>
          <div className="badge-pulse mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {enhancedStats ? 
              `${enhancedStats.activity.totalGamingSessions || 0} Sessions • ${enhancedStats.activity.uniqueGamesPlayed || 0} verschiedene Spiele` : 
              'Spiele mit uns!'
            }
          </div>
          
          {/* Live Gaming-Info */}
          {enhancedStats && enhancedStats.activity.currentlyPlaying > 0 && (
            <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping mr-2"></div>
              {enhancedStats.activity.currentlyPlaying} Spieler sind gerade aktiv
            </div>
          )}
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Lade Gaming-Statistiken...
            </div>
          </div>
        )}
        
        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Fehler beim Laden der Gaming-Daten: {error}
            </div>
          </div>
        )}
        
        {/* Games Grid */}
        {!loading && games.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {games.map((game, index) => (
                <GameCard 
                  key={game.id || game.gameId || index} 
                  game={game} 
                  delay={index * 100} 
                  isVisible={isVisible} 
                />
              ))}
            </div>
            
            {/* Gaming-Statistiken Summary */}
            {enhancedStats && enhancedStats.activity.totalGamingSessions > 0 && (
              <div className="mt-12 text-center">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      {enhancedStats.activity.totalGamingHours || 0}h
                    </div>
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Gesamte Gaming-Zeit
                    </div>
                  </div>
                  <div className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {enhancedStats.activity.totalGamingSessions || 0}
                    </div>
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Gaming Sessions
                    </div>
                  </div>
                  <div className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {enhancedStats.activity.uniqueGamesPlayed || 0}
                    </div>
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Verschiedene Spiele
                    </div>
                  </div>
                  <div className="bg-light-bg-primary dark:bg-dark-bg-primary rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {enhancedStats.activity.currentlyPlaying || 0}
                    </div>
                    <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                      Spielen gerade
                    </div>
                  </div>
                </div>
                
                {/* Hinweis bei leeren Daten */}
                {games.length === 0 && (
                  <div className="mt-6 text-center">
                    <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                      💡 Noch keine Gaming-Daten verfügbar. Der Discord Bot sammelt Gaming-Aktivitäten in Echtzeit.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        {/* Empty State */}
        {!loading && !error && games.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 001-1v-1a2 2 0 114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
              Noch keine Gaming-Daten
            </h3>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
              Der Discord Bot startet das Gaming-Tracking. Spielt Spiele auf Discord, um hier Statistiken zu sehen!
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Bot ist aktiv und sammelt Gaming-Aktivitäten
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopularGamesSection;