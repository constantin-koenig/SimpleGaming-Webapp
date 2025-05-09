// frontend/src/pages/member/Dashboard.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import MemberLayout from '../../components/common/MemberLayout';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg-primary dark:bg-dark-bg-primary">
        <div className="max-w-md w-full bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg shadow-md p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-red-500 mb-2">Nicht angemeldet</h2>
            <p className="text-light-text-primary dark:text-dark-text-primary mb-6">Du musst angemeldet sein, um auf dein Dashboard zuzugreifen.</p>
            <Link
              to="/"
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded"
            >
              Zur Anmeldung
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MemberLayout>
      {/* Willkommensbereich */}
      <div className="px-4 py-6 sm:px-0">
        <div className="border border-light-border-primary dark:border-dark-border-primary rounded-lg p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Willkommen zurück, {user.username}!</h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">Was möchtest du heute spielen?</p>
        </div>
      </div>

      {/* Statistik-Karten */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 px-4 sm:px-0">
        {/* Karte 1 */}
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-light-text-tertiary dark:text-dark-text-tertiary truncate">
                Discord-Nachrichten
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-primary-600 dark:text-primary-400">
                {user.stats?.messagesCount || 0}
              </dd>
            </dl>
          </div>
        </div>

        {/* Karte 2 */}
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-light-text-tertiary dark:text-dark-text-tertiary truncate">
                Voice-Minuten
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-primary-600 dark:text-primary-400">
                {user.stats?.voiceMinutes || 0}
              </dd>
            </dl>
          </div>
        </div>

        {/* Karte 3 */}
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-light-text-tertiary dark:text-dark-text-tertiary truncate">
                Gespielte Spiele
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-primary-600 dark:text-primary-400">
                {user.stats?.gamesPlayed || 0}
              </dd>
            </dl>
          </div>
        </div>

        {/* Karte 4 */}
        <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dl>
              <dt className="text-sm font-medium text-light-text-tertiary dark:text-dark-text-tertiary truncate">
                Events besucht
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-primary-600 dark:text-primary-400">
                {user.stats?.eventsAttended || 0}
              </dd>
            </dl>
          </div>
        </div>
      </div>

      {/* Gaming-Buddy-Finder */}
      <div className="mt-8 px-4 sm:px-0">
        <div className="border border-light-border-primary dark:border-dark-border-primary rounded-lg p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary">
          <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Gaming-Buddies finden</h2>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">Finde neue Mitspieler für deine Lieblingsspiele</p>
          
          <div className="mt-4 flex flex-wrap gap-4">
            {/* Beispiel für einen Gaming-Buddy */}
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4 flex items-center space-x-4 w-full sm:w-auto">
              <img className="h-12 w-12 rounded-full border border-light-border-primary dark:border-dark-border-primary" src="https://via.placeholder.com/48" alt="Buddy Avatar" />
              <div>
                <h3 className="text-light-text-primary dark:text-dark-text-primary font-medium">Pro_Gamer42</h3>
                <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">League of Legends, Valorant</p>
              </div>
              <button className="ml-auto bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-1 rounded">
                Anfragen
              </button>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link to="/buddies" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              Alle Gaming-Buddies anzeigen →
            </Link>
          </div>
        </div>
      </div>

      {/* Kommende Events */}
      <div className="mt-8 px-4 sm:px-0">
        <div className="border border-light-border-primary dark:border-dark-border-primary rounded-lg p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary">
          <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Kommende Events</h2>
          
          <div className="space-y-4">
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-light-text-primary dark:text-dark-text-primary font-medium">Wöchentliches Turnier</h3>
                  <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">Samstag, 20:00 Uhr</p>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">Fortnite Solo-Turnier mit Preisen für die Top 3</p>
                </div>
                <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-1 rounded">
                  Teilnehmen
                </button>
              </div>
            </div>
            
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-light-text-primary dark:text-dark-text-primary font-medium">Community Game Night</h3>
                  <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">Freitag, 21:00 Uhr</p>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary mt-2">Among Us mit der ganzen Community</p>
                </div>
                <button className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-3 py-1 rounded">
                  Teilnehmen
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <Link to="/events" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
              Alle Events anzeigen →
            </Link>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default Dashboard