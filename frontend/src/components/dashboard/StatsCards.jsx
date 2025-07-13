// frontend/src/components/dashboard/StatsCards.jsx - FIXED: undefined values
import React from 'react';
import { MessageSquare, Headphones, Gamepad2, Trophy } from 'lucide-react';

const StatsCards = ({ dashboardStats, themeClasses }) => {
  // ✅ SAFE: Fallback-Werte für undefined/null Daten
  const safeStats = {
    totalMessages: dashboardStats?.totalMessages || 0,
    voiceHours: dashboardStats?.voiceHours || 0,
    gamesPlayed: dashboardStats?.gamesPlayed || 0,
    achievementsUnlocked: dashboardStats?.achievementsUnlocked || 0
  };

  const statsData = [
    {
      title: 'Nachrichten',
      value: safeStats.totalMessages.toLocaleString(),
      color: 'blue',
      icon: MessageSquare
    },
    {
      title: 'Voice Stunden',
      value: safeStats.voiceHours.toLocaleString(),
      color: 'green',
      icon: Headphones
    },
    {
      title: 'Spiele',
      value: safeStats.gamesPlayed.toLocaleString(),
      color: 'purple',
      icon: Gamepad2
    },
    {
      title: 'Erfolge',
      value: safeStats.achievementsUnlocked.toLocaleString(),
      color: 'orange',
      icon: Trophy
    }
  ];

  // ✅ IMPROVED: Farbklassen dynamisch generieren
  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'text-blue-500',
      green: 'text-green-500', 
      purple: 'text-purple-500',
      orange: 'text-orange-500'
    };
    return colorMap[color] || 'text-gray-500';
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        const colorClass = getColorClasses(stat.color);
        
        return (
          <div 
            key={index} 
            className={`${themeClasses.cardBg} rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200`}
            style={{ border: 'none' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className={`${colorClass} text-sm font-medium mb-1`}>
                  {stat.title}
                </p>
                <p className={`text-2xl font-bold ${themeClasses.text}`}>
                  {stat.value}
                </p>
              </div>
              <div className="flex-shrink-0 ml-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;