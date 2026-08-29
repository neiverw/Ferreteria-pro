import type { Metadata } from 'next';
import { AppLayoutProviders } from '@/components/app/AppLayoutProviders';

export const metadata: Metadata = {
  title: 'Sistema de Gestión | Ferretería PRO',
  description: 'Panel de administración y control POS para ferreterías',
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutProviders>{children}</AppLayoutProviders>;
}
