// frontend/src/components/dashboard/ActivityOverview.jsx - CLEANED VERSION
import React, { useMemo, useEffect } from 'react';
import { Activity, MessageSquare, Mic, Gamepad2, Calendar } from 'lucide-react';
import DatePicker from './DatePicker';

// CSS Animations für die Balken - wird als Style-Tag eingefügt
const injectAnimationStyles = () => {
  const styleId = 'activity-chart-animations';
  
  // Prüfe ob Styles bereits eingefügt wurden
  if (document.getElementById(styleId)) {
    return;
  }

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @keyframes growUp {
      0% {
        height: 0%;
        opacity: 0;
      }
      100% {
        height: var(--final-height);
        opacity: 1;
      }
    }
    
    @keyframes shimmer {
      0% {
        transform: translateX(-100%) skewX(-12deg);
      }
      100% {
        transform: translateX(200%) skewX(-12deg);
      }
    }
    
    .bar-grow {
      animation: growUp 0.8s ease-out forwards;
    }
    
    .shimmer-effect {
      animation: shimmer 2s ease-in-out infinite;
      animation-delay: 1s;
    }
  `;
  
  document.head.appendChild(style);
};

const ActivityOverview = ({ 
  activityFilter, 
  setActivityFilter, 
  activityData, 
  userJoinDate, 
  themeClasses, 
  isDarkMode, 
  loading,
  selectedWeek,
  selectedMonth,
  navigateWeek,
  navigateMonth,
  goToCurrentWeek,
  goToCurrentMonth,
  selectedDate,
  setSelectedDate
}) => {
  // Injiziere CSS-Animationen beim ersten Render
  useEffect(() => {
    injectAnimationStyles();
  }, []);
  // ✅ Konsistente Kategorien-Definition
  const categories = [
    { id: 'messages', label: 'Nachrichten', icon: MessageSquare, gradient: 'from-blue-500 to-blue-600' },
    { id: 'voice', label: 'Voice (Min)', icon: Mic, gradient: 'from-green-500 to-green-600' },
    { id: 'gaming', label: 'Gaming (Min)', icon: Gamepad2, gradient: 'from-purple-500 to-purple-600' },
    { id: 'events', label: 'Events', icon: Calendar, gradient: 'from-orange-500 to-orange-600' }
  ];

  // Daten-Verarbeitung mit garantierter Struktur
  const currentData = useMemo(() => {
    if (!activityData || !Array.isArray(activityData)) {
      // Skeleton-Struktur für Loading-State
      const skeletonCount = activityFilter === 'daily' ? 7 : 
                           activityFilter === 'weekly' ? 5 : 
                           activityFilter === 'monthly' ? 6 : 4;
      
      return Array(skeletonCount).fill(null).map((_, index) => ({
        id: `skeleton-${index}`,
        label: `Loading ${index + 1}`,
        skeleton: true,
        messages: { value: 0, change: 0 },
        voice: { value: 0, change: 0 },
        gaming: { value: 0, change: 0 },
        events: { value: 0, change: 0 }
      }));
    }
    
    return activityData.map(period => ({
      ...period,
      skeleton: false,
      messages: period.messages || { value: 0, change: 0 },
      voice: period.voice || { value: 0, change: 0 },
      gaming: period.gaming || { value: 0, change: 0 },
      events: period.events || { value: 0, change: 0 }
    }));
  }, [activityData, activityFilter]);

  // Wert-Formatierung für Anzeige
  const formatValue = (category, value) => {
    if (!value || value === 0) return '0';
    
    switch (category) {
      case 'voice':
      case 'gaming':
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        if (hours > 0) {
          return hours > 1000 ? `${(hours / 1000).toFixed(1)}k h` : `${hours}h`;
        }
        return `${minutes}min`;
      case 'messages':
      case 'events':
        return value > 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
      default:
        return value.toString();
    }
  };

  // Detaillierte Formatierung für Tooltips
  const formatDetailedValue = (category, value) => {
    if (!value || value === 0) return '0';
    
    switch (category) {
      case 'voice':
      case 'gaming':
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        if (hours > 0 && minutes > 0) {
          return `${hours}h ${minutes}min`;
        } else if (hours > 0) {
          return `${hours} ${hours === 1 ? 'Stunde' : 'Stunden'}`;
        } else {
          return `${minutes} ${minutes === 1 ? 'Minute' : 'Minuten'}`;
        }
      case 'messages':
        return `${value.toLocaleString()} ${value === 1 ? 'Nachricht' : 'Nachrichten'}`;
      case 'events':
        return `${value} ${value === 1 ? 'Event' : 'Events'}`;
      default:
        return value.toString();
    }
  };

  // Statistik-Zusammenfassung mit festen Dimensionen
  const StatsSummary = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {categories.map((category) => {
        const Icon = category.icon;
        const values = currentData.map(period => period[category.id]?.value || 0);
        const totalValue = values.reduce((sum, val) => sum + val, 0);
        const avgValue = values.length > 0 ? totalValue / values.length : 0;
        const maxValue = Math.max(...values);
        const maxPeriodIndex = values.indexOf(maxValue);
        const maxPeriod = currentData[maxPeriodIndex]?.label;
        
        const isSkeletonMode = loading || currentData[0]?.skeleton;
        
        return (
          <div 
            key={`summary-${category.id}`} 
            className={`text-center p-5 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 ${
              isSkeletonMode ? 'animate-pulse' : ''
            } ${
              isDarkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' 
                : 'bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:from-gray-50 hover:to-gray-100'
            }`}
            style={{ minHeight: '140px' }}
          >
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${category.gradient} mb-3 shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className={`text-xl font-bold mb-1 ${themeClasses.text}`} style={{ minHeight: '28px' }}>
              {isSkeletonMode ? (
                <div className={`h-6 rounded w-16 mx-auto ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`} />
              ) : (
                formatValue(category.id, totalValue)
              )}
            </div>
            <div className={`text-xs mb-2 ${themeClasses.textTertiary}`} style={{ minHeight: '16px' }}>
              Gesamt ({activityFilter})
            </div>
            <div className={`text-sm mb-1 ${themeClasses.textSecondary}`} style={{ minHeight: '20px' }}>
              {isSkeletonMode ? (
                <div className={`h-4 rounded w-12 mx-auto ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`} />
              ) : (
                <>⌀ {formatValue(category.id, Math.round(avgValue))}</>
              )}
            </div>
            <div style={{ minHeight: '16px' }}>
              {maxPeriod && !isSkeletonMode && (
                <div className={`text-xs ${themeClasses.textTertiary}`}>
                  🏆 Peak: {maxPeriod}
                </div>
              )}
              {isSkeletonMode && (
                <div className={`h-3 rounded w-20 mx-auto ${
                  isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Balken-Chart mit verbesserter Darstellung und Tooltips
  const ActivityChart = () => {
    return (
      <div className="space-y-8">
        {categories.map((category) => {
          const Icon = category.icon;
          const values = currentData.map(period => period[category.id]?.value || 0);
          const maxValue = Math.max(...values, 1); // Verhindere Division durch 0
          const isSkeletonMode = loading || currentData[0]?.skeleton;
          
          return (
            <div key={`chart-${category.id}`} className="space-y-4">
              {/* Kategorie-Header mit fester Höhe */}
              <div className="flex items-center justify-between" style={{ minHeight: '32px' }}>
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${category.gradient} mr-3`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className={`font-semibold ${themeClasses.text}`}>
                    {category.label}
                  </span>
                </div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  {isSkeletonMode ? (
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16" />
                  ) : (
                    `Peak: ${formatDetailedValue(category.id, maxValue)}`
                  )}
                </div>
              </div>
              
              {/* Balken-Chart Container mit fester Höhe */}
              <div className="relative" style={{ minHeight: '120px' }}>
                <div className="flex items-end justify-between space-x-1 h-full">
                  {currentData.map((period, index) => {
                    const value = period[category.id]?.value || 0;
                    const change = period[category.id]?.change || 0;
                    // Verbesserte Höhenberechnung mit Mindesthöhe für bessere Sichtbarkeit
                    const height = maxValue > 0 ? Math.max((value / maxValue) * 100, value > 0 ? 8 : 0) : 0;
                    
                    return (
                      <div 
                        key={`${category.id}-${period.id || index}`}
                        className="flex-1 flex flex-col items-center group relative"
                        style={{ minHeight: '120px' }}
                      >
                        {/* Balken mit verbesserter Darstellung */}
                        <div className="relative w-full flex justify-center items-end" style={{ height: '100px' }}>
                          <div
                            className={`w-full max-w-12 rounded-t-lg transition-all duration-700 ease-out group-hover:scale-105 group-hover:brightness-110 relative overflow-hidden bar-grow ${
                              isSkeletonMode 
                                ? 'bg-gray-300 dark:bg-gray-600 animate-pulse' 
                                : `bg-gradient-to-t ${category.gradient} shadow-lg hover:shadow-xl`
                            }`}
                            style={{ 
                              '--final-height': `${height}%`,
                              height: `${height}%`,
                              minHeight: value > 0 ? '6px' : '2px',
                              opacity: isSkeletonMode ? 0.7 : 1
                            }}
                          >
                            {/* Shimmer-Effekt beim Hover */}
                            {!isSkeletonMode && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out shimmer-effect opacity-0 group-hover:opacity-100" />
                            )}
                            
                            {/* Pulsierender Highlight am oberen Rand */}
                            {!isSkeletonMode && value > 0 && (
                              <div className="absolute top-0 left-0 right-0 h-1 bg-white/40 rounded-t-lg animate-pulse" 
                                   style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
                            )}
                          </div>
                          
                          {/* Verbesserter Hover-Tooltip */}
                          {!isSkeletonMode && (
                            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-20">
                              <div className={`px-3 py-2 rounded-lg text-sm font-medium shadow-xl border ${
                                themeClasses.cardBg
                              } ${themeClasses.text} ${themeClasses.cardBorder}`}>
                                <div className="text-center">
                                  <div className="font-bold text-base">
                                    {formatDetailedValue(category.id, value)}
                                  </div>
                                  <div className={`text-xs mt-1 ${themeClasses.textTertiary}`}>
                                    {period.label}
                                  </div>
                                </div>
                                {/* Tooltip Arrow */}
                                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${
                                  isDarkMode ? 'border-t-gray-800' : 'border-t-white'
                                }`}></div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Periode-Label mit fester Höhe */}
                        <div className={`text-center mt-3 text-xs font-medium ${themeClasses.textSecondary}`} style={{ minHeight: '16px' }}>
                          {isSkeletonMode ? (
                            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-8 mx-auto animate-pulse" />
                          ) : (
                            period.label || `P${index + 1}`
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Y-Achsen-Hilfslinie für bessere Orientierung */}
                {!isSkeletonMode && maxValue > 0 && (
                  <div className="absolute left-0 top-0 bottom-6 w-full pointer-events-none">
                    {/* 50% Linie */}
                    <div className="absolute left-0 right-0 border-t border-gray-200 dark:border-gray-700 opacity-30" 
                         style={{ top: '50%' }}>
                      <span className={`absolute -left-2 -top-3 text-xs ${themeClasses.textTertiary}`}>
                        {formatValue(category.id, Math.round(maxValue * 0.5))}
                      </span>
                    </div>
                    {/* 100% Linie */}
                    <div className="absolute left-0 right-0 border-t border-gray-200 dark:border-gray-700 opacity-30" 
                         style={{ top: '0%' }}>
                      <span className={`absolute -left-2 -top-3 text-xs ${themeClasses.textTertiary}`}>
                        {formatValue(category.id, maxValue)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`${themeClasses.cardBg} rounded-3xl border ${themeClasses.cardBorder} shadow-xl`} style={{ minHeight: '600px' }}>
      {/* Header mit fester Höhe */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700" style={{ minHeight: '100px' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 mr-3">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className={`text-2xl font-bold ${themeClasses.text}`}>
                Aktivitäts-Übersicht
              </h3>
              <span className={`text-sm ${themeClasses.textSecondary}`}>
                {activityFilter === 'daily' ? 'Letzte 7 Tage' :
                 activityFilter === 'weekly' ? 'Letzte 5 Wochen' :
                 activityFilter === 'monthly' ? 'Letzte 6 Monate' :
                 'Gesamte Account-Historie'}
              </span>
            </div>
          </div>
          
          {/* DatePicker mit fester Struktur */}
          <div style={{ minWidth: '200px' }}>
            <DatePicker
              activityFilter={activityFilter}
              setActivityFilter={setActivityFilter}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              themeClasses={themeClasses}
              isDarkMode={isDarkMode}
              selectedWeek={selectedWeek}
              selectedMonth={selectedMonth}
              navigateWeek={navigateWeek}
              navigateMonth={navigateMonth}
              goToCurrentWeek={goToCurrentWeek}
              goToCurrentMonth={goToCurrentMonth}
            />
          </div>
        </div>
      </div>

      {/* Content mit Loading Overlay */}
      <div className="p-6 relative">
        {/* Loading Overlay - nur visuell, verändert kein Layout */}
        {loading && (
          <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg flex items-center space-x-4">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin"></div>
                <div className="absolute top-0 left-0 w-8 h-8 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <div>
                <p className={`font-medium ${themeClasses.text}`}>Lade Aktivitätsdaten...</p>
                <p className={`text-sm ${themeClasses.textTertiary}`}>
                  {activityFilter === 'weekly' ? 'Wochendaten werden abgerufen' :
                   activityFilter === 'monthly' ? 'Monatsdaten werden abgerufen' :
                   activityFilter === 'daily' ? 'Tägliche Daten werden abgerufen' :
                   'Account-Daten werden abgerufen'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Summary - immer gerendert */}
        <StatsSummary />

        {/* Activity Charts - immer gerendert */}
        <ActivityChart />
      </div>
    </div>
  );
};

export default ActivityOverview;