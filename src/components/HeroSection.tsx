import { Instagram, Facebook } from "lucide-react";
import logo from "@/assets/logo.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero leaf-pattern overflow-hidden flex items-center justify-center">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-10">
        <svg viewBox="0 0 200 200" className="w-full h-full text-primary">
          <path
            fill="currentColor"
            d="M150 50c-20 30-50 50-80 50 30 10 60 30 80 60-10-30-10-70 0-110z"
          />
          <path
            fill="currentColor"
            d="M170 30c-15 25-40 45-65 45 25 8 50 25 65 50-8-25-8-60 0-95z"
            opacity="0.5"
          />
        </svg>
      </div>
      
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-10 transform rotate-180">
        <svg viewBox="0 0 200 200" className="w-full h-full text-primary">
          <path
            fill="currentColor"
            d="M150 50c-20 30-50 50-80 50 30 10 60 30 80 60-10-30-10-70 0-110z"
          />
        </svg>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-accent/20 rounded-full animate-float"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        {/* Social Icons */}
        <div className="absolute top-6 right-6 flex gap-3 opacity-0 animate-fade-in animation-delay-500">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
          >
            <Instagram className="w-5 h-5" />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover:scale-110"
          >
            <Facebook className="w-5 h-5" />
          </a>
        </div>

        {/* Logo */}
        <div className="text-center mb-8 opacity-0 animate-fade-in-up">
          <div className="relative inline-block">
            <img 
              src={logo} 
              alt="AS Salon Logo" 
              className="h-32 md:h-44 w-auto mx-auto drop-shadow-lg"
              style={{ filter: 'sepia(40%) saturate(80%) hue-rotate(-10deg) brightness(0.3)' }}
            />
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />
          </div>
          <h2 className="font-display text-2xl md:text-3xl text-foreground tracking-[0.3em] uppercase mt-6">
            Unisex Salon
          </h2>
        </div>

        {/* Tagline */}
        <p className="text-center text-muted-foreground text-lg md:text-xl max-w-md mb-4 opacity-0 animate-fade-in-up animation-delay-200 font-light italic">
          Where Beauty Meets Elegance
        </p>

        {/* Owner Name */}
        <div className="opacity-0 animate-fade-in-up animation-delay-300 text-center mb-10">
          <div className="inline-flex items-center gap-3">
            <div className="w-8 h-px bg-accent/50" />
            <p className="font-display text-lg text-foreground">
              By Mrs. Seema Akshay Sapre
            </p>
            <div className="w-8 h-px bg-accent/50" />
          </div>
        </div>

        {/* CTA Button */}
        <a
          href="#services"
          className="group relative overflow-hidden bg-primary text-primary-foreground px-12 py-4 rounded-full font-medium text-lg shadow-elevated hover:shadow-card transition-all duration-300 opacity-0 animate-fade-in-up animation-delay-400 hover:scale-105"
        >
          <span className="relative z-10 flex items-center gap-2">
            Explore Our Services
            <svg
              className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-salon-maroon to-salon-brown transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
        </a>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float opacity-0 animate-fade-in animation-delay-600">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-primary rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
