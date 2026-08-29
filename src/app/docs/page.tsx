import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ApiDocsViewer } from '@/components/docs/ApiDocsViewer';

export const metadata: Metadata = {
  title: 'Documentación de la API (Docs)',
  description: 'Documentación interactiva de la API REST para Ferretería Pro (solo desarrollo local).',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DocsPage() {
  // Restringir acceso exclusivamente a entorno de desarrollo local
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return (
    <main className="min-h-screen w-full">
      <ApiDocsViewer />
    </main>
  );
}
