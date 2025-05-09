// frontend/src/components/public/FeaturedStreamer.jsx
import React from 'react';

const FeaturedStreamer = ({ streamer, delay, isVisible }) => {
  return (
    <div 
      className={`relative overflow-hidden bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-lg shadow-lg transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex p-6">
        <div className="relative">
          <div className="relative">
            <img 
              src={streamer.avatar} 
              alt={streamer.name} 
              className="w-20 h-20 rounded-full border-4 border-primary-500"
            />
            <span className="absolute bottom-0 right-0 block h-5 w-5 rounded-full bg-green-400 border-2 border-white"></span>
          </div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-600 rounded-full blur opacity-40"></div>
        </div>
        
        <div className="ml-6">
          <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">{streamer.name}</h3>
          <p className="text-light-text-secondary dark:text-dark-text-secondary">
            Spielt <span className="font-medium text-primary-600 dark:text-primary-400">{streamer.game}</span>
          </p>
          <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">
            {streamer.followers.toLocaleString()} Follower
          </p>
          <div className="mt-3">
            <button className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-full text-sm flex items-center">
              <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.9 8.26H2v7.034h1.9v-7.034zM2 7.26h1.9V5.004H2V7.26zm13.544 1.545v5.49c1.733-.977 3.066-2.177 3.066-2.746 0-.568-1.333-1.77-3.066-2.744zm-2.057-1.542H6.78v7.034h2.91v-1.656h1.242c1.675 0 4.656-1.323 4.656-2.863 0-1.54-2.981-2.515-4.656-2.515h-1.9z"/>
              </svg>
              Live folgen
            </button>
          </div>
        </div>
      </div>
      <div className="px-6 pb-6">
        <blockquote className="italic text-light-text-secondary dark:text-dark-text-secondary border-l-4 border-primary-500 pl-3 py-2 mt-2">
          "{streamer.quote}"
        </blockquote>
      </div>
    </div>
  );
};

export default FeaturedStreamer;