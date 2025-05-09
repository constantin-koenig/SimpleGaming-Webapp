// frontend/src/components/public/StatsCounter.jsx
import React, { useState, useEffect } from 'react';

const StatsCounter = ({ stat, delay, isVisible }) => {
  const [count, setCount] = useState(0);
  const { label, value, suffix } = stat;
  
  // Counter-Animation
  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const end = parseInt(value.toString().replace(/,/g, ''));
    const incrementTime = (delay + 1000) / end;
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    
    return () => {
      clearInterval(timer);
    };
  }, [value, delay, isVisible]);
  
  return (
    <div 
      className={`text-center transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <p className="text-5xl font-extrabold text-white mb-2">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-lg text-primary-300">{label}</p>
    </div>
  );
};

export default StatsCounter;