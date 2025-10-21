"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { InventoryDashboard } from '@/components/inventory-dashboard';
import { SuppliersManagement } from '@/components/suppliers-management';
import { BillingSystem } from '@/components/billing-system';
import { DashboardOverview } from '@/components/dashboard-overview';
import { CustomerManagement } from '@/components/customer-management';
import { ReportsSystem } from '@/components/reports-system';
import { SettingsSystem } from '@/components/settings-system';
import { AuthProvider, useAuth, usePermissions } from '@/components/auth-context';
import { SystemSettingsProvider } from '@/components/system-settings-context';
import { LoginScreen } from '@/components/login-screen';
import { useSystemSettings } from '@/components/system-settings-context';
import { DynamicTitle } from '@/components/dynamic-title';
import { formatColombiaDate } from '@/lib/date-utils';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  Users, 
  Settings, 
  BarChart3,
  Wrench,
  Menu,
  LogOut,
  Crown,
  User,
  CreditCard
} from 'lucide-react';

type ActiveView = 'dashboard' | 'inventory' | 'billing' | 'customers' | 'reports' | 'settings' | 'suppliers';

const navigationItems = [
  { id: 'dashboard' as ActiveView, label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
  { id: 'inventory' as ActiveView, label: 'Inventario', icon: Package, permission: 'inventory' },
  { id: 'suppliers' as ActiveView, label: 'Proveedores', icon: Users, permission: 'suppliers' },
  { id: 'billing' as ActiveView, label: 'Facturación', icon: FileText, permission: 'billing' },
  { id: 'customers' as ActiveView, label: 'Clientes', icon: Users, permission: 'customers' },
  { id: 'reports' as ActiveView, label: 'Reportes', icon: BarChart3, permission: 'reports' },
  { id: 'settings' as ActiveView, label: 'Configuración', icon: Settings, permission: 'settings' },
];

function AppSidebar({ activeView, setActiveView }: { 
  activeView: ActiveView; 
  setActiveView: (view: ActiveView) => void; 
}) {
  const { canAccess, userRole } = usePermissions();
  const { settings: systemSettings } = useSystemSettings();
  
  // Filtrar elementos de navegación según permisos
  const allowedItems = navigationItems.filter(item => canAccess(item.permission));
  
  // Obtener el nombre de la empresa de las configuraciones
  const companyName = systemSettings?.companyName || 'Sistema de Gestión';

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-lg">
            <Wrench className="h-4 w-4" />
          </div>
          <div>
            <h2 className="font-bold">{companyName}</h2>
            <p className="text-sm text-muted-foreground">Sistema de Gestión</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <nav className="space-y-2 p-4">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveView(item.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </nav>
        
        {/* Información del rol del usuario */}
        <div className="mt-auto p-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {userRole === 'admin' && <Crown className="h-4 w-4 text-yellow-600" />}
            {userRole === 'cajero' && <CreditCard className="h-4 w-4 text-green-600" />}
            {userRole === 'bodega' && <Package className="h-4 w-4 text-blue-600" />}
            <span>Perfil: {userRole}</span>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

function AppMain() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const { user, logout } = useAuth();
  const { canAccess, userRole } = usePermissions();

  // Verificar si el usuario tiene acceso a la vista actual al cambiar de usuario
  React.useEffect(() => {
    if (user && !canAccess(activeView)) {
      // Redirigir a la primera vista permitida
      const allowedItems = navigationItems.filter(item => canAccess(item.permission));
      if (allowedItems.length > 0) {
        setActiveView(allowedItems[0].id);
      }
    }
  }, [user, activeView, canAccess]);

  // Función mejorada para cambiar de vista con verificación de permisos
  const handleViewChange = (view: ActiveView) => {
    const item = navigationItems.find(item => item.id === view);
    if (item && canAccess(item.permission)) {
      setActiveView(view);
    }
  };

  const renderContent = () => {
    // Verificar si el usuario tiene permisos para la vista actual
    const currentItem = navigationItems.find(item => item.id === activeView); 
    if (currentItem && !canAccess(currentItem.permission)) {
      return (
        <div className="flex items-center justify-center h-96">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Acceso Restringido</CardTitle>
              <CardDescription>No tienes permisos para acceder a esta sección</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Badge variant="destructive">Sin Permisos</Badge>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Renderizar todos los componentes pero solo mostrar el activo
    // Esto evita el desmontaje y mantiene el estado/datos cargados
    return (
      <>
        <div style={{ display: activeView === 'dashboard' ? 'block' : 'none' }}>
          {canAccess('dashboard') && <DashboardOverview />}
        </div>
        <div style={{ display: activeView === 'inventory' ? 'block' : 'none' }}>
          {canAccess('inventory') && <InventoryDashboard />}
        </div>
        <div style={{ display: activeView === 'suppliers' ? 'block' : 'none' }}>
          {canAccess('suppliers') && <SuppliersManagement />}
        </div>
        <div style={{ display: activeView === 'billing' ? 'block' : 'none' }}>
          {canAccess('billing') && <BillingSystem />}
        </div>
        <div style={{ display: activeView === 'customers' ? 'block' : 'none' }}>
          {canAccess('customers') && <CustomerManagement />}
        </div>
        <div style={{ display: activeView === 'reports' ? 'block' : 'none' }}>
          {canAccess('reports') && <ReportsSystem />}
        </div>
        <div style={{ display: activeView === 'settings' ? 'block' : 'none' }}>
          {canAccess('settings') && <SettingsSystem />}
        </div>
      </>
    );
  };

  const getPageTitle = () => {
    const item = navigationItems.find(item => item.id === activeView);
    return item ? item.label : 'Dashboard';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <AppSidebar activeView={activeView} setActiveView={handleViewChange} />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SidebarTrigger>
                <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
              </div>
              <div className="flex items-center gap-4">
                {/* Info del usuario */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-lg">
                    {userRole === 'admin' && <Crown className="h-4 w-4 text-yellow-600" />}
                    {userRole === 'cajero' && <CreditCard className="h-4 w-4 text-green-600" />}
                    {userRole === 'bodega' && <Package className="h-4 w-4 text-blue-600" />}
                    <span className="text-sm font-medium">{user?.name}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Salir
                  </Button>
                </div>
                <Badge variant="outline">
                  {formatColombiaDate()}
                </Badge>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AppMain />;
}

export default function HomePage() {
  return (
    <AuthProvider>
      <SystemSettingsProvider>
        <DynamicTitle />
        <AppContent />
        <Toaster />
      </SystemSettingsProvider>
    </AuthProvider>
  );
}