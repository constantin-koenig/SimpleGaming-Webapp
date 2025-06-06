// frontend/src/components/public/CommunityStatsSection.jsx
import React from 'react';
import AnimatedStatCard from './AnimatedStatCard';

const CommunityStatsSection = ({ enhancedStats, liveStats, communityStats, isVisible, statsError }) => {
  return (
    <div 
      id="stats" 
      className={`py-20 bg-gradient-to-r from-primary-700 to-primary-900 transition-all duration-1000 relative ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
    >
      {/* Wellige obere Kante */}
      <div className="absolute left-0 right-0 -mt-20 h-20 overflow-hidden">
        <svg className="absolute bottom-0 w-full h-20 fill-current text-gray-50 dark:text-gray-900 transform rotate-180" viewBox="0 0 1440 320">
          <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,122.7C960,139,1056,149,1152,144C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white mb-4 neon-glow">
            SimpleGaming in Zahlen
          </h2>
          {enhancedStats && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-6">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              Live-Daten • {liveStats.formattedData.onlineMembers} online • Aktualisiert {new Date(enhancedStats.lastUpdate).toLocaleTimeString('de-DE')}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {communityStats.map((stat, index) => (
            <AnimatedStatCard 
              key={index} 
              label={stat.label}
              value={stat.value} 
              suffix={stat.suffix}
              delay={index * 200} 
              isVisible={isVisible}
              gradient={stat.gradient}
              icon={stat.icon}
            />
          ))}
        </div>
        
        {/* Error State */}
        {statsError && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-lg bg-red-100 text-red-800 text-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              Live-Statistiken temporär nicht verfügbar
            </div>
          </div>
        )}
      </div>
      
      {/* Wellige untere Kante */}
      <div className="absolute left-0 right-0 h-20 overflow-hidden" style={{marginTop: "5rem"}}>
        <svg className="absolute top-0 w-full h-20 fill-current text-light-bg-primary dark:text-dark-bg-primary" viewBox="0 0 1440 320">
          <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,122.7C960,139,1056,149,1152,144C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </div>
  );
};

export default CommunityStatsSection;