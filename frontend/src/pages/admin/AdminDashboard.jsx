// frontend/src/pages/admin/AdminDashboard.jsx - Komplett neu gestaltet
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Navigation from '../../components/dashboard/Navigation';
import UserAvatar from '../../components/common/UserAvatar';
import ActivityOverview from '../../components/dashboard/ActivityOverview';
import { 
  Users, Crown, Activity, TrendingUp, Calendar, 
  Search, Filter, MoreVertical, Edit, Trash2, 
  Shield, Mail, Clock, ChevronDown, Plus,
  BarChart3, PieChart, Download, RefreshCw, Settings
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // Navigation States (für die Dashboard Navigation)
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeNavItem, setActiveNavItem] = useState('admin');

  // Activity States (für die Aktivitätsübersicht)
  const [activityFilter, setActivityFilter] = useState('weekly');
  const [activityLoading, setActivityLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Theme classes (gleiche wie im Dashboard)
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

  // Simulierte Daten für Admin Dashboard (später durch echte API-Calls ersetzen)
  const [stats, setStats] = useState({
    totalMembers: 245,
    newThisWeek: 12,
    activeToday: 89,
    totalEvents: 156,
    growthRate: 8.5
  });

  // Simulierte Community-weite Aktivitätsdaten
  const [communityActivityData] = useState([
    {
      id: 'week-1',
      label: 'KW 25',
      date: '2024-06-17',
      messages: { value: 2847, change: 12 },
      voice: { value: 1456, change: -5 },
      gaming: { value: 2103, change: 23 },
      events: { value: 8, change: 0 }
    },
    {
      id: 'week-2', 
      label: 'KW 26',
      date: '2024-06-24',
      messages: { value: 3156, change: 11 },
      voice: { value: 1623, change: 11 },
      gaming: { value: 2387, change: 14 },
      events: { value: 12, change: 50 }
    },
    {
      id: 'week-3',
      label: 'KW 27', 
      date: '2024-07-01',
      messages: { value: 2934, change: -7 },
      voice: { value: 1789, change: 10 },
      gaming: { value: 2698, change: 13 },
      events: { value: 15, change: 25 }
    },
    {
      id: 'week-4',
      label: 'KW 28',
      date: '2024-07-08', 
      messages: { value: 3421, change: 17 },
      voice: { value: 1945, change: 9 },
      gaming: { value: 2845, change: 5 },
      events: { value: 18, change: 20 }
    },
    {
      id: 'week-5',
      label: 'KW 29',
      date: '2024-07-15',
      messages: { value: 3678, change: 8 },
      voice: { value: 2134, change: 10 },
      gaming: { value: 3102, change: 9 },
      events: { value: 22, change: 22 }
    }
  ]);

  const [memberGrowthData] = useState([
    { month: 'Jan', members: 180 },
    { month: 'Feb', members: 195 },
    { month: 'Mär', members: 210 },
    { month: 'Apr', members: 225 },
    { month: 'Mai', members: 235 },
    { month: 'Jun', members: 245 }
  ]);

  const [topUsers] = useState([
    {
      id: 1,
      discordId: '123456789',
      username: 'GamerPro2024',
      avatar: null,
      level: 15,
      xp: 2450,
      eventsJoined: 12
    },
    {
      id: 2,
      discordId: '987654321',
      username: 'AdminMaster',
      avatar: null,
      level: 25,
      xp: 4200,
      eventsJoined: 28
    },
    {
      id: 3,
      discordId: '456789123',
      username: 'CasualGamer',
      avatar: null,
      level: 8,
      xp: 1200,
      eventsJoined: 5
    },
    {
      id: 4,
      discordId: '789123456',
      username: 'EventOrganizer',
      avatar: null,
      level: 18,
      xp: 3100,
      eventsJoined: 45
    },
    {
      id: 5,
      discordId: '111222333',
      username: 'VoiceChatter',
      avatar: null,
      level: 12,
      xp: 1890,
      eventsJoined: 8
    }
  ]);

  // Activity Handler für Community-weite Daten
  const handleActivityFilterChange = async (newFilter) => {
    setActivityLoading(true);
    setActivityFilter(newFilter);
    
    // Simuliere API-Call für Community-weite Aktivitätsdaten
    setTimeout(() => {
      setActivityLoading(false);
    }, 800);
  };

  // Navigation Handler für Wochen/Monate
  const navigateWeek = (direction) => {
    const newWeek = new Date(selectedWeek);
    if (direction === 'prev') {
      newWeek.setDate(newWeek.getDate() - 7);
    } else {
      newWeek.setDate(newWeek.getDate() + 7);
    }
    setSelectedWeek(newWeek);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
  };

  const goToCurrentWeek = () => {
    setSelectedWeek(new Date());
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(new Date());
  };

  const renderDashboardContent = () => (
    <div className="space-y-8">
      {/* Statistik-Karten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`${themeClasses.cardBg} rounded-2xl p-6 shadow-lg border ${themeClasses.cardBorder}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${themeClasses.textSecondary}`}>Gesamt Mitglieder</p>
              <p className={`text-3xl font-bold ${themeClasses.text}`}>{stats.totalMembers}</p>
              <p className="text-sm text-green-500 mt-1">+{stats.newThisWeek} diese Woche</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-full">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className={`${themeClasses.cardBg} rounded-2xl p-6 shadow-lg border ${themeClasses.cardBorder}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${themeClasses.textSecondary}`}>Heute Aktiv</p>
              <p className={`text-3xl font-bold ${themeClasses.text}`}>{stats.activeToday}</p>
              <p className={`text-sm ${themeClasses.textTertiary} mt-1`}>{((stats.activeToday / stats.totalMembers) * 100).toFixed(1)}% der Mitglieder</p>
            </div>
            <div className="p-3 bg-green-500 rounded-full">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className={`${themeClasses.cardBg} rounded-2xl p-6 shadow-lg border ${themeClasses.cardBorder}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${themeClasses.textSecondary}`}>Wachstumsrate</p>
              <p className={`text-3xl font-bold ${themeClasses.text}`}>{stats.growthRate}%</p>
              <p className="text-sm text-green-500 mt-1">↗ Monatlich</p>
            </div>
            <div className="p-3 bg-purple-500 rounded-full">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className={`${themeClasses.cardBg} rounded-2xl p-6 shadow-lg border ${themeClasses.cardBorder}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${themeClasses.textSecondary}`}>Events Total</p>
              <p className={`text-3xl font-bold ${themeClasses.text}`}>{stats.totalEvents}</p>
              <p className={`text-sm ${themeClasses.textTertiary} mt-1`}>Alle Zeiten</p>
            </div>
            <div className="p-3 bg-orange-500 rounded-full">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Community-weite Aktivitätsübersicht */}
      <div className="relative">
        <h2 className={`text-2xl font-bold ${themeClasses.text} mb-6`}>
          Community-Aktivität
        </h2>
        
        {/* Loading Overlay für Activity Updates */}
        {activityLoading && (
          <div className="absolute inset-0 bg-black/20 rounded-3xl z-10 flex items-center justify-center">
            <div className={`${themeClasses.cardBg} rounded-lg p-4 shadow-lg`}>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className={`mt-2 text-sm ${themeClasses.text}`}>Lade Community-Daten...</p>
            </div>
          </div>
        )}
        
        <ActivityOverview
          activityFilter={activityFilter}
          setActivityFilter={handleActivityFilterChange}
          activityData={communityActivityData}
          userJoinDate={null} // Nicht relevant für Community-Daten
          themeClasses={themeClasses}
          isDarkMode={isDarkMode}
          loading={activityLoading}
          selectedWeek={selectedWeek}
          selectedMonth={selectedMonth}
          navigateWeek={navigateWeek}
          navigateMonth={navigateMonth}
          goToCurrentWeek={goToCurrentWeek}
          goToCurrentMonth={goToCurrentMonth}
        />
      </div>

      {/* Mitglieder-Wachstum Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${themeClasses.cardBg} rounded-2xl p-6 shadow-lg border ${themeClasses.cardBorder}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${themeClasses.text}`}>Mitglieder-Wachstum</h3>
            <button className={`${themeClasses.textSecondary} hover:${themeClasses.text}`}>
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 flex items-end justify-between space-x-2">
            {memberGrowthData.map((data, index) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t" 
                     style={{ height: `${(data.members / 250) * 200}px`, minHeight: '20px' }}>
                </div>
                <span className={`text-xs ${themeClasses.textTertiary} mt-2`}>{data.month}</span>
                <span className={`text-xs font-medium ${themeClasses.textSecondary}`}>{data.members}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className={`${themeClasses.cardBg} rounded-2xl p-6 shadow-lg border ${themeClasses.cardBorder}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${themeClasses.text}`}>Top Contributors</h3>
            <button className={`${themeClasses.textSecondary} hover:${themeClasses.text}`}>
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            {topUsers.slice(0, 5).map((user, index) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <UserAvatar user={user} size="sm" showBorder={true} />
                  <div>
                    <div className={`text-sm font-medium ${themeClasses.text}`}>
                      {user.username}
                    </div>
                    <div className={`text-xs ${themeClasses.textTertiary}`}>
                      Level {user.level} • {user.xp} XP
                    </div>
                  </div>
                </div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>
                  {user.eventsJoined} Events
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-6">
      {/* Suchleiste und Filter */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-lg border border-light-border-primary dark:border-dark-border-primary">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-light-text-tertiary dark:text-dark-text-tertiary w-4 h-4" />
              <input
                type="text"
                placeholder="Benutzer suchen..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <select
              value={userFilterRole}
              onChange={(e) => setUserFilterRole(e.target.value)}
              className="px-4 py-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Alle Rollen</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div className="flex space-x-2">
            {selectedUsers.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {selectedUsers.length} ausgewählt
                </span>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1 text-xs bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Auswahl aufheben
                </button>
                <button className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600">
                  Löschen
                </button>
                <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  Rolle ändern
                </button>
              </div>
            )}
            <button className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
              <Plus className="w-4 h-4" />
              <span>Benutzer hinzufügen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Benutzer-Tabelle */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl shadow-lg border border-light-border-primary dark:border-dark-border-primary overflow-hidden">
        <div className="px-6 py-4 border-b border-light-border-primary dark:border-dark-border-primary">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
              Mitglieder ({filteredAndSortedUsers.length})
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={selectAllUsers}
                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300"
              >
                Alle auswählen
              </button>
              <span className="text-light-text-tertiary dark:text-dark-text-tertiary">|</span>
              <select
                value={`${sortField}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortField(field);
                  setSortOrder(order);
                }}
                className="text-sm bg-transparent text-light-text-secondary dark:text-dark-text-secondary border-none focus:outline-none"
              >
                <option value="joinDate-desc">Neueste zuerst</option>
                <option value="joinDate-asc">Älteste zuerst</option>
                <option value="username-asc">Name A-Z</option>
                <option value="username-desc">Name Z-A</option>
                <option value="level-desc">Level absteigend</option>
                <option value="level-asc">Level aufsteigend</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredAndSortedUsers.length && filteredAndSortedUsers.length > 0}
                    onChange={selectedUsers.length === filteredAndSortedUsers.length ? clearSelection : selectAllUsers}
                    className="rounded border-light-border-primary dark:border-dark-border-primary"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Benutzer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Rolle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Beitritt</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border-primary dark:divide-dark-border-primary">
              {filteredAndSortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-light-border-primary dark:border-dark-border-primary"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <UserAvatar 
                        user={user} 
                        size="sm" 
                        showBorder={true}
                        showStatus={true}
                      />
                      <div>
                        <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                          {user.username}
                        </div>
                        <div className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(roleId => {
                        const role = roles.find(r => r.id === roleId);
                        return role ? (
                          <span
                            key={roleId}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              backgroundColor: `${role.color}20`, 
                              color: role.color 
                            }}
                          >
                            {role.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-light-text-primary dark:text-dark-text-primary">
                      Level {user.level}
                    </div>
                    <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                      {user.xp} XP
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {new Date(user.joinDate).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      user.status === 'away' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                    }`}>
                      {user.status === 'online' ? 'Online' : user.status === 'away' ? 'Abwesend' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-500">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="text-red-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-500">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRolesTab = () => (
    <div className="space-y-6">
      {/* Rollen-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-lg border border-light-border-primary dark:border-dark-border-primary">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: role.color }}
                ></div>
                <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
                  {role.name}
                </h3>
              </div>
              <button className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary">
                <Edit className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                Mitglieder: {users.filter(user => user.roles.includes(role.id)).length}
              </p>
              <div>
                <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary mb-2">
                  Berechtigungen:
                </p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-light-bg-tertiary dark:bg-dark-bg-tertiary text-light-text-secondary dark:text-dark-text-secondary"
                    >
                      {permission.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Neue Rolle erstellen */}
      <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-2xl p-6 shadow-lg border border-light-border-primary dark:border-dark-border-primary">
        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">
          Neue Rolle erstellen
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Rollenname
            </label>
            <input
              type="text"
              placeholder="z.B. VIP Member"
              className="w-full px-4 py-2 bg-light-bg-tertiary dark:bg-dark-bg-tertiary border border-light-border-primary dark:border-dark-border-primary rounded-lg text-light-text-primary dark:text-dark-text-primary placeholder-light-text-tertiary dark:placeholder-dark-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Farbe
            </label>
            <input
              type="color"
              defaultValue="#6366f1"
              className="w-full h-10 rounded-lg border border-light-border-primary dark:border-dark-border-primary"
            />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-2">
            Berechtigungen
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {['read_messages', 'join_events', 'moderate_chat', 'manage_events', 'manage_users', 'system_settings'].map((permission) => (
              <label key={permission} className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-light-border-primary dark:border-dark-border-primary" />
                <span className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  {permission.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Rolle erstellen
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${themeClasses.bg} transition-colors duration-300`}>
      {/* Navigation */}
      <Navigation 
        activeNavItem={activeNavItem}
        setActiveNavItem={setActiveNavItem}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        user={user}
        themeClasses={themeClasses}
      />

      {/* Admin Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${themeClasses.text}`}>
                Admin Dashboard
              </h1>
              <p className={`${themeClasses.textSecondary} mt-2`}>
                Verwalte deine Gaming-Community
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 px-4 py-2 ${themeClasses.cardBg} rounded-lg border ${themeClasses.cardBorder}`}>
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className={`text-sm font-medium ${themeClasses.text}`}>
                  Administrator
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        {renderDashboardContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;