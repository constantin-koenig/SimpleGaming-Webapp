// frontend/src/components/common/PublicLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const PublicLayout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Header beim Scrollen verkleinern
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Mobile Menü schließen bei Routenwechsel
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary">
      {/* Header mit Theme-Toggle und Animation beim Scrollen */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur ${
          isScrolled 
            ? 'py-2 bg-light-bg-secondary/95 dark:bg-dark-bg-secondary/95 shadow-md' 
            : 'py-4 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            {/* Logo mit Animation */}
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <div className="relative w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg transform transition-transform duration-300 group-hover:rotate-6">
                {/* Gaming-Controller Icon */}
                <svg 
                  className="absolute inset-0 w-full h-full text-white p-2 transform transition-transform duration-300 group-hover:scale-110" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                </svg>
              </div>
            </div>
            <span className={`font-bold text-xl transition-colors ${
              isScrolled 
                ? 'text-light-text-primary dark:text-dark-text-primary' 
                : 'text-white'
            }`}>
              Simple<span className="text-primary-500 dark:text-primary-400">Gaming</span>
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <nav className="flex items-center space-x-6">
              <Link 
                to="/" 
                className={`transition-colors animated-underline ${
                  isScrolled 
                    ? 'text-light-text-primary dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-primary-400' 
                    : 'text-white hover:text-primary-300'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className={`transition-colors animated-underline ${
                  isScrolled 
                    ? 'text-light-text-primary dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-primary-400' 
                    : 'text-white hover:text-primary-300'
                }`}
              >
                Über uns
              </Link>
              <a 
                href="#events" 
                className={`transition-colors animated-underline ${
                  isScrolled 
                    ? 'text-light-text-primary dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-primary-400' 
                    : 'text-white hover:text-primary-300'
                }`}
              >
                Events
              </a>
              <a 
                href="#games" 
                className={`transition-colors animated-underline ${
                  isScrolled 
                    ? 'text-light-text-primary dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-primary-400' 
                    : 'text-white hover:text-primary-300'
                }`}
              >
                Spiele
              </a>
              <a 
                href="#community" 
                className={`transition-colors animated-underline ${
                  isScrolled 
                    ? 'text-light-text-primary dark:text-dark-text-primary hover:text-primary-600 dark:hover:text-primary-400' 
                    : 'text-white hover:text-primary-300'
                }`}
              >
                Community
              </a>
            </nav>
            
            <ThemeToggle />
            
            <a
              href="http://localhost:5000/api/auth/discord"
              className={`group inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                isScrolled 
                  ? 'text-white bg-primary-600 hover:bg-primary-700' 
                  : 'text-primary-700 bg-white hover:bg-gray-50'
              } transition-colors transform hover:-translate-y-0.5 hover:shadow-md`}
            >
              <svg className="w-5 h-5 mr-2 transform transition-transform group-hover:rotate-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0c-.164-.386-.398-.875-.608-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
              </svg>
              Anmelden
            </a>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            
            <button 
              className={`p-2 rounded-md ${
                isScrolled
                  ? 'text-light-text-primary dark:text-dark-text-primary'
                  : 'text-white'
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div 
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen 
              ? 'max-h-96 opacity-100 visible' 
              : 'max-h-0 opacity-0 invisible'
          } overflow-hidden bg-light-bg-secondary dark:bg-dark-bg-secondary shadow-lg`}
        >
          <div className="px-4 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary hover:text-primary-600 dark:hover:text-primary-400"
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary hover:text-primary-600 dark:hover:text-primary-400"
            >
              Über uns
            </Link>
            <a 
              href="#events" 
              className="block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary hover:text-primary-600 dark:hover:text-primary-400"
            >
              Events
            </a>
            <a 
              href="#games" 
              className="block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary hover:text-primary-600 dark:hover:text-primary-400"
            >
              Spiele
            </a>
            <a 
              href="#community" 
              className="block px-3 py-2 rounded-md text-base font-medium transition-colors hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary hover:text-primary-600 dark:hover:text-primary-400"
            >
              Community
            </a>
            <div className="pt-4 pb-2 border-t border-light-border-primary dark:border-dark-border-primary">
              <a
                href="http://localhost:5000/api/auth/discord"
                className="flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0c-.164-.386-.398-.875-.608-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"></path>
                </svg>
                Mit Discord anmelden
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hauptinhalt mit Abstand für den Header */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer mit Wellenmuster */}
      <footer className="bg-light-bg-tertiary dark:bg-dark-bg-tertiary relative">
        {/* Wave-Form */}
        <div className="absolute top-0 w-full">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="fill-current text-light-bg-primary dark:text-dark-bg-primary">
            <path d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo und Beschreibung */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4 group">
                <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg transform transition-transform duration-300 group-hover:rotate-6">
                    <svg 
                      className="absolute inset-0 w-full h-full text-white p-2 transform transition-transform duration-300 group-hover:scale-110" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                  </div>
                </div>
                <span className="font-bold text-xl text-light-text-primary dark:text-dark-text-primary">
                  Simple<span className="text-primary-500">Gaming</span>
                </span>
              </div>
              <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                Die ultimative Gaming-Community für Spieler aller Erfahrungsstufen. Finde neue Freunde, nimm an Events teil und verbessere deine Gaming-Skills.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-600 dark:hover:text-primary-400 transform transition-transform hover:scale-110">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </a>
                <a href="#" className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-600 dark:hover:text-primary-400 transform transition-transform hover:scale-110">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                  </svg>
                </a>
                <a href="#" className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-600 dark:hover:text-primary-400 transform transition-transform hover:scale-110">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                  </svg>
                </a>
                <a href="#" className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-600 dark:hover:text-primary-400 transform transition-transform hover:scale-110">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Schnelllinks */}
            <div>
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 animated-underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 animated-underline">
                    Über uns
                  </Link>
                </li>
                <li>
                  <a href="#games" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 animated-underline">
                    Spiele
                  </a>
                </li>
                <li>
                  <a href="#events" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 animated-underline">
                    Events
                  </a>
                </li>
                <li>
                  <a href="#community" className="text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 animated-underline">
                    Community
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Kontakt */}
            <div>
              <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-4">Kontakt</h3>
              <ul className="space-y-3">
                <li className="flex items-start group">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 mr-2 transform transition-transform group-hover:scale-110 group-hover:rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    contact@simplegaming.de
                  </span>
                </li>
                <li className="flex items-start group">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 mr-2 transform transition-transform group-hover:scale-110 group-hover:rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    Discord: SimpleGaming#1234
                  </span>
                </li>
                <li className="flex items-start group">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mt-0.5 mr-2 transform transition-transform group-hover:scale-110 group-hover:rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-light-text-secondary dark:text-dark-text-secondary group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    Support: Mo-Fr, 10-18 Uhr
                  </span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Copyright und Links */}
          <div className="mt-12 pt-8 border-t border-light-border-primary dark:border-dark-border-primary flex flex-col md:flex-row md:justify-between md:items-center">
            <p className="text-light-text-tertiary dark:text-dark-text-tertiary text-sm">
              &copy; {new Date().getFullYear()} SimpleGaming. Alle Rechte vorbehalten.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-4">
              <Link to="/privacy" className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-600 dark:hover:text-primary-400 text-sm animated-underline">
                Datenschutz
              </Link>
              <Link to="/terms" className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-600 dark:hover:text-primary-400 text-sm animated-underline">
                Nutzungsbedingungen
              </Link>
              <Link to="/imprint" className="text-light-text-tertiary dark:text-dark-text-tertiary hover:text-primary-600 dark:hover:text-primary-400 text-sm animated-underline">
                Impressum
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;