import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Wallet, TrendingUp, History, Target, ExternalLink, TrendingDown, Activity, DollarSign, Percent, Calendar, User, Shield } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
  success: boolean;
  message: string;
  data: {
    account: {
      walletAddress: string;
      memberSince: string;
      accountStatus: string;
      userRole: string;
    };
    portfolio: {
      totalValue: number;
      totalAssets: number;
      totalProfitLoss: number;
      profitLossPercent: number;
      portfolioChangeToday: number;
      portfolioChangePercent: number;
      totalInvested: number;
      avgPortfolioPrice: number;
      solBalance: number;
      solPrice: number;
      solValueUsd: number;
      totalPortfolioValue: number;
    };
    trading: {
      totalTransactions: number;
      totalVolume: number;
      avgTransactionValue: number;
      successfulTransactions: number;
      failedTransactions: number;
      pendingTransactions: number;
      sendTransactions: number;
      receiveTransactions: number;
      swapTransactions: number;
      sendVolume: number;
      receiveVolume: number;
      swapVolume: number;
      successRate: number;
      mostActiveType: string;
    };
    orders: {
      totalOrders: number;
      totalOrderValue: number;
      waitingOrders: number;
      triggeredOrders: number;
      failedOrders: number;
      buyOrders: number;
      sellOrders: number;
      buyOrderValue: number;
      sellOrderValue: number;
      averageOrderValue: number;
    };
    recent: {
      assets: Array<{
        _id: string;
        mint: string;
        name: string;
        symbol: string;
        logo: string;
        balance: number;
        currentPrice: number;
        currentValue: number;
        createdAt: string;
      }>;
      transactions: Array<{
        _id: string;
        signature: string;
        type: string;
        dex: string;
        mint: string;
        amount: number;
        value: number;
        name: string;
        symbol: string;
        logo: string;
        from: string;
        to: string;
        status: string;
        created_at: string;
      }>;
      orders: Array<{
        _id: string;
        mint: string;
        name: string;
        symbol: string;
        logo: string;
        amount: number;
        dex: string;
        orderType: string;
        triggerPrice: number;
        currentPrice: number;
        type: string;
        status: string;
        createdAt: string;
      }>;
      lastTransactionTime: string;
      recentVolume24h: number;
      transactionBreakdown: {
        sends: number;
        receives: number;
        swaps: number;
      };
    };
    performance: {
      topGainers: Array<{
        _id: string;
        mint: string;
        name: string;
        symbol: string;
        logo: string;
        balance: number;
        buyPrice: number;
        currentPrice: number;
        currentValue: number;
        profitLoss: number;
        profitLossPercent: number;
      }>;
      topLosers: Array<{
        _id: string;
        mint: string;
        name: string;
        symbol: string;
        logo: string;
        balance: number;
        buyPrice: number;
        currentPrice: number;
        currentValue: number;
        profitLoss: number;
        profitLossPercent: number;
      }>;
      portfolioChangeToday: number;
      portfolioChangePercent: number;
    };
    system: {
      solPrice: number;
      priceLastUpdated: string;
      assetsLastScanned: string;
    };
  };
}

const Dashboard = () => {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard data
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    enabled: !!token && !!user,
  });

  // Redirect if not logged in
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const openTransactionInSolscan = (signature: string) => {
    window.open(`https://solscan.io/tx/${signature}`, '_blank');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          
          <main className="flex-1 p-2 sm:p-4 lg:p-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 -z-10" />
            
            <div className="max-w-full mx-auto px-2 sm:px-4 space-y-4 sm:space-y-6">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
                </div>
              ) : dashboardData ? (
                <>
                  {/* Welcome Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                        Welcome back, {user.name}!
                      </h1>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Here's your real-time portfolio overview.
                      </p>
                    </div>
                    <Button 
                      onClick={() => navigate('/assets')}
                      className="flex items-center gap-2 text-xs sm:text-sm w-full sm:w-auto"
                      size="sm"
                    >
                      <Wallet className="h-3 w-3 sm:h-4 sm:w-4" />
                      My Assets
                    </Button>
                  </div>

                  {/* Portfolio Overview */}
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium">Portfolio Value</CardTitle>
                        <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="pt-1">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{formatCurrency(dashboardData.data.portfolio.totalPortfolioValue)}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          {dashboardData.data.portfolio.profitLossPercent >= 0 ? (
                            <TrendingUp className="h-2 w-2 sm:h-3 sm:w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-2 w-2 sm:h-3 sm:w-3 text-red-500" />
                          )}
                          {formatPercent(dashboardData.data.portfolio.profitLossPercent)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium">Total Assets</CardTitle>
                        <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="pt-1">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{dashboardData.data.portfolio.totalAssets}</div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(dashboardData.data.portfolio.totalValue)} in tokens
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium">SOL Balance</CardTitle>
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="pt-1">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{dashboardData.data.portfolio.solBalance.toFixed(4)} SOL</div>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(dashboardData.data.portfolio.solValueUsd)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium">P&L</CardTitle>
                        <Percent className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="pt-1">
                        <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${dashboardData.data.portfolio.totalProfitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(dashboardData.data.portfolio.totalProfitLoss)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Total invested: {formatCurrency(dashboardData.data.portfolio.totalInvested)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Trading & Orders Stats */}
                  <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium">Total Transactions</CardTitle>
                        <History className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="pt-1">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{dashboardData.data.trading.totalTransactions}</div>
                        <p className="text-xs text-muted-foreground">
                          {dashboardData.data.trading.successRate}% success rate
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium">Trading Volume</CardTitle>
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="pt-1">
                         <div className="text-lg sm:text-xl lg:text-2xl font-bold">{formatCurrency(dashboardData.data.trading.totalVolume)}</div>
                         <p className="text-xs text-muted-foreground">
                           Avg: {formatCurrency(dashboardData.data.trading.avgTransactionValue)}
                         </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium">Total Orders</CardTitle>
                        <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="pt-1">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{dashboardData.data.orders.totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                          {dashboardData.data.orders.waitingOrders} waiting, {dashboardData.data.orders.triggeredOrders} triggered
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs sm:text-sm font-medium">Order Value</CardTitle>
                        <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent className="pt-1">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold">{formatCurrency(dashboardData.data.orders.totalOrderValue)}</div>
                        <p className="text-xs text-muted-foreground">
                          {dashboardData.data.orders.buyOrders} buy, {dashboardData.data.orders.sellOrders} sell
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity Grid */}
                  <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                    {/* Recent Assets */}
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                          <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />
                          Recent Assets
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Your latest token holdings</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {dashboardData.data.recent.assets.slice(0, 4).map((asset) => (
                            <div key={asset._id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <img src={asset.logo} alt={asset.symbol} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                                <div>
                                  <p className="font-medium text-xs sm:text-sm">{asset.symbol}</p>
                                  <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-xs sm:text-sm">{formatCurrency(asset.currentValue)}</p>
                                <p className="text-xs text-muted-foreground">{asset.balance.toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Transactions */}
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                          <History className="h-4 w-4 sm:h-5 sm:w-5" />
                          Recent Transactions
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Your latest transactions</CardDescription>
                      </CardHeader>
                      <CardContent>
                         <div className="space-y-2">
                           {dashboardData.data.recent.transactions.slice(0, 4).map((tx) => (
                             <div key={tx._id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                               <div className="flex items-center gap-2">
                                 <img src={tx.logo} alt={tx.symbol} className="w-5 h-5 rounded-full" />
                                 <div>
                                   <p className="font-medium text-xs sm:text-sm">{tx.symbol}</p>
                                   <p className="text-xs text-muted-foreground capitalize">{tx.type} • {tx.dex}</p>
                                 </div>
                               </div>
                               <div className="text-right">
                                 <p className={`font-medium text-xs sm:text-sm ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                   {tx.amount >= 0 ? '+' : ''}{formatAmount(tx.amount)}
                                 </p>
                                 <p className="text-xs text-muted-foreground">{formatCurrency(tx.value)}</p>
                               </div>
                             </div>
                           ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Cards */}
                  <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
                    {/* Top Gainers */}
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-green-600 text-sm sm:text-base">
                          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                          Top Gainers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {dashboardData.data.performance.topGainers.slice(0, 3).map((asset) => (
                            <div key={asset._id} className="flex items-center justify-between p-2 rounded-lg bg-green-500/10">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <img src={asset.logo} alt={asset.symbol} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                                <div>
                                  <p className="font-medium text-xs sm:text-sm">{asset.symbol}</p>
                                  <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-xs sm:text-sm text-green-600">
                                  +{formatPercent(asset.profitLossPercent)}
                                </p>
                                <p className="text-xs text-green-600">
                                  +{formatCurrency(asset.profitLoss)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top Losers */}
                    <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-red-600 text-sm sm:text-base">
                          <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5" />
                          Top Losers
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {dashboardData.data.performance.topLosers.slice(0, 3).map((asset) => (
                            <div key={asset._id} className="flex items-center justify-between p-2 rounded-lg bg-red-500/10">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <img src={asset.logo} alt={asset.symbol} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
                                <div>
                                  <p className="font-medium text-xs sm:text-sm">{asset.symbol}</p>
                                  <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-xs sm:text-sm text-red-600">
                                  {formatPercent(asset.profitLossPercent)}
                                </p>
                                <p className="text-xs text-red-600">
                                  {formatCurrency(asset.profitLoss)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* System Info */}
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                        Account & System Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs sm:text-sm font-medium">Account Status</p>
                            <p className="text-xs text-green-600 capitalize">{dashboardData.data.account.accountStatus}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs sm:text-sm font-medium">Last Price Update</p>
                            <p className="text-xs text-muted-foreground">{formatDate(dashboardData.data.system.priceLastUpdated)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs sm:text-sm font-medium">SOL Price</p>
                            <p className="text-xs font-medium">{formatCurrency(dashboardData.data.system.solPrice)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No dashboard data available
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;