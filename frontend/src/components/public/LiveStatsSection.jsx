// frontend/src/components/public/LiveStatsSection.jsx
import React from 'react';
import LiveStatsDisplay from './LiveStatsDisplay';

const LiveStatsSection = ({ liveStats, baseStats, isVisible }) => {
  return (
    <div 
      id="liveStats" 
      className={`py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase gradient-text">Live Stats</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary sm:text-4xl neon-glow">
            Was passiert gerade?
          </p>
          <p className="mt-4 max-w-2xl text-xl text-light-text-secondary dark:text-dark-text-secondary lg:mx-auto">
            Echte Live-Daten aus unserer Discord-Community
          </p>
        </div>
        
        <LiveStatsDisplay 
          liveStats={liveStats} 
          baseStats={baseStats} 
          isVisible={isVisible} 
        />
      </div>
    </div>
  );
};

export default LiveStatsSection;