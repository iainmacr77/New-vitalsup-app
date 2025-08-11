import React, { useState, useEffect } from 'react';
import TopBar from './TopBar';
import SidebarNav from './SidebarNav';
import { useLocation } from 'react-router-dom';

export default function AppShell({ 
  children, 
  nav, 
  user, 
  currentRoute, 
  planLabel = 'Free' 
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const location = useLocation();

  // Auto-collapse sidebar on route change (mobile)
  useEffect(() => {
    setSidebarCollapsed(true);
  }, [location.pathname]);

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
          currentRoute={currentRoute || location.pathname}
          isCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Top Bar */}
          <TopBar
            user={user}
            planLabel={planLabel}
            currentRoute={currentRoute || location.pathname}
            onToggleSidebar={toggleSidebar}
            isCollapsed={sidebarCollapsed}
          />

          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-gray-50/30">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
