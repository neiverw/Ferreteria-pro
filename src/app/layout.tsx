import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/globals.css';
import '@/index.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://ferreteriapro.com'), // Cambiar por tu dominio real
  title: {
    default: 'Cargando...',
    template: '%s | SGI'
  },
  description: 'Sistema completo de gestión empresarial para ferreterías. Control de inventario, facturación, proveedores, clientes y reportes en tiempo real.',
  keywords: ['ferretería', 'inventario', 'facturación', 'gestión empresarial', 'sistema POS', 'control de stock', 'proveedores', 'clientes'],
  authors: [{ name: 'Ferretería Pro' }],
  creator: 'Ferretería Pro',
  publisher: 'Ferretería Pro',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://ferreteriapro.com',
    title: 'Ferretería Pro - Sistema de Gestión e Inventario',
    description: 'Sistema completo de gestión empresarial para ferreterías. Control de inventario, facturación, proveedores y reportes.',
    siteName: 'Ferretería Pro',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ferretería Pro - Sistema de Gestión',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ferretería Pro - Sistema de Gestión e Inventario',
    description: 'Sistema completo de gestión empresarial para ferreterías',
    images: ['/og-image.png'],
  },
  robots: {
    index: false, // Cambiar a true si quieres que sea indexado
    follow: false, // Cambiar a true si es un sitio público
    googleBot: {
      index: false,
      follow: false,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    // Agregar tokens de verificación cuando estén disponibles
    // google: 'google-site-verification-code',
    // yandex: 'yandex-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#09090b" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}