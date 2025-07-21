import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Coins,
  BarChart3,
  History,
  ListOrdered,
  Search,
  Settings,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Trading Menu",
    url: "/trading",
    icon: TrendingUp,
  },
  {
    title: "Limit Orders",
    url: "/limit-orders",
    icon: ListOrdered,
  },
  {
    title: "Token Overview",
    url: "/token-overview",
    icon: Search,
  },
  {
    title: "Trending",
    url: "/trending",
    icon: BarChart3,
  },
  {
    title: "My Assets",
    url: "/assets",
    icon: Coins,
  },
  {
    title: "My Transactions",
    url: "/transactions",
    icon: History,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const [moreToolsOpen, setMoreToolsOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(path);
  };

  const getNavClass = (path: string) =>
    isActive(path) 
      ? "bg-gradient-to-r from-primary/20 to-secondary/10 text-primary border-r-4 border-primary font-semibold shadow-lg backdrop-blur-sm" 
      : "hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/5 text-sidebar-foreground hover:text-primary transition-all duration-300 hover:shadow-md hover:backdrop-blur-sm";

  return (
    <Sidebar className="border-r border-sidebar-border/60 bg-gradient-to-b from-sidebar-background to-sidebar-background/95 backdrop-blur-xl shadow-xl">
      <SidebarContent className="bg-transparent">
        <div className="p-6 border-b border-sidebar-border/30">
          <h2 className="text-xl font-bold text-gradient-primary tracking-wide">
            Trading Hub
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Professional Dashboard
          </p>
        </div>
        
        <SidebarGroup className="px-4 py-6">
          <SidebarGroupLabel className="text-xs font-bold text-primary uppercase tracking-[0.1em] px-3 py-3 mb-2 bg-primary/5 rounded-lg border border-primary/10">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full shadow-glow-primary"></div>
              Navigation
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 mt-4">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={`${getNavClass(item.url)} rounded-xl py-4 px-4 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group`}
                  >
                    <NavLink to={item.url} end={item.url === "/dashboard"}>
                      <div className="flex items-center w-full">
                        <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
                          isActive(item.url) 
                            ? "bg-primary/20 shadow-glow-primary" 
                            : "bg-sidebar-accent/50 group-hover:bg-primary/10 group-hover:shadow-glow-primary"
                        }`}>
                          <item.icon className={`w-5 h-5 transition-all duration-300 ${
                            isActive(item.url) ? "text-primary" : "text-sidebar-foreground group-hover:text-primary"
                          }`} />
                        </div>
                        {state !== "collapsed" && (
                          <div className="flex flex-col">
                            <span className={`font-semibold text-sm tracking-wide transition-all duration-300 ${
                              isActive(item.url) ? "text-primary" : "text-sidebar-foreground group-hover:text-primary"
                            }`}>
                              {item.title}
                            </span>
                            {isActive(item.url) && (
                              <div className="w-6 h-0.5 bg-gradient-to-r from-primary to-secondary rounded-full mt-1 shadow-glow-primary"></div>
                            )}
                          </div>
                        )}
                      </div>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              {/* More Tools Dropdown */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setMoreToolsOpen(!moreToolsOpen)}
                  className={`${getNavClass("/more-tools")} rounded-xl py-4 px-4 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] group cursor-pointer`}
                >
                  <div className="flex items-center w-full">
                    <div className={`p-2 rounded-lg mr-4 transition-all duration-300 ${
                      moreToolsOpen 
                        ? "bg-primary/20 shadow-glow-primary" 
                        : "bg-sidebar-accent/50 group-hover:bg-primary/10 group-hover:shadow-glow-primary"
                    }`}>
                      <Settings className={`w-5 h-5 transition-all duration-300 ${
                        moreToolsOpen ? "text-primary" : "text-sidebar-foreground group-hover:text-primary"
                      }`} />
                    </div>
                    {state !== "collapsed" && (
                      <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                          <span className={`font-semibold text-sm tracking-wide transition-all duration-300 ${
                            moreToolsOpen ? "text-primary" : "text-sidebar-foreground group-hover:text-primary"
                          }`}>
                            More Tools
                          </span>
                        </div>
                        {moreToolsOpen ? (
                          <ChevronDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-sidebar-foreground group-hover:text-primary" />
                        )}
                      </div>
                    )}
                  </div>
                </SidebarMenuButton>
                
                {moreToolsOpen && state !== "collapsed" && (
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton
                        asChild
                        className="hover:bg-primary/10 hover:text-primary transition-all duration-300 rounded-lg"
                      >
                        <NavLink to="/reclaim-rent">
                          <span className="text-sm">Reclaim Rent</span>
                        </NavLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t border-sidebar-border/30">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-xl border border-primary/20 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-accent rounded-full animate-pulse shadow-glow-secondary"></div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-primary">Connected</span>
                <span className="text-xs text-muted-foreground">Solana Network</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}