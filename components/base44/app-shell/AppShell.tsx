import React, { useState, useEffect } from 'react';
import TopBar from './TopBar';
import SidebarNav from './SidebarNav';
import { usePathname } from 'next/navigation';

interface AppShellProps {
  children: React.ReactNode;
  nav: Array<{ label: string; href: string; locked?: boolean; badge?: string }>;
  user?: any;
  currentRoute?: string;
  planLabel?: string;
}

export default function AppShell({ 
  children, 
  nav, 
  user, 
  currentRoute, 
  planLabel = 'Free' 
}: AppShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const pathname = usePathname();

  // Auto-collapse sidebar on route change (mobile)
  useEffect(() => {
    setSidebarCollapsed(true);
  }, [pathname]);

  // Handle responsive sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <SidebarNav
          nav={nav}
          currentRoute={currentRoute || pathname}
          isCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top Bar */}
          <TopBar
            user={user}
            planLabel={planLabel}
            currentRoute={currentRoute || pathname}
            onToggleSidebar={toggleSidebar}
            isCollapsed={sidebarCollapsed}
          />

          {/* Page Content - Using consistent container styling */}
          <main className="flex-1 overflow-auto bg-gray-50/30">
            <div className="max-w-screen-xl mx-auto px-6 sm:px-8 py-6 sm:py-8 space-y-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
