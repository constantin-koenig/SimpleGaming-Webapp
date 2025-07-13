// UserAvatar.jsx - Wiederverwendbare Avatar-Komponente mit GIF-Support
import React, { useState } from 'react';

const UserAvatar = ({ 
  user, 
  size = 'md', 
  showBorder = true, 
  className = '',
  showStatus = false 
}) => {
  const [imageError, setImageError] = useState(false);

  // Größen-Mapping
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
    '2xl': 'h-24 w-24'
  };

  // Avatar URL generieren - mit GIF-Support
  const getAvatarUrl = (user, preferGif = true) => {
    if (!user?.avatar || !user?.discordId) {
      return 'https://via.placeholder.com/128/6366f1/ffffff?text=?';
    }

    // Discord CDN URL
    const baseUrl = `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}`;
    
    // Prüfen ob Avatar animiert ist (beginnt mit "a_")
    const isAnimated = user.avatar.startsWith('a_');
    
    if (isAnimated && preferGif) {
      return `${baseUrl}.gif?size=128`;
    } else {
      return `${baseUrl}.png?size=128`;
    }
  };

  // Fallback URL für Fehler
  const fallbackUrl = `https://via.placeholder.com/128/6366f1/ffffff?text=${user?.username?.charAt(0)?.toUpperCase() || '?'}`;

  const borderClass = showBorder 
    ? 'border-2 border-light-border-primary dark:border-dark-border-primary' 
    : '';

  return (
    <div className={`relative ${className}`}>
      <img
        className={`${sizeClasses[size]} rounded-full ${borderClass} object-cover transition-all duration-200 hover:scale-105`}
        src={imageError ? fallbackUrl : getAvatarUrl(user, true)}
        alt={`${user?.username || 'User'} Avatar`}
        onError={() => setImageError(true)}
        loading="lazy"
      />
      
      {/* Online Status Indicator */}
      {showStatus && (
        <div className={`absolute -bottom-1 -right-1 ${size === 'xs' ? 'h-2 w-2' : size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} rounded-full border-2 border-light-bg-primary dark:border-dark-bg-primary ${user?.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
      )}
    </div>
  );
};

export default UserAvatar;