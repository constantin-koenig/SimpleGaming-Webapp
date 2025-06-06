// frontend/src/pages/public/HomePage.jsx - ENHANCED mit Live-Daten
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';
import { useServerStats, useLiveStats, useAnimatedCounter } from '../../hooks/useServerStats';

// Import existing components
import GameCard from '../../components/public/GameCard';
import TestimonialSlider from '../../components/public/TestimonialSlider';
import EventPreview from '../../components/public/EventPreview';
import CommunityCarousel from '../../components/public/CommunityCarousel';
import HeroSection from '../../components/public/HeroSection';
import FeaturesSection from '../../components/public/FeaturesSection';
import CommunityRulesSection from '../../components/public/CommunityRulesSection';
import FeaturedStreamer from '../../components/public/FeaturedStreamer';





const LiveStatsDisplay = ({ liveStats, baseStats, isVisible }) => {
  // ✅ FIXED: Bessere Animation-Kontrolle
  const onlineCount = useAnimatedCounter(
    liveStats.onlineMembers, 
    1500, 
    isVisible && liveStats.onlineMembers > 0
  );
  const voiceCount = useAnimatedCounter(
    liveStats.activeVoiceSessions, 
    1500, 
    isVisible && liveStats.activeVoiceSessions >= 0
  );
  const playingCount = useAnimatedCounter(
    liveStats.currentlyPlaying, 
    1500, 
    isVisible && liveStats.currentlyPlaying >= 0
  );

  return (
    <div className={`transform transition-all duration-1000 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
      {/* Live-Status Header */}
      <div className="flex items-center justify-center mb-8 space-x-4">
        <div className="flex items-center px-4 py-2 bg-green-100 dark:bg-green-900 rounded-full">
          <div className={`w-3 h-3 rounded-full mr-2 ${
            liveStats.connectionInfo.color === 'green' ? 'bg-green-500 animate-pulse' :
            liveStats.connectionInfo.color === 'yellow' ? 'bg-yellow-500 animate-spin' :
            liveStats.connectionInfo.color === 'orange' ? 'bg-orange-500 animate-pulse' :
            'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            {liveStats.connectionInfo.text}
          </span>
        </div>
        
        {liveStats.timestamp && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Aktualisiert: {liveStats.timestamp.toLocaleTimeString('de-DE')}
          </div>
        )}
      </div>

      {/* Live-Statistiken Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Online Mitglieder */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Gerade Online</p>
                <p className="text-3xl font-bold">
                  {/* ✅ FIXED: Nur Animation zeigen wenn sich Wert ändert */}
                  {onlineCount.isInitialized ? onlineCount.formatted : liveStats.formattedData.onlineMembers}
                  {onlineCount.isAnimating && (
                    <span className="inline-block w-1 h-8 bg-white ml-1 animate-pulse"></span>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <div className="w-2 h-2 bg-green-300 rounded-full animate-ping mr-2"></div>
              <span className="text-green-100 text-xs">Live Discord Präsenz</span>
            </div>
          </div>
        </div>

        {/* Voice Chat */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Im Voice Chat</p>
                <p className="text-3xl font-bold">
                  {/* ✅ FIXED: Stabilere Anzeige */}
                  {voiceCount.isInitialized ? voiceCount.formatted : liveStats.formattedData.activeVoiceSessions}
                  {voiceCount.isAnimating && (
                    <span className="inline-block w-1 h-8 bg-white ml-1 animate-pulse"></span>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
                </svg>
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse mr-2"></div>
              <span className="text-blue-100 text-xs">Aktive Gespräche</span>
            </div>
          </div>
        </div>

        {/* Aktuell Spielend */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Spielen gerade</p>
                <p className="text-3xl font-bold">
                  {/* ✅ FIXED: Konsistente Anzeige */}
                  {playingCount.isInitialized ? playingCount.formatted : liveStats.formattedData.currentlyPlaying}
                  {playingCount.isAnimating && (
                    <span className="inline-block w-1 h-8 bg-white ml-1 animate-pulse"></span>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/>
                </svg>
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <div className="w-2 h-2 bg-purple-300 rounded-full animate-bounce mr-2"></div>
              <span className="text-purple-100 text-xs">Gaming Sessions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Info (nur für Debug/Admins) */}
      {liveStats.performance && process.env.NODE_ENV === 'development' && (
        <div className="text-center text-xs text-gray-500 dark:text-gray-400">
          Cache-Alter: {liveStats.cacheAge}min | 
          Update: {liveStats.performance.updateInProgress ? 'Läuft...' : 'Bereit'} |
          Nächstes Update in: {Math.floor((60000 - (Date.now() % 60000)) / 1000)}s
        </div>
      )}
    </div>
  );
};

// ✅ ENHANCED: Stabilere Animierte Statistik-Karte Komponente
const AnimatedStatCard = ({ label, value, suffix = '', delay = 0, isVisible, gradient, icon }) => {
  const animatedValue = useAnimatedCounter(
    parseInt(value.toString().replace(/,/g, '')) || 0, 
    2000, 
    isVisible
  );
  
  return (
    <div 
      className={`transform transition-all duration-1000 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`${gradient} rounded-xl p-6 text-white relative overflow-hidden shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300`}>
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              {icon}
            </div>
            {animatedValue.isAnimating && (
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          
          <p className="text-4xl md:text-5xl font-extrabold mb-2">
            {/* ✅ FIXED: Bessere Fallback-Anzeige */}
            {animatedValue.isInitialized ? (
              <>
                {animatedValue.formatted}{suffix}
                {animatedValue.isAnimating && (
                  <span className="inline-block w-1 h-10 bg-white ml-2 animate-pulse"></span>
                )}
              </>
            ) : (
              <>
                {value.toLocaleString()}{suffix}
              </>
            )}
          </p>
          <p className="text-lg opacity-90">{label}</p>
        </div>
      </div>
    </div>
  );
};

// Floating Live Badge Komponente
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

// ✅ ENHANCED: Update HomePage Hook-Konfiguration
const HomePage = () => {
  // Stats Hooks - kombiniert normale und Live-Daten
  const { stats, loading: statsLoading, error: statsError } = useServerStats({
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000 // 5 Minuten für normale Stats
  });

  // ✅ FIXED: Live-Stats mit 1-Minute Updates
  const liveStats = useLiveStats({
    refreshInterval: 60000, // ✅ 1 Minute statt 15 Sekunden
    autoRefresh: true
  });

  // Animation States
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    rules: false,
    games: false,
    stats: false,
    liveStats: false,
    events: false,
    community: false,
    testimonials: false,
    streamers: false,
    cta: false
  });
  
  const discordAuthUrl = 'http://localhost:5000/api/auth/discord';
  
  // Scroll-basierte Animationen
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      
      setIsVisible(prev => ({ ...prev, hero: true }));
      
      const sections = ['features', 'rules', 'games', 'stats', 'liveStats', 'events', 'community', 'streamers', 'testimonials', 'cta'];
      
      sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section && scrollPosition > section.offsetTop + 100) {
          setIsVisible(prev => ({ ...prev, [sectionId]: true }));
        }
      });
    };
    
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Enhanced stats mit Live-Daten
  const enhancedStats = stats ? {
    ...stats,
    live: {
      onlineMembers: liveStats.onlineMembers,
      activeVoiceSessions: liveStats.activeVoiceSessions,
      currentlyPlaying: liveStats.currentlyPlaying
    }
  } : null;

  // Community Statistiken mit animierten Werten
  const communityStats = [
    { 
      label: 'Community Mitglieder', 
      value: enhancedStats?.members?.total || 1283, 
      suffix: '+',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/></svg>
    },
    { 
      label: 'Aktive Spieler', 
      value: enhancedStats?.members?.active || 450, 
      suffix: '+',
      gradient: 'bg-gradient-to-br from-green-500 to-green-600',
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    },
    { 
      label: 'Stunden Voice Chat', 
      value: enhancedStats?.activity?.totalVoiceHours || 15460, 
      suffix: '+',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/></svg>
    },
    { 
      label: 'Gesendete Nachrichten', 
      value: enhancedStats?.activity?.totalMessages || 89542, 
      suffix: '+',
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"/></svg>
    }
  ];

  // Beliebte Spiele mit Fallback-Daten
  const popularGames = enhancedStats?.highlights?.popularGames?.length > 0 
    ? enhancedStats.highlights.popularGames.map((game, index) => ({
        id: index + 1,
        title: game.name,
        image: 'https://via.placeholder.com/300x180',
        players: game.playCount || 0,
        category: 'Popular'
      }))
    : [
        {
          id: 1,
          title: 'Minecraft',
          image: 'https://via.placeholder.com/300x180',
          players: 45,
          category: 'Sandbox'
        },
        {
          id: 2,
          title: 'Fortnite',
          image: 'https://via.placeholder.com/300x180',
          players: 38,
          category: 'Battle Royale'
        },
        {
          id: 3,
          title: 'Call of Duty: Warzone',
          image: 'https://via.placeholder.com/300x180',
          players: 31,
          category: 'FPS'
        },
        {
          id: 4,
          title: 'League of Legends',
          image: 'https://via.placeholder.com/300x180',
          players: 27,
          category: 'MOBA'
        }
      ];

  // Kommende Events
  const upcomingEvents = [
    {
      id: 1,
      title: 'Minecraft Bau-Wettbewerb',
      date: 'Samstag, 20:00 Uhr',
      image: 'https://via.placeholder.com/250x150',
      participants: 32,
      maxParticipants: 64
    },
    {
      id: 2,
      title: 'Fortnite Turnier',
      date: 'Sonntag, 14:00 Uhr',
      image: 'https://via.placeholder.com/250x150',
      participants: 18,
      maxParticipants: 30
    },
    {
      id: 3,
      title: 'Community Game Night',
      date: 'Freitag, 21:00 Uhr',
      image: 'https://via.placeholder.com/250x150',
      participants: 22,
      maxParticipants: 40
    }
  ];

  // Community Inhalte
  const communityItems = [
    {
      id: 1,
      title: 'Minecraft Bauwerk',
      description: 'Erstaunlicher Tempel von TeamBuilder2023',
      image: 'https://via.placeholder.com/400x300',
      type: 'Screenshot'
    },
    {
      id: 2,
      title: 'Gewinner des letzten Turniers',
      description: 'ProGamer99 hat das Turnier gewonnen!',
      image: 'https://via.placeholder.com/400x300',
      type: 'Event'
    },
    {
      id: 3,
      title: 'Neuer Server',
      description: 'Unser Valheim-Server ist jetzt online!',
      image: 'https://via.placeholder.com/400x300',
      type: 'News'
    },
    {
      id: 4,
      title: 'Community Treffen',
      description: 'Rückblick auf unser IRL-Treffen',
      image: 'https://via.placeholder.com/400x300',
      type: 'Event'
    },
    {
      id: 5,
      title: 'Basis-Tour',
      description: 'Tour durch MinecraftMaster\'s Mega-Basis',
      image: 'https://via.placeholder.com/400x300',
      type: 'Screenshot'
    }
  ];

  // Testimonials mit echten Top-Usern
  const testimonials = [
    {
      id: 1,
      name: enhancedStats?.highlights?.topUsers?.[0]?.username || 'Max M.',
      avatar: 'https://via.placeholder.com/60',
      text: 'Bei SimpleGaming habe ich nicht nur tolle Mitspieler gefunden, sondern auch echte Freunde. Die Events sind immer ein Highlight!'
    },
    {
      id: 2,
      name: enhancedStats?.highlights?.topUsers?.[1]?.username || 'Sarah K.',
      avatar: 'https://via.placeholder.com/60',
      text: 'Als Gelegenheitsspielerin fühle ich mich hier total willkommen. Die Buddy-Funktion ist genial, um neue Leute kennenzulernen.'
    },
    {
      id: 3,
      name: enhancedStats?.highlights?.topUsers?.[2]?.username || 'Tim R.',
      avatar: 'https://via.placeholder.com/60',
      text: 'Die Gameserver sind super stabil und die Admins kümmern sich gut um die Community. Immer gerne dabei!'
    }
  ];

  // Featured Streamers
  const featuredStreamers = [
    {
      id: 1,
      name: 'NinjaGirl',
      avatar: 'https://via.placeholder.com/100',
      game: 'Valorant',
      followers: 25600,
      quote: 'Ich streame jeden Tag für die beste Community da draußen!'
    },
    {
      id: 2,
      name: 'ProGamer99',
      avatar: 'https://via.placeholder.com/100',
      game: 'League of Legends',
      followers: 18300,
      quote: 'SimpleGaming gibt mir die Motivation, jeden Tag besser zu werden.'
    },
    {
      id: 3,
      name: 'MineKing42',
      avatar: 'https://via.placeholder.com/100',
      game: 'Minecraft',
      followers: 12500,
      quote: 'Kreativität kennt keine Grenzen - genau wie diese Community!'
    }
  ];
  
  return (
    <PublicLayout>
      {/* Hero Section */}
      <HeroSection isVisible={isVisible.hero} />
      
      {/* Floating Live Badge */}
      <FloatingLiveBadge liveStats={liveStats} />
      
      {/* Features Section */}
      <FeaturesSection id="features" isVisible={isVisible.features} />
      
      {/* Community Regeln Section */}
      <CommunityRulesSection id="rules" isVisible={isVisible.rules} />
      
      {/* Beliebte Spiele Section */}
      <div 
        id="games" 
        className={`py-16 bg-light-bg-secondary dark:bg-dark-bg-secondary transition-all duration-1000 pattern-fade ${isVisible.games ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase gradient-text">Spiele</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary sm:text-4xl neon-glow">
              Beliebte Spiele bei SimpleGaming
            </p>
            <div className="badge-pulse mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {enhancedStats ? `${enhancedStats.activity.gamesPlayed} Sessions gespielt` : 'Spiele mit uns!'}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {popularGames.map((game, index) => (
              <GameCard 
                key={game.id} 
                game={game} 
                delay={index * 100} 
                isVisible={isVisible.games} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* NEUE Live-Stats Section */}
      <div 
        id="liveStats" 
        className={`py-16 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-all duration-1000 ${isVisible.liveStats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase gradient-text">Live Stats</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary sm:text-4xl neon-glow">
              Was passiert gerade?
            </p>
            <p className="mt-4 max-w-2xl text-xl text-light-text-secondary dark:text-dark-text-secondary lg:mx-auto">
              Echte Live-Daten aus unserer Discord-Community
            </p>
          </div>
          
          <LiveStatsDisplay 
            liveStats={liveStats} 
            baseStats={enhancedStats} 
            isVisible={isVisible.liveStats} 
          />
        </div>
      </div>
      
      {/* Erweiterte Statistik-Section */}
      <div 
        id="stats" 
        className={`py-20 bg-gradient-to-r from-primary-700 to-primary-900 transition-all duration-1000 relative ${isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        {/* Wellige obere Kante */}
        <div className="absolute left-0 right-0 -mt-20 h-20 overflow-hidden">
          <svg className="absolute bottom-0 w-full h-20 fill-current text-gray-50 dark:text-gray-900 transform rotate-180" viewBox="0 0 1440 320">
            <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,122.7C960,139,1056,149,1152,144C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-4 neon-glow">
              SimpleGaming in Zahlen
            </h2>
            {enhancedStats && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-6">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                Live-Daten • {liveStats.formattedData.onlineMembers} online • Aktualisiert {new Date(enhancedStats.lastUpdate).toLocaleTimeString('de-DE')}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {communityStats.map((stat, index) => (
              <AnimatedStatCard 
                key={index} 
                label={stat.label}
                value={stat.value} 
                suffix={stat.suffix}
                delay={index * 200} 
                isVisible={isVisible.stats}
                gradient={stat.gradient}
                icon={stat.icon}
              />
            ))}
          </div>
          
          {/* Error State */}
          {statsError && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-lg bg-red-100 text-red-800 text-sm">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Live-Statistiken temporär nicht verfügbar
              </div>
            </div>
          )}
        </div>
        
        {/* Wellige untere Kante */}
        <div className="absolute left-0 right-0 h-20 overflow-hidden" style={{marginTop: "5rem"}}>
          <svg className="absolute top-0 w-full h-20 fill-current text-light-bg-primary dark:text-dark-bg-primary" viewBox="0 0 1440 320">
            <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,122.7C960,139,1056,149,1152,144C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Events Section */}
      <div 
        id="events" 
        className={`py-16 bg-light-bg-primary dark:bg-dark-bg-primary transition-all duration-1000 ${isVisible.events ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase gradient-text">Events</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary sm:text-4xl neon-glow">
              Kommende Community-Events
            </p>
            <p className="mt-4 max-w-2xl text-xl text-light-text-secondary dark:text-dark-text-secondary lg:mx-auto">
              Nimm an spannenden Turnieren und Events teil und gewinne tolle Preise!
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.map((event, index) => (
              <EventPreview 
                key={event.id} 
                event={event} 
                delay={index * 150} 
                isVisible={isVisible.events} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Featured Streamers Section */}
      <div 
        id="streamers" 
        className={`py-16 bg-gradient-to-br from-light-bg-secondary to-light-bg-tertiary dark:from-dark-bg-secondary dark:to-dark-bg-tertiary transition-all duration-1000 pattern-fade ${isVisible.streamers ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase gradient-text">Streamer</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary sm:text-4xl neon-glow">
              Unsere Featured Streamer
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredStreamers.map((streamer, index) => (
              <FeaturedStreamer 
                key={streamer.id} 
                streamer={streamer} 
                delay={index * 150} 
                isVisible={isVisible.streamers} 
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Community Carousel Section */}
      <div 
        id="community" 
        className={`py-16 bg-light-bg-secondary dark:bg-dark-bg-secondary transition-all duration-1000 pattern-fade ${isVisible.community ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase gradient-text">Unsere Community</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary sm:text-4xl neon-glow">
              SimpleGaming Highlights
            </p>
          </div>
          
          <CommunityCarousel 
            items={communityItems} 
            isVisible={isVisible.community}
          />
        </div>
      </div>
      
      {/* Testimonials Section */}
      <div 
        id="testimonials" 
        className={`py-16 bg-light-bg-primary dark:bg-dark-bg-primary transition-all duration-1000 ${isVisible.testimonials ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center mb-12">
            <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase gradient-text">Testimonials</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary sm:text-4xl neon-glow">
              Was unsere Mitglieder sagen
            </p>
          </div>
          
          <TestimonialSlider 
            testimonials={testimonials} 
            isVisible={isVisible.testimonials} 
          />
        </div>
      </div>
      
      {/* Enhanced Call to Action Section */}
      <div 
        id="cta" 
        className={`py-16 relative overflow-hidden transition-all duration-1000 ${isVisible.cta ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 z-0">
          <div className="absolute w-96 h-96 -top-20 -left-20 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute w-96 h-96 top-1/4 right-1/3 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute w-96 h-96 bottom-0 right-0 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-0 lg:flex-1">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl neon-glow">
                <span className="block">Bereit, beizutreten?</span>
                <span className="block text-primary-300">
                  {enhancedStats ? 
                    `Werde Teil von ${enhancedStats.formatted?.members?.total || enhancedStats.members.total} Gamern!` : 
                    'Werde noch heute Teil von SimpleGaming!'
                  }
                </span>
              </h2>
              
              {/* Enhanced Live-Aktivität Anzeige */}
              {enhancedStats && liveStats.isOnline && (
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-ping mr-2"></div>
                    <span className="text-white text-sm font-medium">
                      {liveStats.formattedData.onlineMembers} gerade online
                    </span>
                  </div>
                  
                  <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                    <svg className="w-4 h-4 text-blue-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-white text-sm font-medium">
                      {liveStats.formattedData.activeVoiceSessions} im Voice Chat
                    </span>
                  </div>
                  
                  <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                    <svg className="w-4 h-4 text-purple-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/>
                    </svg>
                    <span className="text-white text-sm font-medium">
                      {liveStats.formattedData.currentlyPlaying} spielen gerade
                    </span>
                  </div>
                  
                  <div className="flex items-center bg-white bg-opacity-20 rounded-lg px-4 py-2">
                    <svg className="w-4 h-4 text-yellow-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-white text-sm font-medium">
                      {enhancedStats.members.newThisWeek} neue Mitglieder diese Woche
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow-lg">
                <a
                  href={discordAuthUrl}
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 hover:scale-105 pulse-animation"
                >
                  <svg className="w-6 h-6 mr-2 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0c-.164-.386-.398-.875-.608-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                  </svg>
                  Discord beitreten
                </a>
              </div>
            </div>
          </div>
          
          {/* Live Gaming Scene mit echten Daten */}
          <div className="mt-10">
            <div className="relative flex justify-center">
              <svg viewBox="0 0 300 100" className="w-full max-w-lg opacity-40">
                {/* Gaming Table */}
                <rect x="100" y="80" width="100" height="5" rx="2" fill="#FFFFFF" />
                
                {/* Player 1 - Left */}
                <g className="animate-pulse" style={{animationDuration: "3s"}}>
                  <circle cx="80" cy="40" r="8" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                  <line x1="80" y1="48" x2="80" y2="65" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="80" y1="52" x2="70" y2="60" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="80" y1="52" x2="90" y2="65" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="80" y1="65" x2="70" y2="85" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="80" y1="65" x2="90" y2="85" stroke="#FFFFFF" strokeWidth="2" />
                  
                  {/* Happy Face */}
                  <circle cx="77" cy="38" r="1" fill="#FFFFFF" />
                  <circle cx="83" cy="38" r="1" fill="#FFFFFF" />
                  <path d="M77,43 Q80,46 83,43" stroke="#FFFFFF" strokeWidth="1" fill="none" />
                </g>
                
                {/* Player 2 - Right */}
                <g className="animate-pulse" style={{animationDuration: "2.5s", animationDelay: "0.5s"}}>
                  <circle cx="220" cy="40" r="8" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                  <line x1="220" y1="48" x2="220" y2="65" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="220" y1="52" x2="230" y2="60" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="220" y1="52" x2="210" y2="65" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="220" y1="65" x2="210" y2="85" stroke="#FFFFFF" strokeWidth="2" />
                  <line x1="220" y1="65" x2="230" y2="85" stroke="#FFFFFF" strokeWidth="2" />
                  
                  {/* Happy Face */}
                  <circle cx="217" cy="38" r="1" fill="#FFFFFF" />
                  <circle cx="223" cy="38" r="1" fill="#FFFFFF" />
                  <path d="M217,43 Q220,46 223,43" stroke="#FFFFFF" strokeWidth="1" fill="none" />
                </g>
                
                {/* Game Screen/Monitor */}
                <rect x="125" y="50" width="50" height="30" rx="2" fill="#FFFFFF" opacity="0.2" className="animate-pulse" />
                
                {/* Game Console */}
                <rect x="140" y="85" width="20" height="5" rx="1" fill="#FFFFFF" opacity="0.7" />
                
                {/* Controllers */}
                <rect x="95" y="65" width="15" height="8" rx="2" fill="#FFFFFF" opacity="0.5" />
                <rect x="190" y="65" width="15" height="8" rx="2" fill="#FFFFFF" opacity="0.5" />
                
                {/* Effect Stars - Excitement */}
                <path d="M120,30 L122,35 L127,37 L122,39 L120,44 L118,39 L113,37 L118,35 Z" fill="#FFFFFF" opacity="0.5" className="animate-ping" style={{animationDuration: "2s"}} />
                <path d="M180,35 L182,40 L187,42 L182,44 L180,49 L178,44 L173,42 L178,40 Z" fill="#FFFFFF" opacity="0.5" className="animate-ping" style={{animationDuration: "2.5s"}} />
              </svg>
            </div>
            
            {/* Live-Aktivität Text mit echten Daten */}
            {enhancedStats && liveStats.isOnline && (
              <div className="mt-6 text-center space-y-2">
                <p className="text-white text-opacity-80 text-lg">
                  Gerade spielen <span className="font-bold text-white">{liveStats.formattedData.currentlyPlaying}</span> Mitglieder zusammen
                </p>
                <p className="text-white text-opacity-60 text-sm">
                  {liveStats.formattedData.activeVoiceSessions} aktive Voice-Sessions • {liveStats.formattedData.onlineMembers} online
                </p>
                {liveStats.timestamp && (
                  <p className="text-white text-opacity-40 text-xs">
                    Live-Update: {liveStats.timestamp.toLocaleTimeString('de-DE')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default HomePage;