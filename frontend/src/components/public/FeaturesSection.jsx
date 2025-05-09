import React from 'react';
import StickFigureAnimation from './StickFigureAnimation';

const FeaturesSection = ({ isVisible }) => {
  const features = [
    {
      id: 1,
      animationType: 'noToxicity',
      label: 'Keine toxische Umgebung',
      description: 'Unsere Community-Regeln sorgen für einen respektvollen Umgang miteinander, damit alle eine gute Zeit haben können.'
    },
    {
      id: 2,
      animationType: 'gaming',
      label: 'Gemeinsames Gaming-Erlebnis',
      description: 'Genieße das Spielen mit Gleichgesinnten und verbessere deine Skills in einer unterstützenden Umgebung.'
    },
    {
      id: 3,
      animationType: 'community',
      label: 'Starke Community',
      description: 'Werde Teil einer aktiven Gemeinschaft, knüpfe neue Freundschaften und tausche dich mit anderen Gamern aus.'
    },
    {
      id: 4,
      animationType: 'events',
      label: 'Regelmäßige Events',
      description: 'Nimm an spannenden Turnieren, Game Nights und Community-Treffen teil und gewinne tolle Preise.'
    }
  ];

  return (
    <div 
      id="features" 
      className={`py-16 bg-light-bg-primary dark:bg-dark-bg-primary transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
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
          <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-x-6">
            {features.map((feature, index) => (
              <div key={feature.id} className="group" style={{ transitionDelay: `${index * 150}ms` }}>
                <div className="relative perspective">
                  <div className="feature-card relative p-6 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl shadow-xl transform-gpu transition-all duration-500 group-hover:rotate-y-12 group-hover:scale-105 h-full">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    
                    <StickFigureAnimation 
                      animationType={feature.animationType}
                      label={feature.label}
                      description={feature.description}
                      isVisible={isVisible}
                    />
                    
                    <div className="mt-6 text-center">
                      <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-500 text-sm font-medium group-hover:underline">
                        Mehr erfahren →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;