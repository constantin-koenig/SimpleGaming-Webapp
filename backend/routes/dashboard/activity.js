// backend/routes/dashboard/activity.js - UPDATED: Präzise Zeiträume
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../../models/user.model');
const UserActivity = require('../../models/userActivity.model');
const GameStats = require('../../models/gameStats.model');
const { protect } = require('../../middleware/auth.middleware');

// ✅ MAIN ROUTE: Activity Overview für alle Zeiträume
router.get('/overview', protect, async (req, res) => {
  try {
    const { timeframe = 'weekly', weekDate, monthDate } = req.query;
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden' });
    }

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
        return res.status(400).json({ message: 'Ungültiger Zeitrahmen' });
    }

    res.json({
      success: true,
      data: {
        activityData,
        userJoinDate: user.createdAt,
        timeframe,
        weekDate: weekDate || null,
        monthDate: monthDate || null,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error fetching activity overview:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fehler beim Abrufen der Aktivitätsübersicht',
      error: error.message 
    });
  }
});

// ✅ NEW: Spezifische Woche (7 Tage dieser Woche)
async function generateSpecificWeekData(userId, weekDateInput) {
  // Bestimme die Woche basierend auf Input oder aktuelle Woche
  const now = weekDateInput ? new Date(weekDateInput) : new Date();
  
  // Finde den Montag dieser Woche
  const mondayOfWeek = new Date(now);
  const dayOfWeek = now.getDay(); // 0 = Sonntag, 1 = Montag, etc.
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sonntag wird zu 6
  mondayOfWeek.setDate(now.getDate() - daysFromMonday);
  mondayOfWeek.setHours(0, 0, 0, 0);
  
  // Berechne Sonntag dieser Woche
  const sundayOfWeek = new Date(mondayOfWeek);
  sundayOfWeek.setDate(mondayOfWeek.getDate() + 6);
  sundayOfWeek.setHours(23, 59, 59, 999);
  
  console.log(`📅 Generating week data from ${mondayOfWeek.toISOString()} to ${sundayOfWeek.toISOString()}`);
  
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  // Aktivitäten für diese spezifische Woche aggregieren
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
          year: { $year: { $dateAdd: { startDate: '$timestamp', unit: 'hour', amount: 0 } } },
          month: { $month: { $dateAdd: { startDate: '$timestamp', unit: 'hour', amount: 0 } } },
          day: { $dayOfMonth: { $dateAdd: { startDate: '$timestamp', unit: 'hour', amount: 0 } } },
          dayOfWeek: { $dayOfWeek: { $dateAdd: { startDate: '$timestamp', unit: 'hour', amount: 0 } } }
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
        events: {
          $sum: { $cond: [{ $eq: ['$activityType', 'EVENT_JOINED'] }, 1, 0] }
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
        dayOfWeek: '$_id.dayOfWeek',
        messages: 1,
        voice: 1,
        gaming: 1,
        events: 1
      }
    },
    { $sort: { date: 1 } }
  ]);

  // Vollständige Woche mit allen 7 Tagen erstellen
  const result = [];
  const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(mondayOfWeek);
    currentDate.setDate(mondayOfWeek.getDate() + i);
    
    const dayData = weeklyActivities.find(activity => 
      activity.date.toDateString() === currentDate.toDateString()
    ) || { date: currentDate, messages: 0, voice: 0, gaming: 0, events: 0 };
    
    // Berechne Change zum Vortag
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
      },
      events: { 
        value: dayData.events, 
        change: previousData ? dayData.events - previousData.events.value : 0 
      }
    });
  }

  return result;
}

// ✅ NEW: Spezifischer Monat (Kalenderwochen dieses Monats)
async function generateSpecificMonthData(userId, monthDateInput) {
  // Bestimme den Monat basierend auf Input oder aktueller Monat
  const targetDate = monthDateInput ? new Date(monthDateInput) : new Date();
  
  // Erster Tag des Monats
  const firstDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
  firstDayOfMonth.setHours(0, 0, 0, 0);
  
  // Letzter Tag des Monats
  const lastDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
  lastDayOfMonth.setHours(23, 59, 59, 999);
  
  console.log(`📅 Generating month data from ${firstDayOfMonth.toISOString()} to ${lastDayOfMonth.toISOString()}`);
  
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
        events: {
          $sum: { $cond: [{ $eq: ['$activityType', 'EVENT_JOINED'] }, 1, 0] }
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
      
      // Bestimme Wochenlabel (KW XX oder W1, W2, etc.)
      const weekLabel = `W${result.length + 1}`;
      const calendarWeekLabel = `KW${weekNumber}`;
      
      result.push({
        period: `${week._id.year}-W${weekNumber.toString().padStart(2, '0')}`,
        label: weekLabel, // W1, W2, W3, W4, (W5)
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
        },
        events: { 
          value: week.events, 
          change: previous ? week.events - previous.events.value : 0 
        }
      });
    }
  });

  return result;
}

// ✅ KEEP: Bestehende Funktionen (daily und alltime bleiben unverändert)
async function generateDailyActivityData(userId) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const userObjectId = new mongoose.Types.ObjectId(userId);
  
  const dailyActivities = await UserActivity.aggregate([
    {
      $match: {
        userId: userObjectId,
        timestamp: { $gte: sevenDaysAgo }
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
        },
        events: {
          $sum: { $cond: [{ $eq: ['$activityType', 'EVENT_JOINED'] }, 1, 0] }
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
        gaming: 1,
        events: 1
      }
    },
    { $sort: { date: 1 } }
  ]);

  const result = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const dayData = dailyActivities.find(activity => 
      activity.date.toDateString() === date.toDateString()
    ) || { date, messages: 0, voice: 0, gaming: 0, events: 0 };
    
    result.push({
      period: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('de-DE', { weekday: 'short' }),
      date: date,
      messages: { value: dayData.messages, change: 0 },
      voice: { value: dayData.voice, change: 0 },
      gaming: { value: dayData.gaming, change: 0 },
      events: { value: dayData.events, change: 0 }
    });
  }

  // Change-Werte berechnen
  for (let i = 1; i < result.length; i++) {
    const current = result[i];
    const previous = result[i - 1];
    
    current.messages.change = current.messages.value - previous.messages.value;
    current.voice.change = current.voice.value - previous.voice.value;
    current.gaming.change = current.gaming.value - previous.gaming.value;
    current.events.change = current.events.value - previous.events.value;
  }

  return result;
}

async function generateAllTimeActivityData(userId, userCreatedAt) {
  // Bestehende Alltime-Logik bleibt unverändert
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
        events: {
          $sum: { $cond: [{ $eq: ['$activityType', 'EVENT_JOINED'] }, 1, 0] }
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
      },
      events: { 
        value: period.events, 
        change: previous ? period.events - previous.events : 0 
      },
      metadata: {
        accountAge: labelFormat,
        periodCount: allTimeActivities.length
      }
    };
  });
}

// Bestehende Gaming und Trends Routes bleiben unverändert
router.get('/gaming-details', protect, async (req, res) => {
  try {
    const { timeframe = 'week' } = req.query;
    const userId = req.user.id;
    
    const gamingStats = await UserActivity.getGamingSessionStats(userId, timeframe);
    
    res.json({
      success: true,
      data: gamingStats,
      timeframe
    });
    
  } catch (error) {
    console.error('Error fetching gaming details:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fehler beim Abrufen der Gaming-Details' 
    });
  }
});

router.get('/trends', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user.id;
    
    const trends = await UserActivity.getActivityTrends(userId, parseInt(days));
    
    res.json({
      success: true,
      data: trends,
      period: `${days} days`
    });
    
  } catch (error) {
    console.error('Error fetching activity trends:', error);
    res.status(500).json({ 
      success: false,
      message: 'Fehler beim Abrufen der Aktivitätstrends' 
    });
  }
});

module.exports = router;