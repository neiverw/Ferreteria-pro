"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarHeader } from '@/components/ui/sidebar';
import { usePermissions } from '@/components/auth-context';
import { useSystemSettings } from '@/components/system-settings-context';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Settings,
  BarChart3,
  Wrench,
  Crown,
  CreditCard,
  Palette,
  Home,
} from 'lucide-react';

export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/app', icon: LayoutDashboard, permission: 'dashboard' },
  { id: 'inventory', label: 'Inventario', href: '/app/inventory', icon: Package, permission: 'inventory' },
  { id: 'suppliers', label: 'Proveedores', href: '/app/suppliers', icon: Users, permission: 'suppliers' },
  { id: 'billing', label: 'Facturación', href: '/app/billing', icon: FileText, permission: 'billing' },
  { id: 'customers', label: 'Clientes', href: '/app/customers', icon: Users, permission: 'customers' },
  { id: 'reports', label: 'Reportes', href: '/app/reports', icon: BarChart3, permission: 'reports' },
  { id: 'settings', label: 'Configuración', href: '/app/settings', icon: Settings, permission: 'settings' },
];

export const userNavigationItems = [
  { id: 'preferences', label: 'Preferencias', href: '/app/preferences', icon: Palette },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { canAccess, userRole } = usePermissions();
  const { settings: systemSettings } = useSystemSettings();

  const allowedItems = navigationItems.filter(item => canAccess(item.permission));
  const companyName = systemSettings?.companyName || 'Ferretería PRO';

  const isItemActive = (href: string) => {
    if (href === '/app') {
      return pathname === '/app' || pathname === '/app/dashboard';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-lg">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight">{companyName}</h2>
              <p className="text-xs text-muted-foreground">Sistema Cloud POS</p>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <nav className="space-y-1.5 p-3">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);
            return (
              <Button
                key={item.id}
                variant={active ? "default" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              </Button>
            );
          })}

          <div className="border-t my-2" />

          {userNavigationItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.href);
            return (
              <Button
                key={item.id}
                variant={active ? "default" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              </Button>
            );
          })}

          <div className="border-t my-2" />

          <Button variant="outline" className="w-full justify-start text-xs border-dashed" asChild>
            <Link href="/">
              <Home className="h-3.5 w-3.5 mr-2" />
              Ver Landing Page
            </Link>
          </Button>
        </nav>

        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {userRole === 'admin' && <Crown className="h-4 w-4 text-yellow-600" />}
            {userRole === 'cajero' && <CreditCard className="h-4 w-4 text-green-600" />}
            {userRole === 'bodega' && <Package className="h-4 w-4 text-blue-600" />}
            <span>Rol: <strong className="text-foreground capitalize">{userRole}</strong></span>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
