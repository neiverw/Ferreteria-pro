"use client";

import React, { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth, usePermissions } from '@/components/auth-context';
import { formatColombiaDate } from '@/lib/date-utils';
import { AppSidebar, navigationItems, userNavigationItems } from './AppSidebar';
import { Menu, LogOut, Crown, CreditCard, Package } from 'lucide-react';

interface AppLayoutShellProps {
  children: ReactNode;
}

export function AppLayoutShell({ children }: AppLayoutShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { userRole } = usePermissions();

  const getPageTitle = () => {
    if (pathname === '/app' || pathname === '/app/dashboard') return 'Dashboard';
    const foundNav = navigationItems.find(item => item.href === pathname);
    if (foundNav) return foundNav.label;
    const foundUserNav = userNavigationItems.find(item => item.href === pathname);
    if (foundUserNav) return foundUserNav.label;
    return 'Panel de Control';
  };

  return (
    <SidebarProvider>
      <div className="grid h-screen bg-background w-full" style={{ gridTemplateColumns: 'auto 1fr' }}>
        <AppSidebar />
        
        <main className="flex flex-col overflow-hidden w-full min-w-0" style={{ width: '100%', minWidth: 0 }}>
          <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 w-full">
            <div className="flex items-center justify-between px-2 sm:px-4 py-3 sm:py-4 gap-2">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <SidebarTrigger>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SidebarTrigger>
                <h1 className="text-base sm:text-xl font-semibold truncate">{getPageTitle()}</h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-primary/10 rounded-lg">
                  {userRole === 'admin' && <Crown className="h-4 w-4 text-yellow-600" />}
                  {userRole === 'cajero' && <CreditCard className="h-4 w-4 text-green-600" />}
                  {userRole === 'bodega' && <Package className="h-4 w-4 text-blue-600" />}
                  <span className="text-xs sm:text-sm font-medium">{user?.name}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => logout()} className="px-2 sm:px-4">
                  <LogOut className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Salir</span>
                </Button>
                <Badge variant="outline" className="hidden md:flex">
                  {formatColombiaDate()}
                </Badge>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto w-full min-w-0 bg-background">
            <div className="p-3 sm:p-4 md:p-6 w-full flex justify-center">
              <div className="w-full lg:max-w-[90%] xl:max-w-[85%] 2xl:max-w-[80%]">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
