"use client"

import React from 'react';
import { usePathname } from 'next/navigation';
import { isInternalRoute } from '@/lib/route-utils';
import AppShell from './app-shell/AppShell';
import { NAV_ITEMS } from './app-shell/types';
import { SidebarProvider } from '@/components/ui/sidebar';

interface AppShellWrapperProps {
  children: React.ReactNode;
}

export default function AppShellWrapper({ children }: AppShellWrapperProps) {
  const pathname = usePathname();

  // Check if this is an internal route that should get the AppShell
  const shouldUseAppShell = isInternalRoute(pathname);

  // For public routes, render children normally
  if (!shouldUseAppShell) {
    return <>{children}</>;
  }

  // For internal routes, render AppShell wrapped with SidebarProvider
  return (
    <SidebarProvider>
      <AppShell
        nav={NAV_ITEMS}
        user={null}
        currentRoute={pathname}
        planLabel="Free"
      >
        {children}
      </AppShell>
    </SidebarProvider>
  );
}
