// frontend/src/pages/public/HomePage.jsx - REFACTORED mit aufgeteilten Komponenten
import React, { useState, useEffect } from 'react';
import PublicLayout from '../../components/common/PublicLayout';
import { useServerStats, useLiveStats } from '../../hooks/useServerStats';
import { usePopularGames } from '../../hooks/usePopularGames';

// Import der neuen aufgeteilten Komponenten
import FloatingLiveBadge from '../../components/public/FloatingLiveBadge';
import PopularGamesSection from '../../components/public/PopularGamesSection';
import LiveStatsSection from '../../components/public/LiveStatsSection';
import CommunityStatsSection from '../../components/public/CommunityStatsSection';
import CTASection from '../../components/public/CTASection';

// Import bestehender Komponenten
import TestimonialSlider from '../../components/public/TestimonialSlider';
import EventPreview from '../../components/public/EventPreview';
import CommunityCarousel from '../../components/public/CommunityCarousel';
import HeroSection from '../../components/public/HeroSection';
import FeaturesSection from '../../components/public/FeaturesSection';
import CommunityRulesSection from '../../components/public/CommunityRulesSection';
import FeaturedStreamer from '../../components/public/FeaturedStreamer';

const HomePage = () => {
  // Stats Hooks
  const { stats, loading: statsLoading, error: statsError } = useServerStats({
    autoRefresh: true,
    refreshInterval: 5 * 60 * 1000
  });

  const liveStats = useLiveStats({
    refreshInterval: 60000,
    autoRefresh: true
  });

  // Beliebte Spiele Hook
  const { games: popularGames, loading: gamesLoading, error: gamesError } = usePopularGames('week', 4);

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

  // Community Statistiken Konfiguration
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
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 616 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/></svg>
    },
    { 
      label: 'Gaming Sessions', 
      value: enhancedStats?.activity?.totalGamingSessions || 5842, 
      suffix: '+',
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
      icon: <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z"/></svg>
    }
  ];

  // Statische Daten für andere Sektionen
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
      <PopularGamesSection 
        games={popularGames}
        loading={gamesLoading}
        error={gamesError}
        enhancedStats={enhancedStats}
        isVisible={isVisible.games}
      />

      {/* Live-Stats Section */}
      <LiveStatsSection 
        liveStats={liveStats}
        baseStats={enhancedStats}
        isVisible={isVisible.liveStats}
      />
      
      {/* Community Statistiken Section */}
      <CommunityStatsSection 
        enhancedStats={enhancedStats}
        liveStats={liveStats}
        communityStats={communityStats}
        isVisible={isVisible.stats}
        statsError={statsError}
      />
      
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
      
      {/* Call to Action Section */}
      <CTASection 
        enhancedStats={enhancedStats}
        liveStats={liveStats}
        isVisible={isVisible.cta}
        discordAuthUrl={discordAuthUrl}
      />
    </PublicLayout>
  );
};

export default HomePage;