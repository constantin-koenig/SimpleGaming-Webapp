// frontend/src/components/public/CommunityStatsSection.jsx - Mit Vergleichs-Animationen
import React from 'react';
import AnimatedComparisonStatCard from './AnimatedComparisonStatCard';

const CommunityStatsSection = ({ enhancedStats, liveStats, isVisible, statsError }) => {
  
  // ✅ Hilfsfunktionen für kreative Vergleiche
  const calculateComparisons = (stats) => {
    if (!stats) return null;

    const members = stats.members?.total || 0;
    const messages = stats.activity?.totalMessages || 0;
    const voiceHours = stats.activity?.totalVoiceHours || 0;
    const uptimeDays = stats.activity?.serverUptimeDays || Math.floor((Date.now() - new Date('2024-01-15').getTime()) / (1000 * 60 * 60 * 24));

    return {
      members: {
        // Vergleich: Wie viele Schulklassen das wären (25 Schüler pro Klasse)
        comparison: Math.floor(members / 25),
        label: 'Schulklassen',
        suffix: ''
      },
      messages: {
        // Vergleich: Wie viele Bücher das wären (250 Wörter pro Nachricht, 70.000 Wörter pro Buch)
        comparison: Math.floor((messages * 250) / 70000),
        label: 'Bücher geschrieben',
        suffix: ''
      },
      voiceHours: {
        // Vergleich: Wie viele komplette Filme das wären (2 Stunden pro Film)
        comparison: Math.floor(voiceHours / 2),
        label: 'Filme geschaut',
        suffix: ''
      },
      uptimeDays: {
        // Vergleich: Wie viele Jahre das sind
        comparison: (uptimeDays / 365).toFixed(1),
        label: 'Jahre online',
        suffix: ''
      }
    };
  };

  const comparisons = calculateComparisons(enhancedStats);
  const foundingDate = new Date('2024-01-15'); // Anpassbar für dein echtes Gründungsdatum

  // ✅ Community Statistiken mit Vergleichswerten (ohne Datumswiederholung)
  const communityStats = [
    { 
      realValue: enhancedStats?.members?.total || 0,
      realLabel: 'Community Mitglieder',
      realSuffix: '',
      comparisonValue: comparisons?.members?.comparison || 0,
      comparisonLabel: comparisons?.members?.label || 'Schulklassen',
      comparisonSuffix: comparisons?.members?.suffix || '',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg>
    },
    { 
      realValue: enhancedStats?.activity?.totalMessages || 0,
      realLabel: 'Nachrichten gesendet',
      realSuffix: '',
      comparisonValue: comparisons?.messages?.comparison || 0,
      comparisonLabel: comparisons?.messages?.label || 'Bücher geschrieben',
      comparisonSuffix: comparisons?.messages?.suffix || '',
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd"/></svg>
    },
    { 
      realValue: enhancedStats?.activity?.totalVoiceHours || 0,
      realLabel: 'Voice Chat Stunden',
      realSuffix: 'h',
      comparisonValue: comparisons?.voiceHours?.comparison || 0,
      comparisonLabel: comparisons?.voiceHours?.label || 'Filme geschaut',
      comparisonSuffix: comparisons?.voiceHours?.suffix || '',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/></svg>
    },
    { 
      realValue: enhancedStats?.activity?.serverUptimeDays || Math.floor((Date.now() - foundingDate.getTime()) / (1000 * 60 * 60 * 24)),
      realLabel: `Tage seit Gründung`,
      realSuffix: ' Tage',
      comparisonValue: parseFloat(comparisons?.uptimeDays?.comparison || '0'),
      comparisonLabel: comparisons?.uptimeDays?.label || 'Jahre online',
      comparisonSuffix: comparisons?.uptimeDays?.suffix || '',
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd"/></svg>
    }
  ];

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
          
          {/* Erweiterte Info-Sektion */}
          <div className="space-y-3">
            {enhancedStats && (
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 mb-4">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                Live-Daten • {liveStats.formattedData.onlineMembers} online • Aktualisiert {new Date(enhancedStats.lastUpdate).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {communityStats.map((stat, index) => (
            <AnimatedComparisonStatCard 
              key={index}
              realValue={stat.realValue}
              realLabel={stat.realLabel}
              realSuffix={stat.realSuffix}
              comparisonValue={stat.comparisonValue}
              comparisonLabel={stat.comparisonLabel}
              comparisonSuffix={stat.comparisonSuffix}
              delay={index * 200} 
              isVisible={isVisible}
              gradient={stat.gradient}
              icon={stat.icon}
              switchInterval={4000} // ✅ Alle Karten haben das gleiche Intervall
            />
          ))}
        </div>
        
        {/* Zusätzliche Info-Box */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-start max-w-2xl mx-auto bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur-sm">
            <svg className="w-6 h-6 text-yellow-300 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-white mb-2">Wusstest du schon?</h3>
              <p className="text-white text-opacity-90 text-sm leading-relaxed">
                Unsere Community hat zusammen mehr als {enhancedStats?.activity?.totalVoiceHours || 0} Stunden miteinander verbracht - 
                das entspricht {comparisons?.voiceHours?.comparison || 0} kompletten Filmen! 
                Gemeinsam haben wir {comparisons?.messages?.comparison || 0} Bücher an Nachrichten geschrieben.
              </p>
            </div>
          </div>
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