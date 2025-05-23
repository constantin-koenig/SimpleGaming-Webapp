// frontend/src/pages/public/HomePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../components/common/PublicLayout';

// Import zusätzliche Komponenten für Animationen
import GameCard from '../../components/public/GameCard';
import TestimonialSlider from '../../components/public/TestimonialSlider';
import StatsCounter from '../../components/public/StatsCounter';
import EventPreview from '../../components/public/EventPreview';
import CommunityCarousel from '../../components/public/CommunityCarousel';
import HeroSection from '../../components/public/HeroSection';
import FeaturesSection from '../../components/public/FeaturesSection';
import CommunityRulesSection from '../../components/public/CommunityRulesSection';
import FeaturedStreamer from '../../components/public/FeaturedStreamer';

const HomePage = () => {
  // State für Animationen
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    rules: false,
    games: false,
    stats: false,
    events: false,
    community: false,
    testimonials: false,
    streamers: false,
    cta: false
  });
  
  // Discord Auth URL
  const discordAuthUrl = 'http://localhost:5000/api/auth/discord';
  
  // Animationen beim Scrollen triggern
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      
      // Hero Section (sofort sichtbar)
      setIsVisible(prev => ({ ...prev, hero: true }));
      
      // Features Section
      const featuresSection = document.getElementById('features');
      if (featuresSection && scrollPosition > featuresSection.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, features: true }));
      }
      
      // Rules Section
      const rulesSection = document.getElementById('rules');
      if (rulesSection && scrollPosition > rulesSection.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, rules: true }));
      }
      
      // Games Section
      const gamesSection = document.getElementById('games');
      if (gamesSection && scrollPosition > gamesSection.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, games: true }));
      }
      
      // Stats Section
      const statsSection = document.getElementById('stats');
      if (statsSection && scrollPosition > statsSection.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, stats: true }));
      }
      
      // Events Section
      const eventsSection = document.getElementById('events');
      if (eventsSection && scrollPosition > eventsSection.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, events: true }));
      }
      
      // Community Section
      const communitySection = document.getElementById('community');
      if (communitySection && scrollPosition > communitySection.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, community: true }));
      }
      
      // Streamers Section
      const streamersSection = document.getElementById('streamers');
      if (streamersSection && scrollPosition > streamersSection.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, streamers: true }));
      }
      
      // Testimonials Section
      const testimonialsSection = document.getElementById('testimonials');
      if (testimonialsSection && scrollPosition > testimonialsSection.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, testimonials: true }));
      }
      
      // CTA Section
      const ctaSection = document.getElementById('cta');
      if (ctaSection && scrollPosition > ctaSection.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, cta: true }));
      }
    };
    
    // Initial check
    handleScroll();
    
    // Event Listener hinzufügen
    window.addEventListener('scroll', handleScroll);
    
    // Event Listener entfernen
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Beliebte Spiele in der Community
  const popularGames = [
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
  
  // Community Statistiken
  const stats = [
    { label: 'Community Mitglieder', value: 1283, suffix: '+' },
    { label: 'Aktive Spieler', value: 450, suffix: '+' },
    { label: 'Server & Kanäle', value: 56, suffix: '' },
    { label: 'Stunden gemeinsames Spielen', value: 15460, suffix: '+' }
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
  
  // Community Inhalte für Karussell
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
  
  // Testimonials
  const testimonials = [
    {
      id: 1,
      name: 'Max M.',
      avatar: 'https://via.placeholder.com/60',
      text: 'Bei SimpleGaming habe ich nicht nur tolle Mitspieler gefunden, sondern auch echte Freunde. Die Events sind immer ein Highlight!'
    },
    {
      id: 2,
      name: 'Sarah K.',
      avatar: 'https://via.placeholder.com/60',
      text: 'Als Gelegenheitsspielerin fühle ich mich hier total willkommen. Die Buddy-Funktion ist genial, um neue Leute kennenzulernen.'
    },
    {
      id: 3,
      name: 'Tim R.',
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
      {/* Hero Section mit erweiterten Animationen */}
      <HeroSection isVisible={isVisible.hero} />
      
      {/* Features Section mit 3D-Karten und Animationen */}
      <FeaturesSection id="features" isVisible={isVisible.features} />
      
      {/* Community Regeln Section */}
      <CommunityRulesSection id="rules" isVisible={isVisible.rules} />
      
      {/* Beliebte Spiele Section - mit Hover-Animationen und mehr Tiefe */}
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
              Spiele mit uns!
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
          
          <div className="mt-12 text-center">
            <button className="group inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 pulse-animation">
              <span>Alle Spiele entdecken</span>
              <svg className="ml-2 -mr-1 h-5 w-5 transform transition-transform group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Statistik-Section - mit verbesserten Animationen */}
      <div 
        id="stats" 
        className={`py-20 bg-gradient-to-r from-primary-700 to-primary-900 transition-all duration-1000 relative ${isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        {/* Wellige obere Kante */}
        <div className="absolute left-0 right-0 -mt-20 h-20 overflow-hidden">
          <svg className="absolute bottom-0 w-full h-20 fill-current text-light-bg-secondary dark:text-dark-bg-secondary transform rotate-180" viewBox="0 0 1440 320">
            <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,122.7C960,139,1056,149,1152,144C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Titel mit Glow */}
          <h2 className="text-3xl font-extrabold text-white text-center mb-12 neon-glow">SimpleGaming in Zahlen</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <StatsCounter 
                key={index} 
                stat={stat} 
                delay={index * 200} 
                isVisible={isVisible.stats} 
              />
            ))}
          </div>
        </div>
        
        {/* Wellige untere Kante */}
        <div className="absolute left-0 right-0 h-20 overflow-hidden" style={{marginTop: "5rem"}}>
          <svg className="absolute top-0 w-full h-20 fill-current text-light-bg-primary dark:text-dark-bg-primary" viewBox="0 0 1440 320">
            <path d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,90.7C672,85,768,107,864,122.7C960,139,1056,149,1152,144C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>
      
      {/* Events Section - mit Card-Flip Animation */}
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
          
          <div className="mt-12 text-center">
            <button className="group inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 pulse-animation">
              Alle Events ansehen
              <svg className="ml-2 -mr-1 h-5 w-5 transform transition-transform group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
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
            <p className="mt-4 max-w-2xl text-xl text-light-text-secondary dark:text-dark-text-secondary lg:mx-auto">
              Schau dir die Streams unserer Community-Mitglieder an und unterstütze lokale Talente!
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
          
          <div className="mt-12 text-center">
            <button className="group inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 pulse-animation">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"/>
              </svg>
              Alle Streamer entdecken
            </button>
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
            <p className="mt-4 max-w-2xl text-xl text-light-text-secondary dark:text-dark-text-secondary lg:mx-auto">
              Entdecke die neuesten Kreationen und Erfolge unserer Community-Mitglieder!
            </p>
          </div>
          
          {/* Community Carousel */}
          <CommunityCarousel 
            items={communityItems} 
            isVisible={isVisible.community}
          />
          
          <div className="mt-12 text-center">
            <button className="group inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transition transform hover:-translate-y-1 pulse-animation">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Mehr Community-Inhalte
            </button>
          </div>
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
      
      {/* Call to Action Section - mit Dynamischen Hintergrund-Effekten */}
      <div 
        id="cta" 
        className={`py-16 relative overflow-hidden transition-all duration-1000 ${isVisible.cta ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-800 z-0">
          {/* Animierte Kreise als Hintergrund */}
          <div className="absolute w-96 h-96 -top-20 -left-20 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute w-96 h-96 top-1/4 right-1/3 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute w-96 h-96 bottom-0 right-0 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl neon-glow">
              <span className="block">Bereit, beizutreten?</span>
              <span className="block text-primary-300">Werde noch heute Teil von SimpleGaming!</span>
            </h2>
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
          
          {/* Stick Figure Scene - Fun Gaming Session */}
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
                  <line x1="80" y1="52" x2="90" y2="65" stroke="#FFFFFF" strokeWidth="2" /> {/* Arm to controller */}
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
                  <line x1="220" y1="52" x2="210" y2="65" stroke="#FFFFFF" strokeWidth="2" /> {/* Arm to controller */}
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
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default HomePage;