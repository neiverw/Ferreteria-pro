import React from 'react';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth-context';
import { SystemSettingsProvider } from '@/components/system-settings-context';
import { ThemeProvider } from '@/components/theme-provider';
import { RegisterHeader } from '@/components/register/RegisterHeader';
import { RegisterWizard } from '@/components/register/RegisterWizard';
import { Toaster } from '@/components/ui/sonner';
import '@/app/register/global.css';

export const metadata: Metadata = {
  title: 'Registrar Mi Ferretería - Ferretería PRO',
  description: 'Crea la cuenta de tu ferretería en menos de 2 minutos. Control de inventario, facturación POS y punto de venta en la nube.',
};

export default function RegisterPage() {
  return (
    <AuthProvider>
      <SystemSettingsProvider>
        <ThemeProvider>
          <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500 selection:text-white">
            <RegisterHeader />
            <main>
              <RegisterWizard />
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </SystemSettingsProvider>
    </AuthProvider>
  );
}
