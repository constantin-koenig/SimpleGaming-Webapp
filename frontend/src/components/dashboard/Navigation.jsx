// components/dashboard/Navigation.jsx - Aktualisiert mit UserAvatar-Komponente
import React from 'react';
import { 
  Home, Gamepad2, Calendar, Users, Trophy, User, Settings,
  Sun, Moon, Bell
} from 'lucide-react';
import UserAvatar from '../common/UserAvatar';

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
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Profile mit GIF-Avatar */}
            <div className="flex items-center space-x-3">
              {/* Aktualisierter Avatar mit GIF-Support */}
              <UserAvatar 
                user={user} 
                size="md" 
                showBorder={true}
                showStatus={true}
                className="cursor-pointer hover:ring-2 hover:ring-blue-500 hover:ring-offset-2 transition-all"
              />
              
              {/* Username und Level */}
              <div className="hidden sm:block">
                <div className={`text-sm font-medium ${themeClasses.text}`}>
                  {user?.username || 'Benutzer'}
                </div>
                <div className={`text-xs ${themeClasses.textSecondary}`}>
                  Level {user?.level || 1}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavItem === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNavItem(item.id)}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
      </div>
    </nav>
  );
};

export default Navigation;