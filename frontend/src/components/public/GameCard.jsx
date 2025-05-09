// frontend/src/components/public/GameCard.jsx
import React from 'react';

const GameCard = ({ game, delay, isVisible }) => {
  return (
    <div 
      className={`relative overflow-hidden rounded-lg shadow-lg transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-60 z-10 rounded-lg"></div>
      <img 
        src={game.image} 
        alt={game.title} 
        className="w-full h-48 object-cover rounded-t-lg transform transition duration-500 hover:scale-110"
      />
      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{game.title}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
            {game.category}
          </span>
        </div>
        <p className="text-sm text-gray-300 mt-1">
          <span className="font-medium text-primary-400">{game.players}</span> aktive Spieler
        </p>
      </div>
      <button className="absolute top-2 right-2 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition z-20">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  );
};

export default GameCard;