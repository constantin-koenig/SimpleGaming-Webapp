import React, { useState } from 'react';
import { Activity, Gamepad2, Users, Headphones, MessageSquare, ChevronDown, TrendingUp } from 'lucide-react';
import DatePicker from './DatePicker';
import DailyTimeline from './DailyTimeline';
import AlltimeTimeline from './AlltimeTimeline';

const ActivityOverview = ({ 
  activityFilter, 
  setActivityFilter, 
  activityData, 
  themeClasses, 
  isDarkMode 
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Aktivitätskategorien definieren
  const categories = [
    {
      id: 'ingame',
      name: 'Ingame',
      icon: Gamepad2,
      color: '#8B5CF6',
      bgColor: 'bg-purple-500',
      description: 'Zeit in Spielen verbracht'
    },
    {
      id: 'voice',
      name: 'Voice Chat',
      icon: Headphones,
      color: '#10B981',
      bgColor: 'bg-green-500',
      description: 'Zeit im Sprachchat'
    },
    {
      id: 'online',
      name: 'Online',
      icon: Users,
      color: '#3B82F6',
      bgColor: 'bg-blue-500',
      description: 'Online-Zeit insgesamt'
    },
    {
      id: 'messages',
      name: 'Nachrichten',
      icon: MessageSquare,
      color: '#F59E0B',
      bgColor: 'bg-yellow-500',
      description: 'Gesendete Nachrichten'
    }
  ];

  // Sichere Daten-Extraktion
  const getCurrentActivityData = () => {
    if (!activityData || typeof activityData !== 'object') {
      return getMockActivityData(activityFilter);
    }
    
    const timeframeData = activityData[activityFilter];
    if (Array.isArray(timeframeData)) {
      return timeframeData;
    }
    
    return getMockActivityData(activityFilter);
  };

  // Mock-Daten für verschiedene Zeiträume
  const getMockActivityData = (timeframe) => {
    const mockData = {
      daily: [
        { 
          label: '00:00', 
          ingame: { value: 0, details: [] },
          voice: { value: 0, details: [] },
          online: { value: 30, details: ['Discord aktiv'] },
          messages: { value: 5, details: ['#general: 3', '#gaming: 2'] }
        }
      ],
      weekly: [
        { 
          label: 'Mo', 
          ingame: { value: 180, details: ['Valorant: 120min', 'Minecraft: 60min'] },
          voice: { value: 150, details: ['Gaming Voice: 150min'] },
          online: { value: 420, details: ['7h online'] },
          messages: { value: 145, details: ['#general: 85', '#gaming: 60'] }
        },
        { 
          label: 'Di', 
          ingame: { value: 240, details: ['CS2: 180min', 'Rust: 60min'] },
          voice: { value: 180, details: ['Gaming Voice: 180min'] },
          online: { value: 480, details: ['8h online'] },
          messages: { value: 189, details: ['#general: 120', '#cs2: 69'] }
        },
        { 
          label: 'Mi', 
          ingame: { value: 300, details: ['Minecraft: 240min', 'Valorant: 60min'] },
          voice: { value: 120, details: ['Gaming Voice: 120min'] },
          online: { value: 360, details: ['6h online'] },
          messages: { value: 98, details: ['#general: 70', '#minecraft: 28'] }
        },
        { 
          label: 'Do', 
          ingame: { value: 420, details: ['Valorant: 300min', 'CS2: 120min'] },
          voice: { value: 300, details: ['Gaming Voice: 300min'] },
          online: { value: 540, details: ['9h online'] },
          messages: { value: 234, details: ['#general: 156', '#valorant: 78'] }
        },
        { 
          label: 'Fr', 
          ingame: { value: 480, details: ['CS2: 360min', 'Rust: 120min'] },
          voice: { value: 360, details: ['Gaming Voice: 360min'] },
          online: { value: 600, details: ['10h online'] },
          messages: { value: 312, details: ['#general: 200', '#cs2: 112'] }
        },
        { 
          label: 'Sa', 
          ingame: { value: 540, details: ['Minecraft: 300min', 'Valorant: 240min'] },
          voice: { value: 420, details: ['Gaming Voice: 420min'] },
          online: { value: 720, details: ['12h online'] },
          messages: { value: 156, details: ['#general: 100', '#minecraft: 56'] }
        },
        { 
          label: 'So', 
          ingame: { value: 360, details: ['Valorant: 240min', 'CS2: 120min'] },
          voice: { value: 240, details: ['Gaming Voice: 240min'] },
          online: { value: 480, details: ['8h online'] },
          messages: { value: 89, details: ['#general: 65', '#valorant: 24'] }
        }
      ],
      monthly: [
        { 
          label: 'W1', 
          ingame: { value: 1800, details: ['Valorant: 1080min', 'CS2: 720min'] },
          voice: { value: 1200, details: ['Gaming Voice: 1200min'] },
          online: { value: 2520, details: ['42h online'] },
          messages: { value: 890, details: ['Verschiedene Channels'] }
        },
        { 
          label: 'W2', 
          ingame: { value: 2160, details: ['CS2: 1440min', 'Minecraft: 720min'] },
          voice: { value: 1440, details: ['Gaming Voice: 1440min'] },
          online: { value: 3000, details: ['50h online'] },
          messages: { value: 1120, details: ['Verschiedene Channels'] }
        },
        { 
          label: 'W3', 
          ingame: { value: 1920, details: ['Minecraft: 1200min', 'Valorant: 720min'] },
          voice: { value: 1080, details: ['Gaming Voice: 1080min'] },
          online: { value: 2400, details: ['40h online'] },
          messages: { value: 756, details: ['Verschiedene Channels'] }
        },
        { 
          label: 'W4', 
          ingame: { value: 2040, details: ['Valorant: 1200min', 'CS2: 840min'] },
          voice: { value: 1320, details: ['Gaming Voice: 1320min'] },
          online: { value: 2760, details: ['46h online'] },
          messages: { value: 934, details: ['Verschiedene Channels'] }
        }
      ],
      alltime: [
        { 
          label: 'Jan', 
          ingame: { value: 7200, details: ['CS2: 4320min', 'Valorant: 2880min'] },
          voice: { value: 4800, details: ['Gaming Voice: 4800min'] },
          online: { value: 10800, details: ['180h online'] },
          messages: { value: 2340, details: ['Verschiedene Channels'] }
        },
        { 
          label: 'Feb', 
          ingame: { value: 8640, details: ['Valorant: 5760min', 'Minecraft: 2880min'] },
          voice: { value: 5760, details: ['Gaming Voice: 5760min'] },
          online: { value: 12960, details: ['216h online'] },
          messages: { value: 2890, details: ['Verschiedene Channels'] }
        },
        { 
          label: 'Mar', 
          ingame: { value: 9360, details: ['Minecraft: 6480min', 'CS2: 2880min'] },
          voice: { value: 5040, details: ['Gaming Voice: 5040min'] },
          online: { value: 11520, details: ['192h online'] },
          messages: { value: 3420, details: ['Verschiedene Channels'] }
        },
        { 
          label: 'Apr', 
          ingame: { value: 8640, details: ['CS2: 5760min', 'Valorant: 2880min'] },
          voice: { value: 6240, details: ['Gaming Voice: 6240min'] },
          online: { value: 13680, details: ['228h online'] },
          messages: { value: 2750, details: ['Verschiedene Channels'] }
        },
        { 
          label: 'Mai', 
          ingame: { value: 9120, details: ['Valorant: 6240min', 'CS2: 2880min'] },
          voice: { value: 5520, details: ['Gaming Voice: 5520min'] },
          online: { value: 12240, details: ['204h online'] },
          messages: { value: 3890, details: ['Verschiedene Channels'] }
        },
        { 
          label: 'Jun', 
          ingame: { value: 7680, details: ['CS2: 4800min', 'Minecraft: 2880min'] },
          voice: { value: 4320, details: ['Gaming Voice: 4320min'] },
          online: { value: 10080, details: ['168h online'] },
          messages: { value: 2156, details: ['Verschiedene Channels'] }
        }
      ]
    };
    
    return mockData[timeframe] || mockData.weekly;
  };

  const currentData = getCurrentActivityData();

  // Formatierungshelfer
  const formatValue = (category, value) => {
    switch (category) {
      case 'ingame':
      case 'voice':
      case 'online':
        return `${Math.floor(value / 60)}h ${value % 60}m`;
      case 'messages':
        return value.toString();
      default:
        return value.toString();
    }
  };

  // Detailansicht für ausgewählte Kategorie
  const showDetailView = (category, periodIndex) => {
    setSelectedCategory(category);
    setExpandedPeriod(periodIndex);
  };

  return (
    <div className={`${themeClasses.cardBg} rounded-2xl p-6 border ${themeClasses.cardBorder} shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-bold ${themeClasses.text} flex items-center`}>
          <Activity className="w-5 h-5 mr-2 text-purple-500" />
          Aktivitäts-Übersicht
        </h3>
      </div>

      {/* Date Picker Component */}
      <DatePicker
        activityFilter={activityFilter}
        setActivityFilter={setActivityFilter}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        themeClasses={themeClasses}
        isDarkMode={isDarkMode}
      />

      {/* Conditional Rendering: Timeline für Daily, Allzeit-Timeline für Allzeit, Charts für andere */}
      {activityFilter === 'daily' ? (
        <DailyTimeline
          dailyData={currentData}
          selectedDate={selectedDate}
          themeClasses={themeClasses}
          isDarkMode={isDarkMode}
        />
      ) : activityFilter === 'alltime' ? (
        <AlltimeTimeline
          data={currentData}
          themeClasses={themeClasses}
          isDarkMode={isDarkMode}
        />
      ) : (
        <>
          {/* Kategorie-Legende */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {categories.map((category) => {
              const Icon = category.icon;
              const totalValue = currentData.reduce((sum, period) => sum + (period[category.id]?.value || 0), 0);
              
              return (
                <div
                  key={category.id}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                    selectedCategory === category.id
                      ? `border-[${category.color}] bg-[${category.color}]/10`
                      : `border-gray-300 dark:border-gray-600 hover:border-[${category.color}]/50`
                  }`}
                  onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: category.color }} />
                    <span className={`text-sm font-medium ${themeClasses.text}`}>{category.name}</span>
                  </div>
                  <div className={`text-lg font-bold ${themeClasses.text}`}>
                    {formatValue(category.id, totalValue)}
                  </div>
                  <div className={`text-xs ${themeClasses.textTertiary}`}>
                    {category.description}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Aktivitäts-Chart */}
          <div className="mb-6">
            <div className={`grid gap-2 ${
              currentData.length <= 5 ? 'grid-cols-5' : 
              currentData.length <= 7 ? 'grid-cols-7' : 
              'grid-cols-12'
            }`}>
              {currentData.map((period, periodIndex) => (
                <div key={`${activityFilter}-${periodIndex}`} className="text-center">
                  <div className={`text-xs ${themeClasses.textTertiary} mb-2 font-medium`}>
                    {period.label}
                  </div>
                  <div 
                    className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-1 h-32 flex flex-col justify-end cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => setExpandedPeriod(expandedPeriod === periodIndex ? null : periodIndex)}
                  >
                    <div className="flex-1 flex flex-col justify-end space-y-0.5">
                      {categories.map((category) => {
                        const value = period[category.id]?.value || 0;
                        const totalValue = categories.reduce((sum, cat) => sum + (period[cat.id]?.value || 0), 0);
                        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
                        const heightPercentage = totalValue > 0 ? (value / totalValue) * 85 : 0; // 85% max height for spacing
                        const isSelected = selectedCategory === category.id || selectedCategory === null;
                        
                        return (
                          <div
                            key={`${category.id}-${periodIndex}`}
                            className={`rounded-sm transition-all duration-300 ${
                              isSelected ? 'opacity-100' : 'opacity-30'
                            } ${selectedCategory === category.id ? 'shadow-md scale-105 z-10 relative' : ''}`}
                            style={{
                              backgroundColor: category.color,
                              height: `${Math.max(2, heightPercentage)}%`,
                              minHeight: value > 0 ? '3px' : '0px'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              showDetailView(category.id, periodIndex);
                            }}
                            title={`${category.name}: ${formatValue(category.id, value)} (${percentage.toFixed(1)}%)`}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Total Value Display */}
                    <div className={`text-xs ${themeClasses.textTertiary} mt-1 font-medium`}>
                      {(() => {
                        const totalValue = categories.reduce((sum, cat) => sum + (period[cat.id]?.value || 0), 0);
                        // Zeige die dominante Aktivität oder Gesamtzeit
                        const dominantCategory = categories.reduce((prev, current) => 
                          (period[current.id]?.value || 0) > (period[prev.id]?.value || 0) ? current : prev
                        );
                        const dominantValue = period[dominantCategory.id]?.value || 0;
                        
                        if (totalValue === 0) return '0';
                        
                        // Für Zeit-basierte Aktivitäten (ingame, voice, online) zeige Stunden
                        if (['ingame', 'voice', 'online'].includes(dominantCategory.id)) {
                          return formatValue(dominantCategory.id, totalValue);
                        }
                        // Für Nachrichten zeige Anzahl
                        return totalValue.toString();
                      })()}
                    </div>
                    
                    {/* Erweiterte Ansicht für Periode */}
                    {expandedPeriod === periodIndex && (
                      <div className={`absolute top-full left-0 right-0 mt-2 p-3 ${themeClasses.cardBg} rounded-lg border ${themeClasses.cardBorder} shadow-lg z-20 min-w-max`}>
                        <h4 className={`font-semibold ${themeClasses.text} mb-2`}>{period.label}</h4>
                        {categories.map((category) => {
                          const data = period[category.id];
                          const Icon = category.icon;
                          const totalValue = categories.reduce((sum, cat) => sum + (period[cat.id]?.value || 0), 0);
                          const percentage = totalValue > 0 ? ((data?.value || 0) / totalValue) * 100 : 0;
                          
                          return (
                            <div key={category.id} className="flex items-center justify-between py-1">
                              <div className="flex items-center space-x-2">
                                <Icon className="w-3 h-3" style={{ color: category.color }} />
                                <span className={`text-xs ${themeClasses.textSecondary}`}>{category.name}</span>
                              </div>
                              <div className="text-right">
                                <span className={`text-xs font-medium ${themeClasses.text}`}>
                                  {formatValue(category.id, data?.value || 0)}
                                </span>
                                <span className={`text-xs ${themeClasses.textTertiary} ml-2`}>
                                  ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailansicht für ausgewählte Kategorie */}
          {selectedCategory && (
            <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border ${themeClasses.cardBorder}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {(() => {
                    const category = categories.find(c => c.id === selectedCategory);
                    const Icon = category.icon;
                    return (
                      <>
                        <Icon className="w-4 h-4" style={{ color: category.color }} />
                        <h4 className={`font-semibold ${themeClasses.text}`}>{category.name} - Details</h4>
                      </>
                    );
                  })()}
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`text-xs ${themeClasses.textSecondary} hover:${themeClasses.text}`}
                >
                  Schließen
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {currentData.map((period, index) => {
                  const data = period[selectedCategory];
                  const category = categories.find(c => c.id === selectedCategory);
                  
                  if (!data || data.value === 0) return null;
                  
                  return (
                    <div
                      key={`detail-${index}`}
                      className={`p-3 bg-white dark:bg-gray-700 rounded border ${themeClasses.cardBorder} hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${themeClasses.text}`}>{period.label}</span>
                        <span className={`text-sm font-bold`} style={{ color: category.color }}>
                          {formatValue(selectedCategory, data.value)}
                        </span>
                      </div>
                      {data.details && data.details.length > 0 && (
                        <div className="space-y-1">
                          {data.details.map((detail, detailIndex) => (
                            <div key={detailIndex} className={`text-xs ${themeClasses.textTertiary}`}>
                              • {detail}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Statistik-Zusammenfassung */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const totalValue = currentData.reduce((sum, period) => sum + (period[category.id]?.value || 0), 0);
              const avgValue = totalValue / (currentData.length || 1);
              
              return (
                <div key={`summary-${category.id}`} className={`text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg`}>
                  <Icon className="w-6 h-6 mx-auto mb-1" style={{ color: category.color }} />
                  <div className={`text-lg font-bold ${themeClasses.text}`}>
                    {formatValue(category.id, totalValue)}
                  </div>
                  <div className={`text-xs ${themeClasses.textTertiary}`}>
                    Ø {formatValue(category.id, avgValue)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityOverview;