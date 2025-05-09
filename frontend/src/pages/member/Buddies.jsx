// frontend/src/pages/member/Buddies.jsx
import React, { useState } from 'react';
import MemberLayout from '../../components/common/MemberLayout';
import { Link } from 'react-router-dom';

const Buddies = () => {
  const [selectedGame, setSelectedGame] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Simulierte Daten für Buddy-Vorschläge
  const buddies = [
    {
      id: 1,
      name: 'GamerTag123',
      avatar: 'https://via.placeholder.com/48',
      games: ['Call of Duty', 'Fortnite'],
      time: 'Spielt meist abends'
    },
    {
      id: 2,
      name: 'Pro_Gamer42',
      avatar: 'https://via.placeholder.com/48',
      games: ['League of Legends', 'Valorant'],
      time: 'Spielt meist nachmittags'
    },
    {
      id: 3,
      name: 'GameMaster99',
      avatar: 'https://via.placeholder.com/48',
      games: ['Minecraft', 'CS:GO'],
      time: 'Spielt meist am Wochenende'
    },
    {
      id: 4,
      name: 'EpicPlayer',
      avatar: 'https://via.placeholder.com/48',
      games: ['Fortnite', 'Apex Legends'],
      time: 'Spielt meist morgens'
    },
    {
      id: 5,
      name: 'Streamer_Girl',
      avatar: 'https://via.placeholder.com/48',
      games: ['Overwatch', 'Destiny 2'],
      time: 'Spielt meist abends'
    },
    {
      id: 6,
      name: 'NightOwlGamer',
      avatar: 'https://via.placeholder.com/48',
      games: ['Rocket League', 'Rainbow Six Siege'],
      time: 'Spielt meist nachts'
    }
  ];

  // Filterbare Spiele-Liste
  const games = [
    { value: 'fortnite', label: 'Fortnite' },
    { value: 'cod', label: 'Call of Duty' },
    { value: 'lol', label: 'League of Legends' },
    { value: 'valorant', label: 'Valorant' },
    { value: 'csgo', label: 'CS:GO' },
    { value: 'minecraft', label: 'Minecraft' },
    { value: 'apex', label: 'Apex Legends' },
    { value: 'overwatch', label: 'Overwatch' },
    { value: 'rocketleague', label: 'Rocket League' },
    { value: 'r6', label: 'Rainbow Six Siege' }
  ];

  // Filterbare Zeiten-Liste
  const times = [
    { value: 'morning', label: 'Morgens (8-12 Uhr)' },
    { value: 'afternoon', label: 'Nachmittags (12-18 Uhr)' },
    { value: 'evening', label: 'Abends (18-22 Uhr)' },
    { value: 'night', label: 'Nachts (22-8 Uhr)' },
    { value: 'weekend', label: 'Wochenende' }
  ];

  // Simulation einer Filterfunktion (würde mit echten Daten gegen Backend API gehen)
  const filteredBuddies = buddies.slice(0, 4); // Nur Beispiel - keine echte Filterung

  return (
    <MemberLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="border border-light-border-primary dark:border-dark-border-primary rounded-lg p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Gaming-Buddies</h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">Hier findest du passende Spielpartner für deine Lieblingsspiele.</p>
          
          <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4 mb-6">
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Finde deinen Gaming-Buddy</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="game" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Spiel</label>
                <select 
                  id="game" 
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full rounded-md border border-light-border-primary dark:border-dark-border-primary bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Wähle ein Spiel</option>
                  {games.map(game => (
                    <option key={game.value} value={game.value}>{game.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary mb-1">Spielzeit</label>
                <select 
                  id="time" 
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full rounded-md border border-light-border-primary dark:border-dark-border-primary bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Wähle eine Zeit</option>
                  {times.map(time => (
                    <option key={time.value} value={time.value}>{time.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded">
                Suchen
              </button>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Vorgeschlagene Buddies</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBuddies.map(buddy => (
              <div key={buddy.id} className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4 flex items-center space-x-4">
                <img 
                  className="h-12 w-12 rounded-full border border-light-border-primary dark:border-dark-border-primary" 
                  src={buddy.avatar} 
                  alt={`${buddy.name} Avatar`} 
                />
                <div className="flex-1">
                  <h4 className="text-light-text-primary dark:text-dark-text-primary font-medium">{buddy.name}</h4>
                  <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">{buddy.games.join(', ')}</p>
                  <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-xs">{buddy.time}</p>
                </div>
                <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-1 rounded">
                  Anfragen
                </button>
              </div>
            ))}
          </div>
          
          {buddies.length > 4 && (
            <div className="mt-6 text-center">
              <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
                Mehr Buddies anzeigen
              </button>
            </div>
          )}
          
          <div className="mt-8 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
            <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Meine Buddy-Anfragen</h3>
            <div className="divide-y divide-light-border-primary dark:divide-dark-border-primary">
              <div className="py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    className="h-10 w-10 rounded-full border border-light-border-primary dark:border-dark-border-primary" 
                    src="https://via.placeholder.com/40" 
                    alt="Avatar" 
                  />
                  <div>
                    <p className="text-light-text-primary dark:text-dark-text-primary font-medium">CoolGamer55</p>
                    <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">Fortnite, Call of Duty</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-2 py-1 rounded">
                    Annehmen
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-2 py-1 rounded">
                    Ablehnen
                  </button>
                </div>
              </div>
              
              <div className="py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img 
                    className="h-10 w-10 rounded-full border border-light-border-primary dark:border-dark-border-primary" 
                    src="https://via.placeholder.com/40" 
                    alt="Avatar" 
                  />
                  <div>
                    <p className="text-light-text-primary dark:text-dark-text-primary font-medium">GameWizard</p>
                    <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">Minecraft, CS:GO</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-2 py-1 rounded">
                    Annehmen
                  </button>
                  <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-2 py-1 rounded">
                    Ablehnen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default Buddies;