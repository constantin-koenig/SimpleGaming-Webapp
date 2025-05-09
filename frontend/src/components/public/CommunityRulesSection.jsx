import React, { useState } from 'react';

const CommunityRulesSection = ({ isVisible }) => {
  const [activeRule, setActiveRule] = useState(0);
  
  const rules = [
    {
      id: 1,
      title: "Respektvoller Umgang",
      description: "Behandle alle Community-Mitglieder mit Respekt. Beleidigungen, Diskriminierung oder Belästigung werden nicht toleriert.",
      animationType: "respect"
    },
    {
      id: 2,
      title: "Keine Toxizität",
      description: "Toxisches Verhalten wie Spam, Trollen oder Flame Wars haben bei uns keinen Platz. Wir fördern ein positives Umfeld für alle.",
      animationType: "noToxicity"
    },
    {
      id: 3,
      title: "Hilfsbereitschaft",
      description: "Unterstütze neue Mitglieder und hilf ihnen, sich in unserer Community einzuleben. Teile dein Wissen und deine Erfahrungen.",
      animationType: "helpfulness"
    },
    {
      id: 4,
      title: "Fairplay",
      description: "Spiele fair und halte dich an die Regeln. Cheating, Hacking oder Ausnutzen von Exploits sind streng verboten.",
      animationType: "fairplay"
    }
  ];

  // Animation for respect rule
  const renderRespectAnimation = (isActive) => (
    <div className={`h-32 w-32 mx-auto relative ${isActive ? 'animate-pulse' : ''}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Stick Figure 1 */}
        <g className={`transition-transform duration-500 ${isActive ? 'transform translate-x-0' : 'transform translate-x-10'}`}>
          <circle cx="35" cy="30" r="8" stroke="#4F46E5" strokeWidth="2" fill="none" />
          <line x1="35" y1="38" x2="35" y2="55" stroke="#4F46E5" strokeWidth="2" />
          <line x1="35" y1="55" x2="25" y2="70" stroke="#4F46E5" strokeWidth="2" />
          <line x1="35" y1="55" x2="45" y2="70" stroke="#4F46E5" strokeWidth="2" />
          
          {/* Arms - normal or handshake position based on active state */}
          {isActive ? (
            <line x1="35" y1="45" x2="50" y2="50" stroke="#4F46E5" strokeWidth="2" className="origin-top transition-all duration-300" />
          ) : (
            <line x1="35" y1="45" x2="25" y2="50" stroke="#4F46E5" strokeWidth="2" />
          )}
          <line x1="35" y1="45" x2="25" y2="50" stroke="#4F46E5" strokeWidth="2" className={isActive ? 'opacity-0' : 'opacity-100'} />
          
          {/* Happy Face */}
          <circle cx="32" cy="28" r="1" fill="#4F46E5" />
          <circle cx="38" cy="28" r="1" fill="#4F46E5" />
          <path d="M32,33 Q35,36 38,33" stroke="#4F46E5" strokeWidth="1.5" fill="none" />
        </g>
        
        {/* Stick Figure 2 */}
        <g className={`transition-transform duration-500 ${isActive ? 'transform translate-x-0' : 'transform -translate-x-10'}`}>
          <circle cx="65" cy="30" r="8" stroke="#4F46E5" strokeWidth="2" fill="none" />
          <line x1="65" y1="38" x2="65" y2="55" stroke="#4F46E5" strokeWidth="2" />
          <line x1="65" y1="55" x2="55" y2="70" stroke="#4F46E5" strokeWidth="2" />
          <line x1="65" y1="55" x2="75" y2="70" stroke="#4F46E5" strokeWidth="2" />
          
          {/* Arms - normal or handshake position based on active state */}
          {isActive ? (
            <line x1="65" y1="45" x2="50" y2="50" stroke="#4F46E5" strokeWidth="2" className="origin-top transition-all duration-300" />
          ) : (
            <line x1="65" y1="45" x2="75" y2="50" stroke="#4F46E5" strokeWidth="2" />
          )}
          <line x1="65" y1="45" x2="75" y2="50" stroke="#4F46E5" strokeWidth="2" className={isActive ? 'opacity-0' : 'opacity-100'} />
          
          {/* Happy Face */}
          <circle cx="62" cy="28" r="1" fill="#4F46E5" />
          <circle cx="68" cy="28" r="1" fill="#4F46E5" />
          <path d="M62,33 Q65,36 68,33" stroke="#4F46E5" strokeWidth="1.5" fill="none" />
        </g>
        
        {/* Handshake - appears when active */}
        {isActive && (
          <g className="animate-pulse" style={{animationDuration: "2s"}}>
            <circle cx="50" cy="50" r="5" stroke="#4F46E5" strokeWidth="1" fill="#4F46E5" fillOpacity="0.2" />
            <path d="M45,48 Q50,55 55,48" stroke="#4F46E5" strokeWidth="2" fill="none" />
          </g>
        )}
        
        {/* Heart above - appears when active */}
        {isActive && (
          <path 
            d="M50,20 C53,15 58,15 58,20 C58,22 50,30 50,30 C50,30 42,22 42,20 C42,15 47,15 50,20" 
            fill="#EF4444" 
            className="animate-pulse" 
            style={{animationDuration: "1.5s"}}
          />
        )}
      </svg>
    </div>
  );
  
  // Animation for no toxicity rule
  const renderNoToxicityAnimation = (isActive) => (
    <div className={`h-32 w-32 mx-auto relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Stick Figure */}
        <g>
          {/* Head */}
          <circle 
            cx="50" 
            cy="30" 
            r="8" 
            stroke="#4F46E5" 
            strokeWidth="2" 
            fill="none" 
            className={isActive ? "animate-pulse" : ""}
          />
          
          {/* Body */}
          <line 
            x1="50" 
            y1="38" 
            x2="50" 
            y2="55" 
            stroke="#4F46E5" 
            strokeWidth="2"
            className={isActive ? "origin-top transform scale-y-110" : ""} 
          />
          
          {/* Arms - normal in frame 1, raised angry in active state */}
          {!isActive ? (
            <>
              <line x1="50" y1="45" x2="40" y2="50" stroke="#4F46E5" strokeWidth="2" />
              <line x1="50" y1="45" x2="60" y2="50" stroke="#4F46E5" strokeWidth="2" />
            </>
          ) : (
            <>
              <line 
                x1="50" 
                y1="45" 
                x2="35" 
                y2="35" 
                stroke="#4F46E5" 
                strokeWidth="2" 
                className="origin-top-left transition-all duration-300"
              />
              <line 
                x1="50" 
                y1="45" 
                x2="65" 
                y2="35" 
                stroke="#4F46E5" 
                strokeWidth="2" 
                className="origin-top-right transition-all duration-300"
              />
            </>
          )}
          
          {/* Legs */}
          <line x1="50" y1="55" x2="40" y2="70" stroke="#4F46E5" strokeWidth="2" />
          <line x1="50" y1="55" x2="60" y2="70" stroke="#4F46E5" strokeWidth="2" />
          
          {/* Angry Face - appears in active state */}
          {isActive ? (
            <>
              <line x1="45" y1="28" x2="48" y2="30" stroke="#4F46E5" strokeWidth="1.5" />
              <line x1="55" y1="28" x2="52" y2="30" stroke="#4F46E5" strokeWidth="1.5" />
              <path d="M45,33 Q50,30 55,33" stroke="#4F46E5" strokeWidth="1.5" fill="none" />
            </>
          ) : (
            <>
              <circle cx="47" cy="28" r="1" fill="#4F46E5" />
              <circle cx="53" cy="28" r="1" fill="#4F46E5" />
              <path d="M47,33 Q50,35 53,33" stroke="#4F46E5" strokeWidth="1.5" fill="none" />
            </>
          )}
          
          {/* Speech Bubble with toxic words - appears when active */}
          {isActive && (
            <g>
              <path 
                d="M65,20 Q75,20 75,10 Q75,0 65,0 Q55,0 55,10 Q55,15 50,18 L55,15 Q55,20 65,20" 
                fill="white" 
                stroke="#4F46E5" 
              />
              <text x="65" y="12" fontSize="6" textAnchor="middle" fill="#EF4444">
                #$@!
              </text>
            </g>
          )}
          
          {/* Prohibition Sign - appears when active */}
          {isActive && (
            <g className="animate-pulse">
              <circle cx="50" cy="37" r="30" stroke="#FF0000" strokeWidth="2" fill="none" />
              <line x1="30" y1="57" x2="70" y2="17" stroke="#FF0000" strokeWidth="2" />
            </g>
          )}
        </g>
      </svg>
    </div>
  );
  
  // Animation for helpfulness rule
  const renderHelpfulnessAnimation = (isActive) => (
    <div className={`h-32 w-32 mx-auto relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Experienced Stick Figure */}
        <g className={`transition-transform duration-500 ${isActive ? 'transform translate-x-2' : 'transform translate-x-10'}`}>
          <circle cx="35" cy="30" r="8" stroke="#4F46E5" strokeWidth="2" fill="none" />
          <line x1="35" y1="38" x2="35" y2="55" stroke="#4F46E5" strokeWidth="2" />
          <line x1="35" y1="55" x2="25" y2="70" stroke="#4F46E5" strokeWidth="2" />
          <line x1="35" y1="55" x2="45" y2="70" stroke="#4F46E5" strokeWidth="2" />
          
          {/* Knowledge/Help Icon - visible when active */}
          {isActive && (
            <circle cx="35" cy="15" r="5" fill="#4F46E5" fillOpacity="0.3" stroke="#4F46E5" strokeWidth="1" className="animate-pulse" />
          )}
          
          {/* Arms - explaining gesture when active */}
          {isActive ? (
            <>
              <line x1="35" y1="45" x2="45" y2="50" stroke="#4F46E5" strokeWidth="2" />
              <line x1="35" y1="45" x2="45" y2="40" stroke="#4F46E5" strokeWidth="2" />
            </>
          ) : (
            <>
              <line x1="35" y1="45" x2="25" y2="50" stroke="#4F46E5" strokeWidth="2" />
              <line x1="35" y1="45" x2="45" y2="50" stroke="#4F46E5" strokeWidth="2" />
            </>
          )}
          
          {/* Experienced (Smile) Face */}
          <circle cx="32" cy="28" r="1" fill="#4F46E5" />
          <circle cx="38" cy="28" r="1" fill="#4F46E5" />
          <path d="M32,33 Q35,36 38,33" stroke="#4F46E5" strokeWidth="1.5" fill="none" />
        </g>
        
        {/* New Member Stick Figure - smaller */}
        <g className={`transition-transform duration-500 ${isActive ? 'transform translate-x-0 scale-90' : 'transform -translate-x-5 scale-90'}`}>
          <circle cx="65" cy="35" r="7" stroke="#4F46E5" strokeWidth="2" fill="none" />
          <line x1="65" y1="42" x2="65" y2="57" stroke="#4F46E5" strokeWidth="2" />
          <line x1="65" y1="57" x2="58" y2="70" stroke="#4F46E5" strokeWidth="2" />
          <line x1="65" y1="57" x2="72" y2="70" stroke="#4F46E5" strokeWidth="2" />
          
          {/* Question Mark Icon - visible when active */}
          {isActive && (
            <path d="M65,19 L67,16 L70,19 L65,24" stroke="#4F46E5" strokeWidth="1" fill="none" className="animate-bounce" />
          )}
          
          {/* Arms - gesture of receiving info when active */}
          {isActive ? (
            <>
              <line x1="65" y1="47" x2="55" y2="47" stroke="#4F46E5" strokeWidth="2" />
              <line x1="65" y1="47" x2="55" y2="43" stroke="#4F46E5" strokeWidth="2" />
            </>
          ) : (
            <>
              <line x1="65" y1="47" x2="55" y2="52" stroke="#4F46E5" strokeWidth="2" />
              <line x1="65" y1="47" x2="75" y2="52" stroke="#4F46E5" strokeWidth="2" />
            </>
          )}
          
          {/* Curious/Learning Face */}
          <circle cx="62" cy="33" r="1" fill="#4F46E5" />
          <circle cx="68" cy="33" r="1" fill="#4F46E5" />
          <path d="M62,38 Q65,40 68,38" stroke="#4F46E5" strokeWidth="1.5" fill="none" />
        </g>
        
        {/* Knowledge Transfer Animation - visible when active */}
        {isActive && (
          <g>
            <path d="M45,45 L55,45" stroke="#4F46E5" strokeWidth="1" strokeDasharray="2,2" className="animate-pulse" />
            <path d="M47,43 L53,45 L47,47" fill="none" stroke="#4F46E5" strokeWidth="1" className="animate-pulse" />
          </g>
        )}
        
        {/* Light Bulb Moment - visible when active */}
        {isActive && (
          <path 
            d="M65,18 L65,25 M60,20 L70,20" 
            stroke="#F59E0B" 
            strokeWidth="2" 
            className="animate-pulse" 
            style={{animationDuration: "1.5s"}}
          />
        )}
      </svg>
    </div>
  );
  
  // Animation for fairplay rule
  const renderFairplayAnimation = (isActive) => (
    <div className={`h-32 w-32 mx-auto relative`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Fair Playing Stick Figure */}
        <g className={`transition-transform duration-500 ${isActive ? 'transform translate-x-0' : 'transform translate-x-8'}`}>
          <circle cx="40" cy="30" r="8" stroke="#4F46E5" strokeWidth="2" fill="none" />
          <line x1="40" y1="38" x2="40" y2="55" stroke="#4F46E5" strokeWidth="2" />
          <line x1="40" y1="55" x2="30" y2="70" stroke="#4F46E5" strokeWidth="2" />
          <line x1="40" y1="55" x2="50" y2="70" stroke="#4F46E5" strokeWidth="2" />
          <line x1="40" y1="45" x2="30" y2="50" stroke="#4F46E5" strokeWidth="2" />
          
          {/* Controller/Trophy in hand */}
          {isActive ? (
            <g>
              <path d="M40,45 L50,45" stroke="#4F46E5" strokeWidth="2" />
              <path d="M50,40 L50,50 L55,52 L55,38 L50,40" fill="#F59E0B" fillOpacity="0.3" stroke="#4F46E5" strokeWidth="1" />
            </g>
          ) : (
            <line x1="40" y1="45" x2="50" y2="50" stroke="#4F46E5" strokeWidth="2" />
          )}
          
          {/* Happy Fair Play Face */}
          <circle cx="37" cy="28" r="1" fill="#4F46E5" />
          <circle cx="43" cy="28" r="1" fill="#4F46E5" />
          <path d="M37,33 Q40,36 43,33" stroke="#4F46E5" strokeWidth="1.5" fill="none" />
        </g>
        
        {/* Cheating Stick Figure */}
        <g className={`transition-transform duration-500 ${isActive ? 'transform translate-x-0' : 'transform -translate-x-8'}`}>
          <circle cx="70" cy="30" r="8" stroke="#4F46E5" strokeWidth="2" fill="none" />
          <line x1="70" y1="38" x2="70" y2="55" stroke="#4F46E5" strokeWidth="2" />
          <line x1="70" y1="55" x2="60" y2="70" stroke="#4F46E5" strokeWidth="2" />
          <line x1="70" y1="55" x2="80" y2="70" stroke="#4F46E5" strokeWidth="2" />
          <line x1="70" y1="45" x2="80" y2="50" stroke="#4F46E5" strokeWidth="2" />
          
          {/* Cheating tool/hack */}
          {isActive ? (
            <g>
              <path d="M70,45 L60,45" stroke="#4F46E5" strokeWidth="2" />
              <rect x="55" y="42" width="5" height="6" fill="#EF4444" fillOpacity="0.3" stroke="#EF4444" strokeWidth="1" />
            </g>
          ) : (
            <line x1="70" y1="45" x2="60" y2="50" stroke="#4F46E5" strokeWidth="2" />
          )}
          
          {/* Sneaky/Caught Face */}
          {isActive ? (
            <>
              <circle cx="67" cy="28" r="1" fill="#4F46E5" />
              <circle cx="73" cy="28" r="1" fill="#4F46E5" />
              <path d="M67,33 Q70,30 73,33" stroke="#4F46E5" strokeWidth="1.5" fill="none" />
            </>
          ) : (
            <>
              <circle cx="67" cy="28" r="1" fill="#4F46E5" />
              <circle cx="73" cy="28" r="1" fill="#4F46E5" />
              <path d="M67,33 Q70,35 73,33" stroke="#4F46E5" strokeWidth="1.5" fill="none" />
            </>
          )}
        </g>
        
        {/* Prohibition Sign on cheating - visible when active */}
        {isActive && (
          <g className="animate-pulse">
            <circle cx="60" cy="45" r="10" stroke="#FF0000" strokeWidth="2" fill="none" />
            <line x1="53" y1="52" x2="67" y2="38" stroke="#FF0000" strokeWidth="2" />
          </g>
        )}
        
        {/* Trophy/Medal for fair play - visible when active */}
        {isActive && (
          <g className="animate-pulse">
            <circle cx="55" cy="15" r="8" fill="#F59E0B" fillOpacity="0.3" stroke="#F59E0B" strokeWidth="1" />
            <text x="55" y="18" fontSize="8" textAnchor="middle" fill="#4F46E5">
              ★
            </text>
          </g>
        )}
      </svg>
    </div>
  );
  
  const renderAnimation = (type, isActive) => {
    switch (type) {
      case 'respect':
        return renderRespectAnimation(isActive);
      case 'noToxicity':
        return renderNoToxicityAnimation(isActive);
      case 'helpfulness':
        return renderHelpfulnessAnimation(isActive);
      case 'fairplay':
        return renderFairplayAnimation(isActive);
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={`py-16 bg-light-bg-primary dark:bg-dark-bg-primary transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase gradient-text">Community Regeln</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary sm:text-4xl">
            Unser Kodex für ein besseres Miteinander
          </p>
          <p className="mt-4 max-w-2xl text-xl text-light-text-secondary dark:text-dark-text-secondary lg:mx-auto">
            Diese Regeln helfen uns, eine freundliche und unterstützende Community aufzubauen
          </p>
        </div>

        <div className="mt-10 lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Rules List */}
          <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary">Unsere Grundregeln</h3>
            <ul className="space-y-4">
              {rules.map((rule, index) => (
                <li 
                  key={rule.id}
                  className={`p-4 rounded-lg transition-all cursor-pointer ${
                    activeRule === index 
                      ? 'bg-primary-100 dark:bg-primary-900 border-l-4 border-primary-500' 
                      : 'bg-light-bg-tertiary dark:bg-dark-bg-tertiary hover:bg-primary-50 dark:hover:bg-primary-900/50'
                  }`}
                  onClick={() => setActiveRule(index)}
                >
                  <h4 className={`font-semibold text-lg ${
                    activeRule === index 
                      ? 'text-primary-700 dark:text-primary-300' 
                      : 'text-light-text-primary dark:text-dark-text-primary'
                  }`}>
                    {rule.title}
                  </h4>
                  <p className="mt-1 text-light-text-secondary dark:text-dark-text-secondary">
                    {rule.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Animation Preview */}
          <div className="mt-10 lg:mt-0 flex items-center justify-center">
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shadow-lg p-6 w-full h-full">
              <h3 className="text-xl font-bold mb-6 text-light-text-primary dark:text-dark-text-primary text-center">
                {rules[activeRule].title}
              </h3>
              
              <div className="flex flex-col items-center justify-center h-64">
                {renderAnimation(rules[activeRule].animationType, true)}
                <p className="mt-6 text-center text-light-text-secondary dark:text-dark-text-secondary max-w-md">
                  {rules[activeRule].description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityRulesSection;