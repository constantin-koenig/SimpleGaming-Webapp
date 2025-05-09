// frontend/src/components/public/EventPreview.jsx
import React from 'react';

const EventPreview = ({ event, delay, isVisible }) => {
  return (
    <div 
      className={`overflow-hidden rounded-lg shadow-lg transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative">
        <img 
          src={event.image} 
          alt={event.title} 
          className="w-full h-48 object-cover transform transition duration-500 hover:scale-110"
        />
        <div className="absolute top-0 left-0 m-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
            {event.date}
          </span>
        </div>
      </div>
      
      <div className="p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary">
        <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
          {event.title}
        </h3>
        
        <div className="flex items-center mt-3 mb-4">
          <div className="flex -space-x-1 overflow-hidden">
            <img 
              className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800" 
              src="https://via.placeholder.com/24" 
              alt="" 
            />
            <img 
              className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800" 
              src="https://via.placeholder.com/24" 
              alt="" 
            />
            <img 
              className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-gray-800" 
              src="https://via.placeholder.com/24" 
              alt="" 
            />
          </div>
          <span className="ml-2 text-sm text-light-text-tertiary dark:text-dark-text-tertiary">
            {event.participants}/{event.maxParticipants} Teilnehmer
          </span>
        </div>
        
        <div className="w-full bg-light-bg-tertiary dark:bg-dark-bg-tertiary rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full"
            style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
          ></div>
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <button className="bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg text-sm font-medium shadow hover:shadow-lg transform transition hover:-translate-y-1">
            Teilnehmen
          </button>
          <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
            Details ansehen
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventPreview;