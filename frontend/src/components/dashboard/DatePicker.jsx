// frontend/src/components/dashboard/DatePicker.jsx - FIXED: Date Formatting
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
  
  // ✅ FIXED: Filter-Optionen
  const filterOptions = [
    { 
      value: 'daily', 
      label: 'Letzte 7 Tage', 
      shortLabel: '7 Tage',
      description: 'Überblick der letzten Woche'
    },
    { 
      value: 'weekly', 
      label: 'Woche', 
      shortLabel: 'Woche',
      description: 'Montag bis Sonntag'
    },
    { 
      value: 'monthly', 
      label: 'Monat', 
      shortLabel: 'Monat',
      description: 'Kalenderwochen des Monats'
    },
    { 
      value: 'alltime', 
      label: 'Gesamt', 
      shortLabel: 'Gesamt',
      description: 'Komplette Account-Historie'
    }
  ];

  const currentOption = filterOptions.find(opt => opt.value === activityFilter);

  // ✅ FIXED: Sichere Datumsformatierung
  const formatCurrentPeriod = () => {
    try {
      if (activityFilter === 'weekly' && selectedWeek) {
        // ✅ FIXED: Verwende selectedWeek wie es ist (Backend macht die Wochenberechnung)
        const weekDate = selectedWeek instanceof Date ? selectedWeek : new Date(selectedWeek);
        
        if (isNaN(weekDate.getTime())) {
          return { primary: 'Ungültiges Datum', secondary: '' };
        }
        
        // ✅ FIXED: Für Anzeige berechnen wir Montag-Sonntag basierend auf selectedWeek
        const monday = new Date(weekDate);
        const dayOfWeek = monday.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sonntag = 0
        monday.setDate(monday.getDate() - daysFromMonday);
        
        // Sonntag berechnen
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        const isSameMonth = monday.getMonth() === sunday.getMonth();
        const isSameYear = monday.getFullYear() === sunday.getFullYear();
        
        if (isSameMonth && isSameYear) {
          return {
            primary: `${monday.getDate()}-${sunday.getDate()}. ${monday.toLocaleDateString('de-DE', { month: 'long' })}`,
            secondary: monday.getFullYear().toString()
          };
        } else {
          return {
            primary: `${monday.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} - ${sunday.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}`,
            secondary: (isSameYear ? sunday.getFullYear() : `${monday.getFullYear()}/${sunday.getFullYear()}`).toString()
          };
        }
      }
      
      if (activityFilter === 'monthly' && selectedMonth) {
        const monthDate = selectedMonth instanceof Date ? selectedMonth : new Date(selectedMonth);
        
        if (isNaN(monthDate.getTime())) {
          return { primary: 'Ungültiges Datum', secondary: '' };
        }
        
        return {
          primary: monthDate.toLocaleDateString('de-DE', { month: 'long' }),
          secondary: monthDate.getFullYear().toString()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error formatting date:', error);
      return { primary: 'Fehler', secondary: '' };
    }
  };

  // ✅ FIXED: Prüfe ob aktueller Zeitraum
  const isCurrentPeriod = () => {
    try {
      const now = new Date();
      
      if (activityFilter === 'weekly' && selectedWeek) {
        // ✅ FIXED: Prüfe ob die Woche von selectedWeek die aktuelle Woche ist
        const weekDate = selectedWeek instanceof Date ? selectedWeek : new Date(selectedWeek);
        if (isNaN(weekDate.getTime())) return false;
        
        // Finde Montag der aktuellen Woche (von heute)
        const currentMonday = new Date(now);
        const currentDayOfWeek = currentMonday.getDay();
        const currentDaysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
        currentMonday.setDate(currentMonday.getDate() - currentDaysFromMonday);
        currentMonday.setHours(0, 0, 0, 0);
        
        // Finde Montag der Woche von selectedWeek
        const selectedMonday = new Date(weekDate);
        const selectedDayOfWeek = selectedMonday.getDay();
        const selectedDaysFromMonday = selectedDayOfWeek === 0 ? 6 : selectedDayOfWeek - 1;
        selectedMonday.setDate(selectedMonday.getDate() - selectedDaysFromMonday);
        selectedMonday.setHours(0, 0, 0, 0);
        
        return currentMonday.getTime() === selectedMonday.getTime();
      }
      
      if (activityFilter === 'monthly' && selectedMonth) {
        const monthDate = selectedMonth instanceof Date ? selectedMonth : new Date(selectedMonth);
        if (isNaN(monthDate.getTime())) return false;
        
        return now.getFullYear() === monthDate.getFullYear() && 
               now.getMonth() === monthDate.getMonth();
      }
      
      return false;
    } catch (error) {
      console.error('Error checking current period:', error);
      return false;
    }
  };

  const currentPeriod = formatCurrentPeriod();
  const isCurrent = isCurrentPeriod();

  return (
    <div className="flex flex-col space-y-4">
      {/* ✅ FIXED: Filter-Auswahl */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`
            w-full flex items-center justify-between px-4 py-2.5 rounded-xl border
            ${themeClasses.cardBg} ${themeClasses.text} ${themeClasses.cardBorder}
            hover:bg-gray-50 dark:hover:bg-gray-700
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all duration-200
          `}
          style={{ minWidth: '160px' }}
        >
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="font-medium">{currentOption?.shortLabel || 'Wählen'}</span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} />
        </button>

        {/* Dropdown */}
        {isDropdownOpen && (
          <div className={`
            absolute top-full left-0 right-0 mt-2 py-2 rounded-xl border shadow-lg z-50
            ${themeClasses.cardBg} ${themeClasses.cardBorder}
          `}>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setActivityFilter(option.value);
                  setIsDropdownOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700
                  transition-colors duration-150
                  ${activityFilter === option.value ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                `}
              >
                <div className={`font-medium ${themeClasses.text}`}>
                  {option.label}
                </div>
                <div className={`text-xs ${themeClasses.textTertiary} mt-0.5`}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ✅ FIXED: Navigation-Controls mit robuster Fehlerbehandlung */}
      <div style={{ minHeight: '40px' }}>
        {(activityFilter === 'weekly' || activityFilter === 'monthly') && currentPeriod && (
          <div className="flex items-center justify-between space-x-2">
            {/* Linke Navigation */}
            <button
              onClick={() => {
                try {
                  if (activityFilter === 'weekly' && navigateWeek) {
                    navigateWeek('prev');
                  } else if (activityFilter === 'monthly' && navigateMonth) {
                    navigateMonth('prev');
                  }
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
              className={`
                flex items-center justify-center w-9 h-9 rounded-lg
                ${themeClasses.cardBg} ${themeClasses.cardBorder} border
                hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors duration-200 group
              `}
              title={`Vorherige ${activityFilter === 'weekly' ? 'Woche' : 'Monat'}`}
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200" />
            </button>

            {/* Mittlere Anzeige */}
            <div 
              className={`
                flex flex-col items-center justify-center px-4 py-2 rounded-lg
                ${themeClasses.cardBg} ${themeClasses.cardBorder} border
                flex-1 max-w-48 min-h-[44px]
              `}
              style={{ minWidth: '160px' }}
            >
              <div className={`font-medium ${themeClasses.text} text-sm text-center`}>
                {currentPeriod.primary}
              </div>
              {currentPeriod.secondary && (
                <div className={`text-xs ${themeClasses.textTertiary} mt-0.5`}>
                  {currentPeriod.secondary}
                  {isCurrent && (
                    <span className="ml-1 text-green-500">• Aktuell</span>
                  )}
                </div>
              )}
            </div>

            {/* Rechte Navigation */}
            <button
              onClick={() => {
                try {
                  if (activityFilter === 'weekly' && navigateWeek) {
                    navigateWeek('next');
                  } else if (activityFilter === 'monthly' && navigateMonth) {
                    navigateMonth('next');
                  }
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
              className={`
                flex items-center justify-center w-9 h-9 rounded-lg
                ${themeClasses.cardBg} ${themeClasses.cardBorder} border
                hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors duration-200 group
              `}
              title={`Nächste ${activityFilter === 'weekly' ? 'Woche' : 'Monat'}`}
            >
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
            </button>

            {/* Reset-Button */}
            {!isCurrent && (
              <>
                <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  onClick={() => {
                    try {
                      if (activityFilter === 'weekly' && goToCurrentWeek) {
                        goToCurrentWeek();
                      } else if (activityFilter === 'monthly' && goToCurrentMonth) {
                        goToCurrentMonth();
                      }
                    } catch (error) {
                      console.error('Reset error:', error);
                    }
                  }}
                  className={`
                    flex items-center justify-center w-9 h-9 rounded-lg
                    ${themeClasses.cardBg} ${themeClasses.cardBorder} border
                    hover:bg-blue-50 dark:hover:bg-blue-900/20
                    transition-colors duration-200 group
                  `}
                  title={`Zur aktuellen ${activityFilter === 'weekly' ? 'Woche' : 'Monat'}`}
                >
                  <RotateCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ✅ FIXED: Info-Text */}
      <div style={{ minHeight: '20px' }}>
        {(activityFilter === 'weekly' || activityFilter === 'monthly') && (
          <div className={`text-xs ${themeClasses.textTertiary} text-center`}>
            Verwende die Pfeile zur Navigation zwischen {activityFilter === 'weekly' ? 'Wochen' : 'Monaten'}
          </div>
        )}
      </div>

      {/* Click-outside Handler */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default DatePicker;