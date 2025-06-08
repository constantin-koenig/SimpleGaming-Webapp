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
          
          {/* Live Gaming-Info - ohne pulsierenden Badge */}
          {enhancedStats && enhancedStats.activity.currentlyPlaying > 0 && (
            <div className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping mr-2"></div>
              Gaming-Sessions aktiv
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
            
            {/* Gaming-Statistiken Summary - Redesigned */}
            {enhancedStats && enhancedStats.activity.totalGamingSessions > 0 && (
              <div className="mt-16">
                {/* Dekorative Trennlinie */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex-grow h-px bg-gradient-to-r from-transparent via-primary-300 dark:via-primary-600 to-transparent"></div>
                  <div className="px-6">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">Gaming Highlights</span>
                    </div>
                  </div>
                  <div className="flex-grow h-px bg-gradient-to-r from-transparent via-primary-300 dark:via-primary-600 to-transparent"></div>
                </div>

                {/* Fancy Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* Gaming Zeit */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                    <div className="relative bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl p-6 border border-primary-200 dark:border-primary-800 transform -rotate-1 group-hover:rotate-0 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                          {enhancedStats.activity.totalGamingHours || 0}h
                        </div>
                      </div>
                      <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        Gesamte Gaming-Zeit
                      </div>
                      <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                        Von unserer Community
                      </div>
                    </div>
                  </div>

                  {/* Gaming Sessions */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
                    <div className="relative bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl p-6 border border-green-200 dark:border-green-800 transform rotate-1 group-hover:rotate-0 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                        </div>
                        <div className="text-3xl font-extrabold text-green-600 dark:text-green-400">
                          {(enhancedStats.activity.totalGamingSessions || 0).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        Gaming Sessions
                      </div>
                      <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                        Erfolgreich abgeschlossen
                      </div>
                    </div>
                  </div>

                  {/* Verschiedene Spiele */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                    <div className="relative bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl p-6 border border-blue-200 dark:border-blue-800 transform -rotate-1 group-hover:rotate-0 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z"/>
                          </svg>
                        </div>
                        <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                          {enhancedStats.activity.uniqueGamesPlayed || 0}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        Verschiedene Spiele
                      </div>
                      <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                        In unserer Library
                      </div>
                    </div>
                  </div>

                  {/* Durchschnittliche Session-Länge (neue Metrik) */}
                  <div className="relative group md:col-span-3 lg:col-span-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl transform -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
                    <div className="relative bg-light-bg-primary dark:bg-dark-bg-primary rounded-xl p-6 border border-purple-200 dark:border-purple-800 transform rotate-1 group-hover:rotate-0 transition-transform duration-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <div className="text-3xl font-extrabold text-purple-600 dark:text-purple-400">
                          {enhancedStats.activity.totalGamingSessions > 0 
                            ? Math.round((enhancedStats.activity.totalGamingHours * 60) / enhancedStats.activity.totalGamingSessions)
                            : 0}min
                        </div>
                      </div>
                      <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        Ø Session-Länge
                      </div>
                      <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                        Pro Gaming-Session
                      </div>
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