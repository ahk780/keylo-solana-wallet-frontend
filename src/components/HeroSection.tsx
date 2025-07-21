import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-trading.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Futuristic trading dashboard"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/95" />
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 z-10">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 z-20 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 animate-fade-in">
            <span className="text-gradient-primary">Keylo</span>
            <br />
            <span className="text-foreground">Professional Solana Wallet</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto animate-fade-in px-2">
            Enterprise-grade Solana wallet backend with institutional-level security and consumer-friendly features. 
            Built for serious crypto users who need reliability, security, and comprehensive portfolio management.
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mb-6 sm:mb-10 animate-slide-in-right px-2">
            <div className="flex items-center gap-2 glass-card px-3 sm:px-4 py-2 rounded-full">
              <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-accent" />
              <span className="text-xs sm:text-sm font-medium">AES-256 Encryption</span>
            </div>
            <div className="flex items-center gap-2 glass-card px-3 sm:px-4 py-2 rounded-full">
              <TrendingUp className="w-4 sm:w-5 h-4 sm:h-5 text-secondary" />
              <span className="text-xs sm:text-sm font-medium">Real-time Analytics</span>
            </div>
            <div className="flex items-center gap-2 glass-card px-3 sm:px-4 py-2 rounded-full">
              <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-primary" />
              <span className="text-xs sm:text-sm font-medium">Open Source</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in px-4">
            <Button 
              size="default" 
              className="flex-1 sm:flex-none bg-primary text-primary-foreground hover-glow group text-sm sm:text-lg px-4 sm:px-8 py-3 sm:py-6 rounded-full max-w-[140px] sm:max-w-none"
              asChild
            >
              <Link to="/login">
                Login
                <ArrowRight className="ml-1 sm:ml-2 w-4 sm:w-5 h-4 sm:h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="default"
              className="flex-1 sm:flex-none border-border hover:bg-card/50 text-sm sm:text-lg px-4 sm:px-8 py-3 sm:py-6 rounded-full hover-glow max-w-[140px] sm:max-w-none"
              asChild
            >
              <Link to="/register">Register</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 mt-12 sm:mt-16 animate-fade-in px-2">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gradient-primary">99.9%</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gradient-primary">Live</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Price Updates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gradient-primary">Bank-Level</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Security</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-gradient-primary">Open</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Source</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};