// ===== components/dashboard/Navigation.jsx =====
import React from 'react';
import { 
  Home, Gamepad2, Calendar, Users, Trophy, User, Settings,
  Sun, Moon, Bell
} from 'lucide-react';

const Navigation = ({ 
  activeNavItem, 
  setActiveNavItem, 
  isDarkMode, 
  setIsDarkMode, 
  user, 
  themeClasses 
}) => {
  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'games', name: 'Spiele', icon: Gamepad2 },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'community', name: 'Community', icon: Users },
    { id: 'leaderboard', name: 'Leaderboard', icon: Trophy },
    { id: 'profile', name: 'Profil', icon: User },
    { id: 'settings', name: 'Einstellungen', icon: Settings }
  ];

  return (
    <nav className={`${themeClasses.navBg} border-b ${themeClasses.navBorder} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              SimpleGaming
            </div>
          </div>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNavItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveNavItem(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-500 text-white'
                      : `${themeClasses.textSecondary} hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} hover:${themeClasses.text}`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>

          {/* User & Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
            </button>

            {/* Notifications */}
            <button className={`relative p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}>
              <Bell className={`w-5 h-5 ${themeClasses.text}`} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Avatar */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-8 h-8 rounded-full ring-2 ring-blue-500"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
              </div>
              <div className="hidden md:block">
                <p className={`text-sm font-medium ${themeClasses.text}`}>{user.username}</p>
                <p className={`text-xs ${themeClasses.textTertiary}`}>Level {user.level}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;