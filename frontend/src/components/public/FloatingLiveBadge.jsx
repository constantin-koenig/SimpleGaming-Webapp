// frontend/src/components/public/FloatingLiveBadge.jsx
import React, { useState } from 'react';

const FloatingLiveBadge = ({ liveStats }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!liveStats.isOnline) return null;

  return (
    <div 
      className="fixed top-20 right-4 z-50 transition-all duration-300"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className={`bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg transition-all duration-300 ${
        isExpanded ? 'px-6 py-4' : 'px-4 py-2'
      }`}>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-ping"></div>
          <div className="text-sm font-medium">
            {isExpanded ? (
              <div className="space-y-1">
                <div>{liveStats.formattedData.onlineMembers} online</div>
                <div>{liveStats.formattedData.activeVoiceSessions} im Voice</div>
                <div>{liveStats.formattedData.currentlyPlaying} spielen</div>
              </div>
            ) : (
              <div>{liveStats.formattedData.onlineMembers} online</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingLiveBadge;