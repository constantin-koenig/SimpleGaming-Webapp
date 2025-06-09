// frontend/src/components/public/AnimatedComparisonStatCard.jsx
import React, { useState, useEffect } from 'react';
import { useAnimatedCounter } from '../../hooks/useServerStats';

const AnimatedComparisonStatCard = ({ 
  realValue, 
  realLabel, 
  realSuffix = '', 
  comparisonValue, 
  comparisonLabel, 
  comparisonSuffix = '', 
  delay = 0, 
  isVisible, 
  gradient, 
  icon,
  switchInterval = 4000, // 4 Sekunden zwischen Wechseln
  globalSyncOffset = 0 // ✅ NEU: Für globale Synchronisation
}) => {
  const [showComparison, setShowComparison] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Bestimme welcher Wert gerade angezeigt werden soll
  const currentValue = showComparison ? comparisonValue : realValue;
  const currentLabel = showComparison ? comparisonLabel : realLabel;
  const currentSuffix = showComparison ? comparisonSuffix : realSuffix;

  const animatedValue = useAnimatedCounter(
    parseInt(currentValue.toString().replace(/,/g, '')) || 0, 
    1500, 
    isVisible && !isTransitioning
  );

  // ✅ FIXED: Globale Synchronisation aller Karten
  useEffect(() => {
    if (!isVisible) return;

    // Alle Karten starten synchron
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // Nach kurzer Transition Zeit alle gleichzeitig wechseln
      setTimeout(() => {
        setShowComparison(prev => !prev);
        setIsTransitioning(false);
      }, 300);
    }, switchInterval);

    return () => clearInterval(interval);
  }, [isVisible, switchInterval]); // ✅ Alle verwenden das gleiche Intervall
  
  return (
    <div 
      className={`transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`${gradient} rounded-xl p-6 text-white relative overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}>
        {/* Animated Background Blobs */}
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        <div className={`absolute bottom-0 left-0 -mb-4 -ml-4 w-16 h-16 bg-white opacity-5 rounded-full transition-transform duration-1000 ${showComparison ? 'scale-150' : 'scale-100'}`}></div>
        
        <div className="relative z-10">
          {/* Header mit Icon */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              {icon}
            </div>
            
            {/* Status-Indikator */}
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
              showComparison ? 'bg-yellow-300 animate-pulse' : 'bg-green-300'
            }`}></div>
          </div>
          
          {/* Hauptwert mit Slide-Animation */}
          <div className={`transition-all duration-500 transform ${
            isTransitioning ? 'translate-x-4 opacity-50' : 'translate-x-0 opacity-100'
          }`}>
            <p className="text-4xl md:text-5xl font-extrabold mb-2">
              {animatedValue.isInitialized ? (
                <>
                  {animatedValue.formatted}{currentSuffix}
                </>
              ) : (
                <>
                  {currentValue.toLocaleString()}{currentSuffix}
                </>
              )}
            </p>
            
            {/* Label ohne Typ-Indikator */}
            <p className={`text-lg transition-all duration-500 ${
              showComparison ? 'opacity-90 text-yellow-100' : 'opacity-90'
            }`}>
              {currentLabel}
            </p>
          </div>
        </div>

        {/* Particle Effect bei Wechsel */}
        {isTransitioning && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full animate-ping"></div>
            <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
            <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" style={{animationDelay: '0.4s'}}></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnimatedComparisonStatCard;