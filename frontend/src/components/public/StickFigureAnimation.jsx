// frontend/src/components/public/StickFigureAnimation.jsx
import React, { useEffect, useState, useRef } from 'react';

const StickFigureAnimation = ({ animationType, label, description, isVisible }) => {
  const [animationState, setAnimationState] = useState(0);
  const animRef = useRef(null);
  
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
    } else if (animationState === getMaxFrames()) {
      // Loop back to beginning after a pause
      const resetTimer = setTimeout(() => {
        setAnimationState(1);
      }, 2000);
      
      return () => clearTimeout(resetTimer);
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
        return 4;
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
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
        {/* Table with shadow */}
        <rect x="20" y="65" width="60" height="5" rx="2" fill="#6B7280" />
        <rect x="22" y="70" width="56" height="2" rx="1" fill="#4B5563" opacity="0.3" />
        
        {/* Head with pulse effect */}
        <circle 
          cx="50" 
          cy="30" 
          r="10" 
          stroke={animationState >= 2 ? "#EF4444" : "#000"} 
          strokeWidth="2" 
          fill="none" 
          className={`transition-colors duration-300 ${animationState >= 1 ? "animate-pulse" : ""}`}
        />
        
        {/* Body */}
        <line 
          x1="50" 
          y1="40" 
          x2="50" 
          y2="60" 
          stroke={animationState >= 2 ? "#EF4444" : "#000"} 
          strokeWidth="2"
          className={`transition-colors duration-300 ${animationState >= 2 ? "origin-top transform scale-y-110" : ""}`} 
        />
        
        {/* Arms - normal in frame 1, raised in frame 2 */}
        {animationState < 2 ? (
          <>
            <line x1="50" y1="45" x2="35" y2="55" stroke="#000" strokeWidth="2" className="transition-all duration-300" />
            <line x1="50" y1="45" x2="65" y2="55" stroke="#000" strokeWidth="2" className="transition-all duration-300" />
          </>
        ) : (
          <>
            <line 
              x1="50" 
              y1="45" 
              x2="30" 
              y2={animationState >= 3 ? "35" : "40"} 
              stroke="#EF4444" 
              strokeWidth="2" 
              className="origin-top-left transition-all duration-300"
            />
            <line 
              x1="50" 
              y1="45" 
              x2="70" 
              y2={animationState >= 3 ? "35" : "40"} 
              stroke="#EF4444" 
              strokeWidth="2" 
              className="origin-top-right transition-all duration-300"
            />
          </>
        )}
        
        {/* Legs */}
        <line 
          x1="50" 
          y1="60" 
          x2="40" 
          y2="75" 
          stroke={animationState >= 2 ? "#EF4444" : "#000"} 
          strokeWidth="2"
          className="transition-colors duration-300"
        />
        <line 
          x1="50" 
          y1="60" 
          x2="60" 
          y2="75" 
          stroke={animationState >= 2 ? "#EF4444" : "#000"} 
          strokeWidth="2"
          className="transition-colors duration-300"
        />
        
        {/* Face expressions - change with animation state */}
        {animationState < 2 ? (
          // Normal face
          <>
            <circle cx="45" cy="28" r="1.5" fill="#000" />
            <circle cx="55" cy="28" r="1.5" fill="#000" />
            <path d="M45,33 Q50,35 55,33" stroke="#000" strokeWidth="1.5" fill="none" />
          </>
        ) : animationState === 2 ? (
          // Slightly angry face
          <>
            <line x1="43" y1="26" x2="47" y2="30" stroke="#000" strokeWidth="1.5" />
            <line x1="57" y1="26" x2="53" y2="30" stroke="#000" strokeWidth="1.5" />
            <path d="M44,34 Q50,32 56,34" stroke="#000" strokeWidth="1.5" fill="none" />
          </>
        ) : (
          // Very angry face
          <>
            <line x1="42" y1="25" x2="48" y2="31" stroke="#000" strokeWidth="2" />
            <line x1="58" y1="25" x2="52" y2="31" stroke="#000" strokeWidth="2" />
            <path d="M43,35 Q50,30 57,35" stroke="#000" strokeWidth="2" fill="none" />
            
            {/* Anger lines */}
            <line x1="35" y1="20" x2="38" y2="23" stroke="#EF4444" strokeWidth="1" />
            <line x1="65" y1="20" x2="62" y2="23" stroke="#EF4444" strokeWidth="1" />
            <line x1="33" y1="25" x2="36" y2="27" stroke="#EF4444" strokeWidth="1" />
            <line x1="67" y1="25" x2="64" y2="27" stroke="#EF4444" strokeWidth="1" />
          </>
        )}
        
        {/* Speech Bubble - appears in frame 3 */}
        {animationState >= 3 && (
          <g>
            <path 
              d="M65,20 Q75,20 75,10 Q75,0 65,0 Q55,0 55,10 Q55,15 50,18 L55,15 Q55,20 65,20" 
              fill="white" 
              stroke="#000"
              className="animate-pulse" 
            />
            <text x="62" y="12" fontSize="10" textAnchor="middle" fill="#EF4444" fontWeight="bold">
              #$@!
            </text>
          </g>
        )}
        
        {/* Prohibition Sign - appears in frame 4 with animation */}
        {animationState >= 4 && (
          <g className="animate-pulse">
            <circle cx="50" cy="40" r="35" stroke="#FF0000" strokeWidth="4" fill="none" className="origin-center animate-ping opacity-50" />
            <line x1="25" y1="65" x2="75" y2="15" stroke="#FF0000" strokeWidth="4" className="origin-center animate-ping opacity-50" />
            
            {/* Solid version underneath the animated one */}
            <circle cx="50" cy="40" r="35" stroke="#FF0000" strokeWidth="4" fill="none" />
            <line x1="25" y1="65" x2="75" y2="15" stroke="#FF0000" strokeWidth="4" />
          </g>
        )}
      </svg>
    </div>
  );
  
  // Gaming Animation: Two stick figures playing games together and high-fiving
  const renderGamingAnimation = () => (
    <div className="relative h-32 w-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
        {/* Background elements - Gaming setup */}
        <rect x="20" y="70" width="60" height="5" rx="2" fill="#6B7280" /> {/* Table */}
        <rect x="18" y="75" width="64" height="2" rx="1" fill="#4B5563" opacity="0.3" /> {/* Table shadow */}
        
        {/* Gaming monitors/devices */}
        <rect 
          x="30" 
          y="55" 
          width="16" 
          height="12" 
          rx="1" 
          fill="#4B5563"
          className={animationState >= 2 ? "animate-pulse" : ""}
          style={{animationDuration: "2s"}}
        /> {/* Left monitor */}
        <rect 
          x="54" 
          y="55" 
          width="16" 
          height="12" 
          rx="1" 
          fill="#4B5563"
          className={animationState >= 2 ? "animate-pulse" : ""}
          style={{animationDuration: "2.5s", animationDelay: "0.3s"}}
        /> {/* Right monitor */}
        
        {/* Monitor screens - light up during gameplay */}
        <rect 
          x="32" 
          y="57" 
          width="12" 
          height="8" 
          rx="1" 
          fill={animationState >= 2 ? "#3B82F6" : "#9CA3AF"}
          className="transition-colors duration-300"
        /> {/* Left screen */}
        <rect 
          x="56" 
          y="57" 
          width="12" 
          height="8" 
          rx="1" 
          fill={animationState >= 2 ? "#8B5CF6" : "#9CA3AF"}
          className="transition-colors duration-300"
        /> {/* Right screen */}
        
        {/* Left Player */}
        <g className={`transition-transform duration-500 ${
          animationState >= 3 ? "transform -translate-x-1 -translate-y-2" : ""
        }`}>
          <circle cx="38" cy="30" r="6" stroke="#000" strokeWidth="1.5" fill="none" /> {/* Head */}
          <line x1="38" y1="36" x2="38" y2="48" stroke="#000" strokeWidth="1.5" /> {/* Body */}
          
          {/* Left arm changing position for high five */}
          {animationState < 3 ? (
            <line x1="38" y1="40" x2="30" y2="50" stroke="#000" strokeWidth="1.5" className="transition-all duration-300" />
          ) : (
            <line x1="38" y1="40" x2="43" y2="37" stroke="#000" strokeWidth="1.5" className="transition-all duration-300" />
          )}
          
          {/* Right arm changes to high five */}
          {animationState < 3 ? (
            <line x1="38" y1="40" x2="45" y2="55" stroke="#000" strokeWidth="1.5" className="transition-all duration-300" />
          ) : (
            <line x1="38" y1="40" x2="50" y2="40" stroke="#000" strokeWidth="1.5" className="transition-all duration-300" />
          )}
          
          <line x1="38" y1="48" x2="32" y2="60" stroke="#000" strokeWidth="1.5" /> {/* Left leg */}
          <line x1="38" y1="48" x2="44" y2="60" stroke="#000" strokeWidth="1.5" /> {/* Right leg */}
          
          {/* Face - gets happier */}
          <circle cx="36" cy="28" r="1" fill="#000" />
          <circle cx="40" cy="28" r="1" fill="#000" />
          <path 
            d={animationState >= 3 ? "M35,30 Q38,34 41,30" : "M35,30 Q38,32 41,30"} 
            stroke="#000" 
            strokeWidth="1" 
            fill="none"
            className="transition-all duration-300"
          />
        </g>
        
        {/* Right Player */}
        <g className={`transition-transform duration-500 ${
          animationState >= 3 ? "transform translate-x-1 -translate-y-2" : ""
        }`}>
          <circle cx="62" cy="30" r="6" stroke="#000" strokeWidth="1.5" fill="none" /> {/* Head */}
          <line x1="62" y1="36" x2="62" y2="48" stroke="#000" strokeWidth="1.5" /> {/* Body */}
          
          {/* Left arm changes to high five */}
          {animationState < 3 ? (
            <line x1="62" y1="40" x2="55" y2="55" stroke="#000" strokeWidth="1.5" className="transition-all duration-300" />
          ) : (
            <line x1="62" y1="40" x2="50" y2="40" stroke="#000" strokeWidth="1.5" className="transition-all duration-300" />
          )}
          
          {/* Right arm changing position */}
          {animationState < 3 ? (
            <line x1="62" y1="40" x2="70" y2="50" stroke="#000" strokeWidth="1.5" className="transition-all duration-300" />
          ) : (
            <line x1="62" y1="40" x2="57" y2="37" stroke="#000" strokeWidth="1.5" className="transition-all duration-300" />
          )}
          
          <line x1="62" y1="48" x2="56" y2="60" stroke="#000" strokeWidth="1.5" /> {/* Left leg */}
          <line x1="62" y1="48" x2="68" y2="60" stroke="#000" strokeWidth="1.5" /> {/* Right leg */}
          
          {/* Face - gets happier */}
          <circle cx="60" cy="28" r="1" fill="#000" />
          <circle cx="64" cy="28" r="1" fill="#000" />
          <path 
            d={animationState >= 3 ? "M59,30 Q62,34 65,30" : "M59,30 Q62,32 65,30"} 
            stroke="#000" 
            strokeWidth="1" 
            fill="none"
            className="transition-all duration-300"
          />
        </g>
        
        {/* High Five effect - appears in frame 3+ */}
        {animationState >= 3 && (
          <g>
            <circle 
              cx="50" 
              cy="40" 
              r="3" 
              fill="#F59E0B" 
              fillOpacity="0.7"
              className="animate-ping"
              style={{animationDuration: "1s"}}
            />
            {/* Small stars around high five */}
            <path 
              d="M45,35 L46,37 L48,38 L46,39 L45,41 L44,39 L42,38 L44,37 Z" 
              fill="#F59E0B" 
              className="animate-ping opacity-75" 
              style={{animationDuration: "1.5s"}}
            />
            <path 
              d="M55,35 L56,37 L58,38 L56,39 L55,41 L54,39 L52,38 L54,37 Z" 
              fill="#F59E0B" 
              className="animate-ping opacity-75" 
              style={{animationDuration: "1.7s", animationDelay: "0.2s"}}
            />
          </g>
        )}
        
        {/* Game victory elements - appears in frame 4 */}
        {animationState >= 4 && (
          <g>
            <text 
              x="38" 
              y="63" 
              fontSize="3" 
              textAnchor="middle" 
              fill="#10B981" 
              fontWeight="bold"
              className="animate-bounce"
              style={{animationDuration: "1s"}}
            >
              WINNER!
            </text>
            <text 
              x="62" 
              y="63" 
              fontSize="3" 
              textAnchor="middle" 
              fill="#10B981" 
              fontWeight="bold"
              className="animate-bounce"
              style={{animationDuration: "1s", animationDelay: "0.3s"}}
            >
              WINNER!
            </text>
            
            {/* Victory stars */}
            <path 
              d="M25,20 L27,25 L32,27 L27,29 L25,34 L23,29 L18,27 L23,25 Z" 
              fill="#F59E0B" 
              className="animate-ping opacity-75" 
              style={{animationDuration: "1.5s"}}
            />
            <path 
              d="M75,20 L77,25 L82,27 L77,29 L75,34 L73,29 L68,27 L73,25 Z" 
              fill="#F59E0B" 
              className="animate-ping opacity-75" 
              style={{animationDuration: "1.7s", animationDelay: "0.3s"}}
            />
          </g>
        )}
      </svg>
    </div>
  );
  
  // Community Animation: Multiple stick figures forming a community with a heart
  const renderCommunityAnimation = () => (
    <div className="relative h-32 w-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
        {/* Ground/shadow */}
        <ellipse cx="50" cy="80" rx="40" ry="3" fill="#4B5563" opacity="0.2" />
        
        {/* Central figure - always present */}
        <g className={`transition-all duration-500 ${animationState >= 2 ? "transform translate-y-2" : ""}`}>
          <circle cx="50" cy="30" r="6" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
          <line x1="50" y1="36" x2="50" y2="50" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="50" y1="40" x2="43" y2="45" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="50" y1="40" x2="57" y2="45" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="50" y1="50" x2="45" y2="60" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="50" y1="50" x2="55" y2="60" stroke="#3B82F6" strokeWidth="1.5" />
          
          {/* Face - gets happier */}
          <circle cx="48" cy="28" r="1" fill="#3B82F6" />
          <circle cx="52" cy="28" r="1" fill="#3B82F6" />
          <path 
            d={animationState >= 2 ? "M47,32 Q50,35 53,32" : "M47,31 Q50,33 53,31"} 
            stroke="#3B82F6" 
            strokeWidth="1" 
            fill="none"
            className="transition-all duration-300"
          />
        </g>
        
        {/* Left figures - appear progressively */}
        <g className={`transition-all duration-700 ${
          animationState === 0 ? "opacity-0 transform translate-x-10" :
          animationState === 1 ? "opacity-100 transform translate-x-5" :
          "opacity-100 transform translate-x-2"
        }`}>
          {/* Left figure 1 */}
          <circle cx="25" cy="35" r="5" stroke="#EC4899" strokeWidth="1.5" fill="none" />
          <line x1="25" y1="40" x2="25" y2="52" stroke="#EC4899" strokeWidth="1.5" />
          <line x1="25" y1="43" x2="20" y2="47" stroke="#EC4899" strokeWidth="1.5" />
          <line x1="25" y1="43" x2="32" y2={animationState >= 2 ? "40" : "47"} stroke="#EC4899" strokeWidth="1.5" className="transition-all duration-300" />
          <line x1="25" y1="52" x2="20" y2="60" stroke="#EC4899" strokeWidth="1.5" />
          <line x1="25" y1="52" x2="30" y2="60" stroke="#EC4899" strokeWidth="1.5" />
          
          {/* Face */}
          <circle cx="23" cy="33" r="1" fill="#EC4899" />
          <circle cx="27" cy="33" r="1" fill="#EC4899" />
          <path d="M22,36 Q25,38 28,36" stroke="#EC4899" strokeWidth="1" fill="none" />
          
          {/* Left figure 2 - only in higher animation states */}
          {animationState >= 2 && (
            <g className="animate-fade-in" style={{animationDuration: "0.5s"}}>
              <circle cx="10" cy="40" r="4" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />
              <line x1="10" y1="44" x2="10" y2="54" stroke="#8B5CF6" strokeWidth="1.5" />
              <line x1="10" y1="47" x2="6" y2="50" stroke="#8B5CF6" strokeWidth="1.5" />
              <line x1="10" y1="47" x2="15" y2="44" stroke="#8B5CF6" strokeWidth="1.5" />
              <line x1="10" y1="54" x2="7" y2="60" stroke="#8B5CF6" strokeWidth="1.5" />
              <line x1="10" y1="54" x2="13" y2="60" stroke="#8B5CF6" strokeWidth="1.5" />
              
              {/* Face */}
              <circle cx="9" cy="39" r="0.7" fill="#8B5CF6" />
              <circle cx="11" cy="39" r="0.7" fill="#8B5CF6" />
              <path d="M8,41 Q10,42 12,41" stroke="#8B5CF6" strokeWidth="0.7" fill="none" />
            </g>
          )}
        </g>
        
        {/* Right figures - appear progressively */}
        <g className={`transition-all duration-700 ${
          animationState === 0 ? "opacity-0 transform -translate-x-10" :
          animationState === 1 ? "opacity-100 transform -translate-x-5" :
          "opacity-100 transform -translate-x-2"
        }`}>
          {/* Right figure 1 */}
          <circle cx="75" cy="35" r="5" stroke="#10B981" strokeWidth="1.5" fill="none" />
          <line x1="75" y1="40" x2="75" y2="52" stroke="#10B981" strokeWidth="1.5" />
          <line x1="75" y1="43" x2="80" y2="47" stroke="#10B981" strokeWidth="1.5" />
          <line x1="75" y1="43" x2="68" y2={animationState >= 2 ? "40" : "47"} stroke="#10B981" strokeWidth="1.5" className="transition-all duration-300" />
          <line x1="75" y1="52" x2="70" y2="60" stroke="#10B981" strokeWidth="1.5" />
          <line x1="75" y1="52" x2="80" y2="60" stroke="#10B981" strokeWidth="1.5" />
          
          {/* Face */}
          <circle cx="73" cy="33" r="1" fill="#10B981" />
          <circle cx="77" cy="33" r="1" fill="#10B981" />
          <path d="M72,36 Q75,38 78,36" stroke="#10B981" strokeWidth="1" fill="none" />
          
          {/* Right figure 2 - only in higher animation states */}
          {animationState >= 2 && (
            <g className="animate-fade-in" style={{animationDuration: "0.5s"}}>
              <circle cx="90" cy="40" r="4" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
              <line x1="90" y1="44" x2="90" y2="54" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="90" y1="47" x2="85" y2="44" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="90" y1="47" x2="94" y2="50" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="90" y1="54" x2="87" y2="60" stroke="#F59E0B" strokeWidth="1.5" />
              <line x1="90" y1="54" x2="93" y2="60" stroke="#F59E0B" strokeWidth="1.5" />
              
              {/* Face */}
              <circle cx="89" cy="39" r="0.7" fill="#F59E0B" />
              <circle cx="91" cy="39" r="0.7" fill="#F59E0B" />
              <path d="M88,41 Q90,42 92,41" stroke="#F59E0B" strokeWidth="0.7" fill="none" />
            </g>
          )}
        </g>
        
        {/* Connection lines between figures - appears in frame 2+ */}
        {animationState >= 2 && (
          <g>
            <line x1="32" y1="40" x2="43" y2="45" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="1,1" />
            <line x1="15" y1="44" x2="20" y2="47" stroke="#8B5CF6" strokeWidth="0.5" strokeDasharray="1,1" />
            <line x1="57" y1="45" x2="68" y2="40" stroke="#10B981" strokeWidth="0.5" strokeDasharray="1,1" />
            <line x1="80" y1="47" x2="85" y2="44" stroke="#F59E0B" strokeWidth="0.5" strokeDasharray="1,1" />
          </g>
        )}
        
        {/* Heart appears in the center - appears in frame 2+ */}
        {animationState >= 2 && (
          <g>
            <path 
              d="M50,20 C55,10 65,10 65,20 C65,25 50,35 50,35 C50,35 35,25 35,20 C35,10 45,10 50,20" 
              fill="#EF4444" 
              fillOpacity="0.9"
              className={animationState >= 3 ? "animate-pulse" : ""}
              style={{animationDuration: "2s"}}
            />
            
            {/* Small floating hearts around the community in frame 3 */}
            {animationState >= 3 && (
              <g>
                <path 
                  d="M30,15 C32,10 36,10 36,15 C36,17 30,20 30,20 C30,20 24,17 24,15 C24,10 28,10 30,15" 
                  fill="#EF4444" 
                  fillOpacity="0.7"
                  className="animate-float"
                  style={{animationDuration: "3s"}}
                />
                <path 
                  d="M70,15 C72,10 76,10 76,15 C76,17 70,20 70,20 C70,20 64,17 64,15 C64,10 68,10 70,15" 
                  fill="#EF4444" 
                  fillOpacity="0.7"
                  className="animate-float"
                  style={{animationDuration: "2.5s", animationDelay: "0.5s"}}
                />
                <path 
                  d="M50,8 C51,5 53,5 53,8 C53,9 50,11 50,11 C50,11 47,9 47,8 C47,5 49,5 50,8" 
                  fill="#EF4444" 
                  fillOpacity="0.7"
                  className="animate-float"
                  style={{animationDuration: "2.8s", animationDelay: "0.3s"}}
                />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
  
  // Events Animation: Podium with winners
  const renderEventsAnimation = () => (
    <div className="relative h-32 w-32 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow">
        {/* Ground */}
        <rect x="5" y="85" width="90" height="3" rx="1" fill="#6B7280" />
        
        {/* Podium - appears gradually */}
        <g className={`transition-opacity duration-300 ${animationState >= 1 ? "opacity-100" : "opacity-0"}`}>
          {/* 2nd place podium */}
          <rect 
            x="20" 
            y="65" 
            width="20" 
            height="20" 
            rx="2" 
            fill="#9CA3AF" 
            className={`transition-transform duration-500 ${
              animationState >= 1 ? "transform translate-y-0" : "transform translate-y-10"
            }`}
          />
          <text 
            x="30" 
            y="77" 
            fontSize="8" 
            textAnchor="middle" 
            fill="white" 
            fontWeight="bold"
            className={`transition-opacity duration-500 ${
              animationState >= 1 ? "opacity-100" : "opacity-0"
            }`}
          >
            2
          </text>
          
          {/* 1st place podium */}
          <rect 
            x="40" 
            y="55" 
            width="20" 
            height="30" 
            rx="2" 
            fill="#F59E0B" 
            className={`transition-transform duration-500 ${
              animationState >= 1 ? "transform translate-y-0" : "transform translate-y-10"
            }`}
            style={{transitionDelay: "0.2s"}}
          />
          <text 
            x="50" 
            y="75" 
            fontSize="10" 
            textAnchor="middle" 
            fill="white" 
            fontWeight="bold"
            className={`transition-opacity duration-500 ${
              animationState >= 1 ? "opacity-100" : "opacity-0"
            }`}
            style={{transitionDelay: "0.2s"}}
          >
            1
          </text>
          
          {/* 3rd place podium */}
          <rect 
            x="60" 
            y="70" 
            width="20" 
            height="15" 
            rx="2" 
            fill="#6B7280" 
            className={`transition-transform duration-500 ${
              animationState >= 1 ? "transform translate-y-0" : "transform translate-y-10"
            }`}
            style={{transitionDelay: "0.4s"}}
          />
          <text 
            x="70" 
            y="80" 
            fontSize="7" 
            textAnchor="middle" 
            fill="white" 
            fontWeight="bold"
            className={`transition-opacity duration-500 ${
              animationState >= 1 ? "opacity-100" : "opacity-0"
            }`}
            style={{transitionDelay: "0.4s"}}
          >
            3
          </text>
        </g>
        
        {/* Winners appear in sequence */}
        {/* 2nd place winner */}
        <g className={`transition-all duration-500 ${
          animationState >= 2 ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-5"
        }`}>
          <circle cx="30" cy="35" r="5" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
          <line x1="30" y1="40" x2="30" y2="50" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="30" y1="42" x2="25" y2="47" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="30" y1="42" x2="35" y2="47" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="30" y1="50" x2="27" y2="57" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="30" y1="50" x2="33" y2="57" stroke="#3B82F6" strokeWidth="1.5" />
          
          {/* Face */}
          <circle cx="28" cy="34" r="1" fill="#3B82F6" />
          <circle cx="32" cy="34" r="1" fill="#3B82F6" />
          <path d="M28,37 Q30,39 32,37" stroke="#3B82F6" strokeWidth="1" fill="none" />
          
          {/* Silver medal */}
          {animationState >= 3 && (
            <circle cx="30" cy="45" r="2" fill="#9CA3AF" stroke="#CBD5E1" strokeWidth="0.5" className="animate-pulse" />
          )}
        </g>
        
        {/* 1st place winner */}
        <g className={`transition-all duration-500 ${
          animationState >= 2 ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-5"
        }`} style={{transitionDelay: "0.2s"}}>
          <circle cx="50" cy="25" r="6" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          <line x1="50" y1="31" x2="50" y2="43" stroke="#F59E0B" strokeWidth="1.5" />
          
          {/* Arms raised in victory */}
          <line x1="50" y1="34" x2="43" y2="30" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="50" y1="34" x2="57" y2="30" stroke="#F59E0B" strokeWidth="1.5" />
          
          <line x1="50" y1="43" x2="46" y2="52" stroke="#F59E0B" strokeWidth="1.5" />
          <line x1="50" y1="43" x2="54" y2="52" stroke="#F59E0B" strokeWidth="1.5" />
          
          {/* Face - very happy */}
          <circle cx="48" cy="24" r="1" fill="#F59E0B" />
          <circle cx="52" cy="24" r="1" fill="#F59E0B" />
          <path d="M47,27 Q50,31 53,27" stroke="#F59E0B" strokeWidth="1" fill="none" />
          
          {/* Gold medal and crown */}
          {animationState >= 3 && (
            <g>
              <circle cx="50" cy="36" r="2.5" fill="#F59E0B" stroke="#FBBF24" strokeWidth="0.5" className="animate-pulse" />
              <path d="M47,19 L50,16 L53,19 L52,21 L48,21 Z" fill="#FBBF24" className="animate-pulse" />
            </g>
          )}
        </g>
        
        {/* 3rd place winner */}
        <g className={`transition-all duration-500 ${
          animationState >= 2 ? "opacity-100 transform translate-y-0" : "opacity-0 transform translate-y-5"
        }`} style={{transitionDelay: "0.4s"}}>
          <circle cx="70" cy="40" r="5" stroke="#6B7280" strokeWidth="1.5" fill="none" />
          <line x1="70" y1="45" x2="70" y2="55" stroke="#6B7280" strokeWidth="1.5" />
          <line x1="70" y1="47" x2="65" y2="52" stroke="#6B7280" strokeWidth="1.5" />
          <line x1="70" y1="47" x2="75" y2="52" stroke="#6B7280" strokeWidth="1.5" />
          <line x1="70" y1="55" x2="67" y2="62" stroke="#6B7280" strokeWidth="1.5" />
          <line x1="70" y1="55" x2="73" y2="62" stroke="#6B7280" strokeWidth="1.5" />
          
          {/* Face */}
          <circle cx="68" cy="39" r="1" fill="#6B7280" />
          <circle cx="72" cy="39" r="1" fill="#6B7280" />
          <path d="M68,42 Q70,43 72,42" stroke="#6B7280" strokeWidth="1" fill="none" />
          
          {/* Bronze medal */}
          {animationState >= 3 && (
            <circle cx="70" cy="50" r="2" fill="#92400E" stroke="#B45309" strokeWidth="0.5" className="animate-pulse" />
          )}
        </g>
        
        {/* Event banner */}
        {animationState >= 3 && (
          <g className="animate-fade-in" style={{animationDuration: "0.5s"}}>
            <rect x="15" y="10" width="70" height="10" rx="2" fill="#4F46E5" />
            <text x="50" y="17" fontSize="6" textAnchor="middle" fill="white" fontWeight="bold">
              EVENT WINNERS
            </text>
          </g>
        )}
        
        {/* Celebration elements in frame 4 */}
        {animationState >= 4 && (
          <g>            
            {/* Confetti */}
            <g className="animate-ping" style={{animationDuration: "1.5s"}}>
              <circle cx="20" cy="30" r="1" fill="#F87171" />
              <circle cx="80" cy="35" r="1" fill="#60A5FA" />
              <circle cx="25" cy="15" r="1" fill="#34D399" />
              <circle cx="75" cy="20" r="1" fill="#A78BFA" />
              <circle cx="30" cy="10" r="1" fill="#FBBF24" />
              <circle cx="70" cy="15" r="1" fill="#F87171" />
              <circle cx="35" cy="25" r="1" fill="#60A5FA" />
              <circle cx="65" cy="30" r="1" fill="#34D399" />
              <circle cx="40" cy="15" r="1" fill="#A78BFA" />
              <circle cx="60" cy="10" r="1" fill="#FBBF24" />
              <rect x="55" y="25" width="2" height="4" fill="#F87171" transform="rotate(30)" />
              <rect x="45" y="30" width="2" height="4" fill="#60A5FA" transform="rotate(60)" />
              <rect x="25" y="25" width="2" height="4" fill="#34D399" transform="rotate(45)" />
              <rect x="75" y="30" width="2" height="4" fill="#A78BFA" transform="rotate(15)" />
            </g>
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

// Add keyframe animations
const animKeyframes = `
@keyframes scale-in {
  0% { transform: scale(0); }
  70% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@keyframes float {
  0% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0); }
}

@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
`;

// Add style tag to document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = animKeyframes;
  document.head.appendChild(styleElement);
}

export default StickFigureAnimation;