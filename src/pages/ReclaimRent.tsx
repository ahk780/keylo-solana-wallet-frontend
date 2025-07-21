import { useState, useEffect } from "react";
import { ArrowLeft, ExternalLink, AlertCircle, DollarSign } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";

interface EmptyAccount {
  mint: string;
  name: string;
  symbol: string;
  logo: string;
  token_account: string;
  rent: number;
}

interface EmptyAccountsResponse {
  success: boolean;
  message: string;
  data: {
    emptyAccounts: EmptyAccount[];
    totalAccounts: number;
    totalRentRecoverable: number;
  };
}

interface CloseResponse {
  success: boolean;
  message: string;
  data: {
    signature: string;
    mint: string;
    operation: string;
  };
}

export default function ReclaimRent() {
  const { user, token, loading: authLoading } = useAuth();
  const [emptyAccounts, setEmptyAccounts] = useState<EmptyAccount[]>([]);
  const [totalRentRecoverable, setTotalRentRecoverable] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<EmptyAccount | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [claimingRent, setClaimingRent] = useState(false);
  const [closeResponse, setCloseResponse] = useState<CloseResponse | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("ReclaimRent useEffect running", { token: !!token, user: !!user });
    if (token && user) {
      console.log("Calling fetchEmptyAccounts...");
      fetchEmptyAccounts();
    }
  }, [token, user]);

  const fetchEmptyAccounts = async () => {
    console.log("fetchEmptyAccounts called");
    try {
      setLoading(true);
      console.log("Making API call to fetch empty accounts...");
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/token/empty-accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      console.log("API response:", response.status, response.ok);
      const data: EmptyAccountsResponse = await response.json();
      console.log("API data:", data);
      
      if (data.success) {
        console.log("Setting empty accounts:", data.data.emptyAccounts.length);
        setEmptyAccounts(data.data.emptyAccounts);
        setTotalRentRecoverable(data.data.totalRentRecoverable);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch empty accounts",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching empty accounts:", error);
      toast({
        title: "Error",
        description: "Failed to connect to the server",
        variant: "destructive",
      });
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleClaimRent = (account: EmptyAccount) => {
    setSelectedAccount(account);
    setConfirmDialogOpen(true);
  };

  const confirmClaimRent = async () => {
    if (!selectedAccount) return;

    try {
      setClaimingRent(true);
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/token/close`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mint: selectedAccount.mint,
        }),
      });

      const data: CloseResponse = await response.json();

      if (data.success) {
        setCloseResponse(data);
        setConfirmDialogOpen(false);
        setSuccessDialogOpen(true);
        // Remove the claimed account from the list
        setEmptyAccounts(prev => prev.filter(acc => acc.mint !== selectedAccount.mint));
        setTotalRentRecoverable(prev => prev - selectedAccount.rent);
        toast({
          title: "Success",
          description: data.message,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to claim rent",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process the request",
        variant: "destructive",
      });
    } finally {
      setClaimingRent(false);
    }
  };

  const getSolscanUrl = (signature: string) => {
    return `https://solscan.io/tx/${signature}`;
  };

  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <DashboardHeader />
            <main className="flex-1 p-3 sm:p-6">
              <div className="max-w-full mx-auto space-y-3 sm:space-y-6 px-2 sm:px-4">
                <div className="mb-6">
                  <h1 className="text-xl sm:text-3xl font-bold">Reclaim Rent</h1>
                  <p className="text-sm sm:text-base text-muted-foreground mt-2">
                    Close empty token accounts and recover your rent deposits. Each token account holds approximately 0.002 SOL in rent that can be reclaimed.
                  </p>
                </div>
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Loading empty accounts...</div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <DashboardHeader />
          <main className="flex-1 p-3 sm:p-6">
            <div className="max-w-full mx-auto space-y-3 sm:space-y-6 px-2 sm:px-4">
              <div className="mb-6">
                <h1 className="text-xl sm:text-3xl font-bold">Reclaim Rent</h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-2">
                  Close empty token accounts and recover your rent deposits. Each token account holds approximately 0.002 SOL in rent that can be reclaimed.
                </p>
              </div>

              <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Rent Recovery Summary
            </CardTitle>
            <CardDescription>
              Total rent recoverable from {emptyAccounts.length} empty token accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {totalRentRecoverable.toFixed(8)} SOL
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              ≈ ${(totalRentRecoverable * 200).toFixed(2)} USD (estimated)
            </div>
          </CardContent>
        </Card>

        {emptyAccounts.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Empty Accounts Found</h3>
              <p className="text-muted-foreground text-center">
                You don't have any empty token accounts to reclaim rent from.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {emptyAccounts.map((account) => (
              <Card key={account.mint}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={account.logo}
                        alt={account.name}
                        className="w-12 h-12 rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      <div>
                        <h3 className="font-semibold">{account.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{account.symbol}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {account.mint.slice(0, 8)}...{account.mint.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary">
                        {account.rent.toFixed(8)} SOL
                      </div>
                      <Button
                        onClick={() => handleClaimRent(account)}
                        className="mt-2"
                        size="sm"
                      >
                        Claim Rent
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
            )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Rent Claim</DialogTitle>
            <DialogDescription>
              Are you sure you want to close this token account and claim the rent?
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="py-4">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={selectedAccount.logo}
                  alt={selectedAccount.name}
                  className="w-10 h-10 rounded-full"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
                  }}
                />
                <div>
                  <h4 className="font-semibold">{selectedAccount.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedAccount.symbol}</p>
                </div>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">You will receive:</p>
                <p className="text-lg font-bold text-primary">
                  {selectedAccount.rent.toFixed(8)} SOL
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={claimingRent}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmClaimRent}
              disabled={claimingRent}
            >
              {claimingRent ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rent Claimed Successfully!</DialogTitle>
            <DialogDescription>
              Your token account has been closed and rent has been recovered.
            </DialogDescription>
          </DialogHeader>
          {closeResponse && (
            <div className="py-4">
              <div className="bg-primary/10 p-4 rounded-lg space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Transaction Signature:</p>
                  <p className="text-xs font-mono break-all">{closeResponse.data.signature}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Operation:</p>
                  <p className="text-sm font-semibold">{closeResponse.data.operation}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setSuccessDialogOpen(false)}
              className="flex-1"
            >
              Close
            </Button>
            {closeResponse && (
              <Button
                onClick={() => window.open(getSolscanUrl(closeResponse.data.signature), "_blank")}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Solscan
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}