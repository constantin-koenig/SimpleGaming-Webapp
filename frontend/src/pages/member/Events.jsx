// frontend/src/pages/member/Events.jsx
import React, { useState } from 'react';
import MemberLayout from '../../components/common/MemberLayout';

const Events = () => {
  // Simulierte Daten für Events
  const [events] = useState([
    {
      id: 1,
      title: 'Wöchentliches Fortnite-Turnier',
      type: 'Turnier',
      typeColor: 'green',
      date: 'Samstag, 20:00 Uhr',
      description: 'Fortnite Solo-Turnier mit Preisen für die Top 3. Melde dich an und zeige dein Können!',
      participants: 32,
      maxParticipants: 64
    },
    {
      id: 2,
      title: 'Community Game Night',
      type: 'Community',
      typeColor: 'blue',
      date: 'Freitag, 21:00 Uhr',
      description: 'Among Us mit der ganzen Community! Komm vorbei für einen lustigen Abend voller Verrat und Spaß.',
      participants: 15,
      maxParticipants: 20
    },
    {
      id: 3,
      title: 'Monatliches Gewinnspiel',
      type: 'Gewinnspiel',
      typeColor: 'purple',
      date: 'Endet am 31. des Monats',
      description: 'Nimm am monatlichen Gewinnspiel teil und gewinne tolle Preise, darunter Gaming-Zubehör und Spielecodes!',
      participants: 145,
      maxParticipants: null
    },
    {
      id: 4,
      title: 'Minecraft Bau-Wettbewerb',
      type: 'Wettbewerb',
      typeColor: 'yellow',
      date: 'Sonntag, 14:00 Uhr',
      description: 'Zeige deine kreative Seite in unserem Minecraft Bau-Wettbewerb. Thema: Futuristische Städte',
      participants: 12,
      maxParticipants: 30
    }
  ]);

  // Simulierte Daten für Teilnahmen
  const [myEvents] = useState([
    {
      id: 2,
      title: 'Community Game Night',
      type: 'Community',
      typeColor: 'blue',
      date: 'Freitag, 21:00 Uhr',
      status: 'Bestätigt'
    }
  ]);

  // Hilfsfunktion für Typfarben
  const getTypeColorClasses = (type, isBackground = false) => {
    const colors = {
      'Turnier': isBackground ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100' : 'text-green-600 dark:text-green-400',
      'Community': isBackground ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100' : 'text-blue-600 dark:text-blue-400',
      'Gewinnspiel': isBackground ? 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-100' : 'text-purple-600 dark:text-purple-400',
      'Wettbewerb': isBackground ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100' : 'text-yellow-600 dark:text-yellow-400'
    };
    
    return colors[type] || (isBackground ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400');
  };

  return (
    <MemberLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="border border-light-border-primary dark:border-dark-border-primary rounded-lg p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Events & Turniere</h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">Hier findest du alle kommenden Events und Turniere unserer Community.</p>
          
          <div className="mb-8">
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Kommende Events</h2>
            
            <div className="space-y-4 mt-4">
              {events.map(event => (
                <div key={event.id} className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="mb-4 md:mb-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColorClasses(event.type, true)} mb-2`}>
                        {event.type}
                      </span>
                      <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">{event.title}</h3>
                      <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">{event.date}</p>
                      <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">
                        {event.description}
                      </p>
                      {event.maxParticipants && (
                        <div className="mt-2">
                          <div className="flex items-center">
                            <span className="text-light-text-tertiary dark:text-dark-text-tertiary text-xs">
                              {event.participants}/{event.maxParticipants} Teilnehmer
                            </span>
                            <div className="ml-2 w-24 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-full h-2.5">
                              <div 
                                className="bg-primary-600 h-2.5 rounded-full" 
                                style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-1 rounded">
                        Teilnehmen
                      </button>
                      <button className="bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border-primary dark:border-dark-border-primary text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary text-sm font-medium px-3 py-1 rounded">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Meine Events</h2>
            
            {myEvents.length > 0 ? (
              <div className="space-y-4">
                {myEvents.map(event => (
                  <div key={event.id} className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColorClasses(event.type, true)} mb-2`}>
                          {event.type}
                        </span>
                        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">{event.title}</h3>
                        <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">{event.date}</p>
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100">
                            Status: {event.status}
                          </span>
                        </div>
                      </div>
                      <button className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-3 py-1 rounded">
                        Abmelden
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
                <p className="text-light-text-secondary dark:text-dark-text-secondary">Du hast dich noch für keine Events angemeldet.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Event-Kalender</h2>
            <p className="text-light-text-secondary dark:text-dark-text-secondary mb-2">
              Behalte den Überblick über alle kommenden Events in unserem Community-Kalender.
            </p>
            <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-1 rounded">
              Zum Event-Kalender
            </button>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default Events;