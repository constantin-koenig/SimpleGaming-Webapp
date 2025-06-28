import React from 'react';
import { Calendar, Users, Eye, X } from 'lucide-react';

const RegisteredEvents = ({ registeredEvents, themeClasses, isDarkMode }) => {
  return (
    <div className={`${themeClasses.cardBg} rounded-2xl p-6 border ${themeClasses.cardBorder} shadow-sm`}>
      <h3 className={`text-xl font-bold mb-4 ${themeClasses.text} flex items-center`}>
        <Calendar className="w-5 h-5 mr-2 text-blue-500" />
        Meine Events ({registeredEvents.length})
      </h3>
      <div className="space-y-3">
        {registeredEvents.map((event) => (
          <div key={event.id} className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${themeClasses.cardBorder}`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-semibold ${themeClasses.text} text-sm`}>{event.name}</h4>
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-gray-400" />
                <span className={`text-xs ${themeClasses.textTertiary}`}>{event.participants}</span>
              </div>
            </div>
            <div className={`text-xs ${themeClasses.textSecondary} mb-3`}>
              {new Date(event.date).toLocaleDateString('de-DE')} • {event.time}
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-xs py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg font-medium flex items-center justify-center">
                <Eye className="w-3 h-3 mr-1" />
                Details
              </button>
              {event.canCancel && (
                <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs py-2.5 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RegisteredEvents;