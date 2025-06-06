// frontend/src/components/public/AnimatedStatCard.jsx
import React from 'react';
import { useAnimatedCounter } from '../../hooks/useServerStats';

const AnimatedStatCard = ({ label, value, suffix = '', delay = 0, isVisible, gradient, icon }) => {
  const animatedValue = useAnimatedCounter(
    parseInt(value.toString().replace(/,/g, '')) || 0, 
    2000, 
    isVisible
  );
  
  return (
    <div 
      className={`transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`${gradient} rounded-xl p-6 text-white relative overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              {icon}
            </div>
            {animatedValue.isAnimating && (
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          
          <p className="text-4xl md:text-5xl font-extrabold mb-2">
            {animatedValue.isInitialized ? (
              <>
                {animatedValue.formatted}{suffix}
                {animatedValue.isAnimating && (
                  <span className="inline-block w-1 h-10 bg-white ml-2 animate-pulse"></span>
                )}
              </>
            ) : (
              <>
                {value.toLocaleString()}{suffix}
              </>
            )}
          </p>
          <p className="text-lg opacity-90">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default AnimatedStatCard;