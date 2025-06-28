import React from 'react';
import { Users, MessageCircle, Gamepad2 } from 'lucide-react';

const FriendsList = ({ friends, themeClasses, isDarkMode }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'ingame': return 'bg-purple-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`${themeClasses.cardBg} rounded-2xl p-6 border ${themeClasses.cardBorder} shadow-sm`}>
      <h3 className={`text-xl font-bold mb-4 ${themeClasses.text} flex items-center`}>
        <Users className="w-5 h-5 mr-2 text-green-500" />
        Freunde ({friends.filter(f => f.status === 'online' || f.status === 'ingame').length}/{friends.length} online)
      </h3>
      <div className="space-y-3">
        {friends.map((friend) => (
          <div key={friend.id} className={`p-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg border ${themeClasses.cardBorder} hover:border-blue-500/30 transition-colors cursor-pointer`}>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={friend.avatar}
                  alt={friend.username}
                  className="w-8 h-8 rounded-full"
                />
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(friend.status)} rounded-full border-2 ${isDarkMode ? 'border-gray-800' : 'border-white'}`}></div>
              </div>
              <div className="flex-1">
                <h4 className={`font-semibold ${themeClasses.text} text-sm`}>{friend.username}</h4>
                <p className={`text-xs ${themeClasses.textTertiary}`}>
                  {friend.status === 'online' ? 'Online' :
                   friend.status === 'ingame' ? `Spielt ${friend.game}` :
                   friend.lastSeen}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-all duration-200 transform hover:scale-110 group`}>
                  <MessageCircle className="w-4 h-4 text-blue-500 group-hover:text-blue-400" />
                </button>
                {(friend.status === 'online' || friend.status === 'ingame') && (
                  <button className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'} transition-all duration-200 transform hover:scale-110 group`}>
                    <Gamepad2 className="w-4 h-4 text-purple-500 group-hover:text-purple-400" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;