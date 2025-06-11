// frontend/src/components/public/LiveStatsDisplay.jsx
import React, { useState, useEffect } from 'react';
import { useAnimatedCounter } from '../../hooks/useServerStats';

const LiveStatsDisplay = ({ liveStats, baseStats, isVisible }) => {
  const [countdown, setCountdown] = useState(60);

  const onlineCount = useAnimatedCounter(
    liveStats.onlineMembers, 
    1500, 
    isVisible && liveStats.onlineMembers > 0
  );
  const voiceCount = useAnimatedCounter(
    liveStats.activeVoiceSessions, 
    1500, 
    isVisible && liveStats.activeVoiceSessions >= 0
  );
  const playingCount = useAnimatedCounter(
    liveStats.currentlyPlaying, 
    1500, 
    isVisible && liveStats.currentlyPlaying >= 0
  );

  // Countdown für nächstes Update
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const nextUpdate = Math.ceil(now / 60000) * 60000; // Nächste volle Minute
      const secondsUntilUpdate = Math.floor((nextUpdate - now) / 1000);
      setCountdown(secondsUntilUpdate);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`transform transition-all duration-1000 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
      {/* Live-Status Header */}
      <div className="flex items-center justify-center mb-8 space-x-4">
        <div className="flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            liveStats.connectionInfo.color === 'green' ? 'bg-green-500 animate-pulse' :
            liveStats.connectionInfo.color === 'yellow' ? 'bg-yellow-500 animate-spin' :
            liveStats.connectionInfo.color === 'orange' ? 'bg-orange-500 animate-pulse' :
            'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            {liveStats.connectionInfo.text}
          </span>
        </div>
        
        {liveStats.timestamp && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Aktualisiert: {liveStats.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>

      {/* Live-Statistiken Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Online Mitglieder */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Gerade Online</p>
                <p className="text-3xl font-bold">
                  {onlineCount.isInitialized ? onlineCount.formatted : liveStats.formattedData.onlineMembers}
                  {onlineCount.isAnimating && (
                    <span className="inline-block w-1 h-8 bg-white ml-1 animate-pulse"></span>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-ping mr-2"></div>
              <span className="text-green-100 text-xs">Live Discord Präsenz</span>
            </div>
          </div>
        </div>

        {/* Voice Chat */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Im Voice Chat</p>
                <p className="text-3xl font-bold">
                  {voiceCount.isInitialized ? voiceCount.formatted : liveStats.formattedData.activeVoiceSessions}
                  {voiceCount.isAnimating && (
                    <span className="inline-block w-1 h-8 bg-white ml-1 animate-pulse"></span>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse mr-2"></div>
              <span className="text-blue-100 text-xs">Aktive Gespräche</span>
            </div>
          </div>
        </div>

        {/* Aktuell Spielend */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Spielen gerade</p>
                <p className="text-3xl font-bold">
                  {playingCount.isInitialized ? playingCount.formatted : liveStats.formattedData.currentlyPlaying}
                  {playingCount.isAnimating && (
                    <span className="inline-block w-1 h-8 bg-white ml-1 animate-pulse"></span>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/>
                </svg>
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce mr-2"></div>
              <span className="text-purple-100 text-xs">Gaming Sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Info (nur für Debug/Admins) */}
      {liveStats.performance && process.env.NODE_ENV === 'development' && (
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          Nächstes Update in: {countdown}s
        </div>
      )}
    </div>
  );
};

export default LiveStatsDisplay;