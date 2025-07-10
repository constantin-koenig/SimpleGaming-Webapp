import React, { useState, useMemo } from 'react';
import { Activity, Gamepad2, Users, Headphones, MessageSquare, ChevronDown, TrendingUp, Zap, BarChart3, Calendar } from 'lucide-react';
import DatePicker from './DatePicker';

const ActivityOverview = ({ 
  activityFilter, 
  setActivityFilter, 
  activityData, 
  themeClasses, 
  isDarkMode,
  userJoinDate // Neuer Prop für Account-Erstellungsdatum
}) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Hilfsfunktion für Kalenderwoche - für Allzeit-Funktionalität
  const calculateWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Dynamische Zeitperioden basierend auf Account-Alter (für Allzeit)
  const getTimePeriodsConfig = useMemo(() => {
    if (activityFilter !== 'alltime' || !userJoinDate) {
      return { type: 'months', labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun'] };
    }

    const joinDate = new Date(userJoinDate);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - joinDate.getFullYear()) * 12 + now.getMonth() - joinDate.getMonth();
    
    if (monthsDiff <= 3) {
      const weeks = [];
      for (let i = Math.min(monthsDiff * 4, 12); i >= 0; i--) {
        const weekDate = new Date(now);
        weekDate.setDate(weekDate.getDate() - (i * 7));
        weeks.push(`W${calculateWeekNumber(weekDate)}`);
      }
      return { type: 'weeks', labels: weeks };
    } else if (monthsDiff <= 12) {
      const months = [];
      for (let i = monthsDiff; i >= 0; i--) {
        const monthDate = new Date(now);
        monthDate.setMonth(monthDate.getMonth() - i);
        months.push(monthDate.toLocaleDateString('de-DE', { month: 'short' }));
      }
      return { type: 'months', labels: months };
    } else {
      const quarters = [];
      const quartersCount = Math.min(Math.ceil(monthsDiff / 3), 12);
      for (let i = quartersCount; i >= 0; i--) {
        const quarterDate = new Date(now);
        quarterDate.setMonth(quarterDate.getMonth() - (i * 3));
        const quarter = Math.floor(quarterDate.getMonth() / 3) + 1;
        quarters.push(`Q${quarter}`);
      }
      return { type: 'quarters', labels: quarters };
    }
  }, [userJoinDate, activityFilter]);

  // Aktivitätskategorien definieren mit Gradients
  const categories = [
    {
      id: 'ingame',
      name: 'Gaming',
      icon: Gamepad2,
      color: '#8B5CF6',
      gradient: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500',
      description: 'Zeit in Spielen verbracht'
    },
    {
      id: 'voice',
      name: 'Voice',
      icon: Headphones,
      color: '#10B981',
      gradient: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500',
      description: 'Zeit im Sprachchat'
    },
    {
      id: 'online',
      name: 'Online',
      icon: Users,
      color: '#3B82F6',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500',
      description: 'Online-Zeit insgesamt'
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: MessageSquare,
      color: '#F59E0B',
      gradient: 'from-yellow-500 to-orange-500',
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

  // Mock-Daten für verschiedene Zeiträume (ohne Daily)
  const getMockActivityData = (timeframe) => {
    const mockData = {
      weekly: [
        { label: 'Mo', ingame: { value: 2880, details: ['CS2: 1800min', 'Valorant: 1080min'] }, voice: { value: 1440, details: ['Gaming Voice: 1440min'] }, online: { value: 4320, details: ['72h online'] }, messages: { value: 1234, details: ['Verschiedene Channels'] } },
        { label: 'Di', ingame: { value: 3240, details: ['Valorant: 2160min', 'Minecraft: 1080min'] }, voice: { value: 1800, details: ['Gaming Voice: 1800min'] }, online: { value: 5040, details: ['84h online'] }, messages: { value: 987, details: ['Verschiedene Channels'] } },
        { label: 'Mi', ingame: { value: 2160, details: ['Minecraft: 1440min', 'CS2: 720min'] }, voice: { value: 1080, details: ['Gaming Voice: 1080min'] }, online: { value: 3600, details: ['60h online'] }, messages: { value: 1456, details: ['Verschiedene Channels'] } },
        { label: 'Do', ingame: { value: 3600, details: ['CS2: 2400min', 'Valorant: 1200min'] }, voice: { value: 2160, details: ['Gaming Voice: 2160min'] }, online: { value: 5760, details: ['96h online'] }, messages: { value: 1789, details: ['Verschiedene Channels'] } },
        { label: 'Fr', ingame: { value: 4320, details: ['Valorant: 2880min', 'CS2: 1440min'] }, voice: { value: 2520, details: ['Gaming Voice: 2520min'] }, online: { value: 6480, details: ['108h online'] }, messages: { value: 2345, details: ['Verschiedene Channels'] } },
        { label: 'Sa', ingame: { value: 5400, details: ['CS2: 3600min', 'Minecraft: 1800min'] }, voice: { value: 3240, details: ['Gaming Voice: 3240min'] }, online: { value: 8640, details: ['144h online'] }, messages: { value: 1876, details: ['Verschiedene Channels'] } },
        { label: 'So', ingame: { value: 4680, details: ['Minecraft: 2880min', 'Valorant: 1800min'] }, voice: { value: 2880, details: ['Gaming Voice: 2880min'] }, online: { value: 7200, details: ['120h online'] }, messages: { value: 1543, details: ['Verschiedene Channels'] } }
      ],
      monthly: [
        { label: 'W1', ingame: { value: 10800, details: ['CS2: 6480min', 'Valorant: 4320min'] }, voice: { value: 7200, details: ['Gaming Voice: 7200min'] }, online: { value: 18000, details: ['300h online'] }, messages: { value: 3456, details: ['Verschiedene Channels'] } },
        { label: 'W2', ingame: { value: 12960, details: ['Valorant: 8640min', 'Minecraft: 4320min'] }, voice: { value: 8640, details: ['Gaming Voice: 8640min'] }, online: { value: 21600, details: ['360h online'] }, messages: { value: 4321, details: ['Verschiedene Channels'] } },
        { label: 'W3', ingame: { value: 11520, details: ['Minecraft: 7200min', 'CS2: 4320min'] }, voice: { value: 7920, details: ['Gaming Voice: 7920min'] }, online: { value: 19440, details: ['324h online'] }, messages: { value: 3987, details: ['Verschiedene Channels'] } },
        { label: 'W4', ingame: { value: 13680, details: ['CS2: 9000min', 'Valorant: 4680min'] }, voice: { value: 9360, details: ['Gaming Voice: 9360min'] }, online: { value: 23040, details: ['384h online'] }, messages: { value: 4567, details: ['Verschiedene Channels'] } }
      ],
      alltime: [
        { label: 'Jan', ingame: { value: 7200, details: ['CS2: 4320min', 'Valorant: 2880min'] }, voice: { value: 4800, details: ['Gaming Voice: 4800min'] }, online: { value: 10800, details: ['180h online'] }, messages: { value: 2340, details: ['Verschiedene Channels'] } },
        { label: 'Feb', ingame: { value: 8640, details: ['Valorant: 5760min', 'Minecraft: 2880min'] }, voice: { value: 5760, details: ['Gaming Voice: 5760min'] }, online: { value: 12960, details: ['216h online'] }, messages: { value: 2890, details: ['Verschiedene Channels'] } },
        { label: 'Mar', ingame: { value: 9360, details: ['Minecraft: 6480min', 'CS2: 2880min'] }, voice: { value: 5040, details: ['Gaming Voice: 5040min'] }, online: { value: 11520, details: ['192h online'] }, messages: { value: 3420, details: ['Verschiedene Channels'] } },
        { label: 'Apr', ingame: { value: 8640, details: ['CS2: 5760min', 'Valorant: 2880min'] }, voice: { value: 6240, details: ['Gaming Voice: 6240min'] }, online: { value: 13680, details: ['228h online'] }, messages: { value: 2750, details: ['Verschiedene Channels'] } },
        { label: 'Mai', ingame: { value: 9120, details: ['Valorant: 6240min', 'CS2: 2880min'] }, voice: { value: 5520, details: ['Gaming Voice: 5520min'] }, online: { value: 12240, details: ['204h online'] }, messages: { value: 3890, details: ['Verschiedene Channels'] } },
        { label: 'Jun', ingame: { value: 7680, details: ['CS2: 4800min', 'Minecraft: 2880min'] }, voice: { value: 4320, details: ['Gaming Voice: 4320min'] }, online: { value: 10080, details: ['168h online'] }, messages: { value: 2156, details: ['Verschiedene Channels'] } }
      ]
    };
    
    // Für Allzeit: Passe Labels an Account-Alter an
    if (timeframe === 'alltime') {
      const baseData = mockData.alltime;
      const config = getTimePeriodsConfig;
      
      return baseData.slice(0, config.labels.length).map((period, index) => ({
        ...period,
        label: config.labels[index] || period.label
      }));
    }
    
    return mockData[timeframe] || mockData.weekly;
  };

  const currentData = getCurrentActivityData();

  // Formatierungshelfer
  const formatValue = (category, value) => {
    if (!value) return '0';
    
    switch (category) {
      case 'ingame':
      case 'voice':
      case 'online':
        const hours = Math.floor(value / 60);
        return hours >= 1000 ? `${(hours / 1000).toFixed(1)}k h` : `${hours}h`;
      case 'messages':
        return value > 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
      default:
        return value.toString();
    }
  };

  const formatDetailedValue = (category, value) => {
    if (!value) return '0';
    
    switch (category) {
      case 'ingame':
      case 'voice':
      case 'online':
        const hours = Math.floor(value / 60);
        const minutes = value % 60;
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      case 'messages':
        return value.toLocaleString('de-DE');
      default:
        return value.toString();
    }
  };

  // Moderne Bar Chart für Weekly/Monthly
  const ModernActivityChart = () => {
    const maxValues = {};
    categories.forEach(category => {
      const values = currentData.map(period => period[category.id]?.value || 0);
      maxValues[category.id] = Math.max(...values, 1);
    });

    return (
      <div className="space-y-8 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          const values = currentData.map(period => period[category.id]?.value || 0);
          const maxValue = Math.max(...values, 1);
          const totalValue = values.reduce((sum, val) => sum + val, 0);
          const isVisible = selectedCategory === null || selectedCategory === category.id;
          
          return (
            <div 
              key={category.id} 
              className={`transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-50'}`}
              onMouseEnter={() => setSelectedCategory(category.id)}
              onMouseLeave={() => setSelectedCategory(null)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-r ${category.gradient} shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className={`text-lg font-bold ${themeClasses.text}`}>{category.name}</span>
                    <div className={`text-sm ${themeClasses.textSecondary}`}>
                      {formatValue(category.id, totalValue)} gesamt
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3 h-16">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="flex-1 relative group cursor-pointer"
                    onClick={() => setExpandedPeriod(expandedPeriod === index ? null : index)}
                  >
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-xl overflow-hidden shadow-sm">
                      <div
                        className={`w-full transition-all duration-700 ease-out rounded-xl bg-gradient-to-t ${category.gradient} relative overflow-hidden shadow-inner`}
                        style={{
                          height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`,
                          transform: `translateY(${maxValue > 0 ? 100 - (value / maxValue) * 100 : 100}%)`
                        }}
                      >
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-full group-hover:animate-pulse" />
                      </div>
                    </div>
                    
                    {/* Value label on hover */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                      {formatDetailedValue(category.id, value)}
                    </div>
                    
                    {/* Period label */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-center">
                      {currentData[index]?.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`${themeClasses.cardBg} rounded-3xl p-6 border ${themeClasses.cardBorder} shadow-xl`}>
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
              {activityFilter === 'weekly' ? 'Tägliche Aktivitäten' :
               activityFilter === 'monthly' ? 'Wöchentliche Trends' :
               getTimePeriodsConfig.type === 'weeks' ? 'Wöchentliche Trends' :
               getTimePeriodsConfig.type === 'months' ? 'Monatliche Trends' :
               'Quartalsweise Trends'}
            </span>
          </div>
        </div>
        
        {/* Info Badge */}
        <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-4 py-2 rounded-xl border border-purple-200 dark:border-purple-700">
          <BarChart3 className="w-4 h-4 text-purple-600" />
          <span className={`text-sm font-medium ${themeClasses.text}`}>
            Balkendiagramm
          </span>
        </div>
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

      {/* Activity Legend */}
      <div className="flex items-center justify-center space-x-8 mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
        {categories.map((category) => {
          const Icon = category.icon;
          const totalValue = currentData.reduce((sum, period) => sum + (period[category.id]?.value || 0), 0);
          
          return (
            <div
              key={category.id}
              className={`flex items-center space-x-3 cursor-pointer transition-all duration-200 ${
                selectedCategory === null || selectedCategory === category.id 
                  ? 'opacity-100 scale-100' : 'opacity-60 scale-95'
              }`}
              onMouseEnter={() => setSelectedCategory(category.id)}
              onMouseLeave={() => setSelectedCategory(null)}
            >
              <div className={`p-2 rounded-lg bg-gradient-to-r ${category.gradient} shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <div className={`text-sm font-semibold ${themeClasses.text}`}>
                  {category.name}
                </div>
                <div className={`text-xs ${themeClasses.textTertiary}`}>
                  {formatValue(category.id, totalValue)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Moderne Charts für Weekly/Monthly/Alltime */}
      {/* Account Age Info - nur für Allzeit */}
      {activityFilter === 'alltime' && userJoinDate && (
        <div className={`mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200 dark:border-blue-700`}>
          <div className="flex items-center text-sm">
            <Calendar className="w-5 h-5 mr-3 text-blue-500" />
            <div>
              <span className={`font-medium ${themeClasses.text}`}>
                Account seit {new Date(userJoinDate).toLocaleDateString('de-DE', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
              <span className={`ml-3 ${themeClasses.textTertiary}`}>
                • {((new Date() - new Date(userJoinDate)) / (1000 * 60 * 60 * 24)).toFixed(0)} Tage aktiv
              </span>
            </div>
          </div>
        </div>
      )}
      
      <ModernActivityChart />
      
      {/* Footer Info - nur für Allzeit */}
      {activityFilter === 'alltime' && (
        <div className="mt-6 text-center">
          <span className={`text-xs ${themeClasses.textTertiary}`}>
            ✨ Darstellung automatisch angepasst an Account-Alter • 
            {getTimePeriodsConfig.type === 'weeks' && ' Wöchentliche Auflösung für neue Accounts'}
            {getTimePeriodsConfig.type === 'months' && ' Monatliche Auflösung für etablierte Accounts'}
            {getTimePeriodsConfig.type === 'quarters' && ' Quartalsweise Auflösung für langjährige Accounts'}
          </span>
        </div>
      )}

      {/* Selected Period Details - Für Weekly/Monthly/Alltime */}
      {(activityFilter === 'weekly' || activityFilter === 'monthly' || activityFilter === 'alltime') && expandedPeriod !== null && currentData[expandedPeriod] && (
        <div className="mt-8 p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-3xl border border-blue-200 dark:border-blue-700/50 shadow-xl">
          
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg mr-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h4 className={`text-2xl font-bold ${themeClasses.text} mb-1`}>
                  {currentData[expandedPeriod].label}
                </h4>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Detaillierte Aktivitätsanalyse für diesen {
                    activityFilter === 'weekly' ? 'Tag' : 
                    activityFilter === 'monthly' ? 'Zeitraum' :
                    getTimePeriodsConfig.type === 'weeks' ? 'Zeitraum' :
                    getTimePeriodsConfig.type === 'months' ? 'Monat' :
                    'Quartal'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={() => setExpandedPeriod(null)}
              className={`group px-4 py-2 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-all duration-200 rounded-xl hover:bg-white/50 dark:hover:bg-gray-800/50 flex items-center space-x-2`}
            >
              <span className="text-sm font-medium">Schließen</span>
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center group-hover:bg-gray-300 dark:group-hover:bg-gray-600 transition-colors">
                <span className="text-xs">✕</span>
              </div>
            </button>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {categories.map((category) => {
              const Icon = category.icon;
              const currentValue = currentData[expandedPeriod][category.id]?.value || 0;
              const previousValue = expandedPeriod > 0 ? currentData[expandedPeriod - 1][category.id]?.value || 0 : null;
              const trend = previousValue ? ((currentValue - previousValue) / previousValue) * 100 : null;
              
              return (
                <div key={category.id} className="group relative">
                  {/* Card */}
                  <div className="h-full p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    
                    {/* Icon */}
                    <div className="flex items-center justify-center mb-4">
                      <div className={`p-4 rounded-2xl bg-gradient-to-r ${category.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    {/* Main Value */}
                    <div className="text-center mb-4">
                      <div className={`text-3xl font-bold ${themeClasses.text} mb-2`}>
                        {formatDetailedValue(category.id, currentValue)}
                      </div>
                      <div className={`text-sm font-medium ${themeClasses.textSecondary}`}>
                        {category.name}
                      </div>
                    </div>
                    
                    {/* Trend Indicator */}
                    {trend !== null && (
                      <div className="flex items-center justify-center">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          trend > 0 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                            : trend < 0 
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          <span className="text-sm">
                            {trend > 0 ? '↗' : trend < 0 ? '↘' : '→'}
                          </span>
                          <span>
                            {Math.abs(trend).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* No trend message */}
                    {trend === null && (
                      <div className="flex items-center justify-center">
                        <div className={`px-3 py-1 rounded-full text-xs ${themeClasses.textTertiary} bg-gray-100 dark:bg-gray-800`}>
                          Erster Zeitraum
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Hover Glow Effect */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10 blur-xl`} />
                </div>
              );
            })}
          </div>

          {/* Game Details Section */}
          {currentData[expandedPeriod].ingame?.details && (
            <div className="p-6 bg-white/70 dark:bg-gray-800/70 rounded-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm">
              <div className="flex items-center mb-6">
                <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 mr-3">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h5 className={`text-lg font-bold ${themeClasses.text}`}>
                    Gaming Breakdown
                  </h5>
                  <p className={`text-sm ${themeClasses.textSecondary}`}>
                    Detaillierte Aufschlüsselung der Spielzeit
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentData[expandedPeriod].ingame.details.map((detail, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0" />
                    <span className={`text-sm font-medium ${themeClasses.text}`}>
                      {detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const values = currentData.map(period => period[category.id]?.value || 0);
          const totalValue = values.reduce((sum, val) => sum + val, 0);
          const avgValue = values.length > 0 ? totalValue / values.length : 0;
          const maxValue = Math.max(...values);
          const maxPeriodIndex = values.indexOf(maxValue);
          const maxPeriod = currentData[maxPeriodIndex]?.label;
          
          return (
            <div key={`summary-${category.id}`} className={`text-center p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200`}>
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${category.gradient} mb-3 shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className={`text-xl font-bold ${themeClasses.text} mb-1`}>
                {formatValue(category.id, totalValue)}
              </div>
              <div className={`text-xs ${themeClasses.textTertiary} mb-2`}>
                Gesamt
              </div>
              <div className={`text-sm ${themeClasses.textSecondary} mb-1`}>
                ⌀ {formatValue(category.id, avgValue)}
              </div>
              {maxPeriod && (
                <div className={`text-xs ${themeClasses.textTertiary}`}>
                  🏆 Peak: {maxPeriod}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityOverview;