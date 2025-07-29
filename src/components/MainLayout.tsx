import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWebSocket } from '@/components/realtime/WebSocketManager';
import { 
  Home, 
  Bot, 
  Code, 
  Database, 
  FileText, 
  Settings, 
  BarChart3, 
  Users, 
  Upload, 
  Folder, 
  Terminal, 
  GitBranch,
  Search,
  Bell,
  User,
  LogOut,
  Activity,
  Wifi,
  WifiOff,
  Zap,
  Brain,
  MessageSquare,
  Layers,
  Package,
  Play,
  BookOpen,
  HelpCircle
} from 'lucide-react';

const navigationItems = [
  {
    title: "Main",
    items: [
      { title: "Dashboard", url: "/", icon: Home },
      { title: "AI Builder", url: "/ai-builder", icon: Zap },
      { title: "AI Chat", url: "/chat", icon: Bot },
      { title: "Code Editor", url: "/editor", icon: Code },
      { title: "Projects", url: "/projects", icon: FileText },
    ]
  },
  {
    title: "Development",
    items: [
      { title: "Code Executor", url: "/code-executor", icon: Play },
      { title: "Templates", url: "/templates", icon: Folder },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Production Test", url: "/production-test", icon: Settings },
    ]
  }
];

function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        {navigationItems.map((group, groupIndex) => (
          <SidebarGroup key={groupIndex}>
            <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => navigate(item.url)}
                      className={isActive(item.url) ? "bg-primary text-primary-foreground" : ""}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}

export function MainLayout() {
  const { user, signOut } = useAuth();
  const { isConnected, connectionState } = useWebSocket();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getConnectionIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Global Header */}
        <header className="sticky top-0 z-50 h-14 bg-background border-b border-border flex items-center px-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Sovereign IDE</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                DeepSeek AI
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                RAG 2.0
              </Badge>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {getConnectionIcon()}
              <span className="text-xs text-muted-foreground capitalize">
                {connectionState}
              </span>
            </div>
            
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="sm">
              <GitBranch className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4" />
              <span className="hidden md:inline">{user?.email}</span>
            </div>
            
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <main className="flex-1">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}