// backend/routes/dashboard/activity.js - OHNE EVENTS
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const UserActivity = require('../../models/userActivity.model');

// ✅ OHNE EVENTS: Activity Overview ohne Event-Daten
router.get('/overview', async (req, res) => {
  try {
    const { timeframe = 'weekly', weekDate, monthDate } = req.query;
    const userId = req.user.id;
    const user = req.user;

    let activityData;
    
    switch (timeframe) {
      case 'daily':
        activityData = await generateDailyActivityData(userId);
        break;
      case 'weekly':
        // ✅ UPDATED: Spezifische Woche basierend auf weekDate
        activityData = await generateSpecificWeekData(userId, weekDate);
        break;
      case 'monthly':
        // ✅ UPDATED: Spezifischer Monat mit Kalenderwochen basierend auf monthDate
        activityData = await generateSpecificMonthData(userId, monthDate);
        break;
      case 'alltime':
        activityData = await generateAllTimeActivityData(userId, user.createdAt);
        break;
      default:
        activityData = await generateWeeklyActivityData(userId);
    }

    res.json({
      success: true,
      data: activityData,
      timeframe: timeframe,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Error fetching activity overview:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fehler beim Abrufen der Aktivitätsdaten',
      error: error.message 
    });
  }
});

// ✅ OHNE EVENTS: Daily Activity (letzte 7 Tage) - KORRIGIERTE TAGESZUORDNUNG
async function generateDailyActivityData(userId) {
  const now = new Date();
  now.setHours(23, 59, 59, 999); // Ende des heutigen Tages
  
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6); // Heute + 6 Tage zurück = 7 Tage
  sevenDaysAgo.setHours(0, 0, 0, 0); // Anfang des ersten Tages
  

  
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  const dailyActivities = await UserActivity.aggregate([
    {
      $match: {
        userId: userObjectId,
        timestamp: { $gte: sevenDaysAgo, $lte: now }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        messages: {
          $sum: { $cond: [{ $eq: ['$activityType', 'MESSAGE'] }, 1, 0] }
        },
        voice: {
          $sum: {
            $cond: [
              { $eq: ['$activityType', 'VOICE_LEAVE'] },
              { $ifNull: ['$metadata.duration', 0] },
              0
            ]
          }
        },
        gaming: {
          $sum: {
            $cond: [
              { $eq: ['$activityType', 'GAME_END'] },
              { $ifNull: ['$metadata.duration', 0] },
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        messages: 1,
        voice: 1,
        gaming: 1
      }
    },
    { $sort: { date: 1 } }
  ]);

  const result = [];
  
  // Erstelle Array für die letzten 7 Tage (inklusive heute)
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0); // Normalisiere auf Tagesanfang für Vergleich
    
    // Finde die Daten für diesen Tag
    const dayData = dailyActivities.find(activity => {
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      return activityDate.getTime() === date.getTime();
    }) || { date, messages: 0, voice: 0, gaming: 0 };
    
    const previousData = result.length > 0 ? result[result.length - 1] : null;
    
    result.push({
      period: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('de-DE', { weekday: 'short' }),
      date: date,
      messages: { 
        value: dayData.messages, 
        change: previousData ? dayData.messages - previousData.messages.value : 0 
      },
      voice: { 
        value: dayData.voice, 
        change: previousData ? dayData.voice - previousData.voice.value : 0 
      },
      gaming: { 
        value: dayData.gaming, 
        change: previousData ? dayData.gaming - previousData.gaming.value : 0 
      }
    });
  }

  return result;
}

// ✅ NEW: Spezifische Woche (7 Tage dieser Woche) - OHNE EVENTS
async function generateSpecificWeekData(userId, weekDateInput) {
  // Bestimme die Woche basierend auf Input oder aktuelle Woche
  const now = weekDateInput ? new Date(weekDateInput) : new Date();
  
  // Finde den Montag dieser Woche
  const mondayOfWeek = new Date(now);
  const dayOfWeek = now.getDay(); // 0 = Sonntag, 1 = Montag, etc.
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sonntag = 6 Tage vom Montag
  mondayOfWeek.setDate(now.getDate() - daysFromMonday);
  mondayOfWeek.setHours(0, 0, 0, 0);
  
  // Sonntag der gleichen Woche
  const sundayOfWeek = new Date(mondayOfWeek);
  sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
  sundayOfWeek.setHours(23, 59, 59, 999);
  
  
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  // Aktivitäten für diese spezifische Woche aggregieren (Montag bis Sonntag)
  const weeklyActivities = await UserActivity.aggregate([
    {
      $match: {
        userId: userObjectId,
        timestamp: { 
          $gte: mondayOfWeek,
          $lte: sundayOfWeek
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        messages: {
          $sum: { $cond: [{ $eq: ['$activityType', 'MESSAGE'] }, 1, 0] }
        },
        voice: {
          $sum: {
            $cond: [
              { $eq: ['$activityType', 'VOICE_LEAVE'] },
              { $ifNull: ['$metadata.duration', 0] },
              0
            ]
          }
        },
        gaming: {
          $sum: {
            $cond: [
              { $eq: ['$activityType', 'GAME_END'] },
              { $ifNull: ['$metadata.duration', 0] },
              0
            ]
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        messages: 1,
        voice: 1,
        gaming: 1
      }
    },
    { $sort: { date: 1 } }
  ]);

  // Erstelle 7-Tage Array (Montag bis Sonntag)
  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  const result = [];

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(mondayOfWeek);
    currentDate.setDate(mondayOfWeek.getDate() + i);
    
    // Finde die Daten für diesen Tag
    const dayData = weeklyActivities.find(activity => 
      activity.date.toDateString() === currentDate.toDateString()
    ) || { date: currentDate, messages: 0, voice: 0, gaming: 0 };
    
    const previousData = i > 0 ? result[i - 1] : null;
    
    result.push({
      period: currentDate.toISOString().split('T')[0],
      label: weekDays[i],
      date: currentDate,
      messages: { 
        value: dayData.messages, 
        change: previousData ? dayData.messages - previousData.messages.value : 0 
      },
      voice: { 
        value: dayData.voice, 
        change: previousData ? dayData.voice - previousData.voice.value : 0 
      },
      gaming: { 
        value: dayData.gaming, 
        change: previousData ? dayData.gaming - previousData.gaming.value : 0 
      }
    });
  }

  return result;
}

// ✅ NEW: Spezifischer Monat (Kalenderwochen dieses Monats) - OHNE EVENTS
async function generateSpecificMonthData(userId, monthDateInput) {
  // Bestimme den Monat basierend auf Input oder aktueller Monat
  const targetDate = monthDateInput ? new Date(monthDateInput) : new Date();
  
  // Erster Tag des Monats
  const firstDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  
  // Letzter Tag des Monats
  const lastDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
  lastDayOfMonth.setHours(23, 59, 59, 999);
  
  
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  // Aktivitäten für diesen spezifischen Monat aggregieren
  const monthlyActivities = await UserActivity.aggregate([
    {
      $match: {
        userId: userObjectId,
        timestamp: { 
          $gte: firstDayOfMonth,
          $lte: lastDayOfMonth
        }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          week: { $week: '$timestamp' }
        },
        messages: {
          $sum: { $cond: [{ $eq: ['$activityType', 'MESSAGE'] }, 1, 0] }
        },
        voice: {
          $sum: {
            $cond: [
              { $eq: ['$activityType', 'VOICE_LEAVE'] },
              { $ifNull: ['$metadata.duration', 0] },
              0
            ]
          }
        },
        gaming: {
          $sum: {
            $cond: [
              { $eq: ['$activityType', 'GAME_END'] },
              { $ifNull: ['$metadata.duration', 0] },
              0
            ]
          }
        },
        firstDayOfWeek: { $min: '$timestamp' },
        lastDayOfWeek: { $max: '$timestamp' }
      }
    },
    { $sort: { '_id.week': 1 } }
  ]);

  // Formatierung für Frontend - nur Wochen die (teilweise) in diesem Monat liegen
  const result = [];
  
  monthlyActivities.forEach((week, index) => {
    // Prüfe ob diese Woche tatsächlich in den gewählten Monat fällt
    const weekStart = new Date(week.firstDayOfWeek);
    const weekEnd = new Date(week.lastDayOfWeek);
    
    // Woche muss mindestens teilweise im gewählten Monat liegen
    if (weekStart <= lastDayOfMonth && weekEnd >= firstDayOfMonth) {
      const weekNumber = week._id.week;
      const previous = result[result.length - 1]; // Vorherige Woche in Result-Array
      
      // Bestimme Wochenlabel - KALENDERWOCHE anstatt W1, W2
      const calendarWeekLabel = `W${weekNumber}`;
      
      result.push({
        period: `${week._id.year}-W${weekNumber.toString().padStart(2, '0')}`,
        label: calendarWeekLabel, // KW28, KW29, KW30, etc.
        calendarWeek: calendarWeekLabel, // KW28, KW29, etc.
        date: weekStart,
        weekStart: weekStart,
        weekEnd: weekEnd,
        messages: { 
          value: week.messages, 
          change: previous ? week.messages - previous.messages.value : 0 
        },
        voice: { 
          value: week.voice, 
          change: previous ? week.voice - previous.voice.value : 0 
        },
        gaming: { 
          value: week.gaming, 
          change: previous ? week.gaming - previous.gaming.value : 0 
        }
      });
    }
  });

  return result;
}

// ✅ OHNE EVENTS: AllTime Activity ohne Events
async function generateAllTimeActivityData(userId, userCreatedAt) {
  const now = new Date();
  const accountAge = now - new Date(userCreatedAt);
  const monthsOld = accountAge / (1000 * 60 * 60 * 24 * 30);
  
  let groupBy, labelFormat;
  
  if (monthsOld <= 3) {
    groupBy = { year: { $year: '$timestamp' }, week: { $week: '$timestamp' } };
    labelFormat = 'weekly';
  } else if (monthsOld <= 12) {
    groupBy = { year: { $year: '$timestamp' }, month: { $month: '$timestamp' } };
    labelFormat = 'monthly';
  } else {
    groupBy = { 
      year: { $year: '$timestamp' }, 
      quarter: { $ceil: { $divide: [{ $month: '$timestamp' }, 3] } }
    };
    labelFormat = 'quarterly';
  }

  const allTimeActivities = await UserActivity.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: { $gte: new Date(userCreatedAt) }
      }
    },
    {
      $group: {
        _id: groupBy,
        messages: {
          $sum: { $cond: [{ $eq: ['$activityType', 'MESSAGE'] }, 1, 0] }
        },
        voice: {
          $sum: {
            $cond: [
              { $eq: ['$activityType', 'VOICE_LEAVE'] },
              { $ifNull: ['$metadata.duration', 0] },
              0
            ]
          }
        },
        gaming: {
          $sum: {
            $cond: [
              { $eq: ['$activityType', 'GAME_END'] },
              { $ifNull: ['$metadata.duration', 0] },
              0
            ]
          }
        },
        firstActivity: { $min: '$timestamp' }
      }
    },
    { 
      $sort: { 
        '_id.year': 1, 
        '_id.month': 1, 
        '_id.week': 1, 
        '_id.quarter': 1 
      } 
    }
  ]);

  return allTimeActivities.map((period, index) => {
    let label, periodKey;
    
    if (labelFormat === 'weekly') {
      label = `W${period._id.week}`;
      periodKey = `${period._id.year}-W${period._id.week}`;
    } else if (labelFormat === 'monthly') {
      const monthDate = new Date(period._id.year, period._id.month - 1, 1);
      label = monthDate.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
      periodKey = `${period._id.year}-${period._id.month.toString().padStart(2, '0')}`;
    } else {
      label = `Q${period._id.quarter}/${period._id.year.toString().slice(-2)}`;
      periodKey = `${period._id.year}-Q${period._id.quarter}`;
    }
    
    const previous = allTimeActivities[index - 1];
    
    return {
      period: periodKey,
      label: label,
      date: period.firstActivity,
      messages: { 
        value: period.messages, 
        change: previous ? period.messages - previous.messages : 0 
      },
      voice: { 
        value: period.voice, 
        change: previous ? period.voice - previous.voice : 0 
      },
      gaming: { 
        value: period.gaming, 
        change: previous ? period.gaming - previous.gaming : 0 
      }
    };
  });
}

module.exports = router;