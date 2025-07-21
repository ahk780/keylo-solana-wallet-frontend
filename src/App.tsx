import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyAssets from "./pages/MyAssets";
import MyTransactions from "./pages/MyTransactions";
import TradingMenu from "./pages/TradingMenu";
import LimitOrders from "./pages/LimitOrders";
import TokenOverview from "./pages/TokenOverview";
import Trending from "./pages/Trending";
import ReclaimRent from "./pages/ReclaimRent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<MyAssets />} />
            <Route path="/transactions" element={<MyTransactions />} />
            <Route path="/trading" element={<TradingMenu />} />
            <Route path="/limit-orders" element={<LimitOrders />} />
            <Route path="/token-overview" element={<TokenOverview />} />
            <Route path="/trending" element={<Trending />} />
            <Route path="/reclaim-rent" element={<ReclaimRent />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
