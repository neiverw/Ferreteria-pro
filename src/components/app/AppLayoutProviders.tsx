"use client";

import React, { ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/components/auth-context';
import { SystemSettingsProvider } from '@/components/system-settings-context';
import { ThemeProvider } from '@/components/theme-provider';
import { LoginScreen } from '@/components/login-screen';
import { DynamicTitle } from '@/components/dynamic-title';
import { AppLayoutShell } from '@/components/app/AppLayoutShell';

function AppLayoutContent({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AppLayoutShell>{children}</AppLayoutShell>;
}

export function AppLayoutProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <SystemSettingsProvider>
        <ThemeProvider>
          <DynamicTitle />
          <AppLayoutContent>{children}</AppLayoutContent>
          <Toaster />
        </ThemeProvider>
      </SystemSettingsProvider>
    </AuthProvider>
  );
}
