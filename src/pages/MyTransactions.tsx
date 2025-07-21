import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, ExternalLink, History, ChevronRight, TrendingUp, TrendingDown, Send, ArrowDownLeft } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Transaction {
  _id: string;
  userId: string;
  signature: string;
  slot: number;
  type: string;
  dex: string;
  mint: string;
  amount: string; // Changed to string since API returns strings
  value: string;  // Changed to string since API returns strings
  name: string;
  symbol: string;
  logo: string;
  from: string;
  to: string;
  status: string;
  created_at: string;
}

interface TransactionResponse {
  success: boolean;
  message: string;
  data: {
    transactions: Transaction[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalTransactions: number;
      limit: number;
    };
  };
}

const MyTransactions = () => {
  const { user, token, loading } = useAuth();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 20;

  // Fetch transactions
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', currentPage],
    queryFn: async (): Promise<TransactionResponse> => {
      console.log('MyTransactions: Fetching transactions for page', currentPage);
      console.log('MyTransactions: Token available:', !!token);
      console.log('MyTransactions: User available:', !!user);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/transactions?page=${currentPage}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('MyTransactions: API response status:', response.status, response.ok);
      
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      console.log('MyTransactions: API data received:', data);
      return data;
    },
    enabled: !!token && !!user, // Only run query when user is authenticated
  });

  console.log('MyTransactions render - loading:', loading, 'user:', !!user, 'token:', !!token, 'isLoading:', isLoading);

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

  const formatAmount = (amount: string) => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return '0';
    return Math.abs(numAmount).toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 10 
    });
  };

  const formatValue = (value: string) => {
    if (!value || value === '') return '$0.00';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '$0.00';
    return `$${numValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 10
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openTransactionInSolscan = (signature: string) => {
    window.open(`https://solscan.io/tx/${signature}`, '_blank');
  };

  const getTransactionIcon = (type: string, amount: string) => {
    const numAmount = parseFloat(amount);
    if (type === 'swap') return <TrendingUp className="h-3 w-3" />;
    if (type === 'send' || numAmount < 0) return <Send className="h-3 w-3" />;
    if (type === 'receive' || numAmount > 0) return <ArrowDownLeft className="h-3 w-3" />;
    return <History className="h-3 w-3" />;
  };

  const getTransactionColor = (type: string, amount: string) => {
    const numAmount = parseFloat(amount);
    if (type === 'swap') return 'text-blue-500';
    if (type === 'send' || numAmount < 0) return 'text-red-500';
    if (type === 'receive' || numAmount > 0) return 'text-green-500';
    return 'text-muted-foreground';
  };

  const handleNextPage = () => {
    if (transactionsData?.data.pagination.currentPage < transactionsData?.data.pagination.totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          
          <main className="flex-1 p-3 sm:p-6">
            <div className="w-full max-w-2xl sm:max-w-4xl md:max-w-6xl lg:max-w-full mx-auto space-y-4 sm:space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-xl sm:text-3xl font-bold">My Transactions</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">Your transaction history</p>
                </div>
              </div>

              <Card>
                <CardHeader className="pb-3 sm:pb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base sm:text-lg">All Transactions</CardTitle>
                      <CardDescription className="text-xs sm:text-sm">
                        {transactionsData?.data.pagination ? 
                          `${transactionsData.data.pagination.totalTransactions} total transactions` : 
                          'Loading...'}
                      </CardDescription>
                    </div>
                    {transactionsData?.data.pagination && (
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Page {transactionsData.data.pagination.currentPage} of {transactionsData.data.pagination.totalPages}
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Card View */}
                      <div className="block md:hidden space-y-3 p-4">
                        {transactionsData?.data.transactions.map((transaction) => (
                          <Card key={transaction._id} className="p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`p-1 rounded-full ${getTransactionColor(transaction.type, transaction.amount)} bg-current/10`}>
                                  {getTransactionIcon(transaction.type, transaction.amount)}
                                </div>
                                <div>
                                  <p className="text-xs font-medium capitalize">{transaction.type}</p>
                                  <p className="text-xs text-muted-foreground">{transaction.dex}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-xs font-medium ${getTransactionColor(transaction.type, transaction.amount)}`}>
                                  {parseFloat(transaction.amount) > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                                </p>
                                <p className="text-xs text-muted-foreground">{formatValue(transaction.value)}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Token</p>
                                <div className="flex items-center gap-1">
                                  {transaction.logo && (
                                    <img src={transaction.logo} alt={transaction.symbol} className="w-4 h-4 rounded-full" />
                                  )}
                                  <span className="font-medium">{transaction.symbol}</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Status</p>
                                <Badge 
                                  variant={transaction.status === 'confirmed' ? 'default' : 'secondary'}
                                  className={`text-xs h-5 ${transaction.status === 'confirmed' ? 'bg-green-500/20 text-green-500' : ''}`}
                                >
                                  {transaction.status}
                                </Badge>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-mono">{formatDate(transaction.created_at)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Signature</p>
                                <p className="font-mono">{formatAddress(transaction.signature)}</p>
                              </div>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openTransactionInSolscan(transaction.signature)}
                              className="w-full h-7 text-xs"
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View on Solscan
                            </Button>
                          </Card>
                        ))}
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden md:block">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Type</TableHead>
                              <TableHead className="text-xs">Token</TableHead>
                              <TableHead className="text-xs">Amount</TableHead>
                              <TableHead className="text-xs">Value</TableHead>
                              <TableHead className="text-xs">DEX</TableHead>
                              <TableHead className="text-xs">Status</TableHead>
                              <TableHead className="text-xs">Date</TableHead>
                              <TableHead className="text-xs">Signature</TableHead>
                              <TableHead className="text-xs">Action</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {transactionsData?.data.transactions.map((transaction) => (
                              <TableRow key={transaction._id}>
                                <TableCell className="py-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1 rounded-full ${getTransactionColor(transaction.type, transaction.amount)} bg-current/10`}>
                                      {getTransactionIcon(transaction.type, transaction.amount)}
                                    </div>
                                    <span className="text-xs font-medium capitalize">{transaction.type}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="py-2">
                                  <div className="flex items-center gap-2">
                                    {transaction.logo && (
                                      <img src={transaction.logo} alt={transaction.symbol} className="w-4 h-4 rounded-full" />
                                    )}
                                    <div>
                                      <p className="text-xs font-medium">{transaction.symbol}</p>
                                      <p className="text-xs text-muted-foreground truncate max-w-20">{transaction.name}</p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="py-2">
                                   <span className={`text-xs font-medium ${getTransactionColor(transaction.type, transaction.amount)}`}>
                                     {parseFloat(transaction.amount) > 0 ? '+' : ''}{formatAmount(transaction.amount)}
                                  </span>
                                </TableCell>
                                <TableCell className="py-2">
                                  <span className="text-xs">{formatValue(transaction.value)}</span>
                                </TableCell>
                                <TableCell className="py-2">
                                  <span className="text-xs">{transaction.dex}</span>
                                </TableCell>
                                <TableCell className="py-2">
                                  <Badge 
                                    variant={transaction.status === 'confirmed' ? 'default' : 'secondary'}
                                    className={`text-xs h-5 ${transaction.status === 'confirmed' ? 'bg-green-500/20 text-green-500' : ''}`}
                                  >
                                    {transaction.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-2">
                                  <span className="text-xs font-mono">{formatDate(transaction.created_at)}</span>
                                </TableCell>
                                <TableCell className="py-2">
                                  <span className="text-xs font-mono">{formatAddress(transaction.signature)}</span>
                                </TableCell>
                                <TableCell className="py-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openTransactionInSolscan(transaction.signature)}
                                    className="h-6 px-2 text-xs"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {transactionsData?.data.transactions.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No transactions found</p>
                        </div>
                      )}

                      {/* Pagination */}
                      {transactionsData?.data.pagination && transactionsData.data.pagination.totalPages > 1 && (
                        <div className="border-t p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, transactionsData.data.pagination.totalTransactions)} of {transactionsData.data.pagination.totalTransactions}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 h-7 px-3 text-xs"
                              >
                                <ChevronRight className="h-3 w-3 rotate-180" />
                                <span className="hidden sm:inline">Previous</span>
                                <span className="sm:hidden">Prev</span>
                              </Button>
                              <div className="text-xs text-muted-foreground px-2">
                                {currentPage} / {transactionsData.data.pagination.totalPages}
                              </div>
                              <Button
                                onClick={handleNextPage}
                                disabled={currentPage >= transactionsData.data.pagination.totalPages}
                                className="flex items-center gap-1 h-7 px-3 text-xs"
                              >
                                <span className="hidden sm:inline">Next</span>
                                <span className="sm:hidden">Next</span>
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MyTransactions;