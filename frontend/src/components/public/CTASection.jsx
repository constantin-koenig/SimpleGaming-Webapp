// frontend/src/components/public/CTASection.jsx
import React from 'react';

const CTASection = ({ enhancedStats, liveStats, isVisible, discordAuthUrl }) => {
  return (
    <div 
      id="cta" 
      className={`py-16 relative overflow-hidden transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 z-0">
        <div className="absolute w-96 h-96 -top-20 -left-20 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute w-96 h-96 top-1/4 right-1/3 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute w-96 h-96 bottom-0 right-0 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-0 lg:flex-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl neon-glow">
              <span className="block">Bereit, beizutreten?</span>
              <span className="block text-primary-300">
                {enhancedStats ? 
                  `Werde Teil von ${enhancedStats.formatted?.members?.total || enhancedStats.members.total} Gamern!` : 
                  'Werde noch heute Teil von SimpleGaming!'
                }
              </span>
            </h2>
            
            {/* Enhanced Live-Aktivität Anzeige */}
            {enhancedStats && liveStats.isOnline && (
              <div className="mt-6 flex flex-wrap gap-4">
                <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-ping mr-2"></div>
                  <span className="text-white text-sm font-medium">
                    {liveStats.formattedData.onlineMembers} gerade online
                  </span>
                </div>
                
                <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <svg className="w-4 h-4 text-blue-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-white text-sm font-medium">
                    {liveStats.formattedData.activeVoiceSessions} im Voice Chat
                  </span>
                </div>
                
                <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <svg className="w-4 h-4 text-purple-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/>
                  </svg>
                  <span className="text-white text-sm font-medium">
                    {liveStats.formattedData.currentlyPlaying} spielen gerade
                  </span>
                </div>
                
                {/* Gaming-spezifische Live-Stats */}
                {enhancedStats.activity.totalGamingSessions > 0 && (
                  <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                    <svg className="w-4 h-4 text-yellow-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-white text-sm font-medium">
                      {enhancedStats.activity.totalGamingHours}h Gaming-Zeit
                    </span>
                  </div>
                )}
                
                <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                  <svg className="w-4 h-4 text-indigo-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white text-sm font-medium">
                    {enhancedStats.members.newThisWeek} neue Mitglieder diese Woche
                  </span>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow-lg">
              <a
                href={discordAuthUrl}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 hover:scale-105 pulse-animation"
              >
                <svg className="w-6 h-6 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0c-.164-.386-.398-.875-.608-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                </svg>
                Discord beitreten
              </a>
            </div>
          </div>
        </div>
        
        {/* Live Gaming Scene mit echten Daten */}
        <div className="mt-10">
          <div className="relative flex justify-center">
            <svg viewBox="0 0 300 100" className="w-full max-w-lg opacity-40">
              {/* Gaming Table */}
              <rect x="100" y="80" width="100" height="5" rx="2" fill="#FFFFFF" />
              
              {/* Player 1 - Left */}
              <g className="animate-pulse" style={{animationDuration: "3s"}}>
                <circle cx="80" cy="40" r="8" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                <line x1="80" y1="48" x2="80" y2="65" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="80" y1="52" x2="70" y2="60" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="80" y1="52" x2="90" y2="65" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="80" y1="65" x2="70" y2="85" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="80" y1="65" x2="90" y2="85" stroke="#FFFFFF" strokeWidth="2" />
                
                {/* Happy Face */}
                <circle cx="77" cy="38" r="1" fill="#FFFFFF" />
                <circle cx="83" cy="38" r="1" fill="#FFFFFF" />
                <path d="M77,43 Q80,46 83,43" stroke="#FFFFFF" strokeWidth="1" fill="none" />
              </g>
              
              {/* Player 2 - Right */}
              <g className="animate-pulse" style={{animationDuration: "2.5s", animationDelay: "0.5s"}}>
                <circle cx="220" cy="40" r="8" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                <line x1="220" y1="48" x2="220" y2="65" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="220" y1="52" x2="230" y2="60" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="220" y1="52" x2="210" y2="65" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="220" y1="65" x2="210" y2="85" stroke="#FFFFFF" strokeWidth="2" />
                <line x1="220" y1="65" x2="230" y2="85" stroke="#FFFFFF" strokeWidth="2" />
                
                {/* Happy Face */}
                <circle cx="217" cy="38" r="1" fill="#FFFFFF" />
                <circle cx="223" cy="38" r="1" fill="#FFFFFF" />
                <path d="M217,43 Q220,46 223,43" stroke="#FFFFFF" strokeWidth="1" fill="none" />
              </g>
              
              {/* Game Screen/Monitor */}
              <rect x="125" y="50" width="50" height="30" rx="2" fill="#FFFFFF" opacity="0.2" className="animate-pulse" />
              
              {/* Game Console */}
              <rect x="140" y="85" width="20" height="5" rx="1" fill="#FFFFFF" opacity="0.7" />
              
              {/* Controllers */}
              <rect x="95" y="65" width="15" height="8" rx="2" fill="#FFFFFF" opacity="0.5" />
              <rect x="190" y="65" width="15" height="8" rx="2" fill="#FFFFFF" opacity="0.5" />
              
              {/* Effect Stars - Excitement */}
              <path d="M120,30 L122,35 L127,37 L122,39 L120,44 L118,39 L113,37 L118,35 Z" fill="#FFFFFF" opacity="0.5" className="animate-ping" style={{animationDuration: "2s"}} />
              <path d="M180,35 L182,40 L187,42 L182,44 L180,49 L178,44 L173,42 L178,40 Z" fill="#FFFFFF" opacity="0.5" className="animate-ping" style={{animationDuration: "2.5s"}} />
            </svg>
          </div>
          
          {/* Live-Aktivität Text mit echten Daten */}
          {enhancedStats && liveStats.isOnline && (
            <div className="mt-6 text-center space-y-2">
              <p className="text-white text-opacity-80 text-lg">
                Gerade spielen <span className="font-bold text-white">{liveStats.formattedData.currentlyPlaying}</span> Mitglieder zusammen
              </p>
              <p className="text-white text-opacity-60 text-sm">
                {liveStats.formattedData.activeVoiceSessions} aktive Voice-Sessions • {liveStats.formattedData.onlineMembers} online
              </p>
              {/* Gaming-Statistiken im CTA */}
              {enhancedStats.activity.totalGamingSessions > 0 && (
                <p className="text-white text-opacity-60 text-sm">
                  {enhancedStats.activity.totalGamingSessions} Gaming-Sessions • {enhancedStats.activity.uniqueGamesPlayed} verschiedene Spiele
                </p>
              )}
              {liveStats.timestamp && (
                <p className="text-white text-opacity-40 text-xs">
                  Live-Update: {liveStats.timestamp.toLocaleTimeString('de-DE')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CTASection;