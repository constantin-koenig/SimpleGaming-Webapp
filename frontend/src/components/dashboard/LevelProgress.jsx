import React from 'react';

const LevelProgress = ({ user, themeClasses, isDarkMode }) => {
  const xpProgress = (user.xp / user.xpToNext) * 100;

  return (
    <div className={`${themeClasses.cardBg} rounded-2xl p-6 border ${themeClasses.cardBorder} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.username}
              className="w-16 h-16 rounded-full ring-4 ring-blue-500"
            />
            <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-xs font-bold text-white">
              {user.level}
            </div>
          </div>
          <div>
            <h1 className={`text-2xl font-bold ${themeClasses.text}`}>
              Willkommen zurück, {user.username}!
            </h1>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${themeClasses.textSecondary}`}>Rang:</span>
              <span className={`text-sm font-bold bg-gradient-to-r ${user.rankColor} bg-clip-text text-transparent`}>
                {user.rank}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm ${themeClasses.textSecondary}`}>Nächstes Level</p>
          <p className={`text-lg font-bold ${themeClasses.text}`}>
            {(user.xpToNext - user.xp).toLocaleString()} XP
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>Level {user.level} Fortschritt</span>
          <span className={`text-sm ${themeClasses.textTertiary}`}>{user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP</span>
        </div>
        <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-4 overflow-hidden`}>
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 relative"
            style={{ width: `${xpProgress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelProgress;