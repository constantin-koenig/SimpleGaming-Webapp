// ===== components/dashboard/DatePicker.jsx =====
import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const DatePicker = ({ 
  activityFilter, 
  setActivityFilter, 
  selectedDate, 
  setSelectedDate, 
  themeClasses, 
  isDarkMode 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Aktuelles Datum
  const today = new Date();
  
  // Kalender-Hilfsfunktionen
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatMonth = (date) => {
    return date.toLocaleDateString('de-DE', {
      month: 'long',
      year: 'numeric'
    });
  };

  const getWeekNumber = (date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  };

  const getWeeksInYear = (year) => {
    const weeks = [];
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);
    
    // Finde den ersten Montag des Jahres
    let current = new Date(firstDay);
    while (current.getDay() !== 1) {
      current.setDate(current.getDate() + 1);
    }
    
    let weekNumber = 1;
    while (current <= lastDay) {
      const weekStart = new Date(current);
      const weekEnd = new Date(current);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      weeks.push({
        number: weekNumber,
        start: weekStart,
        end: weekEnd,
        label: `KW ${weekNumber}`,
        dateRange: `${weekStart.getDate().toString().padStart(2, '0')}.${(weekStart.getMonth() + 1).toString().padStart(2, '0')} - ${weekEnd.getDate().toString().padStart(2, '0')}.${(weekEnd.getMonth() + 1).toString().padStart(2, '0')}`
      });
      
      current.setDate(current.getDate() + 7);
      weekNumber++;
    }
    
    return weeks;
  };

  // Navigation
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const navigateYear = (direction) => {
    setCurrentYear(currentYear + direction);
  };

  // Quick-Select Funktionen
  const selectToday = () => {
    setSelectedDate(today);
    setActivityFilter('daily');
    setIsCalendarOpen(false);
  };

  const selectThisWeek = () => {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Montag
    setSelectedDate(startOfWeek);
    setActivityFilter('weekly');
    setIsCalendarOpen(false);
  };

  const selectThisMonth = () => {
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setSelectedDate(startOfMonth);
    setActivityFilter('monthly');
    setIsCalendarOpen(false);
  };

  // Datum auswählen
  const selectDate = (day) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(newDate);
    setIsCalendarOpen(false);
  };

  // Woche auswählen
  const selectWeek = (week) => {
    setSelectedDate(week.start);
    setActivityFilter('weekly');
    setIsCalendarOpen(false);
  };

  // Monat auswählen
  const selectMonth = (monthIndex) => {
    const newDate = new Date(currentYear, monthIndex, 1);
    setSelectedDate(newDate);
    setActivityFilter('monthly');
    setIsCalendarOpen(false);
  };

  // Render verschiedene Kalender-Views
  const renderDailyCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Leere Tage am Anfang
    for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Tage des Monats
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate && 
        date.toDateString() === selectedDate.toDateString();
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => selectDate(day)}
          className={`h-8 w-8 rounded text-sm font-medium transition-all duration-200 ${
            isSelected
              ? 'bg-blue-500 text-white shadow-md'
              : isToday
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : `hover:bg-gray-100 dark:hover:bg-gray-700 ${themeClasses.text}`
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth(-1)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className={`font-semibold ${themeClasses.text}`}>
            {formatMonth(currentMonth)}
          </h3>
          <button
            onClick={() => navigateMonth(1)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
            <div key={day} className={`text-center text-xs font-medium ${themeClasses.textSecondary} py-2`}>
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  const renderWeeklyCalendar = () => {
    const weeks = getWeeksInYear(currentYear);
    const currentWeek = selectedDate ? getWeekNumber(selectedDate) : getWeekNumber(today);

    return (
      <div>
        {/* Year Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateYear(-1)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className={`font-semibold ${themeClasses.text}`}>
            {currentYear}
          </h3>
          <button
            onClick={() => navigateYear(1)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weeks Grid */}
        <div className="grid grid-cols-4 gap-2 max-h-80 overflow-y-auto">
          {weeks.map((week) => {
            const isSelected = selectedDate && getWeekNumber(selectedDate) === week.number;
            const isCurrentWeek = getWeekNumber(today) === week.number && today.getFullYear() === currentYear;

            return (
              <button
                key={week.number}
                onClick={() => selectWeek(week)}
                className={`p-3 rounded-lg text-left transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-500 text-white shadow-md'
                    : isCurrentWeek
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : `hover:bg-gray-100 dark:hover:bg-gray-700 ${themeClasses.text}`
                }`}
              >
                <div className="font-medium text-sm">{week.label}</div>
                <div className={`text-xs ${isSelected ? 'text-blue-100' : themeClasses.textTertiary}`}>
                  {week.dateRange}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthlyCalendar = () => {
    const months = [
      'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
      'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
    ];

    const currentMonth = selectedDate ? selectedDate.getMonth() : today.getMonth();
    const todayMonth = today.getMonth();

    return (
      <div>
        {/* Year Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateYear(-1)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className={`font-semibold ${themeClasses.text}`}>
            {currentYear}
          </h3>
          <button
            onClick={() => navigateYear(1)}
            className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Months Grid */}
        <div className="grid grid-cols-3 gap-3">
          {months.map((month, index) => {
            const isSelected = selectedDate && 
              selectedDate.getMonth() === index && 
              selectedDate.getFullYear() === currentYear;
            const isCurrentMonth = todayMonth === index && today.getFullYear() === currentYear;

            return (
              <button
                key={month}
                onClick={() => selectMonth(index)}
                className={`p-4 rounded-lg text-center transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-500 text-white shadow-md'
                    : isCurrentMonth
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : `hover:bg-gray-100 dark:hover:bg-gray-700 ${themeClasses.text}`
                }`}
              >
                <div className="font-medium">{month}</div>
                <div className={`text-xs mt-1 ${isSelected ? 'text-blue-100' : themeClasses.textTertiary}`}>
                  {String(index + 1).padStart(2, '0')}/{currentYear}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Bestimme welcher Kalender angezeigt werden soll
  const renderCalendar = () => {
    switch (activityFilter) {
      case 'daily':
        return renderDailyCalendar();
      case 'weekly':
        return renderWeeklyCalendar();
      case 'monthly':
        return renderMonthlyCalendar();
      default:
        return renderDailyCalendar();
    }
  };

  return (
    <div className="relative">
      {/* Date Range Selector */}
      <div className="flex items-center space-x-3 mb-4">
        {/* Filter Buttons */}
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { key: 'daily', label: 'Tag', icon: Clock },
            { key: 'weekly', label: 'Woche', icon: Calendar },
            { key: 'monthly', label: 'Monat', icon: Calendar },
            { key: 'alltime', label: 'Allzeit', icon: Calendar }
          ].map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.key}
                onClick={() => setActivityFilter(filter.key)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-1 ${
                  activityFilter === filter.key
                    ? 'bg-blue-500 text-white shadow-sm transform scale-105'
                    : `${themeClasses.textSecondary} hover:${themeClasses.text} hover:bg-white/50 dark:hover:bg-gray-600`
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date Display & Calendar Toggle */}
        {activityFilter !== 'alltime' && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${themeClasses.cardBorder} ${themeClasses.cardBg} hover:border-blue-300 transition-colors`}
            >
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className={`text-sm font-medium ${themeClasses.text}`}>
                {selectedDate ? (
                  activityFilter === 'daily' ? formatDate(selectedDate) :
                  activityFilter === 'weekly' ? `KW ${getWeekNumber(selectedDate)} ${selectedDate.getFullYear()}` :
                  activityFilter === 'monthly' ? formatMonth(selectedDate) :
                  'Allzeit'
                ) : (
                  activityFilter === 'daily' ? 'Heute' :
                  activityFilter === 'weekly' ? 'Diese Woche' :
                  activityFilter === 'monthly' ? 'Dieser Monat' :
                  'Allzeit'
                )}
              </span>
            </button>

            {/* Quick Select Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={selectToday}
                className={`px-3 py-2 text-xs rounded-lg ${themeClasses.cardBg} ${themeClasses.cardBorder} border hover:border-blue-300 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
              >
                Heute
              </button>
              <button
                onClick={selectThisWeek}
                className={`px-3 py-2 text-xs rounded-lg ${themeClasses.cardBg} ${themeClasses.cardBorder} border hover:border-blue-300 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
              >
                Diese Woche
              </button>
              <button
                onClick={selectThisMonth}
                className={`px-3 py-2 text-xs rounded-lg ${themeClasses.cardBg} ${themeClasses.cardBorder} border hover:border-blue-300 ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
              >
                Dieser Monat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Calendar Dropdown */}
      {isCalendarOpen && activityFilter !== 'alltime' && (
        <div className={`absolute top-full left-0 mt-2 p-4 ${themeClasses.cardBg} rounded-lg border ${themeClasses.cardBorder} shadow-lg z-50 min-w-80`}>
          {renderCalendar()}

          {/* Calendar Footer */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button
                onClick={
                  activityFilter === 'daily' ? selectToday :
                  activityFilter === 'weekly' ? selectThisWeek :
                  selectThisMonth
                }
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                {activityFilter === 'daily' ? 'Heute' :
                 activityFilter === 'weekly' ? 'Diese Woche' :
                 'Dieser Monat'} auswählen
              </button>
              <button
                onClick={() => setIsCalendarOpen(false)}
                className={`text-sm ${themeClasses.textSecondary} hover:${themeClasses.text}`}
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;

