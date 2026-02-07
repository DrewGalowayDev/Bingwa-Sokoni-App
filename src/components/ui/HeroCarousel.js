import React, { useState, useEffect } from 'react';
import './HeroCarousel.css';

/**
 * HeroCarousel Component
 * Auto-transitioning background images with smooth fade effect
 * Transitions every 2 seconds
 */

const carouselImages = [
  {
    url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&auto=format&fit=crop&q=80',
    alt: 'Mobile payments and digital transactions'
  },
  {
    url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&auto=format&fit=crop&q=80',
    alt: 'Smartphone with connectivity'
  },
  {
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
    alt: 'Data and analytics visualization'
  }
];

export const HeroCarousel = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
        setIsTransitioning(false);
      }, 500);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-carousel">
      {/* Background Images */}
      {carouselImages.map((image, index) => (
        <div
          key={index}
          className={`hero-carousel__slide ${
            index === currentIndex ? 'hero-carousel__slide--active' : ''
          } ${isTransitioning && index === currentIndex ? 'hero-carousel__slide--fading' : ''}`}
          style={{ backgroundImage: `url(${image.url})` }}
          aria-hidden={index !== currentIndex}
        />
      ))}

      {/* Overlay Gradient */}
      <div className="hero-carousel__overlay" />

      {/* Content */}
      <div className="hero-carousel__content">
        {children}
      </div>

      {/* Indicators */}
      <div className="hero-carousel__indicators">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            className={`hero-carousel__indicator ${
              index === currentIndex ? 'hero-carousel__indicator--active' : ''
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroCarousel;
