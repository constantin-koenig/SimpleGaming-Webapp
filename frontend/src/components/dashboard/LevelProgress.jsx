// frontend/src/components/dashboard/LevelProgress.jsx - Komplett ohne Rahmen
import React from 'react';
import UserAvatar from '../common/UserAvatar';

const LevelProgress = ({ user, themeClasses, isDarkMode }) => {
  const xpProgress = (user.xp / user.xpToNext) * 100;

  return (
    <div className={`${themeClasses.cardBg} rounded-2xl p-6 shadow-lg`} style={{border: 'none'}}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {/* Aktualisierter Avatar mit GIF-Support */}
            <UserAvatar 
              user={user} 
              size="lg" 
              showBorder={false}
              showStatus={true}
              className="shadow-xl"
            />
            
            {/* Level Badge */}
            <div className="absolute -bottom-2 -right-2 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full text-xs font-bold text-white shadow-lg">
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
            
            {/* Zusätzliche User-Info */}
            <div className="flex items-center space-x-4 mt-1">
              <span className={`text-xs ${themeClasses.textTertiary}`}>
                Mitglied seit {new Date(user.joinDate).toLocaleDateString('de-DE')}
              </span>
              {user.lastActive && (
                <span className={`text-xs ${themeClasses.textTertiary}`}>
                  Zuletzt aktiv: {new Date(user.lastActive).toLocaleDateString('de-DE')}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`text-sm ${themeClasses.textSecondary}`}>Nächstes Level</p>
          <p className={`text-lg font-bold ${themeClasses.text}`}>
            {(user.xpToNext - user.xp).toLocaleString()} XP
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-xs ${themeClasses.textTertiary}`}>
              {Math.round(xpProgress)}% erreicht
            </span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>
            Level {user.level} Fortschritt
          </span>
          <span className={`text-sm ${themeClasses.textTertiary}`}>
            {user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP
          </span>
        </div>
        
        {/* Verbesserter Progress Bar */}
        <div className={`w-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-4 overflow-hidden shadow-inner`}>
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-500 rounded-full transition-all duration-1000 relative"
            style={{ width: `${Math.max(xpProgress, 2)}%` }}
          >
            {/* Glänzender Effekt */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full animate-pulse"></div>
            
            {/* Fortschritts-Indikator */}
            {xpProgress > 10 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <span className="text-xs font-bold text-white drop-shadow-sm">
                  {Math.round(xpProgress)}%
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* XP Gewinn Info */}
        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs ${themeClasses.textTertiary}`}>
            💬 {user.xpFromMessages || 0} XP aus Nachrichten
          </span>
          <span className={`text-xs ${themeClasses.textTertiary}`}>
            🎮 {user.xpFromGames || 0} XP aus Spielen
          </span>
          <span className={`text-xs ${themeClasses.textTertiary}`}>
            🎯 {user.xpFromAchievements || 0} XP aus Erfolgen
          </span>
        </div>
      </div>
    </div>
  );
};

export default LevelProgress;