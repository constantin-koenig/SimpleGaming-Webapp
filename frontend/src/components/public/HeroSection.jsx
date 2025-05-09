import React, { useState, useEffect, useRef } from 'react';

const HeroSection = ({ isVisible }) => {
  // Typer-Effekt für Hero-Sektion
  const [typedText, setTypedText] = useState('');
  const fullText = 'Gaming-Erlebnis';
  
  // Refs für Parallax-Effekt
  const parallaxRef = useRef(null);
  
  // Discord Auth URL
  const discordAuthUrl = 'http://localhost:5000/api/auth/discord';
  
  // Typer effect
  useEffect(() => {
    if (isVisible) {
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
  }, [isVisible]);
  
  // Parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const offset = window.pageYOffset;
        parallaxRef.current.style.transform = `translateY(${offset * 0.5}px)`;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div 
      className={`relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-900 to-primary-700 dark:from-primary-900 dark:to-primary-800 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Floating Gaming Icons - als zusätzliche Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <g fill="none" fillRule="evenodd">
              <g fill="#ffffff">
                <path d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/>
              </g>
            </g>
          </svg>
        </div>
        
        {/* Animated Particles */}
        <div className="gaming-particles"></div>
        
        {/* Floating Icons */}
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
      
      {/* Parallax Depth Effect */}
      <div ref={parallaxRef} className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-primary-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>
      
      {/* Animated Stick Figures in Background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {/* Jumping Stick Figure */}
        <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 scale-75">
          <svg viewBox="0 0 100 100" className="w-24 h-24 animate-bounce" style={{animationDuration: "3s"}}>
            <circle cx="50" cy="30" r="10" stroke="#FFF" strokeWidth="2" fill="none" />
            <line x1="50" y1="40" x2="50" y2="60" stroke="#FFF" strokeWidth="2" />
            <line x1="50" y1="60" x2="40" y2="80" stroke="#FFF" strokeWidth="2" />
            <line x1="50" y1="60" x2="60" y2="80" stroke="#FFF" strokeWidth="2" />
            <line x1="50" y1="45" x2="30" y2="55" stroke="#FFF" strokeWidth="2" />
            <line x1="50" y1="45" x2="70" y2="55" stroke="#FFF" strokeWidth="2" />
            <path d="M45,33 Q50,38 55,33" stroke="#FFF" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        
        {/* Gaming Stick Figure */}
        <div className="absolute bottom-1/4 right-1/3 transform -translate-x-1/2 scale-75">
          <svg viewBox="0 0 100 100" className="w-24 h-24">
            <circle cx="50" cy="30" r="10" stroke="#FFF" strokeWidth="2" fill="none" />
            <line x1="50" y1="40" x2="50" y2="60" stroke="#FFF" strokeWidth="2" />
            <line x1="50" y1="60" x2="40" y2="80" stroke="#FFF" strokeWidth="2" />
            <line x1="50" y1="60" x2="60" y2="80" stroke="#FFF" strokeWidth="2" />
            <line x1="50" y1="45" x2="35" y2="60" stroke="#FFF" strokeWidth="2" className="animate-pulse" />
            <line x1="50" y1="45" x2="65" y2="60" stroke="#FFF" strokeWidth="2" className="animate-pulse" />
            
            {/* Controller */}
            <rect x="35" y="60" width="30" height="10" rx="2" fill="#FFF" opacity="0.5" />
            
            {/* Happy Face */}
            <circle cx="45" cy="28" r="1" fill="#FFF" />
            <circle cx="55" cy="28" r="1" fill="#FFF" />
            <path d="M45,33 Q50,38 55,33" stroke="#FFF" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
        
        {/* Celebrating Stick Figure */}
        <div className="absolute top-2/3 left-2/3 transform -translate-x-1/2 scale-75">
          <svg viewBox="0 0 100 100" className="w-24 h-24">
            <circle cx="50" cy="30" r="10" stroke="#FFF" strokeWidth="2" fill="none" />
            <line x1="50" y1="40" x2="50" y2="60" stroke="#FFF" strokeWidth="2" />
            <line x1="50" y1="60" x2="40" y2="80" stroke="#FFF" strokeWidth="2" />
            <line x1="50" y1="60" x2="60" y2="80" stroke="#FFF" strokeWidth="2" />
            <line x1="50" y1="45" x2="30" y2="40" stroke="#FFF" strokeWidth="2" className="origin-top-left animate-pulse" />
            <line x1="50" y1="45" x2="70" y2="40" stroke="#FFF" strokeWidth="2" className="origin-top-right animate-pulse" />
            
            {/* Happy Face */}
            <circle cx="45" cy="28" r="1" fill="#FFF" />
            <circle cx="55" cy="28" r="1" fill="#FFF" />
            <path d="M45,33 Q50,38 55,33" stroke="#FFF" strokeWidth="1.5" fill="none" />
            
            {/* Stars */}
            <path d="M25,20 L27,25 L32,27 L27,29 L25,34 L23,29 L18,27 L23,25 Z" fill="#FFF" opacity="0.3" className="animate-ping" />
            <path d="M75,30 L77,35 L82,37 L77,39 L75,44 L73,39 L68,37 L73,35 Z" fill="#FFF" opacity="0.3" className="animate-ping" />
          </svg>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center py-20">
        <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
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
              <a
                href="#about"
                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 shadow-lg hover:shadow-xl transform transition hover:-translate-y-1 hover:scale-105"
              >
                <span className="mr-2">Mehr erfahren</span>
                <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        {/* Stick Figure Scene - Fun Gaming Session */}
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-72 h-32">
          <svg viewBox="0 0 300 100" className="w-full h-full opacity-40">
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
            <rect x="125" y="50" width="50" height="30" rx="2" fill="#FFFFFF" opacity="0.2" />
            
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
        
        {/* Scroll-Down Indicator with Pulsing */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce bg-white dark:bg-gray-800 p-2 w-10 h-10 ring-1 ring-slate-900/5 dark:ring-slate-200/20 shadow-lg rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;