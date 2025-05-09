// frontend/src/components/common/MemberLayout.jsx
// Eine gemeinsame Layout-Komponente für alle Mitgliederseiten
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ThemeToggle from './ThemeToggle';

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
                <div className="flex items-center">
                  <img
                    className="h-8 w-8 rounded-full border border-light-border-primary dark:border-dark-border-primary"
                    src={user && user.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : 'https://via.placeholder.com/40'}
                    alt="Profilbild"
                  />
                  <span className="ml-2 text-light-text-primary dark:text-dark-text-primary">{user?.username || 'Benutzer'}</span>
                  <button
                    onClick={logout}
                    className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
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