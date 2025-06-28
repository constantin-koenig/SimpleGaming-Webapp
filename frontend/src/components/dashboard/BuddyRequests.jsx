import React from 'react';
import { UserPlus, UserCheck, UserX } from 'lucide-react';

const BuddyRequests = ({ buddyRequests, themeClasses, isDarkMode }) => {
  return (
    <div className={`${themeClasses.cardBg} rounded-2xl p-6 border ${themeClasses.cardBorder} shadow-sm`}>
      <h3 className={`text-xl font-bold mb-4 ${themeClasses.text} flex items-center`}>
        <UserPlus className="w-5 h-5 mr-2 text-purple-500" />
        Buddy Anfragen ({buddyRequests.length})
      </h3>
      <div className="space-y-3">
        {buddyRequests.map((request) => (
          <div key={request.id} className={`p-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${themeClasses.cardBorder}`}>
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={request.avatar}
                alt={request.username}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h4 className={`font-semibold ${themeClasses.text} text-sm`}>{request.username}</h4>
                <p className={`text-xs ${themeClasses.textTertiary}`}>
                  {request.mutual} gemeinsame Freunde
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {request.games.map((game, index) => (
                <span key={index} className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  {game}
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-xs py-2.5 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg font-medium flex items-center justify-center">
                <UserCheck className="w-3 h-3 mr-1" />
                Annehmen
              </button>
              <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs py-2.5 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg">
                <UserX className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuddyRequests;