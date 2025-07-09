// ===== components/dashboard/DailyTimeline.jsx =====
import React, { useState } from 'react';
import { Clock, Activity, Gamepad2, MessageSquare, Headphones, Users } from 'lucide-react';

const DailyTimeline = ({ 
  dailyData, 
  selectedDate, 
  themeClasses, 
  isDarkMode 
}) => {
  const [selectedHour, setSelectedHour] = useState(null);
  const [hoveredActivity, setHoveredActivity] = useState(null);

  // Timeline-Konfiguration
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  
  // Activity-Kategorien
  const activityTypes = {
    gaming: { 
      color: '#8B5CF6', 
      icon: Gamepad2, 
      label: 'Gaming',
      priority: 1
    },
    voice: { 
      color: '#10B981', 
      icon: Headphones, 
      label: 'Voice Chat',
      priority: 2
    },
    messages: { 
      color: '#3B82F6', 
      icon: MessageSquare, 
      label: 'Nachrichten',
      priority: 3
    },
    online: { 
      color: '#F59E0B', 
      icon: Users, 
      label: 'Online',
      priority: 4
    }
  };

  // Mock-Daten für Timeline generieren
  const generateTimelineData = () => {
    const timelineData = {};
    
    timeSlots.forEach(hour => {
      const activities = [];
      
      // Gaming-Sessions
      if (hour >= 14 && hour <= 16) {
        activities.push({
          type: 'gaming',
          start: hour,
          duration: Math.min(2, 17 - hour),
          intensity: 0.8,
          details: {
            game: 'Valorant',
            sessions: 3,
            achievements: 1
          }
        });
      }
      
      if (hour >= 19 && hour <= 22) {
        activities.push({
          type: 'gaming',
          start: hour,
          duration: Math.min(3, 23 - hour),
          intensity: 0.9,
          details: {
            game: 'CS2',
            sessions: 2,
            achievements: 2
          }
        });
      }

      // Voice Chat
      if (hour >= 15 && hour <= 17) {
        activities.push({
          type: 'voice',
          start: hour,
          duration: 2,
          intensity: 0.7,
          details: {
            channel: 'Gaming Voice',
            participants: 4
          }
        });
      }

      if (hour >= 20 && hour <= 23) {
        activities.push({
          type: 'voice',
          start: hour,
          duration: 3,
          intensity: 0.8,
          details: {
            channel: 'Gaming Voice',
            participants: 6
          }
        });
      }

      // Nachrichten (sporadisch den ganzen Tag)
      if (hour >= 8 && hour <= 23) {
        const messageIntensity = 
          hour >= 12 && hour <= 14 ? 0.6 : // Mittagszeit
          hour >= 18 && hour <= 22 ? 0.8 : // Abends
          0.3; // Normal

        activities.push({
          type: 'messages',
          start: hour,
          duration: 1,
          intensity: messageIntensity,
          details: {
            channels: ['#general', '#gaming'],
            messages: Math.floor(messageIntensity * 50)
          }
        });
      }

      // Online-Status (fast den ganzen Tag)
      if (hour >= 9 && hour <= 23) {
        activities.push({
          type: 'online',
          start: hour,
          duration: 1,
          intensity: 0.5,
          details: {
            platforms: ['Discord', 'Steam']
          }
        });
      }

      timelineData[hour] = activities;
    });

    return timelineData;
  };

  const timelineData = generateTimelineData();

  // Formatierungshelfer
  const formatHour = (hour) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const formatDuration = (duration) => {
    if (duration < 1) return `${Math.round(duration * 60)}min`;
    return `${duration}h`;
  };

  // Aktivität für Stunde bekommen
  const getActivitiesForHour = (hour) => {
    return timelineData[hour] || [];
  };

  // Dominante Aktivität für Stunde
  const getDominantActivity = (hour) => {
    const activities = getActivitiesForHour(hour);
    if (activities.length === 0) return null;
    
    return activities.reduce((prev, current) => 
      (current.intensity * activityTypes[current.type].priority) > 
      (prev.intensity * activityTypes[prev.type].priority) ? prev : current
    );
  };

  return (
    <div className={`${themeClasses.cardBg} rounded-2xl p-6 border ${themeClasses.cardBorder} shadow-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-xl font-bold ${themeClasses.text} flex items-center`}>
          <Clock className="w-5 h-5 mr-2 text-blue-500" />
          Tageszeitleiste
          {selectedDate && (
            <span className={`ml-3 text-sm font-normal ${themeClasses.textSecondary}`}>
              {selectedDate.toLocaleDateString('de-DE', { 
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          )}
        </h3>
      </div>

      {/* Activity Legend */}
      <div className="flex items-center space-x-6 mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {Object.entries(activityTypes).map(([type, config]) => {
          const Icon = config.icon;
          return (
            <div
              key={type}
              className={`flex items-center space-x-2 cursor-pointer transition-opacity ${
                hoveredActivity === null || hoveredActivity === type ? 'opacity-100' : 'opacity-50'
              }`}
              onMouseEnter={() => setHoveredActivity(type)}
              onMouseLeave={() => setHoveredActivity(null)}
            >
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: config.color }}
              />
              <Icon className="w-4 h-4" style={{ color: config.color }} />
              <span className={`text-sm ${themeClasses.textSecondary}`}>
                {config.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Time Labels */}
        <div className="flex mb-4">
          {timeSlots.filter((_, index) => index % 3 === 0).map(hour => (
            <div key={hour} className="flex-1 text-center">
              <span className={`text-xs ${themeClasses.textTertiary}`}>
                {formatHour(hour)}
              </span>
            </div>
          ))}
        </div>

        {/* Main Timeline */}
        <div className="relative h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {/* Hour Divisions */}
          {timeSlots.map(hour => (
            <div
              key={hour}
              className="absolute top-0 bottom-0 border-r border-gray-200 dark:border-gray-600 opacity-30"
              style={{ left: `${(hour / 24) * 100}%`, width: '1px' }}
            />
          ))}

          {/* Activity Blocks */}
          {timeSlots.map(hour => {
            const activities = getActivitiesForHour(hour);
            const dominantActivity = getDominantActivity(hour);
            
            return (
              <div
                key={hour}
                className="absolute top-0 bottom-0 cursor-pointer transition-all duration-200"
                style={{
                  left: `${(hour / 24) * 100}%`,
                  width: `${100 / 24}%`
                }}
                onClick={() => setSelectedHour(selectedHour === hour ? null : hour)}
                onMouseEnter={() => setHoveredActivity(dominantActivity?.type || null)}
                onMouseLeave={() => setHoveredActivity(null)}
              >
                {/* Activity Layers */}
                {activities.map((activity, index) => {
                  const config = activityTypes[activity.type];
                  const isVisible = hoveredActivity === null || hoveredActivity === activity.type;
                  
                  return (
                    <div
                      key={`${activity.type}-${index}`}
                      className={`absolute transition-all duration-300 rounded-sm ${
                        selectedHour === hour ? 'scale-105 shadow-md' : ''
                      }`}
                      style={{
                        backgroundColor: config.color,
                        opacity: isVisible ? activity.intensity * 0.8 : 0.2,
                        top: `${index * 20}%`,
                        height: `${Math.min(80, 100 / activities.length)}%`,
                        left: '2px',
                        right: '2px'
                      }}
                      title={`${config.label}: ${formatHour(hour)} (${(activity.intensity * 100).toFixed(0)}%)`}
                    />
                  );
                })}

                {/* Hover Indicator */}
                {selectedHour === hour && (
                  <div className="absolute inset-0 border-2 border-white rounded-sm pointer-events-none" />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Time Indicator */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
          style={{ left: `${(new Date().getHours() / 24) * 100}%` }}
        >
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full" />
        </div>
      </div>

      {/* Selected Hour Details */}
      {selectedHour !== null && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-semibold ${themeClasses.text}`}>
              {formatHour(selectedHour)} - {formatHour(selectedHour + 1)}
            </h4>
            <button
              onClick={() => setSelectedHour(null)}
              className={`text-sm ${themeClasses.textSecondary} hover:${themeClasses.text}`}
            >
              Schließen
            </button>
          </div>
          
          <div className="space-y-3">
            {getActivitiesForHour(selectedHour).map((activity, index) => {
              const config = activityTypes[activity.type];
              const Icon = config.icon;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded border">
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" style={{ color: config.color }} />
                    <div>
                      <span className={`font-medium ${themeClasses.text}`}>
                        {config.label}
                      </span>
                      <div className={`text-xs ${themeClasses.textTertiary}`}>
                        Intensität: {(activity.intensity * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${themeClasses.text}`}>
                      {formatDuration(activity.duration)}
                    </div>
                    {activity.details && (
                      <div className={`text-xs ${themeClasses.textTertiary}`}>
                        {activity.type === 'gaming' && activity.details.game}
                        {activity.type === 'voice' && `${activity.details.participants} Teilnehmer`}
                        {activity.type === 'messages' && `${activity.details.messages} Nachrichten`}
                        {activity.type === 'online' && activity.details.platforms.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Daily Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(activityTypes).map(([type, config]) => {
          const Icon = config.icon;
          
          // Berechne Gesamtaktivität für den Tag
          const totalActivity = timeSlots.reduce((sum, hour) => {
            const activities = getActivitiesForHour(hour);
            const typeActivity = activities.find(a => a.type === type);
            return sum + (typeActivity ? typeActivity.intensity * typeActivity.duration : 0);
          }, 0);
          
          return (
            <div key={type} className={`text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg`}>
              <Icon className="w-6 h-6 mx-auto mb-1" style={{ color: config.color }} />
              <div className={`text-lg font-bold ${themeClasses.text}`}>
                {type === 'messages' ? Math.round(totalActivity * 50) : formatDuration(totalActivity)}
              </div>
              <div className={`text-xs ${themeClasses.textTertiary}`}>
                {config.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyTimeline;