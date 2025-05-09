import React, { useEffect, useState } from 'react';

const StickFigureAnimation = ({ animationType, label, description, isVisible }) => {
  const [animationState, setAnimationState] = useState(0);
  
  // Reset animation when visibility changes
  useEffect(() => {
    if (isVisible) {
      // Start animation sequence when component becomes visible
      const timer = setTimeout(() => {
        setAnimationState(1);
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setAnimationState(0);
    }
  }, [isVisible]);
  
  // Progress through animation frames
  useEffect(() => {
    if (animationState > 0 && animationState < getMaxFrames()) {
      const timer = setTimeout(() => {
        setAnimationState(prevState => prevState + 1);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [animationState, animationType]);
  
  // Get maximum frames for the current animation type
  const getMaxFrames = () => {
    switch(animationType) {
      case 'noToxicity':
        return 4;
      case 'gaming':
        return 4;
      case 'community':
        return 3;
      case 'events':
        return 3;
      default:
        return 3;
    }
  };
  
  // Render specific animation based on type
  const renderAnimation = () => {
    switch(animationType) {
      case 'noToxicity':
        return renderNoToxicityAnimation();
      case 'gaming':
        return renderGamingAnimation();
      case 'community':
        return renderCommunityAnimation();
      case 'events':
        return renderEventsAnimation();
      default:
        return null;
    }
  };
  
  // No Toxicity Animation: Stick figure gets angry, shouts, then gets crossed out
  const renderNoToxicityAnimation = () => (
    <div className="relative h-32 w-32 mx-auto">
      {/* Stick Figure */}
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Table */}
        <rect x="20" y="65" width="60" height="5" rx="2" fill="#6B7280" />
        
        {/* Head */}
        <circle 
          cx="50" 
          cy="30" 
          r="10" 
          stroke="#000" 
          strokeWidth="2" 
          fill="none" 
          className={animationState >= 1 ? "animate-pulse" : ""}
        />
        
        {/* Body */}
        <line 
          x1="50" 
          y1="40" 
          x2="50" 
          y2="60" 
          stroke="#000" 
          strokeWidth="2"
          className={animationState >= 2 ? "origin-top transform scale-y-110" : ""} 
        />
        
        {/* Arms - normal in frame 1, raised in frame 2 */}
        {animationState < 2 ? (
          <>
            <line x1="50" y1="45" x2="35" y2="55" stroke="#000" strokeWidth="2" />
            <line x1="50" y1="45" x2="65" y2="55" stroke="#000" strokeWidth="2" />
          </>
        ) : (
          <>
            <line 
              x1="50" 
              y1="45" 
              x2="30" 
              y2={animationState >= 3 ? "35" : "40"} 
              stroke="#000" 
              strokeWidth="2" 
              className="origin-top-left transition-all duration-300"
            />
            <line 
              x1="50" 
              y1="45" 
              x2="70" 
              y2={animationState >= 3 ? "35" : "40"} 
              stroke="#000" 
              strokeWidth="2" 
              className="origin-top-right transition-all duration-300"
            />
          </>
        )}
        
        {/* Legs */}
        <line x1="50" y1="60" x2="40" y2="75" stroke="#000" strokeWidth="2" />
        <line x1="50" y1="60" x2="60" y2="75" stroke="#000" strokeWidth="2" />
        
        {/* Angry Face - appears in frame 2+ */}
        {animationState >= 2 && (
          <>
            <line x1="45" y1="28" x2="48" y2="30" stroke="#000" strokeWidth="1.5" />
            <line x1="55" y1="28" x2="52" y2="30" stroke="#000" strokeWidth="1.5" />
            <path d="M45,35 Q50,32 55,35" stroke="#000" strokeWidth="1.5" fill="none" />
          </>
        )}
        
        {/* Speech Bubble - appears in frame 3 */}
        {animationState >= 3 && (
          <g>
            <path 
              d="M65,20 Q75,20 75,10 Q75,0 65,0 Q55,0 55,10 Q55,15 50,18 L55,15 Q55,20 65,20" 
              fill="white" 
              stroke="#000" 
            />
            <text x="62" y="12" fontSize="10" textAnchor="middle" fill="#000">
              #$@!
            </text>
          </g>
        )}
        
        {/* Prohibition Sign - appears in frame 4 */}
        {animationState >= 4 && (
          <g className="animate-pulse">
            <circle cx="50" cy="40" r="35" stroke="#FF0000" strokeWidth="4" fill="none" />
            <line x1="25" y1="65" x2="75" y2="15" stroke="#FF0000" strokeWidth="4" />
          </g>
        )}
      </svg>
    </div>
  );
  
  // Gaming Animation: Stick figure gets excited playing games
  const renderGamingAnimation = () => (
    <div className="relative h-32 w-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Game Controller or PC */}
        <rect 
          x="30" 
          y="60" 
          width="40" 
          height="20" 
          rx="2" 
          fill="#6B7280" 
          className={animationState >= 3 ? "animate-pulse" : ""}
        />
        
        {/* Screen */}
        {animationState >= 2 && (
          <rect 
            x="35" 
            y="65" 
            width="30" 
            height="10" 
            fill={animationState >= 3 ? "#4F46E5" : "#9CA3AF"} 
            className={animationState >= 3 ? "animate-pulse" : ""}
          />
        )}
        
        {/* Head */}
        <circle 
          cx="50" 
          cy="30" 
          r="10" 
          stroke="#000" 
          strokeWidth="2" 
          fill="none" 
          className={animationState >= 1 ? "animate-bounce" : ""}
        />
        
        {/* Body */}
        <line x1="50" y1="40" x2="50" y2="60" stroke="#000" strokeWidth="2" />
        
        {/* Arms */}
        {animationState < 2 ? (
          <>
            <line x1="50" y1="45" x2="35" y2="55" stroke="#000" strokeWidth="2" />
            <line x1="50" y1="45" x2="65" y2="55" stroke="#000" strokeWidth="2" />
          </>
        ) : (
          <>
            <line 
              x1="50" 
              y1="45" 
              x2="35" 
              y2="60" 
              stroke="#000" 
              strokeWidth="2" 
              className={animationState >= 3 ? "animate-pulse origin-top" : ""}
            />
            <line 
              x1="50" 
              y1="45" 
              x2="65" 
              y2="60" 
              stroke="#000" 
              strokeWidth="2" 
              className={animationState >= 3 ? "animate-pulse origin-top" : ""}
            />
          </>
        )}
        
        {/* Legs */}
        <line x1="50" y1="60" x2="40" y2="75" stroke="#000" strokeWidth="2" />
        <line x1="50" y1="60" x2="60" y2="75" stroke="#000" strokeWidth="2" />
        
        {/* Happy Face - appears in frame 2+ */}
        {animationState >= 2 && (
          <>
            <circle cx="45" y="28" r="1" fill="#000" />
            <circle cx="55" y="28" r="1" fill="#000" />
            <path d="M45,33 Q50,38 55,33" stroke="#000" strokeWidth="1.5" fill="none" />
          </>
        )}
        
        {/* Excitement Stars - appears in frame 4 */}
        {animationState >= 4 && (
          <>
            <path d="M25,20 L27,25 L32,27 L27,29 L25,34 L23,29 L18,27 L23,25 Z" fill="#F59E0B" className="animate-ping opacity-75" />
            <path d="M75,30 L77,35 L82,37 L77,39 L75,44 L73,39 L68,37 L73,35 Z" fill="#F59E0B" className="animate-ping opacity-75" />
            <path d="M60,10 L62,15 L67,17 L62,19 L60,24 L58,19 L53,17 L58,15 Z" fill="#F59E0B" className="animate-ping opacity-75" />
          </>
        )}
      </svg>
    </div>
  );
  
  // Community Animation: Stick figures coming together
  const renderCommunityAnimation = () => (
    <div className="relative h-32 w-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* First Stick Figure */}
        <g className={animationState >= 1 ? "transform translate-x-5" : "transform translate-x-20"}>
          <circle cx="30" cy="30" r="7" stroke="#000" strokeWidth="2" fill="none" />
          <line x1="30" y1="37" x2="30" y2="50" stroke="#000" strokeWidth="2" />
          <line x1="30" y1="42" x2="20" y2="47" stroke="#000" strokeWidth="2" />
          <line x1="30" y1="42" x2="40" y2="47" stroke="#000" strokeWidth="2" />
          <line x1="30" y1="50" x2="25" y2="65" stroke="#000" strokeWidth="2" />
          <line x1="30" y1="50" x2="35" y2="65" stroke="#000" strokeWidth="2" />
          
          {/* Happy Face */}
          <circle cx="27" y="28" r="1" fill="#000" />
          <circle cx="33" y="28" r="1" fill="#000" />
          <path d="M26,32 Q30,36 34,32" stroke="#000" strokeWidth="1" fill="none" />
        </g>
        
        {/* Second Stick Figure */}
        <g className={animationState >= 1 ? "transform translate-x-0" : "transform translate-x-15"}>
          <circle cx="70" cy="30" r="7" stroke="#000" strokeWidth="2" fill="none" />
          <line x1="70" y1="37" x2="70" y2="50" stroke="#000" strokeWidth="2" />
          <line x1="70" y1="42" x2="60" y2="47" stroke="#000" strokeWidth="2" />
          <line x1="70" y1="42" x2="80" y2="47" stroke="#000" strokeWidth="2" />
          <line x1="70" y1="50" x2="65" y2="65" stroke="#000" strokeWidth="2" />
          <line x1="70" y1="50" x2="75" y2="65" stroke="#000" strokeWidth="2" />
          
          {/* Happy Face */}
          <circle cx="67" y="28" r="1" fill="#000" />
          <circle cx="73" y="28" r="1" fill="#000" />
          <path d="M66,32 Q70,36 74,32" stroke="#000" strokeWidth="1" fill="none" />
        </g>
        
        {/* Heart appears when figures come together - appears in frame 2 */}
        {animationState >= 2 && (
          <path 
            d="M50,40 C55,30 65,30 65,40 C65,45 50,55 50,55 C50,55 35,45 35,40 C35,30 45,30 50,40" 
            fill="#EF4444" 
            className={animationState >= 3 ? "animate-pulse" : ""}
          />
        )}
      </svg>
    </div>
  );
  
  // Events Animation: Stick figure celebrating an event
  const renderEventsAnimation = () => (
    <div className="relative h-32 w-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Event Banner */}
        {animationState >= 2 && (
          <g>
            <rect x="20" y="20" width="60" height="15" rx="2" fill="#4F46E5" />
            <text x="50" y="30" fontSize="8" textAnchor="middle" fill="white" fontWeight="bold">
              EVENT!
            </text>
          </g>
        )}
        
        {/* Head */}
        <circle 
          cx="50" 
          cy="50" 
          r="8" 
          stroke="#000" 
          strokeWidth="2" 
          fill="none" 
          className={animationState >= 1 ? "animate-bounce" : ""}
        />
        
        {/* Body */}
        <line x1="50" y1="58" x2="50" y2="70" stroke="#000" strokeWidth="2" />
        
        {/* Arms - normal in frame 1, raised in celebration in frame 2+ */}
        {animationState < 2 ? (
          <>
            <line x1="50" y1="62" x2="40" y2="65" stroke="#000" strokeWidth="2" />
            <line x1="50" y1="62" x2="60" y2="65" stroke="#000" strokeWidth="2" />
          </>
        ) : (
          <>
            <line 
              x1="50" 
              y1="62" 
              x2="35" 
              y2="50" 
              stroke="#000" 
              strokeWidth="2" 
              className="origin-bottom transition-all duration-300"
            />
            <line 
              x1="50" 
              y1="62" 
              x2="65" 
              y2="50" 
              stroke="#000" 
              strokeWidth="2" 
              className="origin-bottom transition-all duration-300"
            />
          </>
        )}
        
        {/* Legs */}
        <line x1="50" y1="70" x2="45" y2="85" stroke="#000" strokeWidth="2" />
        <line x1="50" y1="70" x2="55" y2="85" stroke="#000" strokeWidth="2" />
        
        {/* Happy Face */}
        <circle cx="47" y="48" r="1" fill="#000" />
        <circle cx="53" y="48" r="1" fill="#000" />
        <path d="M46,53 Q50,57 54,53" stroke="#000" strokeWidth="1.5" fill="none" />
        
        {/* Celebration Stars and Confetti - appears in frame 3 */}
        {animationState >= 3 && (
          <g className="animate-ping opacity-75">
            <circle cx="30" cy="30" r="2" fill="#F59E0B" />
            <circle cx="70" cy="40" r="2" fill="#10B981" />
            <circle cx="25" cy="60" r="2" fill="#EC4899" />
            <circle cx="75" cy="60" r="2" fill="#8B5CF6" />
            <circle cx="50" cy="20" r="2" fill="#EF4444" />
            <rect x="40" y="35" width="2" height="5" fill="#3B82F6" transform="rotate(45)" />
            <rect x="65" y="55" width="2" height="5" fill="#F59E0B" transform="rotate(-30)" />
            <rect x="30" y="45" width="2" height="5" fill="#EC4899" transform="rotate(60)" />
          </g>
        )}
      </svg>
    </div>
  );
  
  return (
    <div className={`flex flex-col items-center transform transition-all duration-1000 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
      {renderAnimation()}
      
      <h3 className="mt-4 text-lg font-semibold text-light-text-primary dark:text-dark-text-primary neon-glow">
        {label}
      </h3>
      
      <p className="mt-2 text-center text-light-text-secondary dark:text-dark-text-secondary">
        {description}
      </p>
    </div>
  );
};

export default StickFigureAnimation;