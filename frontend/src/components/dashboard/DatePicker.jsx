// frontend/src/components/dashboard/DatePicker.jsx - BEAUTIFUL VERSION
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, RotateCcw, ChevronDown } from 'lucide-react';

const DatePicker = ({ 
  activityFilter, 
  setActivityFilter, 
  selectedDate, 
  setSelectedDate, 
  themeClasses, 
  isDarkMode,
  selectedWeek,
  selectedMonth,
  navigateWeek,
  navigateMonth,
  goToCurrentWeek,
  goToCurrentMonth
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Filter-Optionen mit Icons und Beschreibungen
  const filterOptions = [
    { 
      value: 'daily', 
      label: 'Letzte 7 Tage', 
      shortLabel: '7 Tage',
      icon: Calendar,
      description: 'Überblick der letzten Woche',
      color: 'yellow'
    },
    { 
      value: 'weekly', 
      label: 'Woche', 
      shortLabel: 'Woche',
      icon: Calendar,
      description: 'Montag bis Sonntag',
      color: 'green'
    },
    { 
      value: 'monthly', 
      label: 'Monat', 
      shortLabel: 'Monat',
      icon: Calendar,
      description: 'Kalenderwochen des Monats',
      color: 'blue'
    },
    { 
      value: 'alltime', 
      label: 'Gesamt', 
      shortLabel: 'Gesamt',
      icon: Calendar,
      description: 'Komplette Account-Historie',
      color: 'purple'
    }
  ];

  const currentOption = filterOptions.find(opt => opt.value === activityFilter);

  // ✅ Formatiere Datumsanzeige eleganter
  const formatCurrentPeriod = () => {
    if (activityFilter === 'weekly' && selectedWeek) {
      const monday = new Date(selectedWeek);
      const dayOfWeek = monday.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      monday.setDate(monday.getDate() - daysFromMonday);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      const isSameMonth = monday.getMonth() === sunday.getMonth();
      
      if (isSameMonth) {
        return {
          primary: `${monday.getDate()}-${sunday.getDate()}. ${monday.toLocaleDateString('de-DE', { month: 'long' })}`,
          secondary: monday.getFullYear()
        };
      } else {
        return {
          primary: `${monday.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}`,
          secondary: sunday.getFullYear()
        };
      }
    }
    
    if (activityFilter === 'monthly' && selectedMonth) {
      return {
        primary: selectedMonth.toLocaleDateString('de-DE', { month: 'long' }),
        secondary: selectedMonth.getFullYear()
      };
    }
    
    return null;
  };

  // ✅ Prüfe ob aktueller Zeitraum
  const isCurrentPeriod = () => {
    const now = new Date();
    
    if (activityFilter === 'weekly' && selectedWeek) {
      const weekStart = new Date(selectedWeek);
      const dayOfWeek = weekStart.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weekStart.setDate(weekStart.getDate() - daysFromMonday);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return now >= weekStart && now <= weekEnd;
    }
    
    if (activityFilter === 'monthly' && selectedMonth) {
      return now.getMonth() === selectedMonth.getMonth() && now.getFullYear() === selectedMonth.getFullYear();
    }
    
    return false;
  };

  // ✅ NEW: Prüfe ob Next-Button disabled sein soll (keine Zukunft)
  const isNextDisabled = () => {
    const now = new Date();
    
    if (activityFilter === 'weekly' && selectedWeek) {
      const weekStart = new Date(selectedWeek);
      const dayOfWeek = weekStart.getDay();
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      weekStart.setDate(weekStart.getDate() - daysFromMonday + 7); // Nächste Woche
      
      return weekStart > now;
    }
    
    if (activityFilter === 'monthly' && selectedMonth) {
      const nextMonth = new Date(selectedMonth);
      nextMonth.setMonth(selectedMonth.getMonth() + 1);
      nextMonth.setDate(1); // Erster Tag des nächsten Monats
      
      return nextMonth > now;
    }
    
    return false;
  };

  const periodData = formatCurrentPeriod();

  return (
    <div className="flex items-center justify-between w-full">
      {/* ✅ FIXED: Left Section - Filter Dropdown (always same position) */}
      <div className="flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`
              flex items-center space-x-3 px-4 py-2.5 rounded-xl border transition-all duration-200
              ${themeClasses.cardBg} ${themeClasses.cardBorder} ${themeClasses.text}
              hover:shadow-md hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:border-transparent
              ${isDropdownOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}
            `}
          >
            {/* Color Badge */}
            <div className={`
              w-3 h-3 rounded-full
              ${currentOption?.color === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                currentOption?.color === 'green' ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                currentOption?.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                'bg-gradient-to-r from-purple-400 to-pink-400'}
            `} />
            
            {/* Label */}
            <span className="font-medium">
              {currentOption?.shortLabel}
            </span>
            
            {/* Dropdown Icon */}
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* ✅ Beautiful Dropdown Menu */}
          {isDropdownOpen && (
            <div className={`
              absolute top-full left-0 mt-2 w-64 rounded-xl shadow-xl border z-50
              ${themeClasses.cardBg} ${themeClasses.cardBorder}
              animate-in slide-in-from-top-2 duration-200
            `}>
              <div className="p-2">
                {filterOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = option.value === activityFilter;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setActivityFilter(option.value);
                        setIsDropdownOpen(false);
                      }}
                      className={`
                        w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-150
                        ${isSelected 
                          ? `${option.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700' :
                              option.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700' :
                              option.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700' :
                              'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700'}`
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }
                      `}
                    >
                      {/* Color Badge */}
                      <div className={`
                        w-3 h-3 rounded-full flex-shrink-0
                        ${option.color === 'yellow' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' :
                          option.color === 'green' ? 'bg-gradient-to-r from-green-400 to-emerald-400' :
                          option.color === 'blue' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' :
                          'bg-gradient-to-r from-purple-400 to-pink-400'}
                      `} />
                      
                      <div className="flex-1 text-left">
                        <div className={`font-medium ${themeClasses.text}`}>
                          {option.label}
                        </div>
                        <div className={`text-xs ${themeClasses.textTertiary}`}>
                          {option.description}
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className={`
                          w-2 h-2 rounded-full
                          ${option.color === 'yellow' ? 'bg-yellow-500' :
                            option.color === 'green' ? 'bg-green-500' :
                            option.color === 'blue' ? 'bg-blue-500' :
                            'bg-purple-500'}
                        `} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ FIXED: Right Section - Navigation (fixed width, always visible) */}
      <div className="flex-shrink-0 w-80">
        {(activityFilter === 'weekly' || activityFilter === 'monthly') ? (
          <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-1 w-full">
            {/* Previous Button */}
            <button
              onClick={() => {
                if (activityFilter === 'weekly') navigateWeek(-1);
                if (activityFilter === 'monthly') navigateMonth(-1);
              }}
              className={`
                p-2 rounded-lg transition-all duration-200 ${themeClasses.text}
                hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm
                active:scale-95 flex-shrink-0
              `}
              title={`Vorherige ${activityFilter === 'weekly' ? 'Woche' : 'Monat'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Period Display - Fixed width */}
            <div className="flex-1 px-2">
              {periodData && (
                <div className={`
                  px-4 py-2 rounded-lg transition-all duration-200
                  ${themeClasses.cardBg} border ${themeClasses.cardBorder} shadow-sm
                  text-center group hover:shadow-md w-full
                `}>
                  <div className={`font-semibold ${themeClasses.text} group-hover:scale-105 transition-transform duration-200`}>
                    {periodData.primary}
                  </div>
                  <div className={`text-xs ${themeClasses.textTertiary} mt-0.5`}>
                    {periodData.secondary}
                  </div>
                </div>
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() => {
                if (!isNextDisabled()) {
                  if (activityFilter === 'weekly') navigateWeek(1);
                  if (activityFilter === 'monthly') navigateMonth(1);
                }
              }}
              disabled={isNextDisabled()}
              className={`
                p-2 rounded-lg transition-all duration-200 flex-shrink-0
                ${isNextDisabled() 
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-50' 
                  : `${themeClasses.text} hover:bg-white dark:hover:bg-gray-700 hover:shadow-sm active:scale-95`
                }
              `}
              title={
                isNextDisabled() 
                  ? 'Zukunft nicht verfügbar' 
                  : `Nächste ${activityFilter === 'weekly' ? 'Woche' : 'Monat'}`
              }
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Current Period Button - Fixed width */}
            <div className="ml-2 pl-2 border-l border-gray-200 dark:border-gray-600 w-12 flex justify-center">
              {!isCurrentPeriod() && (
                <button
                  onClick={() => {
                    if (activityFilter === 'weekly') goToCurrentWeek();
                    if (activityFilter === 'monthly') goToCurrentMonth();
                  }}
                  className={`
                    p-2 rounded-lg transition-all duration-200
                    bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md
                    hover:from-blue-600 hover:to-blue-700 hover:shadow-lg
                    active:scale-95 group
                  `}
                  title={`Aktuelle ${activityFilter === 'weekly' ? 'Woche' : 'Monat'}`}
                >
                  <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              )}
            </div>
          </div>
        ) : (
          // ✅ PLACEHOLDER: Maintain layout for daily/alltime filters
          <div className="w-full h-12" />
        )}
      </div>
    </div>
  );
};

export default DatePicker;