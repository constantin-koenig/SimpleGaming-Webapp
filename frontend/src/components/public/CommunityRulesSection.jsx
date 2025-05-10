// frontend/src/components/public/CommunityRulesSection.jsx
import React, { useState, useEffect } from 'react';

const CommunityRulesSection = ({ isVisible }) => {
  const [activeRule, setActiveRule] = useState(0);
  const [animationState, setAnimationState] = useState(1);
  
  // Automatisch zwischen Animationszuständen wechseln, wenn eine Regel aktiv ist
  useEffect(() => {
    if (!isVisible) return;
    
    const maxFrames = 4; // Maximale Anzahl an Animationsframes
    const interval = setInterval(() => {
      setAnimationState(prev => (prev % maxFrames) + 1);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isVisible, activeRule]);
  
  const rules = [
    {
      id: 1,
      title: "Respektvoller Umgang",
      description: "Behandle alle Community-Mitglieder mit Respekt und Freundlichkeit. Wir schätzen Vielfalt und möchten, dass sich jeder willkommen fühlt, unabhängig von Spielerfahrung, Herkunft oder Persönlichkeit.",
      icon: "heart",
      animationType: "respect",
      color: "pink"
    },
    {
      id: 2,
      title: "Keine Toxizität",
      description: "Unsere Community ist ein sicherer Ort ohne Beleidigungen, Hate Speech oder Flame Wars. Wir fördern konstruktives Feedback und respektvolle Kommunikation, auch in hitzigen Gaming-Momenten.",
      icon: "shield",
      animationType: "noToxicity",
      color: "red"
    },
    {
      id: 3,
      title: "Hilfsbereitschaft",
      description: "Unterstütze neue Mitglieder und teile dein Wissen. Eine helfende Hand zu reichen ist das Fundament unserer Gemeinschaft – gemeinsam werden wir alle zu besseren Spielern und haben mehr Spaß.",
      icon: "lightbulb",
      animationType: "helpfulness",
      color: "yellow"
    },
    {
      id: 4,
      title: "Fairplay",
      description: "Spiele fair und halte dich an die Regeln des jeweiligen Spiels. Cheating, Hacking oder Ausnutzen von Exploits zerstören den Spielspaß für alle und haben hier keinen Platz.",
      icon: "trophy",
      animationType: "fairplay",
      color: "green"
    }
  ];

  // Render Icon basierend auf dem Typ
  const renderIcon = (iconType, color) => {
    const iconColors = {
      pink: "text-pink-500 dark:text-pink-400",
      red: "text-red-500 dark:text-red-400", 
      yellow: "text-yellow-500 dark:text-yellow-400",
      green: "text-green-500 dark:text-green-400",
      blue: "text-blue-500 dark:text-blue-400"
    };

    const colorClass = iconColors[color] || "text-primary-500 dark:text-primary-400";

    switch(iconType) {
      case 'heart':
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        );
      case 'shield':
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'lightbulb':
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
          </svg>
        );
      case 'trophy':
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 3.75A2.75 2.75 0 018.75 1h2.5A2.75 2.75 0 0114 3.75v.443c.572.055 1.14.122 1.706.2C17.053 4.582 18 5.75 18 7.07v3.469c0 1.126-.694 2.191-1.83 2.54-1.952.599-4.024.921-6.17.921s-4.219-.322-6.17-.921C2.694 12.73 2 11.665 2 10.539V7.07c0-1.321.947-2.489 2.294-2.676A41.047 41.047 0 016 4.193V3.75zm6.5 0v.325a41.622 41.622 0 00-5 0V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25zM10 10a1 1 0 00-1 1v.01a1 1 0 001 1h.01a1 1 0 001-1V11a1 1 0 00-1-1H10z" clipRule="evenodd" />
            <path d="M3 15.055v-.684c.126.053.255.1.39.142 2.092.642 4.313.987 6.61.987 2.297 0 4.518-.345 6.61-.987.135-.041.264-.089.39-.142v.684c0 1.347-.985 2.53-2.363 2.686a41.454 41.454 0 01-9.274 0C3.985 17.585 3 16.402 3 15.055z" />
          </svg>
        );
      default:
        return (
          <svg className={`w-6 h-6 ${colorClass}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  // Animation für respektvollen Umgang
  const renderRespectAnimation = () => (
    <div className="h-48 w-48 mx-auto relative">
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-lg">
        {/* Hintergrund */}
        <defs>
          <radialGradient id="respectGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#EC4899" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#EC4899" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill="url(#respectGlow)" className={animationState >= 2 ? "animate-pulse" : ""} />
        
        {/* Stick Figure 1 */}
        <g className={`transition-transform duration-500 ${animationState >= 2 ? 'transform translate-x-0' : 'transform translate-x-8'}`}>
          <circle cx="35" cy="35" r="8" stroke="#EC4899" strokeWidth="2" fill="none" />
          <line x1="35" y1="43" x2="35" y2="60" stroke="#EC4899" strokeWidth="2" />
          <line x1="35" y1="60" x2="25" y2="75" stroke="#EC4899" strokeWidth="2" />
          <line x1="35" y1="60" x2="45" y2="75" stroke="#EC4899" strokeWidth="2" />
          
          {/* Arms - ändern je nach Animationsstatus */}
          {animationState < 3 ? (
            <>
              <line x1="35" y1="50" x2="25" y2="55" stroke="#EC4899" strokeWidth="2" />
              <line x1="35" y1="50" x2="50" y2="50" stroke="#EC4899" strokeWidth="2" />
            </>
          ) : (
            <>
              <line x1="35" y1="50" x2="25" y2="55" stroke="#EC4899" strokeWidth="2" />
              <line x1="35" y1="50" x2="45" y2="45" stroke="#EC4899" strokeWidth="2" className="origin-top-right animate-pulse" />
            </>
          )}
          
          {/* Gesicht - wird fröhlicher während der Animation */}
          <circle cx="32" cy="33" r="1.5" fill="#EC4899" />
          <circle cx="38" cy="33" r="1.5" fill="#EC4899" />
          <path 
            d={animationState >= 3 ? "M32,38 Q35,41 38,38" : "M32,37 Q35,39 38,37"} 
            stroke="#EC4899" 
            strokeWidth="1.5" 
            fill="none"
            className="transition-all duration-300"
          />
        </g>
        
        {/* Stick Figure 2 */}
        <g className={`transition-transform duration-500 ${animationState >= 2 ? 'transform translate-x-0' : 'transform -translate-x-8'}`}>
          <circle cx="65" cy="35" r="8" stroke="#EC4899" strokeWidth="2" fill="none" />
          <line x1="65" y1="43" x2="65" y2="60" stroke="#EC4899" strokeWidth="2" />
          <line x1="65" y1="60" x2="55" y2="75" stroke="#EC4899" strokeWidth="2" />
          <line x1="65" y1="60" x2="75" y2="75" stroke="#EC4899" strokeWidth="2" />
          
          {/* Arms - ändern je nach Animationsstatus */}
          {animationState < 3 ? (
            <>
              <line x1="65" y1="50" x2="75" y2="55" stroke="#EC4899" strokeWidth="2" />
              <line x1="65" y1="50" x2="50" y2="50" stroke="#EC4899" strokeWidth="2" />
            </>
          ) : (
            <>
              <line x1="65" y1="50" x2="75" y2="55" stroke="#EC4899" strokeWidth="2" />
              <line x1="65" y1="50" x2="55" y2="45" stroke="#EC4899" strokeWidth="2" className="origin-top-left animate-pulse" />
            </>
          )}
          
          {/* Gesicht - wird fröhlicher während der Animation */}
          <circle cx="62" cy="33" r="1.5" fill="#EC4899" />
          <circle cx="68" cy="33" r="1.5" fill="#EC4899" />
          <path 
            d={animationState >= 3 ? "M62,38 Q65,41 68,38" : "M62,37 Q65,39 68,37"} 
            stroke="#EC4899" 
            strokeWidth="1.5" 
            fill="none"
            className="transition-all duration-300"
          />
        </g>
        
        {/* Verbindung - Hände schütteln oder High-Five */}
        {animationState >= 2 && (
          <g>
            {animationState === 2 && (
              <circle cx="50" cy="50" r="4" fill="#EC4899" fillOpacity="0.3" />
            )}
            
            {animationState >= 3 && (
              <g>
                <circle cx="50" cy="50" r="5" fill="#EC4899" fillOpacity="0.3" className="animate-ping" />
                {/* Herz über den Figuren erscheint in Phase 3+ */}
                <path 
                  d="M50,25 C53,20 58,20 58,25 C58,27 50,35 50,35 C50,35 42,27 42,25 C42,20 47,20 50,25" 
                  fill="#EC4899" 
                  className={animationState === 4 ? "animate-pulse" : ""}
                  fillOpacity="0.7"
                />
                
                {animationState === 4 && (
                  <>
                    {/* Kleine Herzen herumschweben */}
                    <path 
                      d="M35,20 C36,18 38,18 38,20 C38,21 35,23 35,23 C35,23 32,21 32,20 C32,18 34,18 35,20" 
                      fill="#EC4899" 
                      fillOpacity="0.5"
                      className="animate-ping"
                    />
                    <path 
                      d="M65,20 C66,18 68,18 68,20 C68,21 65,23 65,23 C65,23 62,21 62,20 C62,18 64,18 65,20" 
                      fill="#EC4899" 
                      fillOpacity="0.5"
                      className="animate-ping"
                      style={{animationDelay: "0.5s"}}
                    />
                  </>
                )}
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
  
  // Animation für keine Toxizität
  const renderNoToxicityAnimation = () => (
    <div className="h-48 w-48 mx-auto relative">
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-lg">
        {/* Hintergrund */}
        <defs>
          <radialGradient id="toxicityGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill="url(#toxicityGlow)" />
        
        {/* Toxisches Stick Figure - wird verboten */}
        <g className={`transition-all duration-500 ${animationState >= 2 ? 'transform scale-100' : 'transform scale-90'}`}>
          {/* Kopf */}
          <circle 
            cx="50" 
            cy="35" 
            r="10" 
            stroke={animationState >= 2 ? "#EF4444" : "#64748B"} 
            strokeWidth="2" 
            fill="none" 
            className="transition-colors duration-300"
          />
          
          {/* Körper */}
          <line 
            x1="50" 
            y1="45" 
            x2="50" 
            y2="65" 
            stroke={animationState >= 2 ? "#EF4444" : "#64748B"} 
            strokeWidth="2"
            className="transition-colors duration-300" 
          />
          
          {/* Arme - normal oder wütend je nach Animationsstatus */}
          {animationState < 2 ? (
            <>
              <line x1="50" y1="50" x2="40" y2="60" stroke="#64748B" strokeWidth="2" />
              <line x1="50" y1="50" x2="60" y2="60" stroke="#64748B" strokeWidth="2" />
            </>
          ) : (
            <>
              <line 
                x1="50" 
                y1="50" 
                x2="35" 
                y2="45" 
                stroke="#EF4444" 
                strokeWidth="2" 
                className="origin-top-left transition-all duration-300"
              />
              <line 
                x1="50" 
                y1="50" 
                x2="65" 
                y2="45" 
                stroke="#EF4444" 
                strokeWidth="2" 
                className="origin-top-right transition-all duration-300"
              />
            </>
          )}
          
          {/* Beine */}
          <line x1="50" y1="65" x2="40" y2="80" stroke={animationState >= 2 ? "#EF4444" : "#64748B"} strokeWidth="2" className="transition-colors duration-300" />
          <line x1="50" y1="65" x2="60" y2="80" stroke={animationState >= 2 ? "#EF4444" : "#64748B"} strokeWidth="2" className="transition-colors duration-300" />
          
          {/* Gesichtsausdruck - ändert sich mit Animationsstatus */}
          {animationState < 2 ? (
            <>
              <circle cx="45" cy="33" r="1.5" fill="#64748B" />
              <circle cx="55" cy="33" r="1.5" fill="#64748B" />
              <path d="M45,38 Q50,40 55,38" stroke="#64748B" strokeWidth="1.5" fill="none" />
            </>
          ) : animationState === 2 ? (
            <>
              <line x1="43" y1="31" x2="47" y2="35" stroke="#EF4444" strokeWidth="1.5" />
              <line x1="57" y1="31" x2="53" y2="35" stroke="#EF4444" strokeWidth="1.5" />
              <path d="M44,39 Q50,37 56,39" stroke="#EF4444" strokeWidth="1.5" fill="none" />
            </>
          ) : (
            <>
              <line x1="42" y1="30" x2="48" y2="36" stroke="#EF4444" strokeWidth="2" />
              <line x1="58" y1="30" x2="52" y2="36" stroke="#EF4444" strokeWidth="2" />
              <path d="M43,40 Q50,35 57,40" stroke="#EF4444" strokeWidth="2" fill="none" />
            </>
          )}
          
          {/* Sprechblase mit toxischen Worten - erscheint in Phase 3+ */}
          {animationState >= 3 && (
            <g>
              <path 
                d="M70,20 Q80,20 80,10 Q80,0 70,0 Q60,0 60,10 Q60,15 55,18 L60,15 Q60,20 70,20" 
                fill="white" 
                stroke="#EF4444"
                className="animate-pulse" 
              />
              <text x="70" y="12" fontSize="8" textAnchor="middle" fill="#EF4444" fontWeight="bold">
                #$@!
              </text>
            </g>
          )}
        </g>
        
        {/* Verbotszeichen - erscheint in Phase 4 */}
        {animationState >= 4 && (
          <g className="animate-pulse" style={{animationDuration: "2s"}}>
            <circle cx="50" cy="45" r="35" stroke="#EF4444" strokeWidth="4" fill="none" />
            <line x1="25" y1="70" x2="75" y2="20" stroke="#EF4444" strokeWidth="4" />
          </g>
        )}
      </svg>
    </div>
  );
  
  // Animation für Hilfsbereitschaft
  const renderHelpfulnessAnimation = () => (
    <div className="h-48 w-48 mx-auto relative">
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-lg">
        {/* Hintergrund */}
        <defs>
          <radialGradient id="helpGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#EAB308" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#EAB308" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill="url(#helpGlow)" className={animationState >= 3 ? "animate-pulse" : ""} />
        
        {/* Erfahrener Spieler */}
        <g className={`transition-transform duration-500 ${animationState >= 2 ? 'transform translate-x-2' : 'transform translate-x-10'}`}>
          <circle cx="35" cy="35" r="8" stroke="#EAB308" strokeWidth="2" fill="none" />
          <line x1="35" y1="43" x2="35" y2="60" stroke="#EAB308" strokeWidth="2" />
          <line x1="35" y1="60" x2="25" y2="75" stroke="#EAB308" strokeWidth="2" />
          <line x1="35" y1="60" x2="45" y2="75" stroke="#EAB308" strokeWidth="2" />
          
          {/* Wissens-Icon - erscheint bei aktiver Animation */}
          {animationState >= 2 && (
            <circle cx="35" cy="20" r="5" fill="#EAB308" fillOpacity="0.3" stroke="#EAB308" strokeWidth="1" className="animate-pulse" />
          )}
          
          {/* Arme - Erklärgesten wenn aktiv */}
          {animationState >= 3 ? (
            <>
              <line x1="35" y1="50" x2="45" y2="55" stroke="#EAB308" strokeWidth="2" />
              <line x1="35" y1="50" x2="45" y2="45" stroke="#EAB308" strokeWidth="2" />
            </>
          ) : (
            <>
              <line x1="35" y1="50" x2="25" y2="55" stroke="#EAB308" strokeWidth="2" />
              <line x1="35" y1="50" x2="45" y2="55" stroke="#EAB308" strokeWidth="2" />
            </>
          )}
          
          {/* Erfahrenes (lächelndes) Gesicht */}
          <circle cx="32" cy="33" r="1.5" fill="#EAB308" />
          <circle cx="38" cy="33" r="1.5" fill="#EAB308" />
          <path d="M32,37 Q35,40 38,37" stroke="#EAB308" strokeWidth="1.5" fill="none" />
          
          {/* Wissens-Strahlen - erscheinen in Phase 4 */}
          {animationState === 4 && (
            <g>
              <line x1="28" y1="20" x2="25" y2="17" stroke="#EAB308" strokeWidth="1" className="animate-pulse" />
              <line x1="35" y1="15" x2="35" y2="12" stroke="#EAB308" strokeWidth="1" className="animate-pulse" />
              <line x1="42" y1="20" x2="45" y2="17" stroke="#EAB308" strokeWidth="1" className="animate-pulse" />
            </g>
          )}
        </g>
        
        {/* Neuer Spieler */}
        <g className={`transition-transform duration-500 ${animationState >= 2 ? 'transform translate-x-0 scale-90' : 'transform -translate-x-5 scale-90'}`}>
          <circle cx="65" cy="38" r="7" stroke="#3B82F6" strokeWidth="2" fill="none" />
          <line x1="65" y1="45" x2="65" y2="60" stroke="#3B82F6" strokeWidth="2" />
          <line x1="65" y1="60" x2="58" y2="73" stroke="#3B82F6" strokeWidth="2" />
          <line x1="65" y1="60" x2="72" y2="73" stroke="#3B82F6" strokeWidth="2" />
          
          {/* Fragezeichen - erscheint wenn aktiv */}
          {animationState >= 2 && (
            <g>
              <circle cx="65" cy="23" r="3" fill="#3B82F6" fillOpacity="0.3" stroke="#3B82F6" strokeWidth="0.5" />
              <text x="65" y="25" fontSize="6" textAnchor="middle" fill="#3B82F6" fontWeight="bold">?</text>
            </g>
          )}
          
          {/* Arme - Geste des Empfangens wenn aktiv */}
          {animationState >= 3 ? (
            <>
              <line x1="65" y1="52" x2="55" y2="52" stroke="#3B82F6" strokeWidth="2" />
              <line x1="65" y1="52" x2="55" y2="48" stroke="#3B82F6" strokeWidth="2" />
            </>
          ) : (
            <>
              <line x1="65" y1="52" x2="55" y2="57" stroke="#3B82F6" strokeWidth="2" />
              <line x1="65" y1="52" x2="75" y2="57" stroke="#3B82F6" strokeWidth="2" />
            </>
          )}
          
          {/* Neugieriges/Lernendes Gesicht */}
          <circle cx="62" cy="36" r="1" fill="#3B82F6" />
          <circle cx="68" cy="36" r="1" fill="#3B82F6" />
          <path d={animationState >= 3 ? "M62,40 Q65,43 68,40" : "M62,40 Q65,41 68,40"} stroke="#3B82F6" strokeWidth="1.5" fill="none" className="transition-all duration-300" />
        </g>
        
        {/* Wissenstransfer Animation - erscheint wenn aktiv */}
        {animationState >= 3 && (
          <g>
            <path d="M45,50 L55,50" stroke="#EAB308" strokeWidth="1" strokeDasharray="2,2" className="animate-pulse" />
            <path d="M53,48 L55,50 L53,52" fill="none" stroke="#EAB308" strokeWidth="1" className="animate-pulse" />
            
            {/* Glühbirnen-Moment */}
            {animationState === 4 && (
              <g>
                <circle cx="65" cy="23" r="5" fill="#FBBF24" fillOpacity="0.5" stroke="#FBBF24" strokeWidth="0.5" className="animate-ping" />
                <path d="M65,15 L65,12 M60,15 L58,12 M70,15 L72,12" stroke="#FBBF24" strokeWidth="1" className="animate-pulse" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
  
  // Animation für Fairplay
  const renderFairplayAnimation = () => (
    <div className="h-48 w-48 mx-auto relative">
      <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-lg">
        {/* Hintergrund */}
        <defs>
          <radialGradient id="fairplayGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="50" cy="50" r="40" fill="url(#fairplayGlow)" className={animationState >= 3 ? "animate-pulse" : ""} />
        
        {/* Fair spielendes Strichmännchen */}
        <g className={`transition-transform duration-500 ${animationState >= 2 ? 'transform translate-x-0' : 'transform translate-x-8'}`}>
          <circle cx="40" cy="35" r="8" stroke="#10B981" strokeWidth="2" fill="none" />
          <line x1="40" y1="43" x2="40" y2="60" stroke="#10B981" strokeWidth="2" />
          <line x1="40" y1="60" x2="30" y2="75" stroke="#10B981" strokeWidth="2" />
          <line x1="40" y1="60" x2="50" y2="75" stroke="#10B981" strokeWidth="2" />
          <line x1="40" y1="50" x2="30" y2="55" stroke="#10B981" strokeWidth="2" />
          
          {/* Controller/Trophäe in der Hand */}
          {animationState >= 3 ? (
            <g>
              <path d="M40,50 L50,50" stroke="#10B981" strokeWidth="2" />
              <path d="M50,45 L50,55 L55,57 L55,43 L50,45" fill="#FBBF24" fillOpacity="0.3" stroke="#FBBF24" strokeWidth="1" className="animate-pulse" />
            </g>
          ) : (
            <line x1="40" y1="50" x2="50" y2="55" stroke="#10B981" strokeWidth="2" />
          )}
          
          {/* Glückliches Fair-Play Gesicht */}
          <circle cx="37" cy="33" r="1.5" fill="#10B981" />
          <circle cx="43" cy="33" r="1.5" fill="#10B981" />
          <path d="M37,38 Q40,41 43,38" stroke="#10B981" strokeWidth="1.5" fill="none" />
        </g>
        
        {/* Cheatender Spieler */}
        <g className={`transition-transform duration-500 ${animationState >= 2 ? 'transform translate-x-0' : 'transform -translate-x-8'}`}>
          <circle cx="70" cy="35" r="8" stroke="#6B7280" strokeWidth="2" fill="none" />
          <line x1="70" y1="43" x2="70" y2="60" stroke="#6B7280" strokeWidth="2" />
          <line x1="70" y1="60" x2="60" y2="75" stroke="#6B7280" strokeWidth="2" />
          <line x1="70" y1="60" x2="80" y2="75" stroke="#6B7280" strokeWidth="2" />
          <line x1="70" y1="50" x2="80" y2="55" stroke="#6B7280" strokeWidth="2" />
          
          {/* Cheating-Tool/Hack */}
          {animationState >= 3 ? (
            <g>
              <path d="M70,50 L60,50" stroke="#6B7280" strokeWidth="2" />
              <rect x="55" y="47" width="5" height="6" fill="#EF4444" fillOpacity="0.3" stroke="#EF4444" strokeWidth="1" />
            </g>
          ) : (
            <line x1="70" y1="50" x2="60" y2="55" stroke="#6B7280" strokeWidth="2" />
          )}
          
          {/* Hinterhältiges/Ertapptes Gesicht */}
          {animationState >= 3 ? (
            <>
              <circle cx="67" cy="33" r="1.5" fill="#6B7280" />
              <circle cx="73" cy="33" r="1.5" fill="#6B7280" />
              <path d="M67,38 Q70,35 73,38" stroke="#6B7280" strokeWidth="1.5" fill="none" />
            </>
          ) : (
            <>
              <circle cx="67" cy="33" r="1.5" fill="#6B7280" />
              <circle cx="73" cy="33" r="1.5" fill="#6B7280" />
              <path d="M67,38 Q70,40 73,38" stroke="#6B7280" strokeWidth="1.5" fill="none" />
            </>
          )}
        </g>
        
        {/* Verbotszeichen auf Cheating - erscheint bei aktiver Animation */}
        {animationState >= 3 && (
          <g className="animate-pulse">
            <circle cx="60" cy="50" r="10" stroke="#EF4444" strokeWidth="2" fill="none" />
            <line x1="53" y1="57" x2="67" y2="43" stroke="#EF4444" strokeWidth="2" />
          </g>
        )}
        
        {/* Trophäe/Medaille für Fair Play - erscheint in Phase 4 */}
        {animationState === 4 && (
          <g className="animate-pulse">
            <circle cx="40" cy="15" r="8" fill="#FBBF24" fillOpacity="0.3" stroke="#FBBF24" strokeWidth="1" />
            <text x="40" y="18" fontSize="8" textAnchor="middle" fill="#10B981">
              ★
            </text>
          </g>
        )}
      </svg>
    </div>
  );
  
  // Animation basierend auf Typ rendern
  const renderAnimation = (type) => {
    switch (type) {
      case 'respect':
        return renderRespectAnimation();
      case 'noToxicity':
        return renderNoToxicityAnimation();
      case 'helpfulness':
        return renderHelpfulnessAnimation();
      case 'fairplay':
        return renderFairplayAnimation();
      default:
        return null;
    }
  };
  
  return (
    <div 
      id="rules"
      className={`py-16 bg-gradient-to-b from-light-bg-primary to-light-bg-secondary dark:from-dark-bg-primary dark:to-dark-bg-secondary transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase gradient-text">Community Regeln</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary sm:text-4xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">Unser Kodex für ein besseres Miteinander</span>
          </p>
          <p className="mt-4 max-w-2xl text-xl text-light-text-secondary dark:text-dark-text-secondary lg:mx-auto">
            Diese Regeln bilden das Fundament für eine freundliche, sichere und unterstützende Community, in der jeder willkommen ist.
          </p>
        </div>

        <div className="mt-12 lg:grid lg:grid-cols-2 lg:gap-8 relative">
          {/* Dekorative Elemente im Hintergrund */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-16 w-32 h-32 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
            <div className="absolute bottom-1/4 -left-8 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
          </div>

          {/* Regelliste */}
          <div className="relative z-10 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl shadow-xl p-6 border border-light-border-primary dark:border-dark-border-primary">
            <h3 className="text-xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary inline-flex items-center">
              <svg className="w-6 h-6 mr-2 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Unsere Grundregeln
            </h3>
            <ul className="space-y-4 stagger-fade-in animate">
              {rules.map((rule, index) => (
                <li 
                  key={rule.id}
                  className={`p-5 rounded-xl transition-all duration-300 cursor-pointer transform hover:translate-y-0 hover:shadow-md ${
                    activeRule === index 
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 border-l-4 border-primary-500 dark:border-primary-400 shadow-lg' 
                      : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary hover:bg-primary-50 dark:hover:bg-primary-900/50'
                  }`}
                  onClick={() => setActiveRule(index)}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      {renderIcon(rule.icon, rule.color)}
                    </div>
                    <div className="ml-4">
                      <h4 className={`font-semibold text-lg ${
                        activeRule === index 
                          ? 'text-primary-700 dark:text-primary-300' 
                          : 'text-light-text-primary dark:text-dark-text-primary'
                      }`}>
                        {rule.title}
                      </h4>
                      <p className="mt-1 text-light-text-secondary dark:text-dark-text-secondary text-sm">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Animation-Vorschau */}
          <div className="mt-10 lg:mt-0 flex items-center justify-center">
            <div className="relative w-full h-full">
              <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl shadow-xl p-6 border border-light-border-primary dark:border-dark-border-primary h-full">
                <h3 className="text-xl font-bold mb-4 text-light-text-primary dark:text-dark-text-primary text-center inline-flex items-center justify-center w-full">
                  {renderIcon(rules[activeRule].icon, rules[activeRule].color)}
                  <span className="ml-2">{rules[activeRule].title}</span>
                </h3>
                
                <div className="flex flex-col items-center justify-center">
                  {renderAnimation(rules[activeRule].animationType)}
                  <p className="mt-4 text-center text-light-text-secondary dark:text-dark-text-secondary max-w-md">
                    {rules[activeRule].description}
                  </p>
                </div>
                
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4].map((dot) => (
                      <button
                        key={dot}
                        className={`h-2 transition-all ${
                          animationState === dot 
                            ? 'w-8 bg-primary-600 dark:bg-primary-500' 
                            : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-primary-400 dark:hover:bg-primary-700'
                        } rounded-full`}
                        onClick={() => setAnimationState(dot)}
                        aria-label={`Animation Phase ${dot}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Dekorative Elemente hinter der Karte */}
              <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-primary-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
              <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <a
            href="https://discord.gg/simpleGaming"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0c-.164-.386-.398-.875-.608-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
            </svg>
            Unser Discord-Server
          </a>
          <p className="mt-4 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
            Tritt unserer Community bei und erlebe den Unterschied, den diese Regeln machen!
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityRulesSection;