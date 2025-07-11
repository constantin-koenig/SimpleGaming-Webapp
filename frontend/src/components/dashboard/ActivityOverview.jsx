// frontend/src/components/dashboard/ActivityOverview.jsx - FIXED: Echte API-Daten
import React, { useState, useMemo } from 'react';
import { Activity, Gamepad2, Users, Headphones, MessageSquare, ChevronDown, TrendingUp, Zap, BarChart3, Calendar } from 'lucide-react';
import DatePicker from './DatePicker';

const ActivityOverview = ({ 
  activityFilter, 
  setActivityFilter, 
  activityData,
  themeClasses, 
  isDarkMode,
  userJoinDate,
  loading = false,
  // ✅ NEW: Navigation props
  selectedWeek,
  selectedMonth,
  navigateWeek,
  navigateMonth,
  goToCurrentWeek,
  goToCurrentMonth
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // ✅ MOVED: Skeleton-Daten Funktion vor useMemo
  const getSkeletonData = (timeframe) => {
    const counts = {
      daily: 7,
      weekly: 7, 
      monthly: 4,
      alltime: 6
    };
    
    const labels = {
      daily: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
      weekly: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
      monthly: ['W1', 'W2', 'W3', 'W4'],
      alltime: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6']
    };
    
    const count = counts[timeframe] || 7;
    const labelSet = labels[timeframe] || labels.weekly;
    
    return Array.from({ length: count }, (_, index) => ({
      period: `skeleton-${index}`,
      label: labelSet[index] || `P${index + 1}`,
      date: new Date(),
      messages: { value: 0, change: 0 },
      voice: { value: 0, change: 0 },
      gaming: { value: 0, change: 0 },
      events: { value: 0, change: 0 },
      skeleton: true // ✅ Markierung für Skeleton-Rendering
    }));
  };

  // ✅ MOVED: Mock-Daten Funktion vor useMemo
  const getMockActivityData = (timeframe) => {
    const mockData = {
      weekly: [
        { label: 'Mo', messages: { value: 45, change: 0 }, voice: { value: 120, change: 0 }, gaming: { value: 85, change: 0 }, events: { value: 1, change: 0 } },
        { label: 'Di', messages: { value: 32, change: -13 }, voice: { value: 95, change: -25 }, gaming: { value: 130, change: 45 }, events: { value: 0, change: -1 } },
        { label: 'Mi', messages: { value: 67, change: 35 }, voice: { value: 180, change: 85 }, gaming: { value: 45, change: -85 }, events: { value: 2, change: 2 } },
        { label: 'Do', messages: { value: 89, change: 22 }, voice: { value: 210, change: 30 }, gaming: { value: 195, change: 150 }, events: { value: 1, change: -1 } },
        { label: 'Fr', messages: { value: 156, change: 67 }, voice: { value: 245, change: 35 }, gaming: { value: 275, change: 80 }, events: { value: 0, change: -1 } },
        { label: 'Sa', messages: { value: 78, change: -78 }, voice: { value: 320, change: 75 }, gaming: { value: 380, change: 105 }, events: { value: 3, change: 3 } },
        { label: 'So', messages: { value: 94, change: 16 }, voice: { value: 280, change: -40 }, gaming: { value: 290, change: -90 }, events: { value: 1, change: -2 } }
      ],
      monthly: [
        { label: 'W1', messages: { value: 234, change: 0 }, voice: { value: 450, change: 0 }, gaming: { value: 320, change: 0 }, events: { value: 5, change: 0 } },
        { label: 'W2', messages: { value: 189, change: -45 }, voice: { value: 380, change: -70 }, gaming: { value: 445, change: 125 }, events: { value: 3, change: -2 } },
        { label: 'W3', messages: { value: 267, change: 78 }, voice: { value: 520, change: 140 }, gaming: { value: 280, change: -165 }, events: { value: 7, change: 4 } },
        { label: 'W4', messages: { value: 345, change: 78 }, voice: { value: 600, change: 80 }, gaming: { value: 520, change: 240 }, events: { value: 4, change: -3 } }
      ],
      alltime: [
        { label: 'Jan', messages: { value: 892, change: 0 }, voice: { value: 1840, change: 0 }, gaming: { value: 1520, change: 0 }, events: { value: 12, change: 0 } },
        { label: 'Feb', messages: { value: 756, change: -136 }, voice: { value: 1650, change: -190 }, gaming: { value: 1890, change: 370 }, events: { value: 8, change: -4 } },
        { label: 'Mär', messages: { value: 1024, change: 268 }, voice: { value: 2100, change: 450 }, gaming: { value: 1280, change: -610 }, events: { value: 15, change: 7 } },
        { label: 'Apr', messages: { value: 1156, change: 132 }, voice: { value: 2350, change: 250 }, gaming: { value: 2100, change: 820 }, events: { value: 11, change: -4 } },
        { label: 'Mai', messages: { value: 934, change: -222 }, voice: { value: 2180, change: -170 }, gaming: { value: 1960, change: -140 }, events: { value: 9, change: -2 } },
        { label: 'Jun', messages: { value: 1245, change: 311 }, voice: { value: 2520, change: 340 }, gaming: { value: 2380, change: 420 }, events: { value: 18, change: 9 } }
      ]
    };
    
    return mockData[timeframe] || mockData.weekly;
  };

  // Aktivitätskategorien mit korrekten API-Feldnamen
  const categories = [
    {
      id: 'messages',
      name: 'Messages',
      icon: MessageSquare,
      color: '#F59E0B',
      gradient: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500',
      description: 'Gesendete Nachrichten'
    },
    {
      id: 'voice',
      name: 'Voice',
      icon: Headphones,
      color: '#10B981',
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500',
      description: 'Zeit im Sprachchat (Minuten)'
    },
    {
      id: 'gaming',
      name: 'Gaming',
      icon: Gamepad2,
      color: '#8B5CF6',
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500',
      description: 'Zeit in Spielen (Minuten)'
    },
    {
      id: 'events',
      name: 'Events',
      icon: Users,
      color: '#3B82F6',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500',
      description: 'Event-Teilnahmen'
    }
  ];

  // ✅ FIXED: Datenverarbeitung mit Skeleton-Loading (nach Funktionsdefinitionen)
  const currentData = useMemo(() => {
    console.log('🔄 Processing activity data:', { activityData, activityFilter, loading });
    
    // ✅ IMMER feste Struktur beibehalten - auch beim Wechsel zwischen Wochen
    const getFixedStructure = (timeframe) => {
      const structures = {
        daily: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
        weekly: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
        monthly: ['W1', 'W2', 'W3', 'W4'],
        alltime: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6']
      };
      
      const labels = structures[timeframe] || structures.weekly;
      
      return labels.map((label, index) => ({
        period: `${timeframe}-${index}`,
        label: label,
        date: new Date(),
        messages: { value: 0, change: 0 },
        voice: { value: 0, change: 0 },
        gaming: { value: 0, change: 0 },
        events: { value: 0, change: 0 },
        skeleton: false
      }));
    };
    
    // ✅ Während Loading: Skeleton-Daten mit fester Struktur
    if (loading) {
      const skeletonData = getFixedStructure(activityFilter);
      return skeletonData.map(item => ({ ...item, skeleton: true }));
    }
    
    // ✅ FIXED: Immer feste Anzahl Datenpunkte garantieren
    const baseStructure = getFixedStructure(activityFilter);
    
    // Wenn API-Daten vorhanden, diese einmappen
    if (activityData && Array.isArray(activityData) && activityData.length > 0) {
      console.log('✅ Using API data with fixed structure');
      
      return baseStructure.map((baseItem, index) => {
        const apiItem = activityData[index];
        
        if (apiItem) {
          return {
            period: apiItem.period || baseItem.period,
            label: apiItem.label || baseItem.label,
            date: new Date(apiItem.date || apiItem.period || baseItem.date),
            messages: {
              value: apiItem.messages?.value || 0,
              change: apiItem.messages?.change || 0
            },
            voice: {
              value: apiItem.voice?.value || 0,
              change: apiItem.voice?.change || 0
            },
            gaming: {
              value: apiItem.gaming?.value || 0,
              change: apiItem.gaming?.change || 0
            },
            events: {
              value: apiItem.events?.value || 0,
              change: apiItem.events?.change || 0
            },
            skeleton: false
          };
        }
        
        // Fallback wenn API weniger Daten hat als erwartet
        return baseItem;
      });
    }
    
    // Fallback zu Mock-Daten mit fester Struktur
    console.log('⚠️ No API data available, using mock data with fixed structure');
    const mockData = getMockActivityData(activityFilter);
    
    return baseStructure.map((baseItem, index) => {
      const mockItem = mockData[index];
      
      if (mockItem) {
        return {
          ...baseItem,
          ...mockItem,
          skeleton: false
        };
      }
      
      return baseItem;
    });
    
  }, [activityData, activityFilter, loading]);

  // ✅ DELETED: Duplicate function definitions (moved above)

  // Formatierungshelfer
  const formatValue = (category, value) => {
    if (!value) return '0';
    
    switch (category) {
      case 'voice':
      case 'gaming':
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        if (hours > 0) {
          return hours >= 1000 ? `${(hours / 1000).toFixed(1)}k h` : `${hours}h`;
        }
        return `${minutes}min`;
      case 'messages':
      case 'events':
        return value > 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
      default:
        return value.toString();
    }
  };

  const formatDetailedValue = (category, value) => {
    if (!value) return '0';
    
    switch (category) {
      case 'voice':
      case 'gaming':
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return hours > 0 ? `${hours}h ${minutes}min` : `${minutes} Minuten`;
      case 'messages':
        return `${value} Nachrichten`;
      case 'events':
        return `${value} Events`;
      default:
        return value.toString();
    }
  };

  // ✅ UPDATED: Statistik-Zusammenfassung mit Skeleton-Support
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
        
        // ✅ Skeleton-Rendering
        const isSkeletonMode = loading || currentData[0]?.skeleton;
        
        return (
          <div key={`summary-${category.id}`} className={`text-center p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 ${isSkeletonMode ? 'animate-pulse' : ''}`}>
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${category.gradient} mb-3 shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className={`text-xl font-bold ${themeClasses.text} mb-1`}>
              {isSkeletonMode ? (
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-16 mx-auto" />
              ) : (
                formatValue(category.id, totalValue)
              )}
            </div>
            <div className={`text-xs ${themeClasses.textTertiary} mb-2`}>
              Gesamt ({activityFilter})
            </div>
            <div className={`text-sm ${themeClasses.textSecondary} mb-1`}>
              {isSkeletonMode ? (
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-12 mx-auto" />
              ) : (
                <>⌀ {formatValue(category.id, Math.round(avgValue))}</>
              )}
            </div>
            {maxPeriod && !isSkeletonMode && (
              <div className={`text-xs ${themeClasses.textTertiary}`}>
                🏆 Peak: {maxPeriod}
              </div>
            )}
            {isSkeletonMode && (
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20 mx-auto" />
            )}
          </div>
        );
      })}
    </div>
  );

  // ✅ UPDATED: Balken-Chart mit garantiert stabiler Struktur
  const ActivityChart = () => {
    // ✅ FIXED: Immer gleiche Anzahl Balken, auch wenn Daten fehlen
    const guaranteedDataPoints = 7; // Für weekly immer 7, für monthly 4, etc.
    const dataPointsForFilter = {
      daily: 7,
      weekly: 7,
      monthly: 4,
      alltime: 6
    };
    
    const expectedCount = dataPointsForFilter[activityFilter] || 7;
    
    // ✅ Sicherstellen dass immer die erwartete Anzahl vorhanden ist
    const stabilizedData = [...currentData];
    while (stabilizedData.length < expectedCount) {
      stabilizedData.push({
        period: `placeholder-${stabilizedData.length}`,
        label: `P${stabilizedData.length + 1}`,
        date: new Date(),
        messages: { value: 0, change: 0 },
        voice: { value: 0, change: 0 },
        gaming: { value: 0, change: 0 },
        events: { value: 0, change: 0 },
        skeleton: loading
      });
    }
    
    // ✅ Nur die erwartete Anzahl verwenden (falls mehr Daten kommen als erwartet)
    const finalData = stabilizedData.slice(0, expectedCount);

    const maxValue = Math.max(
      ...finalData.flatMap(period => 
        categories.map(cat => period[cat.id]?.value || 0)
      )
    ) || 1;

    // ✅ Skeleton-Modus prüfen
    const isSkeletonMode = loading || finalData[0]?.skeleton;

    return (
      <div className="space-y-6">
        {categories.map((category) => {
          const Icon = category.icon;
          
          return (
            <div key={category.id} className="space-y-3">
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${category.gradient} shadow-lg mr-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${themeClasses.text}`}>
                      {category.name}
                    </div>
                    <div className={`text-xs ${themeClasses.textTertiary}`}>
                      {category.description}
                    </div>
                  </div>
                </div>
              </div>

              {/* ✅ FIXED: Bar Chart mit garantiert stabiler Struktur */}
              <div className={`flex items-end space-x-2 px-2 transition-none`} style={{ height: '96px', minHeight: '96px' }}>
                {finalData.map((period, index) => {
                  const value = period[category.id]?.value || 0;
                  const change = period[category.id]?.change || 0;
                  const heightPercentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                  
                  return (
                    <div 
                      key={`${category.id}-${activityFilter}-${index}`} // ✅ Stabile Keys
                      className="group relative"
                      style={{ 
                        flex: `1 1 ${100/expectedCount}%`, // ✅ Gleichmäßige Verteilung
                        minWidth: `${100/expectedCount}%`,
                        maxWidth: `${100/expectedCount}%`
                      }}
                    >
                      {isSkeletonMode ? (
                        // ✅ Skeleton-Bar mit fester Breite
                        <div 
                          className="w-full rounded-t-lg bg-gray-300 dark:bg-gray-600 animate-pulse transition-none"
                          style={{ 
                            height: `${30 + (index * 10)}%`, // Variierend für realistisches Aussehen
                            minHeight: '8px'
                          }}
                        />
                      ) : (
                        <div 
                          className={`w-full transition-all duration-700 ease-out rounded-t-lg bg-gradient-to-t ${category.gradient} relative overflow-hidden shadow-sm hover:shadow-lg group-hover:scale-105 cursor-pointer`}
                          style={{ 
                            height: `${heightPercentage}%`, 
                            minHeight: value > 0 ? '4px' : '0px'
                          }}
                          onClick={() => setExpandedPeriod(expandedPeriod === index ? null : index)}
                        >
                          {/* Shine effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover:animate-pulse" />
                        </div>
                      )}
                      
                      {/* Value on hover - nur wenn nicht skeleton */}
                      {!isSkeletonMode && value > 0 && (
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap z-10">
                          {formatDetailedValue(category.id, value)}
                          {change !== 0 && (
                            <div className={`text-xs ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {change > 0 ? '+' : ''}{formatValue(category.id, change)}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Period label - immer gleiche Struktur */}
                      <div className={`text-center mt-2 text-xs font-medium ${themeClasses.textSecondary}`} style={{ minHeight: '16px' }}>
                        {isSkeletonMode ? (
                          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-6 mx-auto animate-pulse" />
                        ) : (
                          period.label || `P${index + 1}`
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ✅ REMOVED: Separate Loading State (jetzt integriert)
  return (
    <div className={`${themeClasses.cardBg} rounded-3xl p-6 border ${themeClasses.cardBorder} shadow-xl min-h-[600px]`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
        
        {/* ✅ UPDATED: Filter Controls mit Navigation */}
        <DatePicker
          activityFilter={activityFilter}
          setActivityFilter={setActivityFilter}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          themeClasses={themeClasses}
          isDarkMode={isDarkMode}
          // ✅ NEW: Navigation props
          selectedWeek={selectedWeek}
          selectedMonth={selectedMonth}
          navigateWeek={navigateWeek}
          navigateMonth={navigateMonth}
          goToCurrentWeek={goToCurrentWeek}
          goToCurrentMonth={goToCurrentMonth}
        />
      </div>

      {/* ✅ Loading Overlay nur für Datenaktualisierung */}
      <div className="relative">
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

        {/* Stats Summary */}
        <StatsSummary />

        {/* Activity Charts */}
        <ActivityChart />
      </div>

      {/* Data Info */}
      <div className="mt-6 text-center">
        <span className={`text-xs ${themeClasses.textTertiary}`}>
          {loading ? '⏳ Daten werden geladen...' :
           activityData && activityData.length > 0 
            ? `✅ Echte Daten von API • ${currentData.length} Datenpunkte` 
            : '⚠️ Mock-Daten (API nicht verfügbar)'}
        </span>
      </div>
    </div>
  );
};

export default ActivityOverview;