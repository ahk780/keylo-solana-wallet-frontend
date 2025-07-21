import { Shield, Wallet, TrendingUp, Search, Zap, Code2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Shield,
    title: "Bank-Level Security & Token Analysis",
    description: "Military-grade encryption protects your private keys while detailed Token Overview dashboard provides comprehensive data to analyze any token before trading."
  },
  {
    icon: Wallet,
    title: "Complete Wallet & Trading System",
    description: "Full-featured Solana wallet with portfolio tracking, transaction history, asset management, and professional trading tools all in one place."
  },
  {
    icon: TrendingUp,
    title: "Smart Limit Orders & Multi-DEX Trading",
    description: "Set limit orders that execute automatically across Raydium, Jupiter, Meteora, PumpFun and more. Never miss a trade opportunity again."
  },
  {
    icon: Search,
    title: "Real-Time Token Intelligence",
    description: "Get instant insights on any Solana token - holder distribution, market cap, liquidity, and trending status updated every 30 minutes."
  },
  {
    icon: Zap,
    title: "Lightning Fast & Always Online",
    description: "Experience instant trades and real-time price updates with 99.9% uptime. Built for speed on Solana's high-performance blockchain."
  },
  {
    icon: Code2,
    title: "Open Source & Self-Hostable",
    description: "Fully open source on GitHub. Host your own instance on localhost or cloud. Complete control over your wallet backend and data."
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient-primary">Complete Solana</span>
            <br />
            <span className="text-foreground">Wallet & Trading Platform</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need for secure Solana trading - from basic wallet functions to advanced limit orders and rug protection.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="glass-card hover-glow transition-smooth border-border/20 group"
            >
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10 mr-4 group-hover:glow-primary transition-smooth">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};