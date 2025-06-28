import React from 'react';
import { MessageSquare, Headphones, Gamepad2, Trophy } from 'lucide-react';

const StatsCards = ({ dashboardStats, themeClasses }) => {
  const statsData = [
    {
      title: 'Nachrichten',
      value: dashboardStats.totalMessages.toLocaleString(),
      weekly: `+${dashboardStats.weeklyProgress.messages} diese Woche`,
      color: 'blue',
      icon: MessageSquare
    },
    {
      title: 'Voice Stunden',
      value: dashboardStats.voiceHours,
      weekly: `+${dashboardStats.weeklyProgress.voiceTime}h diese Woche`,
      color: 'green',
      icon: Headphones
    },
    {
      title: 'Spiele',
      value: dashboardStats.gamesPlayed,
      weekly: `+${dashboardStats.weeklyProgress.gamesPlayed} diese Woche`,
      color: 'purple',
      icon: Gamepad2
    },
    {
      title: 'Erfolge',
      value: dashboardStats.achievementsUnlocked,
      weekly: '+3 neue',
      color: 'orange',
      icon: Trophy
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className={`${themeClasses.cardBg} rounded-xl p-4 border ${themeClasses.cardBorder} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-${stat.color}-500 text-sm font-medium`}>{stat.title}</p>
                <p className={`text-2xl font-bold ${themeClasses.text}`}>{stat.value}</p>
                <p className={`text-xs ${themeClasses.textTertiary}`}>{stat.weekly}</p>
              </div>
              <Icon className={`w-8 h-8 text-${stat.color}-500`} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;