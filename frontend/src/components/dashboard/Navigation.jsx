// components/dashboard/Navigation.jsx - Erweitert mit Admin-Funktionalität
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  Home, Gamepad2, Calendar, Users, Trophy, User, Settings,
  Sun, Moon, Bell, Shield, ChevronDown, LogOut, BarChart3,
  UserCheck, Zap
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
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Prüfen ob wir gerade im Admin-Bereich sind
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Navigation Items für Member-Bereich - kompakter gruppiert
  const memberNavItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Home, route: '/dashboard' },
    { id: 'games', name: 'Spiele', icon: Gamepad2, route: '/games' },
    { id: 'events', name: 'Events', icon: Calendar, route: '/events' },
    { id: 'community', name: 'Community', icon: Users, route: '/community' },
    { id: 'leaderboard', name: 'Rangliste', icon: Trophy, route: '/leaderboard' }
  ];

  // Navigation Items für Admin-Bereich - fokussiert auf wichtigste Bereiche
  const adminNavItems = [
    { id: 'admin-dashboard', name: 'Übersicht', icon: BarChart3, route: '/admin' },
    { id: 'admin-users', name: 'Benutzer', icon: Users, route: '/admin/users' },
    { id: 'admin-roles', name: 'Rollen', icon: UserCheck, route: '/admin/roles' },
    { id: 'admin-system', name: 'System', icon: Zap, route: '/admin/system' }
  ];

  // Aktuelle Navigation basierend auf Bereich
  const currentNavItems = isAdminRoute ? adminNavItems : memberNavItems;

  // Navigation Handler
  const handleNavClick = (item) => {
    if (item.route) {
      navigate(item.route);
    }
    setActiveNavItem(item.id);
  };

  // Admin Toggle Handler mit Transition
  const handleAdminToggle = () => {
    setIsTransitioning(true);
    
    // Kurze Verzögerung für smooth transition
    setTimeout(() => {
      if (isAdminRoute) {
        // Zurück zum Member-Bereich
        navigate('/dashboard');
        setActiveNavItem('dashboard');
      } else {
        // Zum Admin-Bereich
        navigate('/admin');
        setActiveNavItem('admin-dashboard');
      }
      
      // Transition nach Navigation beenden
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 50);
  };

  // Feste Breiten für Navigation Items um Layout-Verschiebungen zu vermeiden
  const getNavItemWidth = () => {
    // Berechne maximale Breite basierend auf längsten Text
    return 'w-24 lg:w-auto'; // Feste Breite auf kleineren Bildschirmen
  };

  // Kompakter Bereich-Umschalter mit fester Breite
  const AreaToggle = () => {
    if (!user?.roles?.includes('admin')) return null;

    return (
      <div className="relative">
        <button
          onClick={handleAdminToggle}
          disabled={isTransitioning}
          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-w-[80px] lg:min-w-[100px] ${
            isTransitioning 
              ? 'opacity-75 cursor-wait'
              : isAdminRoute
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-md'
              : `${themeClasses.textSecondary} hover:${themeClasses.text} hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`
          }`}
          title={isAdminRoute ? 'Zurück zum Member-Bereich' : 'Zum Admin-Bereich wechseln'}
        >
          <Shield className="w-4 h-4 flex-shrink-0" />
          <span className="hidden lg:inline whitespace-nowrap">
            {isTransitioning ? 'Wechsle...' : isAdminRoute ? 'Admin' : 'Member'}
          </span>
        </button>
      </div>
    );
  };

  return (
    <nav className={`${themeClasses.navBg} border-b ${themeClasses.navBorder} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand - feste Breite */}
          <div className="flex items-center space-x-3 min-w-[200px]">
            <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent whitespace-nowrap">
              SimpleGaming
            </div>
            {/* Admin-Indikator mit fester Breite und Transition */}
            <div className="flex items-center">
              {isAdminRoute && (
                <div className={`flex items-center space-x-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-md transition-all duration-300 ${
                  isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                }`}>
                  <Shield className="w-3 h-3 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-medium text-red-600 dark:text-red-400 hidden sm:inline">ADMIN</span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation Items - feste Container-Breite */}
          <div className="hidden md:flex items-center space-x-1 flex-1 justify-center max-w-lg">
            <div className={`flex items-center space-x-1 transition-all duration-300 ${
              isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
            }`}>
              {currentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNavItem === item.id || location.pathname === item.route;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item)}
                    disabled={isTransitioning}
                    className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${getNavItemWidth()} ${
                      isActive
                        ? isAdminRoute 
                          ? 'bg-red-500 text-white shadow-md'
                          : 'bg-blue-500 text-white shadow-md'
                        : `${themeClasses.textSecondary} hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} hover:${themeClasses.text}`
                    } ${isTransitioning ? 'cursor-wait' : 'cursor-pointer'}`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden lg:inline whitespace-nowrap">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right side controls - feste Breite */}
          <div className="flex items-center space-x-2 min-w-[200px] justify-end">
            {/* Admin Toggle */}
            <AreaToggle />

            {/* Control Buttons - feste Positionen */}
            <div className="flex items-center space-x-1">
              {/* Theme Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors w-10 h-10 flex items-center justify-center`}
                title="Theme umschalten"
              >
                {isDarkMode ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
              </button>

              {/* Notifications */}
              <button 
                className={`relative p-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors w-10 h-10 flex items-center justify-center`}
                title="Benachrichtigungen"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
            </div>

            {/* User Profile - feste Breite */}
            <div className="relative ml-2">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 focus:outline-none group min-w-[120px] justify-start"
              >
                <UserAvatar 
                  user={user} 
                  size="sm" 
                  showBorder={true}
                  showStatus={true}
                  className="cursor-pointer group-hover:ring-2 group-hover:ring-blue-500 group-hover:ring-offset-1 transition-all flex-shrink-0"
                />
                
                {/* Username - feste Breite container */}
                <div className="hidden xl:block text-left flex-1 min-w-0">
                  <div className={`text-sm font-medium ${themeClasses.text} flex items-center truncate`}>
                    <span className="truncate">{user?.username || 'Benutzer'}</span>
                    {user?.roles?.includes('admin') && (
                      <span className="ml-1 text-yellow-500 flex-shrink-0">👑</span>
                    )}
                  </div>
                  <div className={`text-xs ${themeClasses.textSecondary} truncate`}>
                    Level {user?.level || 1}
                  </div>
                </div>

                <ChevronDown className={`w-4 h-4 ${themeClasses.textSecondary} transition-transform ${showUserMenu ? 'rotate-180' : ''} hidden sm:block flex-shrink-0`} />
              </button>

              {/* User Dropdown */}
              {showUserMenu && (
                <div className={`absolute top-full right-0 mt-2 w-48 ${themeClasses.cardBg} border ${themeClasses.cardBorder} rounded-lg shadow-xl z-50`}>
                  <div className="py-1">
                    {/* User Info */}
                    <div className={`px-4 py-3 border-b ${themeClasses.cardBorder}`}>
                      <div className={`text-sm font-medium ${themeClasses.text} flex items-center`}>
                        <span className="truncate">{user?.username}</span>
                        {user?.roles?.includes('admin') && (
                          <span className="ml-1 text-yellow-500">👑</span>
                        )}
                      </div>
                      <div className={`text-xs ${themeClasses.textSecondary} truncate`}>
                        {user?.email}
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${themeClasses.text} hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center space-x-2`}
                      >
                        <User className="w-4 h-4" />
                        <span>Profil</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm ${themeClasses.text} hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center space-x-2`}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Einstellungen</span>
                      </button>
                    </div>
                    
                    {/* Logout */}
                    <div className={`border-t ${themeClasses.cardBorder}`}>
                      <button
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} flex items-center space-x-2`}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Abmelden</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation - mit Transition */}
      <div className="md:hidden">
        <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 max-h-96 overflow-y-auto transition-all duration-300 ${
          isTransitioning ? 'opacity-50' : 'opacity-100'
        }`}>
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavItem === item.id || location.pathname === item.route;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                disabled={isTransitioning}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? isAdminRoute 
                      ? 'bg-red-500 text-white'
                      : 'bg-blue-500 text-white'
                    : `${themeClasses.textSecondary} hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} hover:${themeClasses.text}`
                } ${isTransitioning ? 'cursor-wait opacity-75' : 'cursor-pointer'}`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </button>
            );
          })}
          
          {/* Mobile Admin Toggle */}
          {user?.roles?.includes('admin') && (
            <div className={`border-t ${themeClasses.cardBorder} pt-2 mt-2`}>
              <button
                onClick={handleAdminToggle}
                disabled={isTransitioning}
                className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isAdminRoute
                    ? 'bg-red-500 text-white'
                    : `${themeClasses.textSecondary} hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} hover:${themeClasses.text}`
                } ${isTransitioning ? 'cursor-wait opacity-75' : 'cursor-pointer'}`}
              >
                <Shield className="w-4 h-4" />
                <span>{isTransitioning ? 'Wechsle...' : isAdminRoute ? 'Zu Member-Bereich' : 'Zu Admin-Bereich'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside handlers */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </nav>
  );
};

export default Navigation;
               