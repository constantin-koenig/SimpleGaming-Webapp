import React, { useState } from 'react';
import { TrendingUp, Activity, Gamepad2, MessageSquare, Headphones, Users, BarChart3, Calendar } from 'lucide-react';

const AlltimeTimeline = ({ 
  data,
  themeClasses, 
  isDarkMode 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Activity-Kategorien
  const categories = [
    {
      id: 'ingame',
      name: 'Ingame',
      icon: Gamepad2,
      color: '#8B5CF6',
      description: 'Zeit in Spielen verbracht'
    },
    {
      id: 'voice',
      name: 'Voice Chat',
      icon: Headphones,
      color: '#10B981',
      description: 'Zeit im Sprachchat'
    },
    {
      id: 'online',
      name: 'Online',
      icon: Users,
      color: '#3B82F6',
      description: 'Online-Zeit insgesamt'
    },
    {
      id: 'messages',
      name: 'Nachrichten',
      icon: MessageSquare,
      color: '#F59E0B',
      description: 'Gesendete Nachrichten'
    }
  ];

  // Formatierungshelfer
  const formatValue = (category, value) => {
    switch (category) {
      case 'ingame':
      case 'voice':
      case 'online':
        return `${Math.floor(value / 60)}h`;
      case 'messages':
        return value > 1000 ? `${(value / 1000).toFixed(1)}k` : value.toString();
      default:
        return value.toString();
    }
  };

  const formatDetailedValue = (category, value) => {
    switch (category) {
      case 'ingame':
      case 'voice':
      case 'online':
        return `${Math.floor(value / 60)}h ${value % 60}m`;
      case 'messages':
        return value.toLocaleString();
      default:
        return value.toString();
    }
  };

  // Berechne Trends zwischen Perioden
  const calculateTrend = (currentValue, previousValue) => {
    if (!previousValue || previousValue === 0) return null;
    return ((currentValue - previousValue) / previousValue) * 100;
  };

  // Berechne Peak-Werte für Skalierung
  const getMaxValues = () => {
    const maxValues = {};
    categories.forEach(category => {
      maxValues[category.id] = Math.max(...data.map(period => period[category.id]?.value || 0));
    });
    return maxValues;
  };

  const maxValues = getMaxValues();

  return (
    <div className={`${themeClasses.cardBg} rounded-2xl p-6 border ${themeClasses.cardBorder} shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-bold ${themeClasses.text} flex items-center`}>
          <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
          Allzeit-Verlauf
          <span className={`ml-3 text-sm font-normal ${themeClasses.textSecondary}`}>
            Langzeit-Aktivitätstrends
          </span>
        </h3>
      </div>

      {/* Activity Legend */}
      <div className="flex items-center justify-center space-x-6 mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {categories.map((category) => {
          const Icon = category.icon;
          const totalValue = data.reduce((sum, period) => sum + (period[category.id]?.value || 0), 0);
          
          return (
            <div
              key={category.id}
              className={`flex items-center space-x-2 cursor-pointer transition-all duration-200 ${
                hoveredCategory === null || hoveredCategory === category.id ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
              }`}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: category.color }}
              />
              <Icon className="w-4 h-4" style={{ color: category.color }} />
              <div className="text-center">
                <div className={`text-sm font-medium ${themeClasses.text}`}>
                  {category.name}
                </div>
                <div className={`text-xs ${themeClasses.textTertiary}`}>
                  {formatValue(category.id, totalValue)} gesamt
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline Container */}
      <div className="relative">
        {/* Month Labels */}
        <div className="flex justify-between mb-4">
          {data.map((period, index) => (
            <div key={index} className="text-center flex-1">
              <span className={`text-sm font-medium ${themeClasses.text}`}>
                {period.label}
              </span>
            </div>
          ))}
        </div>

        {/* Main Timeline */}
        <div className="relative h-40 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4">
          {/* Period Divisions */}
          {data.map((_, index) => (
            <div
              key={index}
              className="absolute top-0 bottom-0 border-r border-gray-200 dark:border-gray-600 opacity-30"
              style={{ left: `${(index / data.length) * 100}%`, width: '1px' }}
            />
          ))}

          {/* Activity Lines/Areas für jede Kategorie */}
          {categories.map((category) => {
            const isVisible = hoveredCategory === null || hoveredCategory === category.id;
            
            // Erstelle SVG-Pfad für die Linie
            const points = data.map((period, index) => {
              const value = period[category.id]?.value || 0;
              const maxValue = maxValues[category.id];
              const x = (index / (data.length - 1)) * 100;
              const y = maxValue > 0 ? 100 - ((value / maxValue) * 80) : 100; // 80% der Höhe nutzen
              return `${x},${y}`;
            });

            const pathData = `M ${points.join(' L ')}`;
            
            return (
              <svg
                key={category.id}
                className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
                  isVisible ? 'opacity-80' : 'opacity-20'
                }`}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {/* Area under curve */}
                <path
                  d={`${pathData} L 100,100 L 0,100 Z`}
                  fill={category.color}
                  fillOpacity="0.1"
                />
                {/* Line */}
                <path
                  d={pathData}
                  stroke={category.color}
                  strokeWidth="2"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Data points */}
                {data.map((period, index) => {
                  const value = period[category.id]?.value || 0;
                  const maxValue = maxValues[category.id];
                  const x = (index / (data.length - 1)) * 100;
                  const y = maxValue > 0 ? 100 - ((value / maxValue) * 80) : 100;
                  
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="3"
                      fill={category.color}
                      className="transition-all duration-200 hover:r-5"
                      style={{ vectorEffect: 'non-scaling-stroke' }}
                    />
                  );
                })}
              </svg>
            );
          })}

          {/* Interactive Overlay für Period-Selection */}
          {data.map((period, index) => (
            <div
              key={index}
              className="absolute top-0 bottom-0 cursor-pointer hover:bg-white/10 transition-colors"
              style={{
                left: `${(index / data.length) * 100}%`,
                width: `${100 / data.length}%`
              }}
              onClick={() => setSelectedPeriod(selectedPeriod === index ? null : index)}
              title={`${period.label} - Klicken für Details`}
            />
          ))}

          {/* Selected Period Indicator */}
          {selectedPeriod !== null && (
            <div
              className="absolute top-0 bottom-0 bg-blue-500/20 border-l-2 border-r-2 border-blue-500 pointer-events-none"
              style={{
                left: `${(selectedPeriod / data.length) * 100}%`,
                width: `${100 / data.length}%`
              }}
            />
          )}
        </div>

        {/* Value indicators */}
        <div className="flex justify-between text-xs">
          {data.map((period, index) => {
            const totalValue = categories.reduce((sum, cat) => sum + (period[cat.id]?.value || 0), 0);
            
            return (
              <div key={index} className="text-center flex-1">
                <div className={`${themeClasses.textTertiary}`}>
                  {totalValue > 0 ? formatValue('online', totalValue) : '0'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Period Details */}
      {selectedPeriod !== null && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-semibold ${themeClasses.text}`}>
              {data[selectedPeriod].label} - Detailansicht
            </h4>
            <button
              onClick={() => setSelectedPeriod(null)}
              className={`text-sm ${themeClasses.textSecondary} hover:${themeClasses.text}`}
            >
              Schließen
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              const currentValue = data[selectedPeriod][category.id]?.value || 0;
              const previousValue = selectedPeriod > 0 ? data[selectedPeriod - 1][category.id]?.value || 0 : null;
              const trend = calculateTrend(currentValue, previousValue);
              
              return (
                <div key={category.id} className="text-center p-3 bg-white dark:bg-gray-800 rounded border">
                  <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: category.color }} />
                  <div className={`text-lg font-bold ${themeClasses.text}`} style={{ color: category.color }}>
                    {formatDetailedValue(category.id, currentValue)}
                  </div>
                  <div className={`text-xs ${themeClasses.textTertiary} mb-1`}>
                    {category.name}
                  </div>
                  {trend !== null && (
                    <div className={`text-xs ${
                      trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {trend > 0 ? '+' : ''}{trend.toFixed(1)}% vs. Vormonat
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Details from mock data */}
          {data[selectedPeriod].ingame?.details && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
              <h5 className={`font-medium ${themeClasses.text} mb-2`}>Details:</h5>
              <div className="space-y-1">
                {data[selectedPeriod].ingame.details.map((detail, index) => (
                  <div key={index} className={`text-sm ${themeClasses.textSecondary}`}>
                    • {detail}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const values = data.map(period => period[category.id]?.value || 0);
          const totalValue = values.reduce((sum, val) => sum + val, 0);
          const avgValue = totalValue / values.length;
          const maxValue = Math.max(...values);
          const maxMonth = data[values.indexOf(maxValue)]?.label;
          
          return (
            <div key={`summary-${category.id}`} className={`text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border`}>
              <Icon className="w-8 h-8 mx-auto mb-2" style={{ color: category.color }} />
              <div className={`text-lg font-bold ${themeClasses.text}`}>
                {formatValue(category.id, totalValue)}
              </div>
              <div className={`text-xs ${themeClasses.textTertiary} mb-1`}>
                Gesamt
              </div>
              <div className={`text-xs ${themeClasses.textSecondary}`}>
                Ø {formatValue(category.id, avgValue)}
              </div>
              <div className={`text-xs ${themeClasses.textTertiary}`}>
                Peak: {maxMonth}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlltimeTimeline;