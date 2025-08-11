import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Menu, Settings, User, LogOut, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function TopBar({ 
  user, 
  planLabel, 
  currentRoute, 
  onToggleSidebar,
  isCollapsed 
}) {
  const getPageTitle = (route) => {
    const routeMap = {
      '/dashboard': 'Dashboard',
      '/profile': 'My Profile',
      '/template': 'Template Settings',
      '/email-settings': 'Email Settings',
      '/article-feed': 'Article Feed',
      '/newsletters/history': 'Newsletter History',
      '/content': 'Content Lab',
      '/users': 'User Management',
      '/triage': 'Triage',
      '/billing': 'Billing'
    };
    return routeMap[route] || 'VitalsUp';
  };

  const getUserInitials = (name) => {
    if (!name) return 'GU'; // Guest User fallback
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <style jsx>{`
        :root {
          --brand-start: #FF2A8A;
          --brand-end: #3663FF;
          --brand: #7A54F6;
        }
        .brand-gradient {
          background-image: linear-gradient(135deg, var(--brand-start), var(--brand-end));
        }
        .header-divider {
          background: linear-gradient(90deg, transparent, var(--brand), transparent);
          opacity: 0.1;
        }
      `}</style>
      
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 sm:px-6 h-16">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-gray-100/80 transition-colors"
              onClick={onToggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center">
                <div className="w-4 h-4 bg-white rounded-sm opacity-90"></div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-gray-900">
                  {getPageTitle(currentRoute)}
                </h1>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Plan Badge */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full brand-gradient"></div>
                <Badge 
                  variant="secondary" 
                  className="text-xs font-medium px-3 py-1 bg-gray-50/80 border-gray-200/60"
                >
                  {planLabel} Plan
                </Badge>
              </div>
              <Link to={createPageUrl("billing")}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-gray-600 hover:text-gray-900 h-7 px-2 hover:bg-gray-100/60"
                >
                  <CreditCard className="w-3 h-3 mr-1" />
                  Manage
                </Button>
              </Link>
            </div>

            {/* Notifications */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative hover:bg-gray-100/60 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></div>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-gray-100/60">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                    <AvatarFallback className="brand-gradient text-white text-sm font-medium">
                      {getUserInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user?.name || 'Guest User'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'no-email@example.com'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <Link to={createPageUrl("profile")}>
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link to={createPageUrl("email-settings")}>
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                <Link to={createPageUrl("billing")}>
                  <DropdownMenuItem className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Gradient Divider */}
        <div className="h-px header-divider"></div>
      </header>
    </>
  );
}
