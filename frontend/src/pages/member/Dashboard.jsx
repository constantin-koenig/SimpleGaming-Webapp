import React, { useState } from 'react';

// Component Imports
import Navigation from '../../components/dashboard/Navigation';
import LevelProgress from '../../components/dashboard/LevelProgress';
import StatsCards from '../../components/dashboard/StatsCards';
import GameActivity from '../../components/dashboard/GameActivity';
import Achievements from '../../components/dashboard/Achievements';
import RegisteredEvents from '../../components/dashboard/RegisteredEvents';
import BuddyRequests from '../../components/dashboard/BuddyRequests';
import FriendsList from '../../components/dashboard/FriendsList';
import QuickActions from '../../components/dashboard/QuickActions';

// Data Imports (könnte später aus API kommen)
import { 
  userData, 
  dashboardStatsData, 
  gameActivityData, 
  recentGamingActivityData,
  achievementsData,
  registeredEventsData,
  buddyRequestsData,
  friendsData 
} from '../data/dashboardData';

const Dashboard = () => {
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  // Navigation State
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  
  // Activity Filter State
  const [activityFilter, setActivityFilter] = useState('weekly');

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

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      {/* Navigation */}
      <Navigation 
        activeNavItem={activeNavItem}
        setActiveNavItem={setActiveNavItem}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        user={userData}
        themeClasses={themeClasses}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Level Progress */}
        <div className="mb-8">
          <LevelProgress 
            user={userData}
            themeClasses={themeClasses}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Linke Spalte */}
          <div className="lg:col-span-2 space-y-6">
            {/* Statistik-Karten */}
            <StatsCards 
              dashboardStats={dashboardStatsData}
              themeClasses={themeClasses}
            />

            {/* Gaming-Aktivität */}
            <GameActivity 
              activityFilter={activityFilter}
              setActivityFilter={setActivityFilter}
              gameActivity={gameActivityData}
              recentGamingActivity={recentGamingActivityData}
              themeClasses={themeClasses}
              isDarkMode={isDarkMode}
            />

            {/* Erfolge */}
            <Achievements 
              achievements={achievementsData}
              themeClasses={themeClasses}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Rechte Spalte */}
          <div className="space-y-6">
            {/* Angemeldete Events */}
            <RegisteredEvents 
              registeredEvents={registeredEventsData}
              themeClasses={themeClasses}
              isDarkMode={isDarkMode}
            />

            {/* Gaming Buddy Anfragen */}
            <BuddyRequests 
              buddyRequests={buddyRequestsData}
              themeClasses={themeClasses}
              isDarkMode={isDarkMode}
            />

            {/* Freunde */}
            <FriendsList 
              friends={friendsData}
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