import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wallet, TrendingUp, Send, ExternalLink, ArrowLeft, Activity, Download, Copy, Flame, Clipboard } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';

interface Asset {
  _id: string;
  mint: string;
  name: string;
  symbol: string;
  logo: string;
  balance: number;
  currentValue: number;
  currentPrice: number;
  status: string;
}

interface AssetsResponse {
  success: boolean;
  data: {
    assets: Asset[];
    summary: {
      totalValue: number;
      totalAssets: number;
      averagePrice: number;
    };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalAssets: number;
      limit: number;
    };
  };
}

interface TransferResponse {
  success: boolean;
  message: string;
  data: {
    transactionId: string;
    signature: string;
    from: string;
    to: string;
    mint: string;
    amount: number;
    status: string;
  };
}

interface BalanceResponse {
  success: boolean;
  message: string;
  data: {
    balance: number;
    walletAddress: string;
    unit: string;
  };
}

interface SolPriceResponse {
  success: boolean;
  message: string;
  data: {
    solPriceUsd: number;
    usdtPriceInSol: number;
    usdtPriceInUsd: number;
    lastUpdated: string;
    source: string;
    isValid: boolean;
  };
}

interface BurnResponse {
  success: boolean;
  message: string;
  data: {
    signature: string;
    mint: string;
    amount: number;
    operation: string;
  };
}

export default function MyAssets() {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transferDialog, setTransferDialog] = useState(false);
  const [transferSuccessDialog, setTransferSuccessDialog] = useState(false);
  const [solTransferDialog, setSolTransferDialog] = useState(false);
  const [receiveDialog, setReceiveDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [receiverWallet, setReceiverWallet] = useState('');
  const [transferResult, setTransferResult] = useState<TransferResponse['data'] | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);
  const [solTransferAmount, setSolTransferAmount] = useState('');
  const [solReceiverWallet, setSolReceiverWallet] = useState('');
  const [burnDialog, setBurnDialog] = useState(false);
  const [burnSuccessDialog, setBurnSuccessDialog] = useState(false);
  const [burnAmount, setBurnAmount] = useState('');
  const [burnResult, setBurnResult] = useState<BurnResponse['data'] | null>(null);
  const [isBurning, setIsBurning] = useState(false);

  const { data: assetsData, isLoading, error } = useQuery<AssetsResponse>({
    queryKey: ['assets'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/assets?page=1&limit=20&status=available`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }

      return response.json();
    },
    enabled: !!token && !!user, // Only run query when user is authenticated
  });

  const { data: balanceData } = useQuery<BalanceResponse>({
    queryKey: ['balance'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/balance`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      return response.json();
    },
    enabled: !!token && !!user,
  });

  const { data: solPriceData } = useQuery<SolPriceResponse>({
    queryKey: ['solPrice'],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/price/sol`);

      if (!response.ok) {
        throw new Error('Failed to fetch SOL price');
      }

      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleBuy = (asset: Asset) => {
    navigate('/trading', { 
      state: { 
        mint: asset.mint, 
        type: 'buy',
        name: asset.name,
        symbol: asset.symbol,
        logo: asset.logo
      } 
    });
  };

  const handleSell = (asset: Asset) => {
    navigate('/trading', { 
      state: { 
        mint: asset.mint, 
        type: 'sell',
        name: asset.name,
        symbol: asset.symbol,
        logo: asset.logo
      } 
    });
  };

  const handleTransfer = (asset: Asset) => {
    setSelectedAsset(asset);
    setTransferDialog(true);
  };

  const handleTransferSubmit = async () => {
    if (!selectedAsset || !transferAmount || !receiverWallet) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsTransferring(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mint: selectedAsset.mint,
          amount: parseFloat(transferAmount),
          to: receiverWallet,
        }),
      });

      const result: TransferResponse = await response.json();

      if (result.success) {
        setTransferResult(result.data);
        setTransferDialog(false);
        setTransferSuccessDialog(true);
        setTransferAmount('');
        setReceiverWallet('');
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        throw new Error(result.message || 'Transfer failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Transfer failed',
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openTransactionInSolscan = (signature: string) => {
    window.open(`https://solscan.io/tx/${signature}`, '_blank');
  };

  const handleSolTransfer = async () => {
    if (!solTransferAmount || !solReceiverWallet) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsTransferring(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/transfer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mint: 'So11111111111111111111111111111111111111112',
          amount: parseFloat(solTransferAmount),
          to: solReceiverWallet,
        }),
      });

      const result: TransferResponse = await response.json();

      if (result.success) {
        setTransferResult(result.data);
        setSolTransferDialog(false);
        setTransferSuccessDialog(true);
        setSolTransferAmount('');
        setSolReceiverWallet('');
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        throw new Error(result.message || 'Transfer failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Transfer failed',
        variant: "destructive",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const handleBurn = (asset: Asset) => {
    setSelectedAsset(asset);
    setBurnDialog(true);
  };

  const handleBurnSubmit = async () => {
    if (!selectedAsset || !burnAmount) {
      toast({
        title: "Error",
        description: "Please enter burn amount",
        variant: "destructive",
      });
      return;
    }

    setIsBurning(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/token/burn`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mint: selectedAsset.mint,
          amount: parseFloat(burnAmount),
        }),
      });

      const result: BurnResponse = await response.json();

      if (result.success) {
        setBurnResult(result.data);
        setBurnDialog(false);
        setBurnSuccessDialog(true);
        setBurnAmount('');
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        throw new Error(result.message || 'Burn failed');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Burn failed',
        variant: "destructive",
      });
    } finally {
      setIsBurning(false);
    }
  };

  const setBurnPercentage = (percentage: number) => {
    if (selectedAsset) {
      const amount = selectedAsset.balance * percentage / 100;
      // Format to avoid scientific notation and remove trailing zeros
      setBurnAmount(amount.toFixed(20).replace(/\.?0+$/, ''));
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const pasteFromClipboard = async (setFunction: (value: string) => void) => {
    try {
      if (!navigator.clipboard) {
        toast({
          title: "Not supported",
          description: "Clipboard access not available. Please paste manually (Ctrl+V)",
          variant: "destructive",
        });
        return;
      }
      
      const text = await navigator.clipboard.readText();
      if (text) {
        setFunction(text);
        toast({
          title: "Pasted",
          description: "Wallet address pasted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Paste manually",
        description: "Please use Ctrl+V to paste the wallet address",
        variant: "destructive",
      });
    }
  };

  // Redirect if not logged in
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 p-6">
              <div className="container mx-auto">
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Loading assets...</div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 p-6">
              <div className="container mx-auto">
                <div className="flex items-center justify-center h-64">
                  <div className="text-destructive">Error loading assets</div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const assets = assetsData?.data?.assets || [];
  const summary = assetsData?.data?.summary;
  const balance = balanceData?.data?.balance || 0;
  const walletAddress = balanceData?.data?.walletAddress || '';
  const solPrice = solPriceData?.data?.solPriceUsd || 0;
  const solValue = balance * solPrice;
  const totalValue = summary ? summary.totalValue + solValue : solValue;

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
                  <h1 className="text-xl sm:text-3xl font-bold">My Assets</h1>
                  <p className="text-sm sm:text-base text-muted-foreground">Your cryptocurrency holdings</p>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
                {/* Available */}
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-4 lg:px-6 pt-2 sm:pt-4 lg:pt-6">
                    <CardTitle className="text-xs font-medium">Available</CardTitle>
                    <Wallet className="h-3 w-3 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6">
                    <div className="text-xs sm:text-lg lg:text-2xl font-bold">{balance.toFixed(6)}</div>
                    <p className="text-xs text-muted-foreground">SOL</p>
                  </CardContent>
                </Card>

                {/* Average Price */}
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-4 lg:px-6 pt-2 sm:pt-4 lg:pt-6">
                    <CardTitle className="text-xs font-medium">Average Price</CardTitle>
                    <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6">
                    <div className="text-xs sm:text-lg lg:text-2xl font-bold">${summary?.averagePrice?.toFixed(8) || '0.00000000'}</div>
                    <p className="text-xs text-muted-foreground">USD</p>
                  </CardContent>
                </Card>

                {/* Total Value */}
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-4 lg:px-6 pt-2 sm:pt-4 lg:pt-6">
                    <CardTitle className="text-xs font-medium">Total Value</CardTitle>
                    <Activity className="h-3 w-3 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6">
                    <div className="text-xs sm:text-lg lg:text-2xl font-bold">${totalValue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">USD</p>
                  </CardContent>
                </Card>

                {/* Assets */}
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-2 sm:px-4 lg:px-6 pt-2 sm:pt-4 lg:pt-6">
                    <CardTitle className="text-xs font-medium">Assets</CardTitle>
                    <Download className="h-3 w-3 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 lg:pb-6">
                    <div className="text-xs sm:text-lg lg:text-2xl font-bold">{summary?.totalAssets || 0}</div>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </CardContent>
                </Card>
              </div>

              {/* SOL Actions - Send SOL and Receive in same line */}
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <Button 
                  onClick={() => setSolTransferDialog(true)} 
                  className="w-full flex items-center justify-center gap-1 sm:gap-2 h-9 sm:h-12 text-xs sm:text-sm bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Send SOL</span>
                  <span className="sm:hidden">Send</span>
                </Button>
                <Button 
                  onClick={() => setReceiveDialog(true)} 
                  variant="outline" 
                  className="w-full flex items-center justify-center gap-1 sm:gap-2 h-9 sm:h-12 text-xs sm:text-sm"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  Receive
                </Button>
              </div>

              {/* Assets Table - Mobile Optimized */}
              <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-2 sm:pb-4">
                  <CardTitle className="text-base sm:text-xl">Assets</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Your cryptocurrency holdings</CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                  {assets.length === 0 ? (
                    <div className="text-center py-4 sm:py-8 text-muted-foreground text-sm sm:text-base">
                      No assets found
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-0">
                      {/* Mobile Card View */}
                      <div className="block sm:hidden space-y-3">
                        {assets.map((asset) => (
                          <Card key={asset._id} className="bg-muted/30 border-primary/10">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <img 
                                    src={asset.logo} 
                                    alt={asset.name} 
                                    className="w-6 h-6 rounded-full"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder.svg';
                                    }}
                                  />
                                  <div>
                                    <div className="font-medium text-sm">{asset.name}</div>
                                    <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                                  </div>
                                </div>
                                <Badge variant={asset.status === 'available' ? 'default' : 'secondary'} className="text-xs">
                                  {asset.status}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                 <div>
                                   <span className="text-muted-foreground">Balance:</span>
                                   <p className="font-medium">{asset.balance.toFixed(10).replace(/\.?0+$/, '')}</p>
                                 </div>
                                 <div>
                                   <span className="text-muted-foreground">Value:</span>
                                   <p className="font-medium">${asset.currentValue.toFixed(10).replace(/\.?0+$/, '')}</p>
                                 </div>
                                <div className="col-span-2">
                                  <span className="text-muted-foreground">Mint:</span>
                                  <p className="font-mono text-xs">{formatAddress(asset.mint)}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-1 mb-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleBuy(asset)}
                                  className="text-xs py-1"
                                >
                                  Buy
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleSell(asset)}
                                  className="text-xs py-1"
                                >
                                  Sell
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-1">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleTransfer(asset)}
                                  className="text-xs py-1"
                                >
                                  <Send className="h-2 w-2 mr-1" />
                                  Send
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleBurn(asset)}
                                  className="text-xs py-1"
                                >
                                  <Flame className="h-2 w-2 mr-1" />
                                  Burn
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      {/* Desktop Table View */}
                      <div className="hidden sm:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs sm:text-sm">Token</TableHead>
                              <TableHead className="text-xs sm:text-sm">Mint</TableHead>
                              <TableHead className="text-xs sm:text-sm">Balance</TableHead>
                              <TableHead className="text-xs sm:text-sm">Current Value</TableHead>
                              <TableHead className="text-xs sm:text-sm">Status</TableHead>
                              <TableHead className="text-xs sm:text-sm">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {assets.map((asset) => (
                              <TableRow key={asset._id}>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <img 
                                      src={asset.logo} 
                                      alt={asset.name} 
                                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                                      onError={(e) => {
                                        e.currentTarget.src = '/placeholder.svg';
                                      }}
                                    />
                                    <div>
                                      <div className="font-medium text-xs sm:text-sm">{asset.name}</div>
                                      <div className="text-xs text-muted-foreground">{asset.symbol}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="font-mono text-xs">
                                  {formatAddress(asset.mint)}
                                </TableCell>
                                 <TableCell className="text-xs sm:text-sm">{asset.balance.toFixed(10).replace(/\.?0+$/, '')}</TableCell>
                                 <TableCell className="text-xs sm:text-sm">${asset.currentValue.toFixed(10).replace(/\.?0+$/, '')}</TableCell>
                                <TableCell>
                                  <Badge variant={asset.status === 'available' ? 'default' : 'secondary'} className="text-xs">
                                    {asset.status}
                                  </Badge>
                                </TableCell>
                                 <TableCell>
                                   <div className="flex gap-1 sm:gap-2">
                                     <Button 
                                       size="sm" 
                                       variant="outline"
                                       onClick={() => handleBuy(asset)}
                                       className="text-xs px-2 py-1"
                                     >
                                       Buy
                                     </Button>
                                     <Button 
                                       size="sm" 
                                       variant="outline"
                                       onClick={() => handleSell(asset)}
                                       className="text-xs px-2 py-1"
                                     >
                                       Sell
                                     </Button>
                                     <Button 
                                       size="sm" 
                                       variant="outline"
                                       onClick={() => handleTransfer(asset)}
                                       className="text-xs px-2 py-1"
                                     >
                                       <Send className="h-2 w-2 sm:h-3 sm:w-3" />
                                       <span className="hidden sm:inline ml-1">Transfer</span>
                                     </Button>
                                     <Button 
                                       size="sm" 
                                       variant="destructive"
                                       onClick={() => handleBurn(asset)}
                                       className="text-xs px-2 py-1"
                                     >
                                       <Flame className="h-2 w-2 sm:h-3 sm:w-3" />
                                       <span className="hidden sm:inline ml-1">Burn</span>
                                     </Button>
                                   </div>
                                 </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Transfer Dialog - Mobile Optimized */}
              <Dialog open={transferDialog} onOpenChange={setTransferDialog}>
                <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto mx-auto my-4 rounded-xl left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                  <DialogHeader className="pb-3 px-1">
                    <DialogTitle className="text-center text-base sm:text-lg">Transfer {selectedAsset?.symbol}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 px-1">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <Label htmlFor="amount" className="text-xs sm:text-sm font-medium">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className="mt-1 text-xs sm:text-sm h-9"
                      />
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <Label htmlFor="receiver" className="text-xs sm:text-sm font-medium">Receiver Wallet</Label>
                      <Input
                        id="receiver"
                        placeholder="Enter receiver wallet address"
                        value={receiverWallet}
                        onChange={(e) => setReceiverWallet(e.target.value)}
                        className="mt-1 text-xs sm:text-sm h-9 font-mono"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setTransferDialog(false)}
                        className="flex-1 text-xs sm:text-sm py-2 h-9"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleTransferSubmit}
                        disabled={isTransferring}
                        className="flex-1 text-xs sm:text-sm py-2 h-9 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                      >
                        {isTransferring ? 'Transferring...' : 'Transfer'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* SOL Transfer Dialog - Mobile Optimized */}
              <Dialog open={solTransferDialog} onOpenChange={setSolTransferDialog}>
                <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto mx-auto my-4 rounded-xl left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                  <DialogHeader className="pb-3 px-1">
                    <DialogTitle className="text-center text-base sm:text-lg">Send SOL</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 px-1">
                    {/* Available Balance */}
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">Available Balance:</span>
                        <span className="text-xs sm:text-sm font-medium">{balance.toFixed(6)} SOL</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-muted-foreground">${solValue.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3">
                      <Label htmlFor="solAmount" className="text-xs sm:text-sm font-medium">Amount (SOL)</Label>
                      <Input
                        id="solAmount"
                        type="number"
                        placeholder="Enter SOL amount"
                        value={solTransferAmount}
                        onChange={(e) => setSolTransferAmount(e.target.value)}
                        className="mt-1 text-xs sm:text-sm h-9"
                      />
                      {/* USD Value Display */}
                      {solTransferAmount && parseFloat(solTransferAmount) > 0 && (
                        <div className="mt-2 text-right">
                          <span className="text-xs text-muted-foreground">
                            ≈ ${(parseFloat(solTransferAmount) * solPrice).toFixed(2)} USD
                          </span>
                        </div>
                      )}
                      
                      {/* Quick Select Percentage Buttons */}
                      <div className="flex gap-1 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-7"
                          onClick={() => setSolTransferAmount((balance * 0.25).toFixed(6))}
                        >
                          25%
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-7"
                          onClick={() => setSolTransferAmount((balance * 0.5).toFixed(6))}
                        >
                          50%
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-7"
                          onClick={() => setSolTransferAmount((balance * 0.75).toFixed(6))}
                        >
                          75%
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-7"
                          onClick={() => setSolTransferAmount((balance * 0.95).toFixed(6))}
                        >
                          Max
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3">
                      <Label htmlFor="solReceiver" className="text-xs sm:text-sm font-medium">Receiver Wallet</Label>
                      <div className="relative mt-1">
                        <Input
                          id="solReceiver"
                          placeholder="Enter receiver wallet address"
                          value={solReceiverWallet}
                          onChange={(e) => setSolReceiverWallet(e.target.value)}
                          className="text-xs sm:text-sm h-9 font-mono pr-10"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => pasteFromClipboard(setSolReceiverWallet)}
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
                        >
                          <Clipboard className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setSolTransferDialog(false)}
                        className="flex-1 text-xs sm:text-sm py-2 h-9"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSolTransfer}
                        disabled={isTransferring}
                        className="flex-1 text-xs sm:text-sm py-2 h-9 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                      >
                        {isTransferring ? 'Sending...' : 'Send SOL'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Receive Dialog - Mobile Optimized */}
              <Dialog open={receiveDialog} onOpenChange={setReceiveDialog}>
                <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto mx-auto my-4 rounded-xl left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                  <DialogHeader className="pb-3 px-1">
                    <DialogTitle className="text-center text-base sm:text-lg">Receive Solana</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 px-1">
                    <div className="text-center">
                      <div className="flex justify-center mb-3">
                        <div className="bg-white p-2 sm:p-4 rounded-lg">
                          <QRCodeSVG 
                            value={walletAddress} 
                            size={window.innerWidth < 640 ? 150 : 200}
                            level="M"
                            includeMargin={true}
                          />
                        </div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <Label className="text-xs sm:text-sm font-medium">Your Wallet Address</Label>
                        <div className="flex items-center gap-2 mt-2 mb-3">
                          <Input
                            readOnly
                            value={walletAddress}
                            className="font-mono text-xs sm:text-sm h-9"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(walletAddress)}
                            className="h-9 px-2"
                          >
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          You can receive any native or non-native tokens on Solana using your wallet address
                        </p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Transfer Success Dialog - Mobile Optimized */}
              <Dialog open={transferSuccessDialog} onOpenChange={setTransferSuccessDialog}>
                <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto mx-auto my-4 rounded-xl left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                  <DialogHeader className="pb-3 px-1">
                    <DialogTitle className="text-center text-base sm:text-lg">Transfer Successful</DialogTitle>
                  </DialogHeader>
                  {transferResult && (
                    <div className="space-y-3 px-1">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                          <span className="text-xs sm:text-sm font-medium text-green-800">Transaction Completed</span>
                        </div>
                        <p className="text-xs text-green-700">
                          Your transfer has been successfully processed
                        </p>
                      </div>
                      
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <Label className="text-muted-foreground">Transaction ID</Label>
                            <p className="font-mono text-xs break-all">{transferResult.transactionId}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Status</Label>
                            <Badge variant="default" className="text-xs">{transferResult.status}</Badge>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">From</Label>
                            <p className="font-mono text-xs">{formatAddress(transferResult.from)}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">To</Label>
                            <p className="font-mono text-xs">{formatAddress(transferResult.to)}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Mint</Label>
                            <p className="font-mono text-xs">{formatAddress(transferResult.mint)}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Amount</Label>
                            <p className="text-xs font-medium">{transferResult.amount}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline"
                          onClick={() => openTransactionInSolscan(transferResult.signature)}
                          className="flex-1 text-xs sm:text-sm py-2 h-9"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">View Transaction</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button 
                          onClick={() => setTransferSuccessDialog(false)}
                          className="flex-1 text-xs sm:text-sm py-2 h-9 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Burn Dialog - Mobile Optimized */}
              <Dialog open={burnDialog} onOpenChange={setBurnDialog}>
                <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto mx-auto my-4 rounded-xl left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                  <DialogHeader className="pb-3 px-1">
                    <DialogTitle className="text-center text-base sm:text-lg">Burn {selectedAsset?.symbol}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 px-1">
                    <div className="bg-muted/30 rounded-lg p-3">
                      <Label htmlFor="burnAmount" className="text-xs sm:text-sm font-medium">Amount to Burn</Label>
                      <Input
                        id="burnAmount"
                        type="number"
                        placeholder="Enter amount to burn"
                        value={burnAmount}
                        onChange={(e) => setBurnAmount(e.target.value)}
                        className="mt-1 text-xs sm:text-sm h-9"
                      />
                    </div>
                    
                    <div className="bg-muted/30 rounded-lg p-3">
                      <Label className="text-xs sm:text-sm font-medium mb-2 block">Quick Select Percentage</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 5, 10, 25, 50, 100].map((percentage) => (
                          <Button
                            key={percentage}
                            variant="outline"
                            size="sm"
                            onClick={() => setBurnPercentage(percentage)}
                            className="text-xs py-1 h-8"
                          >
                            {percentage}%
                          </Button>
                        ))}
                      </div>
                      {selectedAsset && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Available: {selectedAsset.balance.toFixed(10).replace(/\.?0+$/, '')} {selectedAsset.symbol}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setBurnDialog(false)}
                        className="flex-1 text-xs sm:text-sm py-2 h-9"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleBurnSubmit}
                        disabled={isBurning}
                        variant="destructive"
                        className="flex-1 text-xs sm:text-sm py-2 h-9"
                      >
                        {isBurning ? 'Burning...' : 'Burn Tokens'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Burn Success Dialog - Mobile Optimized */}
              <Dialog open={burnSuccessDialog} onOpenChange={setBurnSuccessDialog}>
                <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto mx-auto my-4 rounded-xl left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                  <DialogHeader className="pb-3 px-1">
                    <DialogTitle className="text-center text-base sm:text-lg">Burn Successful</DialogTitle>
                  </DialogHeader>
                  {burnResult && (
                    <div className="space-y-3 px-1">
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Flame className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                          <span className="text-xs sm:text-sm font-medium text-red-800">Tokens Burned Successfully</span>
                        </div>
                        <p className="text-xs text-red-700">
                          Your tokens have been permanently burned from circulation
                        </p>
                      </div>
                      
                      <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="col-span-2">
                            <Label className="text-muted-foreground">Transaction Signature</Label>
                            <p className="font-mono text-xs break-all">{burnResult.signature}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Mint</Label>
                            <p className="font-mono text-xs">{formatAddress(burnResult.mint)}</p>
                          </div>
                          <div>
                            <Label className="text-muted-foreground">Amount Burned</Label>
                            <p className="text-xs font-medium">{burnResult.amount}</p>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-muted-foreground">Operation</Label>
                            <p className="text-xs font-medium capitalize">{burnResult.operation}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline"
                          onClick={() => openTransactionInSolscan(burnResult.signature)}
                          className="flex-1 text-xs sm:text-sm py-2 h-9"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          <span className="hidden sm:inline">View on Solscan</span>
                          <span className="sm:hidden">View</span>
                        </Button>
                        <Button 
                          onClick={() => setBurnSuccessDialog(false)}
                          className="flex-1 text-xs sm:text-sm py-2 h-9 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
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