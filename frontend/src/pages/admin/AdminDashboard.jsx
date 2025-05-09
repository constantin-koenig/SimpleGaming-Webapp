// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState } from 'react';
import MemberLayout from '../../components/common/MemberLayout';

const AdminDashboard = () => {
  // Simulierte Statistikdaten
  const [stats] = useState({
    members: 245,
    servers: 12,
    events: 8,
    messages: 1278
  });

  // Simulierte Server-Daten
  const [servers] = useState([
    { id: 1, name: 'Minecraft SMP', status: 'Online', players: 8, maxPlayers: 20 },
    { id: 2, name: 'CS:GO Competitive', status: 'Online', players: 10, maxPlayers: 10 },
    { id: 3, name: 'Valorant Custom', status: 'Offline', players: 0, maxPlayers: 10 },
    { id: 4, name: 'Rust Community', status: 'Online', players: 25, maxPlayers: 100 }
  ]);

  return (
    <MemberLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="border border-light-border-primary dark:border-dark-border-primary rounded-lg p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Admin-Dashboard</h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">Willkommen im Administrationsbereich!</p>
          
          {/* Community-Statistiken */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Community-Statistiken</h2>
            
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{stats.members}</div>
                  <div className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">Mitglieder</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{stats.servers}</div>
                  <div className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">Aktive Gameserver</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{stats.events}</div>
                  <div className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">Geplante Events</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">{stats.messages}</div>
                  <div className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">Discord-Nachrichten/Tag</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Verwaltungsbereiche */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
              <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">Discord-Server-Verwaltung</h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">Verwalte den Discord-Server direkt über diese Plattform.</p>
              <div className="flex space-x-2">
                <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-1 rounded">
                  Server verwalten
                </button>
                <button className="bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary text-sm font-medium px-3 py-1 rounded">
                  Bot-Einstellungen
                </button>
              </div>
            </div>
            
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
              <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">Benutzer-Verwaltung</h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">Verwalte Benutzer, Rollen und Berechtigungen.</p>
              <div className="flex space-x-2">
                <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-1 rounded">
                  Benutzer verwalten
                </button>
                <button className="bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary text-sm font-medium px-3 py-1 rounded">
                  Rollen bearbeiten
                </button>
              </div>
            </div>
            
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
              <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">Gameserver-Verwaltung</h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">Starte, stoppe und konfiguriere Gameserver.</p>
              <div className="flex space-x-2">
                <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-1 rounded">
                  Gameserver verwalten
                </button>
                <button className="bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary text-sm font-medium px-3 py-1 rounded">
                  Server hinzufügen
                </button>
              </div>
            </div>
            
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
              <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">Event-Verwaltung</h2>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">Erstelle und verwalte Events und Turniere.</p>
              <div className="flex space-x-2">
                <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-1 rounded">
                  Events verwalten
                </button>
                <button className="bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary text-sm font-medium px-3 py-1 rounded">
                  Event erstellen
                </button>
              </div>
            </div>
          </div>
          
          {/* Gameserver-Status */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Gameserver-Status</h2>
            
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-light-border-primary dark:divide-dark-border-primary">
                  <thead className="bg-light-bg-secondary dark:bg-dark-bg-secondary">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                        Server
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                        Spieler
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-light-text-tertiary dark:text-dark-text-tertiary uppercase tracking-wider">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-border-primary dark:divide-dark-border-primary">
                    {servers.map(server => (
                      <tr key={server.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                          {server.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            server.status === 'Online' 
                              ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100' 
                              : 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100'
                          }`}>
                            {server.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-light-text-secondary dark:text-dark-text-secondary">
                          {server.players}/{server.maxPlayers}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            {server.status === 'Online' ? (
                              <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                Stoppen
                              </button>
                            ) : (
                              <button className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">
                                Starten
                              </button>
                            )}
                            <button className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300">
                              Konfigurieren
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
          
          {/* Neueste Aktivitäten */}
          <div>
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Neueste Aktivitäten</h2>
            
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
              <ul className="divide-y divide-light-border-primary dark:divide-dark-border-primary">
                <li className="py-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-light-text-primary dark:text-dark-text-primary">
                        <span className="font-medium">Neuer Benutzer</span> hat sich registriert
                      </p>
                      <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                        Vor 10 Minuten
                      </p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-light-text-primary dark:text-dark-text-primary">
                        <span className="font-medium">Neues Event</span> wurde erstellt
                      </p>
                      <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                        Vor 1 Stunde
                      </p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <span className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-light-text-primary dark:text-dark-text-primary">
                        <span className="font-medium">Discord-Rollen</span> wurden aktualisiert
                      </p>
                      <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                        Vor 3 Stunden
                      </p>
                    </div>
                  </div>
                </li>
                <li className="py-3">
                  <div className="flex space-x-3">
                    <div className="flex-shrink-0">
                      <span className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center text-white text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-light-text-primary dark:text-dark-text-primary">
                        <span className="font-medium">Server-Warnung</span> für Minecraft SMP
                      </p>
                      <p className="text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
                        Vor 5 Stunden
                      </p>
                    </div>
                  </div>
                </li>
              </ul>
              <div className="mt-4 text-center">
                <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
                  Alle Aktivitäten anzeigen
                </button>
              </div>
            </div>
          </div>
          
          {/* System-Status */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">System-Status</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
                <h3 className="text-light-text-primary dark:text-dark-text-primary font-medium mb-2">CPU-Auslastung</h3>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">28%</span>
                  <div className="ml-4 flex-1">
                    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full h-3">
                      <div className="bg-primary-600 h-3 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
                <h3 className="text-light-text-primary dark:text-dark-text-primary font-medium mb-2">RAM-Auslastung</h3>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">64%</span>
                  <div className="ml-4 flex-1">
                    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full h-3">
                      <div className="bg-primary-600 h-3 rounded-full" style={{ width: '64%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
                <h3 className="text-light-text-primary dark:text-dark-text-primary font-medium mb-2">Speicherplatz</h3>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">42%</span>
                  <div className="ml-4 flex-1">
                    <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full h-3">
                      <div className="bg-primary-600 h-3 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default AdminDashboard;