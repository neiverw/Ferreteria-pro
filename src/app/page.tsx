import React from 'react';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth-context';
import { SystemSettingsProvider } from '@/components/system-settings-context';
import { ThemeProvider } from '@/components/theme-provider';
import { LandingClientWrapper } from '@/components/landing/LandingClientWrapper';
import { Toaster } from '@/components/ui/sonner';
import '@/app/landing/global.css';

export const metadata: Metadata = {
  title: 'Ferretería PRO - Sistema Cloud POS & Control de Inventario SaaS',
  description: 'Plataforma SaaS por suscripción todo en uno para ferreterías, almacenes de construcción y depósitos de materiales. Prueba gratis por 14 días.',
  keywords: ['ferreteria saas', 'pos ferreteria', 'sistema suscripcion ferreteria', 'control inventario ferreteria', 'software ferretero cloud'],
};

export default function HomePage() {
  return (
    <AuthProvider>
      <SystemSettingsProvider>
        <ThemeProvider>
          <LandingClientWrapper />
          <Toaster />
        </ThemeProvider>
      </SystemSettingsProvider>
    </AuthProvider>
  );
}