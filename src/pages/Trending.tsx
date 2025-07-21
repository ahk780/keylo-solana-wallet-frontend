import { useState, useEffect } from "react";
import { Copy, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, ExternalLink, ArrowLeft, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendingToken {
  mint: string;
  name: string;
  symbol: string;
  logo: string;
  buy_volume_usd: number;
  latest_price: number;
  net_inflow_usd: number;
  sell_volume_usd: number;
}

interface TrendingResponse {
  success: boolean;
  message: string;
  data: TrendingToken[];
}

const Trending = () => {
  const [tokens, setTokens] = useState<TrendingToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHour, setSelectedHour] = useState(24);
  const { user, token, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (token && user) {
      fetchTrendingTokens(selectedHour);
    }
  }, [selectedHour, token, user]);

  const fetchTrendingTokens = async (hour: number = selectedHour) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/trending?hour=${hour}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data: TrendingResponse = await response.json();
      
      if (data.success) {
        setTokens(data.data);
      } else {
        setError("Failed to fetch trending tokens");
      }
    } catch (error) {
      setError("An error occurred while fetching data");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Mint address copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleBuyToken = (token: TrendingToken) => {
    const params = new URLSearchParams({
      mint: token.mint,
      jitoTip: "0.0005",
      slippage: "10",
      dex: "jupiter",
      type: "buy"
    });
    
    navigate(`/trading?${params.toString()}`, {
      state: {
        mint: token.mint,
        type: "buy",
        name: token.name,
        symbol: token.symbol,
        logo: token.logo,
        currentPrice: token.latest_price,
        latest_price: token.latest_price
      }
    });
  };

  const handleSellToken = (token: TrendingToken) => {
    const params = new URLSearchParams({
      mint: token.mint,
      jitoTip: "0.0005",
      slippage: "10",
      dex: "jupiter",
      type: "sell"
    });
    
    navigate(`/trading?${params.toString()}`, {
      state: {
        mint: token.mint,
        type: "sell",
        name: token.name,
        symbol: token.symbol,
        logo: token.logo,
        currentPrice: token.latest_price,
        latest_price: token.latest_price
      }
    });
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return price.toFixed(4);
    }
    // For small prices, show up to 10 decimal places to avoid scientific notation
    return price.toFixed(10).replace(/\.?0+$/, '');
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`;
    }
    return `$${volume.toFixed(2)}`;
  };

  // Redirect if not logged in
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          
          <main className="flex-1 p-3 sm:p-6">
            <div className="max-w-full mx-auto space-y-3 sm:space-y-6 px-2 sm:px-4">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold">Trending Tokens</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Most active tokens in the market</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1 sm:gap-2">
                {[1, 6, 24].map((hour) => (
                  <Button
                    key={hour}
                    variant={selectedHour === hour ? "default" : "outline"}
                    onClick={() => setSelectedHour(hour)}
                    className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                  >
                    {hour}H
                  </Button>
                ))}
              </div>

              {isLoading && (
                <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardContent className="p-3 sm:p-6">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <Skeleton className="h-8 w-8 sm:h-12 sm:w-12 rounded-full" />
                          <div className="space-y-1 sm:space-y-2">
                            <Skeleton className="h-3 w-[120px] sm:h-4 sm:w-[150px]" />
                            <Skeleton className="h-3 w-[80px] sm:h-4 sm:w-[100px]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {error && (
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardContent className="py-4 sm:py-8 text-center">
                    <p className="text-destructive text-sm sm:text-base">{error}</p>
                    <Button 
                      onClick={() => fetchTrendingTokens(selectedHour)} 
                      className="mt-2 sm:mt-4 text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                      variant="outline"
                    >
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              )}

              {!isLoading && !error && tokens.length === 0 && (
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardContent className="py-4 sm:py-8 text-center">
                    <p className="text-muted-foreground text-sm sm:text-base">No trending tokens found for the selected time period</p>
                  </CardContent>
                </Card>
              )}

              {!isLoading && !error && tokens.length > 0 && (
                <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {tokens.map((token) => (
                    <Card key={token.mint} className="hover:shadow-lg transition-all duration-200 group bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <img 
                              src={token.logo} 
                              alt={token.name} 
                              className="w-8 h-8 sm:w-12 sm:h-12 rounded-full ring-2 ring-primary/20"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                            <div>
                              <CardTitle className="text-sm sm:text-lg font-bold">{token.symbol}</CardTitle>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[100px] sm:max-w-[140px]">
                                {token.name}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(token.mint)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 sm:p-2"
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
                        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <p className="text-muted-foreground">Price</p>
                            <p className="font-mono font-medium text-xs sm:text-sm">${formatPrice(token.latest_price)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Net Flow</p>
                            <div className="flex items-center gap-1">
                              {token.net_inflow_usd >= 0 ? (
                                <ArrowUpRight className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
                              ) : (
                                <ArrowDownRight className="h-2 w-2 sm:h-3 sm:w-3 text-red-500" />
                              )}
                              <span className={`font-medium text-xs sm:text-sm ${token.net_inflow_usd >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {formatVolume(Math.abs(token.net_inflow_usd))}
                              </span>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Buy Volume</p>
                            <p className="font-medium text-green-500 text-xs sm:text-sm">{formatVolume(token.buy_volume_usd)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Sell Volume</p>
                            <p className="font-medium text-red-500 text-xs sm:text-sm">{formatVolume(token.sell_volume_usd)}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-1 sm:gap-2 pt-1 sm:pt-2">
                          <Button 
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4"
                            onClick={() => handleBuyToken(token)}
                          >
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Buy
                          </Button>
                          <Button 
                            variant="outline" 
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-4"
                            onClick={() => handleSellToken(token)}
                          >
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1 rotate-180" />
                            Sell
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Trending;