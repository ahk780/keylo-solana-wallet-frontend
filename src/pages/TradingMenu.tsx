import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Clock, Shield, Zap, Info, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradeResponse {
  success: boolean;
  message: string;
  data: {
    signature: string;
    txUrl: string;
    price: number;
    amount: number;
    type: string;
  };
}

interface LocationState {
  mint: string;
  type: 'buy' | 'sell';
  name: string;
  symbol: string;
  logo: string;
}

interface TokenInfo {
  mint: string;
  name: string;
  symbol: string;
  logo: string;
  priceInUsd?: number;
  currentPrice?: number;
  latest_price?: number;
}

export default function TradingMenu() {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const state = location.state as LocationState;
  
  // Parse URL parameters
  const searchParams = new URLSearchParams(location.search);
  const urlMint = searchParams.get('mint');
  const urlType = searchParams.get('type') as 'buy' | 'sell';
  const urlJitoTip = searchParams.get('jitoTip');
  const urlSlippage = searchParams.get('slippage');
  const urlDex = searchParams.get('dex');
  
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>(urlType || state?.type || 'buy');
  const [mint, setMint] = useState(urlMint || state?.mint || '');
  const [amount, setAmount] = useState('');
  const [dex, setDex] = useState(urlDex || '');
  const [tip, setTip] = useState(urlJitoTip || '');
  const [slippage, setSlippage] = useState(urlSlippage || '');
  const [isTrading, setIsTrading] = useState(false);
  const [tradeResult, setTradeResult] = useState<TradeResponse['data'] | null>(null);
  const [tradeSuccessDialog, setTradeSuccessDialog] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loadingTokenInfo, setLoadingTokenInfo] = useState(false);
  const [calculatedAmount, setCalculatedAmount] = useState<string>('');

  const dexOptions = [
    { value: 'raydium', label: 'Raydium' },
    { value: 'meteora', label: 'Meteora' },
    { value: 'pumpfun', label: 'PumpFun' },
    { value: 'launchlab', label: 'LaunchLab' },
    { value: 'moonshot', label: 'Moonshot' },
    { value: 'jupiter', label: 'Jupiter' },
  ];

  useEffect(() => {
    if (state) {
      setMint(state.mint);
      setTradeType(state.type);
      setTokenInfo({
        mint: state.mint,
        name: state.name,
        symbol: state.symbol,
        logo: state.logo,
        currentPrice: (state as any).currentPrice,
        latest_price: (state as any).latest_price,
      });
    }
  }, [state]);

  // Fetch token info when mint changes (for manually entered mints)
  useEffect(() => {
    if (mint && !state && token && user) {
      // Clear previous token info and fetch new one
      setTokenInfo(null);
      setCalculatedAmount('');
      fetchTokenInfo(mint);
    }
  }, [mint, state, token, user]);

  const fetchTokenInfo = async (mintAddress: string) => {
    setLoadingTokenInfo(true);
    try {
      // Fetch token info from the specific token endpoint for manual entries
      const tokenResponse = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/price/token?mint=${mintAddress}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        if (tokenData.success && tokenData.data) {
          setTokenInfo({
            mint: tokenData.data.mint,
            name: tokenData.data.name,
            symbol: tokenData.data.symbol,
            logo: tokenData.data.logo,
            priceInUsd: tokenData.data.priceInUsd,
          });
          return;
        }
      }
      
      // If specific API fails, set basic token info
      setTokenInfo({
        mint: mintAddress,
        name: `Token ${mintAddress.slice(0, 8)}...`,
        symbol: 'UNKNOWN',
        logo: '/placeholder.svg',
      });
    } catch (error) {
      console.error('Error fetching token info:', error);
      // Set basic token info as fallback
      setTokenInfo({
        mint: mintAddress,
        name: `Token ${mintAddress.slice(0, 8)}...`,
        symbol: 'UNKNOWN',
        logo: '/placeholder.svg',
      });
    } finally {
      setLoadingTokenInfo(false);
    }
  };

  const handleTradeSubmit = async () => {
    if (!mint || !amount || !dex) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsTrading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/trade`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mint,
          amount: parseFloat(amount),
          dex,
          tip: tip ? parseFloat(tip) : undefined,
          slippage: slippage ? parseFloat(slippage) : undefined,
          type: tradeType,
        }),
      });

      const result: TradeResponse = await response.json();

      if (result.success) {
        setTradeResult(result.data);
        setTradeSuccessDialog(true);
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        throw new Error(result.message || 'Trade failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Trade failed',
        variant: "destructive",
      });
    } finally {
      setIsTrading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openTransactionInSolscan = (signature: string) => {
    window.open(`https://solscan.io/tx/${signature}`, '_blank');
  };

  // Calculate expected tokens/SOL based on price and amount
  useEffect(() => {
    if (!amount || !tokenInfo) {
      setCalculatedAmount('');
      return;
    }

    const price = tokenInfo.priceInUsd || tokenInfo.currentPrice || tokenInfo.latest_price;
    if (!price) {
      setCalculatedAmount('');
      return;
    }

    const inputAmount = parseFloat(amount);
    if (isNaN(inputAmount)) {
      setCalculatedAmount('');
      return;
    }

    if (tradeType === 'buy') {
      // Calculate how many tokens user will get
      const solPrice = 150; // Approximate SOL price in USD - you might want to fetch this
      const solInUsd = inputAmount * solPrice;
      const tokensToGet = solInUsd / price;
      setCalculatedAmount(tokensToGet.toLocaleString(undefined, { maximumFractionDigits: 6 }));
    } else {
      // Calculate how much SOL user will get
      const tokensInUsd = inputAmount * price;
      const solPrice = 150; // Approximate SOL price in USD
      const solToGet = tokensInUsd / solPrice;
      setCalculatedAmount(solToGet.toLocaleString(undefined, { maximumFractionDigits: 6 }));
    }
  }, [amount, tokenInfo, tradeType]);

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
                  <h1 className="text-xl sm:text-3xl font-bold">Trading Terminal</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Professional trading interface</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-6 w-full">
                {/* Left Column - Token Info & Market Data */}
                <div className="xl:col-span-1 space-y-3 sm:space-y-6">
                  {/* Token Information */}
                  {(tokenInfo || loadingTokenInfo) && (
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                          Token Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                        {loadingTokenInfo ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                            <span className="ml-2 text-sm text-muted-foreground">Loading token info...</span>
                          </div>
                        ) : tokenInfo && (
                          <>
                            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                              <img 
                                src={tokenInfo.logo} 
                                alt={tokenInfo.name} 
                                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full ring-2 ring-primary/20 shadow-lg"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <div>
                                <div className="text-lg sm:text-xl font-bold">{tokenInfo.name}</div>
                                <div className="text-xs sm:text-sm text-muted-foreground font-mono">{tokenInfo.symbol}</div>
                              </div>
                            </div>
                            
                            <div className="space-y-3 sm:space-y-4">
                              <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                  Mint Address
                                </Label>
                                <p className="text-xs sm:text-sm font-mono mt-1 break-all">{tokenInfo.mint}</p>
                              </div>
                              
                              <div className="space-y-3 sm:space-y-4">
                                {(tokenInfo.priceInUsd || tokenInfo.currentPrice || tokenInfo.latest_price) && (
                                  <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                      Current Price
                                    </Label>
                                    <p className="text-xs sm:text-sm font-medium mt-1">
                                      ${(tokenInfo.priceInUsd || tokenInfo.currentPrice || tokenInfo.latest_price)?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                                    </p>
                                  </div>
                                )}
                                 <div className="grid grid-cols-2 gap-2 sm:gap-4">
                                  <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                      Status
                                    </Label>
                                    <p className="text-xs sm:text-sm font-medium mt-1">Active</p>
                                  </div>
                                  <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                      Network
                                    </Label>
                                    <p className="text-xs sm:text-sm font-medium mt-1">Solana</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* DEX Options */}
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                      <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Available DEXs
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                      <div className="grid grid-cols-2 gap-2">
                        {dexOptions.map((dex) => (
                          <div key={dex.value} className="flex items-center gap-2 p-2 sm:p-3 rounded-lg bg-muted/50">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs sm:text-sm font-medium">{dex.label}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Trading Form */}
                <div className="xl:col-span-2 space-y-3 sm:space-y-6">
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6 pt-3 sm:pt-6">
                      <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                        <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Execute Trade
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        Place your buy or sell orders with advanced settings
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                      <Tabs value={tradeType} onValueChange={(value) => setTradeType(value as 'buy' | 'sell')}>
                        <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                          <TabsTrigger value="buy" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 text-xs sm:text-sm">
                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            Buy Order
                          </TabsTrigger>
                          <TabsTrigger value="sell" className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-800 text-xs sm:text-sm">
                            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                            Sell Order
                          </TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="buy" className="space-y-4 sm:space-y-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-3 sm:space-y-4">
                              <div>
                                <Label htmlFor="mint" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Mint Address *
                                </Label>
                                <Input
                                  id="mint"
                                  placeholder="Enter token mint address"
                                  value={mint}
                                  onChange={(e) => setMint(e.target.value)}
                                  className="mt-1 font-mono text-xs sm:text-sm"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="amount" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Amount (SOL) *
                                </Label>
                                <Input
                                  id="amount"
                                  type="number"
                                  placeholder="0.01"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  className="mt-1 text-xs sm:text-sm"
                                />
                                {calculatedAmount && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    ≈ {calculatedAmount} {tokenInfo?.symbol || 'tokens'}
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <Label htmlFor="dex" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                                  DEX *
                                </Label>
                                <Select value={dex} onValueChange={setDex}>
                                  <SelectTrigger className="mt-1 text-xs sm:text-sm">
                                    <SelectValue placeholder="Select DEX" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {dexOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="space-y-3 sm:space-y-4">
                              <div>
                                <Label htmlFor="tip" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                                  <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Jito Tip (SOL)
                                </Label>
                                <Input
                                  id="tip"
                                  type="number"
                                  placeholder="0.0005"
                                  value={tip}
                                  onChange={(e) => setTip(e.target.value)}
                                  className="mt-1 text-xs sm:text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Higher tips get priority execution
                                </p>
                              </div>
                              
                              <div>
                                <Label htmlFor="slippage" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                                  <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Slippage (%)
                                </Label>
                                <Input
                                  id="slippage"
                                  type="number"
                                  placeholder="10"
                                  value={slippage}
                                  onChange={(e) => setSlippage(e.target.value)}
                                  className="mt-1 text-xs sm:text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Maximum price movement tolerance
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex justify-center">
                            <Button 
                              onClick={handleTradeSubmit}
                              disabled={isTrading}
                              className="w-full max-w-md bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 sm:py-3 text-sm sm:text-lg"
                            >
                              {isTrading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                                  <span className="text-xs sm:text-base">Processing Buy Order...</span>
                                </>
                              ) : (
                                <>
                                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                  <span className="text-xs sm:text-base">Buy Token</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </TabsContent>

                        <TabsContent value="sell" className="space-y-4 sm:space-y-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-3 sm:space-y-4">
                              <div>
                                <Label htmlFor="mint-sell" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                                  <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Mint Address *
                                </Label>
                                <Input
                                  id="mint-sell"
                                  placeholder="Enter token mint address"
                                  value={mint}
                                  onChange={(e) => setMint(e.target.value)}
                                  className="mt-1 font-mono text-xs sm:text-sm"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="amount-sell" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Amount (Tokens) *
                                </Label>
                                <Input
                                  id="amount-sell"
                                  type="number"
                                  placeholder="100"
                                  value={amount}
                                  onChange={(e) => setAmount(e.target.value)}
                                  className="mt-1 text-xs sm:text-sm"
                                />
                                {calculatedAmount && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    ≈ {calculatedAmount} SOL
                                  </p>
                                )}
                              </div>
                              
                              <div>
                                <Label htmlFor="dex-sell" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                                  DEX *
                                </Label>
                                <Select value={dex} onValueChange={setDex}>
                                  <SelectTrigger className="mt-1 text-xs sm:text-sm">
                                    <SelectValue placeholder="Select DEX" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {dexOptions.map((option) => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="space-y-3 sm:space-y-4">
                              <div>
                                <Label htmlFor="tip-sell" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                                  <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Jito Tip (SOL)
                                </Label>
                                <Input
                                  id="tip-sell"
                                  type="number"
                                  placeholder="0.0005"
                                  value={tip}
                                  onChange={(e) => setTip(e.target.value)}
                                  className="mt-1 text-xs sm:text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Higher tips get priority execution
                                </p>
                              </div>
                              
                              <div>
                                <Label htmlFor="slippage-sell" className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                                  <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Slippage (%)
                                </Label>
                                <Input
                                  id="slippage-sell"
                                  type="number"
                                  placeholder="10"
                                  value={slippage}
                                  onChange={(e) => setSlippage(e.target.value)}
                                  className="mt-1 text-xs sm:text-sm"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Maximum price movement tolerance
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex justify-center">
                            <Button 
                              onClick={handleTradeSubmit}
                              disabled={isTrading}
                              className="w-full max-w-md bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-2 sm:py-3 text-sm sm:text-lg"
                            >
                              {isTrading ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                                  <span className="text-xs sm:text-base">Processing Sell Order...</span>
                                </>
                              ) : (
                                <>
                                  <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                  <span className="text-xs sm:text-base">Sell Token</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Trade Success Dialog */}
              <Dialog open={tradeSuccessDialog} onOpenChange={setTradeSuccessDialog}>
                <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto mx-auto my-4 rounded-xl left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                  <DialogHeader className="pb-3 px-1">
                    <DialogTitle className="flex items-center justify-center gap-2 text-center text-base sm:text-lg">
                      <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                      Trade Successful
                    </DialogTitle>
                  </DialogHeader>
                  {tradeResult && (
                    <div className="space-y-3 px-1">
                      {/* Success Banner */}
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 sm:p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          <span className="text-xs sm:text-sm font-medium text-green-800">Transaction Confirmed</span>
                        </div>
                        <p className="text-xs text-green-700">
                          Your {tradeResult.type} order has been successfully executed
                        </p>
                      </div>
                      
                      {/* Trade Details */}
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm">
                          <div>
                            <Label className="text-muted-foreground text-xs">Type</Label>
                            <p className="font-medium capitalize text-xs sm:text-sm">{tradeResult.type}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">Amount</Label>
                            <p className="font-medium text-xs sm:text-sm">{tradeResult.amount}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">Price</Label>
                            <p className="font-medium text-xs sm:text-sm">${tradeResult.price}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground text-xs">Total</Label>
                            <p className="font-medium text-xs sm:text-sm">${(tradeResult.amount * tradeResult.price).toFixed(4)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Transaction Signature */}
                      <div className="bg-muted/30 rounded-lg p-3">
                        <Label className="text-muted-foreground text-xs">Transaction Signature</Label>
                        <div className="bg-muted/50 p-2 rounded mt-1 border">
                          <p className="text-xs font-mono break-all leading-relaxed">
                            {tradeResult.signature}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline"
                          onClick={() => openTransactionInSolscan(tradeResult.signature)}
                          className="flex-1 text-xs sm:text-sm py-2 px-3 h-9"
                        >
                          <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">View on Solscan</span>
                          <span className="sm:hidden">Solscan</span>
                        </Button>
                        <Button 
                          onClick={() => setTradeSuccessDialog(false)}
                          className="flex-1 text-xs sm:text-sm py-2 px-3 h-9 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}