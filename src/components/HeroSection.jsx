import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Box } from 'lucide-react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero">
      <div className="hero-background">
        <div className="glow glow-1"></div>
        <div className="glow glow-2"></div>
      </div>
      
      <div className="container hero-content">
        <div className="hero-text-content animate-fade-in">
          <span className="hero-badge">Premium Quality 3D Prints</span>
          <h1 className="hero-title">
            Bring Your Favorite <span>Anime Characters</span> to Life
          </h1>
          <p className="hero-description">
            Discover our collection of high-detail 3D printed anime figures, or upload your own custom STL files for premium printing services with various filament options.
          </p>
          
          <div className="hero-actions">
            <Link to="/shop" className="btn-primary btn-large">
              Shop Figures <ArrowRight size={20} />
            </Link>
            <Link to="/custom-print" className="btn-secondary btn-large">
              <Box size={20} /> Custom Print
            </Link>
          </div>
        </div>
        
        <div className="hero-visual animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="hero-image-wrapper">
             {/* Using a generic high-quality placeholder image for now, later we can use actual images from the public folder */}
            <img 
              src="/Images/12. Goku/Goku/Photo/Photo/2.png" 
              alt="Premium Anime 3D Print" 
              className="hero-image"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1608889175123-8ee362201f81?q=80&w=800&auto=format&fit=crop";
              }}
            />
            <div className="floating-card card-1">
               <span className="card-dot"></span> High Detail
            </div>
            <div className="floating-card card-2">
               <span className="card-dot blue"></span> Custom Colors
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
