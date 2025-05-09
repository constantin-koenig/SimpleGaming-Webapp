// frontend/src/components/public/TestimonialSlider.jsx
import React, { useState, useEffect } from 'react';

const TestimonialSlider = ({ testimonials, isVisible }) => {
  const [current, setCurrent] = useState(0);
  
  // Auto-Rotation der Testimonials
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [testimonials, isVisible]);
  
  const nextTestimonial = () => {
    setCurrent(prev => (prev + 1) % testimonials.length);
  };
  
  const prevTestimonial = () => {
    setCurrent(prev => (prev - 1 + testimonials.length) % testimonials.length);
  };
  
  return (
    <div 
      className={`relative max-w-4xl mx-auto transition-all duration-1000 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      }`}
    >
      <div className="relative overflow-hidden rounded-lg shadow-lg bg-light-bg-secondary dark:bg-dark-bg-secondary p-8">
        {/* "Anführungszeichen" Hintergrund */}
        <div className="absolute top-4 left-4 text-gray-200 dark:text-gray-800 opacity-10 text-9xl">
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 14.725c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275zm-13 0c0-5.141 3.892-10.519 10-11.725l.984 2.126c-2.215.835-4.163 3.742-4.38 5.746 2.491.392 4.396 2.547 4.396 5.149 0 3.182-2.584 4.979-5.199 4.979-3.015 0-5.801-2.305-5.801-6.275z"/>
          </svg>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-6">
            <img 
              className="h-12 w-12 rounded-full object-cover border-2 border-primary-500"
              src={testimonials[current].avatar}
              alt={testimonials[current].name}
            />
            <div className="ml-4">
              <h3 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                {testimonials[current].name}
              </h3>
              <div className="flex text-primary-500">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </div>
            </div>
          </div>
          
          <p className="text-lg italic text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
            {testimonials[current].text}
          </p>
        </div>
      </div>
      
      {/* Navigation Dots */}
      <div className="flex justify-center mt-6 space-x-2">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              current === index 
                ? 'bg-primary-600 w-6' 
                : 'bg-light-text-tertiary dark:bg-dark-text-tertiary hover:bg-primary-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Previous/Next Buttons */}
      <button 
        onClick={prevTestimonial}
        className="absolute top-1/2 left-0 -ml-4 -translate-y-1/2 bg-light-bg-primary dark:bg-dark-bg-primary rounded-full p-2 shadow-lg hover:shadow-xl transition transform hover:scale-105 focus:outline-none"
        aria-label="Previous testimonial"
      >
        <svg className="h-6 w-6 text-light-text-primary dark:text-dark-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      <button 
        onClick={nextTestimonial}
        className="absolute top-1/2 right-0 -mr-4 -translate-y-1/2 bg-light-bg-primary dark:bg-dark-bg-primary rounded-full p-2 shadow-lg hover:shadow-xl transition transform hover:scale-105 focus:outline-none"
        aria-label="Next testimonial"
      >
        <svg className="h-6 w-6 text-light-text-primary dark:text-dark-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};

export default TestimonialSlider;