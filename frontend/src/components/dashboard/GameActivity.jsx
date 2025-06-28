import React from 'react';
import { Gamepad2, Clock } from 'lucide-react';

const GameActivity = ({ 
  activityFilter, 
  setActivityFilter, 
  gameActivity, 
  recentGamingActivity, 
  themeClasses, 
  isDarkMode 
}) => {
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'vor wenigen Minuten';
    if (diffInHours < 24) return `vor ${diffInHours}h`;
    return `vor ${Math.floor(diffInHours / 24)} Tag(en)`;
  };

  return (
    <div className={`${themeClasses.cardBg} rounded-2xl p-6 border ${themeClasses.cardBorder} shadow-sm`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-bold ${themeClasses.text} flex items-center`}>
          <Gamepad2 className="w-5 h-5 mr-2 text-purple-500" />
          Gaming-Aktivität
        </h3>
        <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {[
            { key: 'daily', label: 'Täglich' },
            { key: 'weekly', label: 'Wöchentlich' },
            { key: 'monthly', label: 'Monatlich' },
            { key: 'alltime', label: 'Allzeit' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActivityFilter(filter.key)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activityFilter === filter.key
                  ? 'bg-blue-500 text-white shadow-sm transform scale-105'
                  : `${themeClasses.textSecondary} hover:${themeClasses.text} hover:bg-white/50 dark:hover:bg-gray-600`
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Gaming Chart */}
      <div className="grid grid-cols-5 md:grid-cols-7 gap-3 mb-6">
        {gameActivity[activityFilter].map((period, index) => {
          const totalPlaytime = period.games.reduce((sum, game) => sum + game.playtime, 0);
          const maxHeight = 120;
          
          return (
            <div key={index} className="text-center">
              <div className={`text-xs ${themeClasses.textTertiary} mb-2 font-medium`}>{period.label}</div>
              <div className="relative bg-gray-100 dark:bg-gray-700 rounded-lg p-2 min-h-[140px] flex flex-col justify-end">
                {period.games.length > 0 ? (
                  <div className="space-y-1">
                    {period.games.map((game, gameIndex) => {
                      const height = Math.max(8, (game.playtime / (totalPlaytime || 1)) * maxHeight);
                      return (
                        <div 
                          key={gameIndex}
                          className="rounded transition-all duration-300 hover:scale-105 cursor-pointer"
                          style={{ 
                            backgroundColor: game.color,
                            height: `${height}px`,
                            opacity: 0.8
                          }}
                          title={`${game.name}: ${Math.floor(game.playtime / 60)}h ${game.playtime % 60}m`}
                        ></div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-gray-400 italic">Keine Aktivität</div>
                )}
                <div className={`text-xs ${themeClasses.textTertiary} mt-2 font-medium`}>
                  {totalPlaytime > 0 ? `${Math.floor(totalPlaytime / 60)}h ${totalPlaytime % 60}m` : '0m'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Spiele-Legende */}
      <div className="flex flex-wrap items-center gap-4 text-sm mb-6">
        {['Valorant', 'CS2', 'Minecraft', 'Rust'].map((game) => {
          const gameData = { 
            'Valorant': { color: '#FF4655', icon: '🎯' },
            'CS2': { color: '#F7931E', icon: '💥' },
            'Minecraft': { color: '#62B47A', icon: '⛏️' },
            'Rust': { color: '#CE422B', icon: '🔥' }
          }[game];
          
          return (
            <div key={game} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded"
                style={{ backgroundColor: gameData.color }}
              ></div>
              <span className={themeClasses.textSecondary}>{gameData.icon} {game}</span>
            </div>
          );
        })}
      </div>

      {/* Letzte Gaming-Aktivität */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className={`text-lg font-semibold ${themeClasses.text} mb-4 flex items-center`}>
          <Clock className="w-4 h-4 mr-2 text-blue-500" />
          Letzte Sessions
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recentGamingActivity.map((activity, index) => (
            <div 
              key={index} 
              className={`p-3 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg border ${themeClasses.cardBorder} hover:border-blue-500/30 transition-all duration-200 cursor-pointer group`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: activity.color }}
                  ></div>
                  <div>
                    <h5 className={`font-medium ${themeClasses.text} text-sm flex items-center`}>
                      {activity.icon} {activity.game}
                    </h5>
                    <p className={`text-xs ${themeClasses.textTertiary}`}>
                      {Math.floor(activity.duration / 60)}h {activity.duration % 60}m gespielt
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs ${themeClasses.textSecondary}`}>
                    {getRelativeTime(activity.lastPlayed)}
                  </p>
                  <div className="w-2 h-2 bg-green-500 rounded-full ml-auto mt-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameActivity;