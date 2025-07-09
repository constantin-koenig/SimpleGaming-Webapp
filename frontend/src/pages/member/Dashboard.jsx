// ===== components/Dashboard.jsx (UPDATED - Nur Activity Overview) =====
import React, { useState } from 'react';
import { useDashboardData } from '../../hooks/useDashboardData';

// Component Imports
import Navigation from '../../components/dashboard/Navigation';
import LevelProgress from '../../components/dashboard/LevelProgress';
import StatsCards from '../../components/dashboard/StatsCards';
import ActivityOverview from '../../components/dashboard/ActivityOverview';
import Achievements from '../../components/dashboard/Achievements';
import RegisteredEvents from '../../components/dashboard/RegisteredEvents';
import BuddyRequests from '../../components/dashboard/BuddyRequests';
import FriendsList from '../../components/dashboard/FriendsList';
import QuickActions from '../../components/dashboard/QuickActions';

const Dashboard = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Navigation State
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  
  // Activity States
  const [activityFilter, setActivityFilter] = useState('weekly');

  // API Data Hook
  const { 
    data, 
    loading, 
    error, 
    refetch, 
    updateGameActivity,
    acceptBuddyRequest,
    rejectBuddyRequest,
    cancelEventRegistration,
    sendFriendMessage,
    inviteFriendToGame
  } = useDashboardData();

  // Theme classes
  const themeClasses = {
    bg: isDarkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    cardBorder: isDarkMode ? 'border-gray-700' : 'border-gray-200',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    textTertiary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    navBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    navBorder: isDarkMode ? 'border-gray-700' : 'border-gray-200'
  };

  // Handle activity filter change
  const handleActivityFilterChange = async (newFilter) => {
    setActivityFilter(newFilter);
    
    // Update activity-related data if needed
    if (newFilter === 'daily') {
      // Could trigger specific daily data updates
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 text-lg ${themeClasses.text}`}>Dashboard wird geladen...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !data.userData) {
    return (
      <div className={`min-h-screen ${themeClasses.bg} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Fehler beim Laden des Dashboards:</p>
          <p className={`text-sm ${themeClasses.textSecondary} mb-4`}>{error}</p>
          <button 
            onClick={refetch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Erneut versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      {/* Navigation */}
      <Navigation 
        activeNavItem={activeNavItem}
        setActiveNavItem={setActiveNavItem}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        user={data.userData}
        themeClasses={themeClasses}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Level Progress */}
        <div className="mb-8">
          <LevelProgress 
            user={data.userData}
            themeClasses={themeClasses}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Linke Spalte - 2/3 der Breite */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistik-Karten */}
            <StatsCards 
              dashboardStats={data.dashboardStats}
              themeClasses={themeClasses}
            />

            {/* Activity Overview - Nur noch diese eine Component */}
            <ActivityOverview
              activityFilter={activityFilter}
              setActivityFilter={handleActivityFilterChange}
              activityData={data.combinedActivity} // Würde aus API kommen
              themeClasses={themeClasses}
              isDarkMode={isDarkMode}
            />

            {/* Erfolge */}
            <Achievements 
              achievements={data.achievements}
              themeClasses={themeClasses}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Rechte Spalte - 1/3 der Breite */}
          <div className="space-y-6">
            {/* Angemeldete Events */}
            <RegisteredEvents 
              registeredEvents={data.registeredEvents}
              onCancelRegistration={cancelEventRegistration}
              themeClasses={themeClasses}
              isDarkMode={isDarkMode}
            />

            {/* Gaming Buddy Anfragen */}
            <BuddyRequests 
              buddyRequests={data.buddyRequests}
              onAcceptRequest={acceptBuddyRequest}
              onRejectRequest={rejectBuddyRequest}
              themeClasses={themeClasses}
              isDarkMode={isDarkMode}
            />

            {/* Freunde */}
            <FriendsList 
              friends={data.friends}
              onSendMessage={sendFriendMessage}
              onInviteToGame={inviteFriendToGame}
              themeClasses={themeClasses}
              isDarkMode={isDarkMode}
            />

            {/* Schnellaktionen */}
            <QuickActions 
              themeClasses={themeClasses}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;