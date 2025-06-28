import React from 'react';
import { 
  Zap, Gamepad2, Calendar, UserPlus, Trophy, Heart, Search 
} from 'lucide-react';

const QuickActions = ({ themeClasses }) => {
  const actions = [
    { icon: Gamepad2, label: 'Spiel finden', color: 'purple' },
    { icon: Calendar, label: 'Event erstellen', color: 'blue' },
    { icon: UserPlus, label: 'Buddy finden', color: 'green' },
    { icon: Trophy, label: 'Turnier', color: 'orange' },
    { icon: Heart, label: 'Favoriten', color: 'pink' },
    { icon: Search, label: 'Entdecken', color: 'indigo' }
  ];

  return (
    <div className={`${themeClasses.cardBg} rounded-2xl p-6 border ${themeClasses.cardBorder} shadow-sm`}>
      <h3 className={`text-xl font-bold mb-4 ${themeClasses.text} flex items-center`}>
        <Zap className="w-5 h-5 mr-2 text-yellow-500" />
        Schnellaktionen
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button 
              key={index}
              className={`p-4 bg-gradient-to-br from-${action.color}-500/20 to-${action.color}-600/30 hover:from-${action.color}-500/30 hover:to-${action.color}-600/40 rounded-xl border border-${action.color}-500/30 hover:border-${action.color}-400/50 transition-all duration-300 text-center group transform hover:scale-105 hover:shadow-lg`}
            >
              <Icon className={`w-7 h-7 mx-auto mb-2 text-${action.color}-400 group-hover:text-${action.color}-300 group-hover:scale-110 transition-all duration-200`} />
              <span className={`text-sm font-medium ${themeClasses.text} group-hover:text-${action.color}-300`}>{action.label}</span>
              <div className={`w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-${action.color}-400 to-${action.color}-600 mx-auto mt-1 transition-all duration-300`}></div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;