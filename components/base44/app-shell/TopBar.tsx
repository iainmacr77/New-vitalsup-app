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
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TopBar({ 
  user, 
  planLabel, 
  currentRoute, 
  onToggleSidebar,
  isCollapsed 
}) {
  const router = useRouter();
  
  const getPageTitle = (route: string) => {
    const routeMap: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/dashboard/profile': 'My Profile',
      '/dashboard/template': 'Template Settings',
      '/dashboard/email-settings': 'Email Settings',
      '/dashboard/articles': 'Article Feed',
      '/dashboard/history': 'Newsletter History',
      '/dashboard/content-lab': 'Content Lab',
      '/dashboard/users': 'User Management',
      '/dashboard/triage': 'Triage'
    };
    return routeMap[route] || 'VitalsUp';
  };

  const getUserInitials = (name: string | undefined) => {
    if (!name) return 'GU'; // Guest User fallback
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = async () => {
    // TODO: Implement logout logic
    router.push('/login');
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
        <div className="flex items-center justify-between px-4 sm:px-6 h-20">
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
            
            {/* Page Title */}
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">
                {getPageTitle(currentRoute)}
              </h1>
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
              <Link href="/dashboard/profile">
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
                <Link href="/dashboard/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/email-settings">
                  <DropdownMenuItem className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                </Link>
                <Link href="/dashboard/profile">
                  <DropdownMenuItem className="cursor-pointer">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
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
