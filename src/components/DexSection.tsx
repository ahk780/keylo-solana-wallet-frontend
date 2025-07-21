import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ExternalLink, Activity } from "lucide-react";

const dexIntegrations = [
  {
    name: "Raydium",
    description: "Trade on Solana's most popular AMM with deep liquidity",
    feature: "AMM Trading",
    status: "Active"
  },
  {
    name: "Jupiter",
    description: "Get the best prices across all Solana DEXs automatically",
    feature: "Best Price Routing",
    status: "Active"
  },
  {
    name: "Meteora",
    description: "Access dynamic liquidity pools and advanced trading features",
    feature: "Dynamic Pools",
    status: "Active"
  },
  {
    name: "Pump.fun",
    description: "Discover and trade the hottest new meme coins early",
    feature: "New Token Discovery",
    status: "Active"
  },
  {
    name: "LaunchLab",
    description: "Participate in token launches and IDO events",
    feature: "Token Launches",
    status: "Active"
  },
  {
    name: "Moonshot",
    description: "Community-driven trading with social features",
    feature: "Social Trading",
    status: "Active"
  }
];

export const DexSection = () => {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-foreground">Trade on All</span>
            <br />
            <span className="text-gradient-primary">Major Solana DEXs</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Access every major Solana exchange from one interface. From AMMs to meme coins to new launches - trade everywhere seamlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {dexIntegrations.map((dex, index) => (
            <Card 
              key={index} 
              className="glass-card hover-glow transition-smooth border-border/20 group cursor-pointer"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {dex.name}
                    </h3>
                    <Badge 
                      variant="outline" 
                      className="border-accent/30 text-accent bg-accent/10"
                    >
                      <Activity className="w-3 h-3 mr-1" />
                      {dex.status}
                    </Badge>
                  </div>
                  <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {dex.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-gradient-primary">
                      {dex.feature}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Integration Type
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
};