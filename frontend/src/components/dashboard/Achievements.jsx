import React from 'react';
import { Award, Check, Grid, List } from 'lucide-react';

const Achievements = ({ achievements, themeClasses, isDarkMode }) => {
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'uncommon': return 'border-green-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  return (
    <div className={`${themeClasses.cardBg} rounded-2xl p-6 border ${themeClasses.cardBorder} shadow-sm`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-bold ${themeClasses.text} flex items-center`}>
          <Award className="w-5 h-5 mr-2 text-yellow-500" />
          Erfolge ({achievements.filter(a => a.unlocked).length}/{achievements.length})
        </h3>
        <div className="flex items-center space-x-2">
          <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
            <Grid className="w-4 h-4" />
          </button>
          <button className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id} 
            className={`p-4 rounded-lg border-2 ${achievement.unlocked ? getRarityColor(achievement.rarity) : 'border-gray-600'} ${
              achievement.unlocked ? themeClasses.cardBg : `${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'} opacity-60`
            } transition-all hover:scale-105`}
          >
            <div className="flex items-center space-x-3">
              <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                {achievement.icon}
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${themeClasses.text} text-sm flex items-center`}>
                  {achievement.name}
                  {achievement.unlocked && <Check className="w-4 h-4 ml-2 text-green-500" />}
                </h4>
                <p className={`text-xs ${themeClasses.textTertiary}`}>{achievement.description}</p>
                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-xs text-blue-500 mt-1">
                    Freigeschaltet: {new Date(achievement.unlockedAt).toLocaleDateString('de-DE')}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Achievements;