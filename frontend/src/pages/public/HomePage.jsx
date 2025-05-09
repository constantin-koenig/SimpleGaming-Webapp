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

const HomePage = () => {
  // State für Animationen
  const [isVisible, setIsVisible] = useState({
    hero: false,
    features: false,
    games: false,
    stats: false,
    events: false,
    community: false,
    testimonials: false,
    cta: false
  });
  
  // Refs für Parallax-Effekt
  const parallaxRef = useRef(null);
  
  // Discord Auth URL
  const discordAuthUrl = 'http://localhost:5000/api/auth/discord';
  
  // Animationen beim Scrollen triggern
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight;
      
      // Hero Section (sofort sichtbar)
      setIsVisible(prev => ({ ...prev, hero: true }));
      
      // Parallax-Effekt
      if (parallaxRef.current) {
        const offset = window.pageYOffset;
        parallaxRef.current.style.transform = `translateY(${offset * 0.5}px)`;
      }
      
      // Features Section
      const featuresSection = document.getElementById('features');
      if (featuresSection && scrollPosition > featuresSection.offsetTop + 100) {
        setIsVisible(prev => ({ ...prev, features: true }));
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
  
  // Typer-Effekt für Hero-Sektion
  const [typedText, setTypedText] = useState('');
  const fullText = 'Gaming-Erlebnis';
  
  useEffect(() => {
    if (isVisible.hero) {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < fullText.length) {
          setTypedText(fullText.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, 100);
      
      return () => clearInterval(typingInterval);
    }
  }, [isVisible.hero]);
  
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
  
  // Animation für schwebende Elemente
  const floatingAnimation = {
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  };
  
  return (
    <PublicLayout>
      {/* Hero Section mit erweiterten Animationen */}
      <div 
        className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-900 to-primary-700 dark:from-primary-900 dark:to-primary-800 transition-opacity duration-1000 ${isVisible.hero ? 'opacity-100' : 'opacity-0'}`}
      >
        {/* Floating Gaming Icons - als zusätzliche Animation */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/assets/gaming-pattern.svg')] opacity-10"></div>
          
          {/* Animierte Partikel */}
          <div className="gaming-particles"></div>
          
          {/* Schwebende Icons */}
          <div className="absolute top-1/4 left-1/4 w-16 h-16 text-primary-300 opacity-20 float-animation" style={{animationDelay: "0s"}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.5 6.027a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm2.5-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zm-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm-6.5-3h1v1h1v1h-1v1h-1v-1H3v-1h1v-1z"/>
              <path d="M13.991 3H2c-.325 0-.502.078-.602.145a.758.758 0 0 0-.254.302A1.46 1.46 0 0 0 1 4.01V10c0 .325.078.502.145.602.07.105.17.188.302.254a1.464 1.464 0 0 0 .538.143L2.01 11H14c.325 0 .502-.078.602-.145a.758.758 0 0 0 .254-.302 1.464 1.464 0 0 0 .143-.538L15 9.99V4c0-.325-.078-.502-.145-.602a.757.757 0 0 0-.302-.254A1.46 1.46 0 0 0 13.99 3zM14 2H2C0 2 0 4 0 4v6c0 2 2 2 2 2h12c2 0 2-2 2-2V4c0-2-2-2-2-2z"/>
            </svg>
          </div>
          
          <div className="absolute top-1/3 right-1/4 w-12 h-12 text-primary-300 opacity-20 float-animation" style={{animationDelay: "0.5s"}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
              <path d="M4 2v2H2V2h2zm1 12v-2a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1zm0-5V7a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1zm5 5v-2a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1zm0-5V7a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1zm5 5v-2a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1zm0-5V7a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1zM5 2h6v2H5V2zm4 0h2v2H9V2zM8 2h1v2H8V2z"/>
            </svg>
          </div>
          
          <div className="absolute bottom-1/3 left-1/5 w-20 h-20 text-primary-300 opacity-20 float-animation" style={{animationDelay: "1s"}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.5 3a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1h5zm0 3a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1h5zm.5 3.5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h5a.5.5 0 0 0 .5-.5zm-.5 2.5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1h5z"/>
              <path d="M16 2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2zM4 1v14H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h2zm1 0h9a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5V1z"/>
            </svg>
          </div>
          
          <div className="absolute bottom-1/4 right-1/5 w-16 h-16 text-primary-300 opacity-20 float-animation" style={{animationDelay: "1.5s"}}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z"/>
            </svg>
          </div>
        </div>
        
        {/* Parallax Tiefen-Effekt */}
        <div ref={parallaxRef} className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-primary-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center py-20">
          <div className={`transform transition-all duration-1000 delay-300 ${isVisible.hero ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 tracking-tight">
              <span className="block">Level up dein</span>
              <span className="block mt-2 text-primary-300 dark:text-primary-300">
                <span className="typewriter inline-block">{typedText}</span>
                <span className="animate-pulse">|</span>
              </span>
            </h1>
            
            <p className="mt-6 max-w-lg mx-auto text-xl text-white text-opacity-80 sm:max-w-3xl">
              Tritt der SimpleGaming Community bei, finde neue Freunde und erlebe unvergessliche Spielmomente zusammen!
            </p>
            
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
              <div className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5">
                <a
                  href={discordAuthUrl}
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 hover:scale-105 pulse-animation"
                >
                  <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0c-.164-.386-.398-.875-.608-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                  </svg>
                  Discord beitreten
                </a>
                <Link
                  to="/about"
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 hover:scale-105"
                >
                  <span className="mr-2">Mehr erfahren</span>
                  <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Scroll-Down Indikator mit Pulsieren */}
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
            <div className="animate-bounce bg-white dark:bg-gray-800 p-2 w-10 h-10 ring-1 ring-slate-900/5 dark:ring-slate-200/20 shadow-lg rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section mit verbesserten Animationen und 3D-Effekten */}
      <div 
        id="features" 
        className={`py-16 bg-light-bg-primary dark:bg-dark-bg-primary transition-all duration-1000 ${isVisible.features ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase gradient-text">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-light-text-primary dark:text-dark-text-primary sm:text-4xl">
              Was SimpleGaming bietet
            </p>
            <p className="mt-4 max-w-2xl text-xl text-light-text-secondary dark:text-dark-text-secondary lg:mx-auto">
              Unsere Plattform vereint alles, was Gamer brauchen
            </p>
          </div>

          <div className="mt-16">
            <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
              {/* Feature 1 - mit 3D Rotationseffekt */}
              <div className="group">
                <div className="relative perspective">
                  <div className="feature-card relative p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl shadow-xl transform-gpu transition-all duration-500 group-hover:rotate-y-12 group-hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    <div className="flex items-center justify-center h-16 w-16 rounded-md bg-primary-500 text-white mb-4 mx-auto group-hover:bg-primary-600 transition-colors">
                      <svg className="h-8 w-8 transform transition-transform group-hover:scale-110 group-hover:rotate-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-center text-2xl font-bold text-light-text-primary dark:text-dark-text-primary neon-glow">Gaming-Partner finden</h3>
                    <p className="mt-4 text-center text-light-text-secondary dark:text-dark-text-secondary">
                      Mit unserem Buddy-Finder-System findest du schnell neue Mitspieler für deine Lieblingsspiele, die zu deinem Spielstil passen.
                    </p>
                    <div className="mt-6 text-center">
                      <Link to="/about" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 text-sm font-medium group-hover:underline">
                        Mehr erfahren →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature 3 - mit Glow-Effekt */}
              <div className="group">
                <div className="relative perspective">
                  <div className="feature-card relative p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl shadow-xl transform-gpu transition-all duration-500 group-hover:rotate-y-12 group-hover:scale-105">
                    {/* Glow-Effekt im Dunkelmodus */}
                    <div className="absolute inset-0 bg-primary-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity dark:group-hover:opacity-20 dark:group-hover:blur-xl"></div>
                    
                    <div className="flex items-center justify-center h-16 w-16 rounded-md bg-primary-500 text-white mb-4 mx-auto group-hover:bg-primary-600 transition-colors">
                      <svg className="h-8 w-8 transform transition-transform group-hover:scale-110 group-hover:rotate-12" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-center text-2xl font-bold text-light-text-primary dark:text-dark-text-primary neon-glow">Eigene Gameserver</h3>
                    <p className="mt-4 text-center text-light-text-secondary dark:text-dark-text-secondary">
                      Spiele auf unseren optimierten Gameservern mit stabiler Performance und individuellen Einstellungen für das beste Spielerlebnis.
                    </p>
                    <div className="mt-6 text-center">
                      <Link to="/about" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 text-sm font-medium group-hover:underline">
                        Mehr erfahren →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
        className={`py-20 bg-gradient-to-r from-primary-700 to-primary-900 transition-all duration-1000 ${isVisible.stats ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
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
      
      {/* Community Carousel Section - NEU! */}
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
        </div>
      </div>
    </PublicLayout>
  );
};

export default HomePage;