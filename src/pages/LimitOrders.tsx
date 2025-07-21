import { useState, useEffect } from "react";
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Edit, Trash2, Info, RefreshCw, ChevronDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

interface LimitOrder {
  _id: string;
  userId: string;
  mint: string;
  name: string;
  symbol: string;
  logo: string;
  amount: number;
  dex: string;
  orderType: "high" | "low";
  triggerPrice: number;
  currentPrice: number;
  slippage: number;
  tip: number;
  signature: string | null;
  type: "buy" | "sell";
  status: "waiting" | "triggered" | "failed";
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: LimitOrder[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalOrders: number;
    limit: number;
  };
}

export default function LimitOrders() {
  const { user, token, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<LimitOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<LimitOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qaOpen, setQaOpen] = useState(false);
  const { toast } = useToast();

  console.log('LimitOrders - Auth state:', { user: !!user, token: !!token, authLoading });
  console.log('LimitOrders - Orders:', orders.length);
  console.log('LimitOrders - Loading:', loading);

  // Create order form state
  const [createForm, setCreateForm] = useState({
    mint: "",
    amount: "",
    dex: "jupiter",
    order_type: "high",
    trigger_price: "",
    slippage: "10",
    tip: "0.001",
    type: "buy"
  });

  // Edit order form state
  const [editForm, setEditForm] = useState({
    amount: "",
    trigger_price: "",
    slippage: "",
    tip: ""
  });

  const fetchOrders = async () => {
    try {
      console.log('LimitOrders - Fetching orders with token:', !!token);
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/orders?page=1&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log('LimitOrders - API response status:', response.status);
      const data: ApiResponse = await response.json();
      console.log('LimitOrders - API response data:', data);
      
      if (data.success) {
        setOrders(data.data);
        console.log('LimitOrders - Set orders:', data.data.length);
      } else {
        console.error('LimitOrders - API error:', data.message);
        toast({
          title: "Error",
          description: "Failed to fetch orders",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('LimitOrders - Fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('LimitOrders - useEffect triggered with:', { token: !!token, user: !!user });
    if (token && user) {
      console.log('LimitOrders - Calling fetchOrders');
      fetchOrders();
    } else {
      console.log('LimitOrders - Not fetching orders, missing token or user');
      setLoading(false);
    }
  }, [token, user]);

  const handleCreateOrder = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/orders`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: (
            <div>
              <p>{data.message}</p>
              <div className="mt-2 space-y-1 text-xs">
                <p><strong>Order ID:</strong> {data.data._id}</p>
                <p><strong>Token:</strong> {data.data.name} ({data.data.symbol})</p>
                <p><strong>Amount:</strong> {data.data.amount}</p>
                <p><strong>Type:</strong> {data.data.type.toUpperCase()}</p>
                <p><strong>Order Type:</strong> {data.data.orderType.toUpperCase()}</p>
                <p><strong>Trigger Price:</strong> ${formatPrice(data.data.triggerPrice, window.innerWidth < 768)}</p>
                <p><strong>Current Price:</strong> ${formatPrice(data.data.currentPrice, window.innerWidth < 768)}</p>
                <p><strong>Status:</strong> {data.data.status.toUpperCase()}</p>
              </div>
            </div>
          ),
        });
        setCreateForm({
          mint: "",
          amount: "",
          dex: "jupiter",
          order_type: "high",
          trigger_price: "",
          slippage: "10",
          tip: "0.001",
          type: "buy"
        });
        setIsCreateDialogOpen(false);
        fetchOrders();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to create order",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditOrder = async () => {
    if (!editingOrder) return;

    try {
      setIsSubmitting(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/orders/${editingOrder._id}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(editForm.amount),
          trigger_price: parseFloat(editForm.trigger_price),
          slippage: parseFloat(editForm.slippage),
          tip: parseFloat(editForm.tip),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: (
            <div>
              <p>{data.message}</p>
              <div className="mt-2 space-y-1 text-xs">
                <p><strong>Order ID:</strong> {data.data._id}</p>
                <p><strong>Updated Amount:</strong> {data.data.amount}</p>
                <p><strong>Updated Trigger Price:</strong> ${formatPrice(data.data.triggerPrice, window.innerWidth < 768)}</p>
                <p><strong>Current Price:</strong> ${formatPrice(data.data.currentPrice, window.innerWidth < 768)}</p>
                <p><strong>Status:</strong> {data.data.status.toUpperCase()}</p>
              </div>
            </div>
          ),
        });
        setIsEditDialogOpen(false);
        setEditingOrder(null);
        fetchOrders();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update order",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/user/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: (
            <div>
              <p>{data.message}</p>
              <div className="mt-2 space-y-1 text-xs">
                <p><strong>Deleted Order ID:</strong> {data.data._id}</p>
                <p><strong>Token:</strong> {data.data.name} ({data.data.symbol})</p>
                <p><strong>Amount:</strong> {data.data.amount}</p>
                <p><strong>Type:</strong> {data.data.type.toUpperCase()}</p>
              </div>
            </div>
          ),
        });
        fetchOrders();
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to delete order",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (order: LimitOrder) => {
    setEditingOrder(order);
    setEditForm({
      amount: order.amount.toString(),
      trigger_price: order.triggerPrice.toString(),
      slippage: order.slippage.toString(),
      tip: order.tip.toString(),
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "waiting":
        return "secondary";
      case "triggered":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatPrice = (price: number, isMobile: boolean = false): string => {
    if (price === 0) return "0";
    
    // For mobile, use max 6 decimals; for desktop, use max 10 decimals
    const maxDecimals = isMobile ? 6 : 10;
    
    // If price is very small (less than 0.000001), use scientific notation on mobile
    if (isMobile && price < 0.000001 && price > 0) {
      return price.toExponential(3);
    }
    
    // For normal cases, format with appropriate decimal places
    if (price >= 1) {
      return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    } else {
      // Count leading zeros to determine appropriate decimal places
      const str = price.toString();
      const decimalIndex = str.indexOf('.');
      if (decimalIndex === -1) return price.toString();
      
      const afterDecimal = str.substring(decimalIndex + 1);
      const leadingZeros = afterDecimal.match(/^0*/)?.[0]?.length || 0;
      
      // Use more decimals for smaller numbers, but respect the mobile limit
      const dynamicDecimals = Math.min(leadingZeros + 4, maxDecimals);
      return price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: dynamicDecimals });
    }
  };

  // Redirect if not logged in
  if (authLoading) {
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
            <TooltipProvider>
              <div className="max-w-full mx-auto space-y-3 sm:space-y-6 px-2 sm:px-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-xl sm:text-3xl font-bold">Limit Orders</h1>
                    <p className="text-sm sm:text-base text-muted-foreground">Manage your automated trading orders</p>
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <Button onClick={fetchOrders} variant="outline" size="sm" className="p-2 sm:p-3">
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="text-xs sm:text-sm px-2 sm:px-4">
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Create Limit Order</span>
                          <span className="sm:hidden">Create</span>
                        </Button>
                      </DialogTrigger>
                       <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto mx-auto my-4 rounded-xl left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                         <DialogHeader className="pb-3 px-1">
                           <DialogTitle className="text-base sm:text-xl font-bold text-center">Create Limit Order</DialogTitle>
                           <DialogDescription className="text-xs text-center text-muted-foreground px-2">
                             Automated trading when conditions are met
                           </DialogDescription>
                         </DialogHeader>
                         <TooltipProvider>
                         <div className="space-y-3 px-1">
                           {/* Essential Fields Section */}
                           <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                             <div>
                               <Label htmlFor="mint" className="text-xs font-medium">Token Address *</Label>
                               <Input
                                 id="mint"
                                 value={createForm.mint}
                                 onChange={(e) => setCreateForm(prev => ({ ...prev, mint: e.target.value }))}
                                 placeholder="Enter mint address"
                                 className="mt-1 text-xs h-9 font-mono"
                               />
                             </div>
                             
                             <div className="grid grid-cols-2 gap-2">
                               <div>
                                 <Label htmlFor="amount" className="text-xs font-medium">Amount *</Label>
                                 <Input
                                   id="amount"
                                   type="number"
                                   value={createForm.amount}
                                   onChange={(e) => setCreateForm(prev => ({ ...prev, amount: e.target.value }))}
                                   placeholder="0.0"
                                   className="mt-1 text-xs h-9"
                                 />
                               </div>
                               <div>
                                 <Label htmlFor="trigger_price" className="text-xs font-medium">Trigger Price *</Label>
                                 <Input
                                   id="trigger_price"
                                   type="number"
                                   step="any"
                                   value={createForm.trigger_price}
                                   onChange={(e) => setCreateForm(prev => ({ ...prev, trigger_price: e.target.value }))}
                                   placeholder="0.000001"
                                   className="mt-1 text-xs h-9"
                                 />
                               </div>
                             </div>
                           </div>

                           {/* Trading Options Section */}
                           <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                             <div className="grid grid-cols-2 gap-2">
                               <div className="flex flex-col">
                                 <Label htmlFor="dex" className="text-xs font-medium mb-1">DEX *</Label>
                                 <Select value={createForm.dex} onValueChange={(value) => setCreateForm(prev => ({ ...prev, dex: value }))}>
                                   <SelectTrigger className="text-xs h-9">
                                     <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="z-50 bg-popover border shadow-lg">
                                     <SelectItem value="raydium" className="text-xs">Raydium</SelectItem>
                                     <SelectItem value="meteora" className="text-xs">Meteora</SelectItem>
                                     <SelectItem value="pumpfun" className="text-xs">PumpFun</SelectItem>
                                     <SelectItem value="jupiter" className="text-xs">Jupiter</SelectItem>
                                   </SelectContent>
                                 </Select>
                               </div>
                               <div className="flex flex-col">
                                 <div className="flex items-center gap-1 mb-1">
                                   <Label htmlFor="order_type" className="text-xs font-medium">Order Type *</Label>
                                   <Tooltip delayDuration={0}>
                                     <TooltipTrigger asChild>
                                       <Button variant="ghost" size="sm" className="h-3 w-3 p-0" type="button">
                                         <Info className="h-2 w-2 text-muted-foreground" />
                                       </Button>
                                     </TooltipTrigger>
                                     <TooltipContent side="top" className="max-w-xs z-50 text-xs">
                                       <p><strong>High:</strong> Buy when price ≥ trigger<br/><strong>Low:</strong> Buy when price ≤ trigger</p>
                                     </TooltipContent>
                                   </Tooltip>
                                 </div>
                                 <Select value={createForm.order_type} onValueChange={(value) => setCreateForm(prev => ({ ...prev, order_type: value }))}>
                                   <SelectTrigger className="text-xs h-9">
                                     <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="z-50 bg-popover border shadow-lg">
                                     <SelectItem value="high" className="text-xs">High</SelectItem>
                                     <SelectItem value="low" className="text-xs">Low</SelectItem>
                                   </SelectContent>
                                 </Select>
                               </div>
                             </div>

                             <div className="grid grid-cols-3 gap-2">
                               <div>
                                 <Label htmlFor="type" className="text-xs font-medium">Type</Label>
                                 <Select value={createForm.type} onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}>
                                   <SelectTrigger className="mt-1 text-xs h-9">
                                     <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="z-50">
                                     <SelectItem value="buy" className="text-xs">Buy</SelectItem>
                                     <SelectItem value="sell" className="text-xs">Sell</SelectItem>
                                   </SelectContent>
                                 </Select>
                               </div>
                               <div>
                                 <Label htmlFor="slippage" className="text-xs font-medium">Slippage %</Label>
                                 <Input
                                   id="slippage"
                                   type="number"
                                   step="0.1"
                                   min="0"
                                   max="50"
                                   value={createForm.slippage}
                                   onChange={(e) => setCreateForm(prev => ({ ...prev, slippage: e.target.value }))}
                                   placeholder="10"
                                   className="mt-1 text-xs h-9"
                                 />
                               </div>
                               <div>
                                 <Label htmlFor="tip" className="text-xs font-medium">Tip SOL</Label>
                                 <Input
                                   id="tip"
                                   type="number"
                                   step="0.0001"
                                   min="0"
                                   value={createForm.tip}
                                   onChange={(e) => setCreateForm(prev => ({ ...prev, tip: e.target.value }))}
                                   placeholder="0.001"
                                   className="mt-1 text-xs h-9"
                                 />
                               </div>
                             </div>
                           </div>

                           <Button 
                             onClick={handleCreateOrder} 
                             className="w-full mt-3 text-xs font-medium py-2.5 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                             disabled={isSubmitting}
                           >
                             {isSubmitting ? (
                               <div className="flex items-center gap-2">
                                 <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
                                 Creating Order...
                               </div>
                             ) : (
                               "Create Limit Order"
                             )}
                           </Button>
                         </div>
                         </TooltipProvider>
                       </DialogContent>
                    </Dialog>
                  </div>
                </div>

                {/* Q&A Section */}
                <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                  <Collapsible open={qaOpen} onOpenChange={setQaOpen}>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3 sm:py-6">
                        <CardTitle className="text-sm sm:text-lg flex items-center justify-between">
                          How to create limit orders for Solana?
                          <ChevronDown className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform ${qaOpen ? 'rotate-180' : ''}`} />
                        </CardTitle>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="py-2 sm:py-4">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          <strong>Answer:</strong> To place limit orders for SOL, use the mint address: <code className="bg-muted px-1 rounded text-xs">So11111111111111111111111111111111111111112</code>
                          <br />
                          Make sure you have sufficient SOL for transaction fees and enough USDC or USDT in your wallet if you want to buy SOL at a lower price, or sell SOL when it reaches a higher price.
                        </p>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>

                {/* Orders List */}
                {loading ? (
                  <div className="flex justify-center items-center py-4 sm:py-8">
                    <RefreshCw className="h-4 w-4 sm:h-6 sm:w-6 animate-spin" />
                  </div>
                ) : orders.length === 0 ? (
                  <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
                    <CardContent className="py-4 sm:py-8 text-center">
                      <p className="text-sm sm:text-base text-muted-foreground">No limit orders found</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid gap-2 sm:gap-4">
                    {orders.map((order) => (
                      <Card key={order._id} className="bg-card/50 backdrop-blur-sm border-primary/20">
                        <CardContent className="p-3 sm:p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2 sm:gap-4">
                              <img
                                src={order.logo}
                                alt={order.name}
                                className="w-8 h-8 sm:w-12 sm:h-12 rounded-full"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg";
                                }}
                              />
                              <div>
                                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                  <h3 className="font-semibold text-sm sm:text-base">{order.name}</h3>
                                  <Badge variant="outline" className="text-xs">{order.symbol}</Badge>
                                  <Badge variant={getStatusBadgeVariant(order.status)} className="text-xs">
                                    {order.status.toUpperCase()}
                                  </Badge>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  {order.type.toUpperCase()} • {order.orderType.toUpperCase()} • {order.dex.toUpperCase()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex gap-1 sm:gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openEditDialog(order)}
                                className="p-1 sm:p-2"
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="p-1 sm:p-2">
                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="mx-2 sm:mx-auto">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-sm sm:text-base">Delete Order</AlertDialogTitle>
                                    <AlertDialogDescription className="text-xs sm:text-sm">
                                      Are you sure you want to delete this limit order? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="text-xs sm:text-sm">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteOrder(order._id)} className="text-xs sm:text-sm">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>

                           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mt-2 sm:mt-4">
                             <div>
                               <Label className="text-xs text-muted-foreground">Amount</Label>
                               <p className="font-medium text-xs sm:text-sm">{order.amount}</p>
                             </div>
                             <div>
                               <Label className="text-xs text-muted-foreground">Trigger Price</Label>
                               <p className="font-medium text-xs sm:text-sm">${formatPrice(order.triggerPrice, window.innerWidth < 768)}</p>
                             </div>
                             <div>
                               <Label className="text-xs text-muted-foreground">Current Price</Label>
                               <p className="font-medium text-xs sm:text-sm">${formatPrice(order.currentPrice, window.innerWidth < 768)}</p>
                             </div>
                             <div>
                               <Label className="text-xs text-muted-foreground">Slippage</Label>
                               <p className="font-medium text-xs sm:text-sm">{order.slippage}%</p>
                             </div>
                             <div>
                               <Label className="text-xs text-muted-foreground">Jito Tip</Label>
                               <p className="font-medium text-xs sm:text-sm">{order.tip} SOL</p>
                             </div>
                             <div>
                               <Label className="text-xs text-muted-foreground">Created</Label>
                               <p className="font-medium text-xs">{formatDate(order.createdAt)}</p>
                             </div>
                           </div>

                          <div className="mt-2 sm:mt-4 pt-2 sm:pt-4 border-t">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs">
                              <div>
                                <Label className="text-muted-foreground text-xs">Order ID:</Label>
                                <p className="font-mono break-all text-xs">{order._id}</p>
                              </div>
                              <div>
                                <Label className="text-muted-foreground text-xs">Mint:</Label>
                                <p className="font-mono break-all text-xs">{order.mint}</p>
                              </div>
                              {order.signature && (
                                <div className="col-span-1 sm:col-span-2">
                                  <Label className="text-muted-foreground text-xs">Signature:</Label>
                                  <p className="font-mono break-all text-xs">{order.signature}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Edit Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogContent className="max-w-md mx-2 sm:mx-auto">
                    <DialogHeader className="pb-2 sm:pb-4">
                      <DialogTitle className="text-lg sm:text-xl">Edit Limit Order</DialogTitle>
                      <DialogDescription className="text-xs sm:text-sm">
                        Update the amount and trigger price for your existing limit order.
                      </DialogDescription>
                    </DialogHeader>
                     <div className="space-y-2 sm:space-y-4">
                       <div>
                         <Label htmlFor="edit_amount" className="text-xs sm:text-sm">Amount</Label>
                         <Input
                           id="edit_amount"
                           type="number"
                           value={editForm.amount}
                           onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                           className="text-xs sm:text-sm"
                         />
                       </div>
                       
                       <div>
                         <Label htmlFor="edit_trigger_price" className="text-xs sm:text-sm">Trigger Price</Label>
                         <Input
                           id="edit_trigger_price"
                           type="number"
                           step="any"
                           value={editForm.trigger_price}
                           onChange={(e) => setEditForm(prev => ({ ...prev, trigger_price: e.target.value }))}
                           className="text-xs sm:text-sm"
                         />
                       </div>

                       <div>
                         <Label htmlFor="edit_slippage" className="text-xs sm:text-sm">Slippage (%)</Label>
                         <Input
                           id="edit_slippage"
                           type="number"
                           step="0.1"
                           min="0"
                           max="50"
                           value={editForm.slippage}
                           onChange={(e) => setEditForm(prev => ({ ...prev, slippage: e.target.value }))}
                           className="text-xs sm:text-sm"
                         />
                       </div>

                       <div>
                         <Label htmlFor="edit_tip" className="text-xs sm:text-sm">Jito Tip (SOL)</Label>
                         <Input
                           id="edit_tip"
                           type="number"
                           step="0.0001"
                           min="0"
                           value={editForm.tip}
                           onChange={(e) => setEditForm(prev => ({ ...prev, tip: e.target.value }))}
                           className="text-xs sm:text-sm"
                         />
                       </div>

                       <Button 
                         onClick={handleEditOrder} 
                         className="w-full text-xs sm:text-sm py-2 sm:py-3"
                         disabled={isSubmitting}
                       >
                         {isSubmitting ? "Updating..." : "Update Order"}
                       </Button>
                     </div>
                  </DialogContent>
                </Dialog>
              </div>
            </TooltipProvider>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}