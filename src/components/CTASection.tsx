import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Code2, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-glow-pulse" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-foreground">Deploy Your Own</span>
            <br />
            <span className="text-gradient-primary">Keylo Instance</span>
          </h2>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Open source, production-ready Solana wallet backend. Host on localhost or deploy to the cloud. 
            Built for developers, traders, and institutions who need real security and performance.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover-glow group text-lg px-10 py-6 rounded-full"
              asChild
            >
              <a href="https://github.com/ahk780/keylo-solana-wallet" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 w-5 h-5" />
                View on GitHub
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-secondary text-secondary hover:bg-secondary/10 text-lg px-10 py-6 rounded-full hover-glow"
              asChild
            >
              <Link to="/login">
                <Shield className="mr-2 w-5 h-5" />
                Start Building
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-primary mb-2">MIT</div>
              <div className="text-sm text-muted-foreground">Open Source License</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-primary mb-2">TypeScript</div>
              <div className="text-sm text-muted-foreground">Full Type Safety</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-primary mb-2">Enterprise</div>
              <div className="text-sm text-muted-foreground">Production Ready</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
