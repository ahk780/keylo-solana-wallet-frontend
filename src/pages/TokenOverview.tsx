import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, ExternalLink, Copy, CheckCircle, XCircle, Users, TrendingUp, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TokenData {
  ca: string;
  name: string;
  symbol: string;
  image: string;
  description?: string;
  socials: {
    telegram?: string;
    twitter?: string;
    website?: string;
  };
  decimals: string;
  supply: string;
  mintAuthority?: string;
  freezeAuthority?: string;
  updateAuthority: string;
  creators: Array<{
    address: string;
    verified: boolean;
    share: string;
  }>;
  isToken2022: boolean;
  top10HoldersBalance: string;
  top10HoldersPercent: string;
  top20HoldersBalance: string;
  top20HoldersPercent: string;
  dex: string;
  poolId?: string;
  liquidity?: string;
  priceInSol: string;
  priceInUsd: string;
  bondingCurveProgress?: string;
  marketCap: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: TokenData;
}

const TokenOverview = () => {
  const { user, token, loading } = useAuth();
  const { toast } = useToast();
  const [mintAddress, setMintAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSearch = async () => {
    if (!mintAddress.trim()) {
      toast({
        title: "Error",
        description: "Please enter a mint address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setTokenData(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/token/overview/${mintAddress}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result: ApiResponse = await response.json();

      if (result.success) {
        setTokenData(result.data);
        toast({
          title: "Success",
          description: "Token overview retrieved successfully",
        });
      } else {
        setError(result.message);
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("Failed to fetch token data");
      toast({
        title: "Error",
        description: "Failed to fetch token data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const formatNumber = (num: string | number) => {
    const number = typeof num === 'string' ? parseFloat(num) : num;
    if (number >= 1e9) return (number / 1e9).toFixed(2) + 'B';
    if (number >= 1e6) return (number / 1e6).toFixed(2) + 'M';
    if (number >= 1e3) return (number / 1e3).toFixed(2) + 'K';
    return number.toFixed(6);
  };

  return (
    <SidebarProvider defaultOpen className="w-full">
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background to-muted/20">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <DashboardHeader />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6 space-y-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Token Overview
                </h1>
                <p className="text-muted-foreground">
                  Analyze any Solana token by entering its mint address
                </p>
              </div>

              {/* Search Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Token Analysis
                  </CardTitle>
                  <CardDescription>
                    Enter a Solana token mint address to get detailed overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      placeholder="Enter token mint address..."
                      value={mintAddress}
                      onChange={(e) => setMintAddress(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSearch}
                      disabled={isLoading}
                      className="min-w-[120px]"
                    >
                      {isLoading ? "Searching..." : "Analyze"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Error Display */}
              {error && (
                <Card className="border-destructive">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-destructive">
                      <XCircle className="h-5 w-5" />
                      <span>{error}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Token Data Display */}
              {tokenData && (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <img 
                          src={tokenData.image} 
                          alt={tokenData.name}
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <h3 className="text-xl">{tokenData.name}</h3>
                          <p className="text-muted-foreground text-sm">{tokenData.symbol}</p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Contract Address</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted p-2 rounded truncate">
                              {tokenData.ca}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(tokenData.ca)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium">DEX</p>
                          <Badge variant="secondary">{tokenData.dex}</Badge>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Decimals</p>
                          <p className="text-sm">{tokenData.decimals}</p>
                        </div>
                      </div>

                      {/* Socials */}
                      {(tokenData.socials.twitter || tokenData.socials.telegram || tokenData.socials.website) && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Social Links</p>
                            <div className="flex gap-2 flex-wrap">
                              {tokenData.socials.website && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(tokenData.socials.website, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Website
                                </Button>
                              )}
                              {tokenData.socials.twitter && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(tokenData.socials.twitter, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Twitter
                                </Button>
                              )}
                              {tokenData.socials.telegram && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => window.open(tokenData.socials.telegram, '_blank')}
                                >
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Telegram
                                </Button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Price & Market Data */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Price Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Price (USD)</p>
                          <p className="text-lg font-semibold">${formatNumber(tokenData.priceInUsd)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Price (SOL)</p>
                          <p className="text-sm">{formatNumber(tokenData.priceInSol)} SOL</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Market Cap</p>
                          <p className="text-sm font-medium">${formatNumber(tokenData.marketCap)}</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Supply & Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Total Supply</p>
                          <p className="text-sm font-medium">{formatNumber(tokenData.supply)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Top 10 Holders</p>
                          <p className="text-sm">{tokenData.top10HoldersPercent}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Top 20 Holders</p>
                          <p className="text-sm">{tokenData.top20HoldersPercent}%</p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Technical Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {tokenData.liquidity && (
                          <div>
                            <p className="text-xs text-muted-foreground">Liquidity</p>
                            <p className="text-sm font-medium">{formatNumber(tokenData.liquidity)} SOL</p>
                          </div>
                        )}
                        {tokenData.bondingCurveProgress && (
                          <div>
                            <p className="text-xs text-muted-foreground">Bonding Curve Progress</p>
                            <p className="text-sm">{parseFloat(tokenData.bondingCurveProgress).toFixed(2)}%</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground">Token Standard</p>
                          <Badge variant={tokenData.isToken2022 ? "default" : "secondary"}>
                            {tokenData.isToken2022 ? "Token 2022" : "SPL Token"}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Authorities & Creators */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Token Authorities</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Mint Authority</p>
                          <div className="flex items-center gap-2">
                            {tokenData.mintAuthority ? (
                              <>
                                <code className="text-xs bg-muted p-2 rounded truncate flex-1">
                                  {tokenData.mintAuthority}
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(tokenData.mintAuthority!)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Revoked
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Freeze Authority</p>
                          <div className="flex items-center gap-2">
                            {tokenData.freezeAuthority ? (
                              <>
                                <code className="text-xs bg-muted p-2 rounded truncate flex-1">
                                  {tokenData.freezeAuthority}
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(tokenData.freezeAuthority!)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Badge variant="outline" className="text-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Revoked
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium">Update Authority</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted p-2 rounded truncate flex-1">
                              {tokenData.updateAuthority}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(tokenData.updateAuthority)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Creators</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {tokenData.creators.map((creator, index) => (
                            <div key={index} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Creator {index + 1}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant={creator.verified ? "default" : "secondary"}>
                                    {creator.verified ? (
                                      <>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Verified
                                      </>
                                    ) : (
                                      "Unverified"
                                    )}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{creator.share}%</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <code className="text-xs bg-muted p-2 rounded truncate flex-1">
                                  {creator.address}
                                </code>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(creator.address)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default TokenOverview;