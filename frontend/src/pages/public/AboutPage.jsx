// frontend/src/pages/public/AboutPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';

const AboutPage = () => {
  // Falls die Umgebungsvariable nicht funktioniert, verwenden wir einen festen Pfad
  const discordAuthUrl = 'http://localhost:5000/api/auth/discord';
  
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-light-text-primary dark:text-dark-text-primary sm:text-5xl md:text-6xl mb-8">
            Über unsere Gaming-Community
          </h1>
          
          <div className="mt-6 text-lg text-light-text-secondary dark:text-dark-text-secondary">
            <p className="mb-4">
              Willkommen bei unserer Gaming-Community! Wir sind eine Gruppe leidenschaftlicher Gamer, die sich zusammengeschlossen haben, um gemeinsam die Welt der Videospiele zu erleben.
            </p>
            
            <p className="mb-4">
              Unsere Community wurde mit dem Ziel gegründet, einen freundlichen und inklusiven Raum für Spieler aller Erfahrungsstufen zu schaffen. Egal, ob du ein Gelegenheitsspieler oder ein Hardcore-Enthusiast bist, bei uns findest du ein Zuhause.
            </p>
            
            <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-8 mb-4">Unsere Mission</h2>
            <p className="mb-4">
              Wir glauben, dass Gaming am besten ist, wenn es geteilt wird. Unsere Mission ist es, eine aktive, respektvolle und unterstützende Gemeinschaft aufzubauen, in der Spieler:
            </p>
            <ul className="list-disc list-inside mb-6 ml-4 text-light-text-secondary dark:text-dark-text-secondary">
              <li className="mb-2">Neue Freundschaften schließen können</li>
              <li className="mb-2">Ihre Gaming-Fähigkeiten verbessern können</li>
              <li className="mb-2">An spannenden Events und Turnieren teilnehmen können</li>
              <li className="mb-2">Gemeinsame Spielerfahrungen erleben können</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-8 mb-4">Was wir anbieten</h2>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">Discord-Server</h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Unser Discord-Server ist das Herzstück unserer Community. Hier kannst du mit anderen Mitgliedern chatten, Voice-Chats beitreten und über deine Lieblingsspiele diskutieren.
                </p>
              </div>
              
              <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">Regelmäßige Events</h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Wir veranstalten regelmäßige Community-Events, darunter Turniere, Game Nights und spezielle thematische Veranstaltungen.
                </p>
              </div>
              
              <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">Gameserver</h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Wir betreiben eigene Server für verschiedene Spiele, die von unseren Mitgliedern genutzt werden können.
                </p>
              </div>
              
              <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary p-6 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">Gaming-Buddy-System</h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary">
                  Mit unserem einzigartigen Buddy-System kannst du Spieler finden, die ähnliche Spiele und Spielzeiten haben wie du.
                </p>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-8 mb-4">Mach mit!</h2>
            <p className="mb-6">
              Wir freuen uns immer über neue Gesichter in unserer Community. Der Beitritt ist einfach und kostenlos:
            </p>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mt-4">
              <a
                href={discordAuthUrl}
                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10"
              >
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0c-.164-.386-.398-.875-.608-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                </svg>
                Mit Discord beitreten
              </a>
              
              <Link
                to="/"
                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 dark:text-primary-300 bg-light-bg-primary dark:bg-dark-bg-tertiary hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary md:py-4 md:text-lg md:px-10"
              >
                Zurück zur Startseite
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default AboutPage;