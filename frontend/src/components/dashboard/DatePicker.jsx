// frontend/src/components/dashboard/DatePicker.jsx - Mit Kalenderauswahl erweitert
import React, { useState, useEffect } from 'react';
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Filter-Optionen
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

  // Sichere Datumsformatierung
  const formatCurrentPeriod = () => {
    try {
      if (activityFilter === 'weekly' && selectedWeek) {
        const weekDate = selectedWeek instanceof Date ? selectedWeek : new Date(selectedWeek);
        
        if (isNaN(weekDate.getTime())) {
          return { primary: 'Ungültiges Datum', secondary: '' };
        }
        
        const monday = new Date(weekDate);
        const dayOfWeek = monday.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        monday.setDate(monday.getDate() - daysFromMonday);
        
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
            secondary: (isSameYear ? monday.getFullYear().toString() : `${monday.getFullYear()}/${sunday.getFullYear()}`)
          };
        }
      } else if (activityFilter === 'monthly' && selectedMonth) {
        const monthDate = selectedMonth instanceof Date ? selectedMonth : new Date(selectedMonth);
        
        if (isNaN(monthDate.getTime())) {
          return { primary: 'Ungültiges Datum', secondary: '' };
        }
        
        return {
          primary: monthDate.toLocaleDateString('de-DE', { month: 'long' }),
          secondary: monthDate.getFullYear().toString()
        };
      }
      
      return { primary: currentOption?.shortLabel || 'Unbekannt', secondary: '' };
    } catch (error) {
      console.error('Date formatting error:', error);
      return { primary: 'Fehler', secondary: '' };
    }
  };

  const currentPeriod = formatCurrentPeriod();

  // Prüfe ob aktuelle Periode angezeigt wird
  const isCurrent = (() => {
    try {
      const now = new Date();
      if (activityFilter === 'weekly' && selectedWeek) {
        const weekDate = selectedWeek instanceof Date ? selectedWeek : new Date(selectedWeek);
        const currentWeekStart = new Date(now);
        const currentDay = currentWeekStart.getDay();
        const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
        currentWeekStart.setDate(currentWeekStart.getDate() - daysFromMonday);
        currentWeekStart.setHours(0, 0, 0, 0);
        
        const selectedWeekStart = new Date(weekDate);
        const selectedDay = selectedWeekStart.getDay();
        const selectedDaysFromMonday = selectedDay === 0 ? 6 : selectedDay - 1;
        selectedWeekStart.setDate(selectedWeekStart.getDate() - selectedDaysFromMonday);
        selectedWeekStart.setHours(0, 0, 0, 0);
        
        return Math.abs(currentWeekStart.getTime() - selectedWeekStart.getTime()) < 24 * 60 * 60 * 1000;
      } else if (activityFilter === 'monthly' && selectedMonth) {
        const monthDate = selectedMonth instanceof Date ? selectedMonth : new Date(selectedMonth);
        return now.getFullYear() === monthDate.getFullYear() && now.getMonth() === monthDate.getMonth();
      }
      return false;
    } catch (error) {
      return false;
    }
  })();

  // NEU: Kalender-Navigation Handler
  const handleDateSelect = (newDate) => {
    try {
      if (activityFilter === 'weekly' && navigateWeek) {
        // Navigiere zur Woche, die das gewählte Datum enthält
        navigateWeek('date', newDate);
      } else if (activityFilter === 'monthly' && navigateMonth) {
        // Navigiere zum Monat des gewählten Datums
        navigateMonth('date', newDate);
      }
      setIsCalendarOpen(false);
    } catch (error) {
      console.error('Date selection error:', error);
    }
  };

  // NEU: Adaptive Mini-Kalender Komponente
  const MiniCalendar = () => {
    const now = new Date();
    const currentDate = activityFilter === 'weekly' ? 
      (selectedWeek instanceof Date ? selectedWeek : new Date(selectedWeek)) :
      (selectedMonth instanceof Date ? selectedMonth : new Date(selectedMonth));
    
    // Initialisiere viewDate basierend auf dem ausgewählten Datum, nicht dem aktuellen
    const [viewDate, setViewDate] = useState(() => {
      if (activityFilter === 'weekly') {
        return new Date(currentDate.getFullYear(), 0, 1); // Jahresanfang für Wochenansicht
      } else {
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // Ausgewählter Monat
      }
    });

    // Update viewDate wenn sich currentDate ändert
    useEffect(() => {
      if (activityFilter === 'weekly') {
        setViewDate(new Date(currentDate.getFullYear(), 0, 1));
      } else {
        setViewDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
      }
    }, [currentDate, activityFilter]);

    // Für Monatsansicht: Monats-Auswahl
    if (activityFilter === 'monthly') {
      const currentYear = viewDate.getFullYear();
      const months = [
        'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
      ];

      return (
        <div className={`absolute top-full left-0 mt-2 p-4 rounded-lg shadow-lg border z-50 ${themeClasses.cardBg} ${themeClasses.cardBorder}`} style={{ minWidth: '280px' }}>
          {/* Jahr Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewDate(new Date(currentYear - 1, viewDate.getMonth(), 1))}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${themeClasses.text}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <h3 className={`font-medium ${themeClasses.text}`}>
              {currentYear}
            </h3>
            
            <button
              onClick={() => setViewDate(new Date(currentYear + 1, viewDate.getMonth(), 1))}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${themeClasses.text}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Monate Grid */}
          <div className="grid grid-cols-3 gap-2">
            {months.map((month, index) => {
              const monthDate = new Date(currentYear, index, 1);
              const isCurrentMonth = now.getMonth() === index && now.getFullYear() === currentYear;
              const isSelected = currentDate.getMonth() === index && currentDate.getFullYear() === currentYear;

              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(monthDate)}
                  className={`
                    px-3 py-2 text-sm rounded transition-colors
                    ${isCurrentMonth ? 'bg-blue-500 text-white font-bold' : ''}
                    ${isSelected && !isCurrentMonth ? 
                      (isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600') : ''}
                    ${!isCurrentMonth && !isSelected ? 
                      `${themeClasses.text} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}` : ''}
                  `}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    // Für Wochenansicht: Kalenderwochen-Auswahl
    if (activityFilter === 'weekly') {
      const currentYear = viewDate.getFullYear();
      
      // Korrekte ISO-8601 Kalenderwochen-Berechnung
      const getWeeksInYear = (year) => {
        const weeks = [];
        
        // ISO-8601 Woche 1 Definition: Erste Woche mit mindestens 4 Tagen im neuen Jahr
        const jan4 = new Date(year, 0, 4); // 4. Januar
        const firstMonday = new Date(jan4);
        
        // Finde den Montag der Woche, die den 4. Januar enthält
        const dayOfWeek = jan4.getDay(); // 0 = Sonntag, 1 = Montag...
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        firstMonday.setDate(jan4.getDate() - daysFromMonday);
        
        let currentMonday = new Date(firstMonday);
        let weekNumber = 1;
        
        while (weekNumber <= 53) {
          const weekStart = new Date(currentMonday);
          const weekEnd = new Date(currentMonday);
          weekEnd.setDate(weekEnd.getDate() + 6);
          
          // Prüfe ob diese Woche noch zum aktuellen Jahr gehört
          // Eine Woche gehört zum Jahr, wenn sie mindestens 4 Tage darin hat
          const jan1NextYear = new Date(year + 1, 0, 1);
          if (weekStart >= jan1NextYear) {
            // Wenn die Woche komplett im nächsten Jahr ist, stoppe
            break;
          }
          
          // Berechne die tatsächliche ISO-Wochennummer
          const isoWeekNumber = getISOWeekNumber(weekStart);
          
          weeks.push({
            number: isoWeekNumber,
            start: new Date(weekStart),
            end: new Date(weekEnd),
            label: `KW ${isoWeekNumber}`
          });
          
          currentMonday.setDate(currentMonday.getDate() + 7);
          weekNumber++;
          
          // Stoppe wenn wir ins nächste Jahr kommen
          if (currentMonday.getFullYear() > year && currentMonday.getMonth() > 2) {
            break;
          }
        }
        
        return weeks.sort((a, b) => a.number - b.number);
      };
      
      // ISO-8601 Wochennummer berechnen
      const getISOWeekNumber = (date) => {
        const target = new Date(date.valueOf());
        const dayNr = (date.getDay() + 6) % 7;
        target.setDate(target.getDate() - dayNr + 3);
        const jan4 = new Date(target.getFullYear(), 0, 4);
        const dayDiff = (target - jan4) / 86400000;
        return 1 + Math.ceil(dayDiff / 7);
      };

      const weeks = getWeeksInYear(currentYear);
      
      // Aktuelle Woche bestimmen
      const getCurrentWeek = (date) => {
        const monday = new Date(date);
        const dayOfWeek = monday.getDay();
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        monday.setDate(monday.getDate() - daysFromMonday);
        
        const isoWeekNumber = getISOWeekNumber(monday);
        
        return weeks.find(week => week.number === isoWeekNumber);
      };

      const currentWeek = getCurrentWeek(now);
      const selectedWeekData = getCurrentWeek(currentDate);

      return (
        <div className={`absolute top-full left-0 mt-2 p-4 rounded-lg shadow-lg border z-50 ${themeClasses.cardBg} ${themeClasses.cardBorder}`} style={{ minWidth: '320px', maxHeight: '400px' }}>
          {/* Jahr Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setViewDate(new Date(currentYear - 1, 0, 1))}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${themeClasses.text}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <h3 className={`font-medium ${themeClasses.text}`}>
              Kalenderwochen {currentYear}
            </h3>
            
            <button
              onClick={() => setViewDate(new Date(currentYear + 1, 0, 1))}
              className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${themeClasses.text}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Wochen Grid - scrollbar */}
          <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto">
            {weeks.map((week) => {
              const isCurrentWeek = currentWeek && week.number === currentWeek.number;
              const isSelected = selectedWeekData && week.number === selectedWeekData.number;
              
              const weekStart = week.start.getDate();
              const weekEnd = week.end.getDate();
              const startMonth = week.start.getMonth() + 1;
              const endMonth = week.end.getMonth() + 1;
              
              const dateRange = startMonth === endMonth ? 
                `${weekStart}-${weekEnd}.${startMonth}` : 
                `${weekStart}.${startMonth}-${weekEnd}.${endMonth}`;

              return (
                <button
                  key={week.number}
                  onClick={() => handleDateSelect(week.start)}
                  className={`
                    px-2 py-3 text-xs rounded transition-colors flex flex-col items-center
                    ${isCurrentWeek ? 'bg-blue-500 text-white font-bold' : ''}
                    ${isSelected && !isCurrentWeek ? 
                      (isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600') : ''}
                    ${!isCurrentWeek && !isSelected ? 
                      `${themeClasses.text} ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}` : ''}
                  `}
                  title={`${week.start.toLocaleDateString('de-DE')} - ${week.end.toLocaleDateString('de-DE')}`}
                >
                  <div className="font-medium">{week.label}</div>
                  <div className="text-xs opacity-75 mt-1">{dateRange}</div>
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return null; // Fallback
  };

  return (
    <div className="space-y-4 relative">
      {/* Filter Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`
            w-full flex items-center justify-between px-4 py-3 rounded-lg
            ${themeClasses.cardBg} ${themeClasses.cardBorder} border
            hover:bg-gray-50 dark:hover:bg-gray-700/50
            transition-colors duration-200
          `}
        >
          <div className="flex items-center">
            <Calendar className={`w-4 h-4 mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            <span className={`font-medium ${themeClasses.text}`}>
              {currentOption?.label || 'Unbekannt'}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg border z-50 ${themeClasses.cardBg} ${themeClasses.cardBorder}`}>
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setActivityFilter(option.value);
                  setIsDropdownOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-3 transition-colors duration-200
                  ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}
                  first:rounded-t-lg last:rounded-b-lg
                  ${option.value === activityFilter ? 
                    (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50') : ''}
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

      {/* Navigation Controls */}
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
                ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                transition-colors duration-200 group
              `}
              title={`Vorherige ${activityFilter === 'weekly' ? 'Woche' : 'Monat'}`}
            >
              <ChevronLeft className={`w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>

            {/* NEU: Mittlere Anzeige - jetzt klickbar für Kalender */}
            <div className="relative flex-1">
              <button
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className={`
                  w-full flex flex-col items-center justify-center px-4 py-2 rounded-lg
                  ${themeClasses.cardBg} ${themeClasses.cardBorder} border
                  ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}
                  transition-colors duration-200 min-h-[44px]
                `}
                title="Kalender öffnen"
                style={{ minWidth: '160px' }}
              >
                <div className={`font-medium ${themeClasses.text} text-sm text-center flex items-center`}>
                  <Calendar className={`w-3 h-3 mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
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
              </button>

              {/* NEU: Mini-Kalender */}
              {isCalendarOpen && <MiniCalendar />}
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
                ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                transition-colors duration-200 group
              `}
              title={`Nächste ${activityFilter === 'weekly' ? 'Woche' : 'Monat'}`}
            >
              <ChevronRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
            </button>

            {/* Reset-Button */}
            {!isCurrent && (
              <>
                <div className={`w-px h-6 ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'} mx-1`} />
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
                    ${isDarkMode ? 'hover:bg-blue-900/20' : 'hover:bg-blue-50'}
                    transition-colors duration-200 group
                  `}
                  title={`Zur aktuellen ${activityFilter === 'weekly' ? 'Woche' : 'Monat'}`}
                >
                  <RotateCcw className={`w-4 h-4 group-hover:rotate-180 transition-transform duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Info-Text */}
      <div style={{ minHeight: '20px' }}>
        {(activityFilter === 'weekly' || activityFilter === 'monthly') && (
          <div className={`text-xs ${themeClasses.textTertiary} text-center`}>
            Klicke auf das Datum für {activityFilter === 'weekly' ? 'Kalenderwochen-' : 'Monats-'}auswahl oder verwende die Pfeile
          </div>
        )}
      </div>

      {/* Click-outside Handler für Dropdown */}
      {isDropdownOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsDropdownOpen(false)}
        />
      )}

      {/* Click-outside Handler für Kalender */}
      {isCalendarOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsCalendarOpen(false)}
        />
      )}
    </div>
  );
};

export default DatePicker;