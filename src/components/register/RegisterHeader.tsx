import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wrench, ArrowLeft, LogIn } from 'lucide-react';

interface RegisterHeaderProps {
  onOpenLoginModal?: () => void;
}

export function RegisterHeader({ onOpenLoginModal }: RegisterHeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Volver a la portada</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white">
              <Wrench className="h-4 w-4" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white">FERRETERÍA</span>
              <span className="ml-1 rounded bg-amber-500/20 px-1 py-0.5 text-[10px] font-bold text-amber-400 border border-amber-500/30">PRO</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-slate-400">¿Ya tienes una ferretería registrada?</span>
          <Link href="/app">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white text-xs h-9"
            >
              <LogIn className="h-3.5 w-3.5 mr-1.5" />
              <span>Iniciar Sesión</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
