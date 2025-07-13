// frontend/src/components/common/MemberLayout.jsx - Aktualisiert mit UserAvatar
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';
import UserAvatar from './UserAvatar';

const MemberLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Prüfen, ob der aktuelle Pfad dem Navigationslink entspricht
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary">
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-light-text-primary dark:text-dark-text-primary text-xl font-bold">GamingCommunity</Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-2">
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/dashboard') 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                  }`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/profile"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/profile') 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                  }`}
                >
                  Profil
                </Link>
                <Link 
                  to="/buddies"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/buddies') 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                  }`}
                >
                  Gaming-Buddies
                </Link>
                <Link 
                  to="/events"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/events') 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                  }`}
                >
                  Events
                </Link>
                {user && user.roles && user.roles.includes('admin') && (
                  <Link 
                    to="/admin"
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      isActive('/admin') 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
                    }`}
                  >
                    Admin
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <ThemeToggle />
              <div className="relative">
                <div className="flex items-center space-x-3">
                  {/* Aktualisierter Avatar mit GIF-Support */}
                  <UserAvatar 
                    user={user} 
                    size="sm" 
                    showBorder={true}
                    className="cursor-pointer hover:ring-2 hover:ring-primary-500 hover:ring-offset-2 transition-all"
                  />
                  
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                      {user?.username || 'Benutzer'}
                    </span>
                    {user?.level && (
                      <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        Level {user.level}
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={logout}
                    className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
                  >
                    Abmelden
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MemberLayout;