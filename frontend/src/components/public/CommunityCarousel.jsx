// frontend/src/components/public/CommunityCarousel.jsx
import React, { useState, useEffect, useRef } from 'react';

const CommunityCarousel = ({ items, isVisible }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const carouselRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Autoplay Funktion
  useEffect(() => {
    if (!isVisible || !autoplay) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isVisible, activeIndex, autoplay, items.length]);

  // Slide-Berechnung
  useEffect(() => {
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.offsetWidth;
      setTranslateX(-activeIndex * slideWidth);
    }
  }, [activeIndex]);

  // Window-Resize-Handler
  useEffect(() => {
    const handleResize = () => {
      if (carouselRef.current) {
        const slideWidth = carouselRef.current.offsetWidth;
        setTranslateX(-activeIndex * slideWidth);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeIndex]);

  // Touch-Handler für Swipe-Funktionalität
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    setAutoplay(false);
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 70) {
      // Swipe nach links
      nextSlide();
    } else if (touchEndX.current - touchStartX.current > 70) {
      // Swipe nach rechts
      prevSlide();
    }
    setAutoplay(true);
  };

  // Slide-Navigation
  const nextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  };

  const prevSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  // Badge-Farbe basierend auf Item-Typ
  const getBadgeColor = (type) => {
    switch(type) {
      case 'Screenshot':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
      case 'Event':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
      case 'News':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100';
      default:
        return 'bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100';
    }
  };

  return (
    <div 
      className={`relative overflow-hidden transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      {/* Hauptkarussel */}
      <div 
        ref={carouselRef}
        className="relative overflow-hidden rounded-xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${translateX}px)` }}
        >
          {items.map((item, index) => (
            <div 
              key={item.id} 
              className="w-full flex-shrink-0"
            >
              <div className="relative group">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-64 md:h-96 object-cover rounded-xl transform transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 rounded-xl"></div>
                
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(item.type)}`}>
                    {item.type}
                  </span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-300 group-hover:translate-y-0">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-shadow">{item.title}</h3>
                  <p className="text-gray-200 text-sm md:text-base">{item.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pfeile für Navigation */}
        <button 
          onClick={prevSlide}
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition transform hover:scale-105 focus:outline-none group"
          aria-label="Vorheriges Element"
        >
          <svg className="h-6 w-6 text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={nextSlide}
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg hover:shadow-xl transition transform hover:scale-105 focus:outline-none group"
          aria-label="Nächstes Element"
        >
          <svg className="h-6 w-6 text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Indikator-Punkte */}
      <div className="flex justify-center mt-4 space-x-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 transition-all ${
              activeIndex === index 
                ? 'w-8 bg-primary-600 dark:bg-primary-500' 
                : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-primary-400 dark:hover:bg-primary-700'
            } rounded-full`}
            aria-label={`Gehe zu Slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Miniatur-Vorschau */}
      <div className="hidden md:flex justify-center mt-6 space-x-3 overflow-x-auto">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => goToSlide(index)}
            className={`relative rounded-lg overflow-hidden transition-all duration-300 ${
              activeIndex === index 
                ? 'ring-4 ring-primary-500 transform scale-105' 
                : 'ring-2 ring-transparent filter grayscale hover:grayscale-0 hover:ring-2 hover:ring-primary-300'
            }`}
            style={{ width: '100px', height: '70px' }}
          >
            <img 
              src={item.image} 
              alt={`Miniatur von ${item.title}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Autoplay-Steuerung */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setAutoplay(!autoplay)}
          className="flex items-center justify-center px-3 py-1 text-xs font-medium rounded-md bg-light-bg-tertiary dark:bg-dark-bg-tertiary hover:bg-light-bg-secondary dark:hover:bg-dark-bg-secondary transition-colors"
        >
          {autoplay ? (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Autoplay pausieren
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Autoplay starten
            </>
          )}
        </button>
      </div>
      
      {/* Information zum Karussell */}
      <div className="mt-6 bg-light-bg-tertiary dark:bg-dark-bg-tertiary p-4 rounded-xl">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">Community-Content einsenden</h3>
            <div className="mt-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
              <p>
                Hast du coole Screenshots, Builds oder andere Inhalte, die du mit der Community teilen möchtest? Sende sie uns über den Discord-Server und du könntest hier gefeatured werden!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityCarousel;