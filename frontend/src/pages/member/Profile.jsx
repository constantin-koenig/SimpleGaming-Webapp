// frontend/src/pages/member/Profile.jsx
import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import MemberLayout from '../../components/common/MemberLayout';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Lädt...</div>;
  }

  return (
    <MemberLayout>
      <div className="px-4 py-6 sm:px-0">
        <div className="border border-light-border-primary dark:border-dark-border-primary rounded-lg p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary">
          <h1 className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Dein Profil</h1>
          <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">Hier kannst du deine Profileinstellungen verwalten.</p>
          
          <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
            <div className="flex items-center">
              <img
                className="h-16 w-16 rounded-full border border-light-border-primary dark:border-dark-border-primary"
                src={user.avatar ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png` : 'https://via.placeholder.com/64'}
                alt="Profilbild"
              />
              <div className="ml-4">
                <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">{user.username}</h2>
                <p className="text-light-text-tertiary dark:text-dark-text-tertiary">Discord ID: {user.discordId}</p>
                {user.email && <p className="text-light-text-tertiary dark:text-dark-text-tertiary">E-Mail: {user.email}</p>}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-4">Gaming-Präferenzen</h2>
            
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">Lieblingsspiele</h3>
              <div className="flex flex-wrap gap-2">
                {user.preferences?.favoriteGames && user.preferences.favoriteGames.length > 0 ? (
                  user.preferences.favoriteGames.map((game, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                      {game}
                    </span>
                  ))
                ) : (
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">Keine Lieblingsspiele ausgewählt</p>
                )}
              </div>
            </div>
            
            <div className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg p-4">
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">Spielerzeiten</h3>
              <div className="flex flex-wrap gap-2">
                {user.preferences?.gamingTimes && user.preferences.gamingTimes.length > 0 ? (
                  user.preferences.gamingTimes.map((time, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                      {time}
                    </span>
                  ))
                ) : (
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">Keine bevorzugten Spielzeiten festgelegt</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded">
                Profil bearbeiten
              </button>
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
};

export default Profile;