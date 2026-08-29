"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Wrench, Menu, X, ArrowRight } from 'lucide-react';

interface LandingNavbarProps {
  onOpenLogin: () => void;
  isAuthenticated?: boolean;
}

export function LandingNavbar({ onOpenLogin, isAuthenticated }: LandingNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md shadow-blue-500/20 text-white">
            <Wrench className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white">FERRETERÍA</span>
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">PRO</span>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-slate-400">SaaS Cloud POS</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-white transition-colors">Características</a>
          <a href="#modules" className="hover:text-white transition-colors">Módulos</a>
          <a href="#pricing" className="hover:text-white transition-colors">Planes y Precios</a>
          <a href="#testimonials" className="hover:text-white transition-colors">Casos de Éxito</a>
          <a href="#faq" className="hover:text-white transition-colors">Preguntas Frecuentes</a>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <Link href="/app">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30">
                <span>Ir al Sistema</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={onOpenLogin}
              >
                Iniciar Sesión
              </Button>
              <Link href="/register">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20">
                  <span>Registrar Ferretería</span>
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 text-slate-400 hover:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Alternar Menú"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 pt-2 pb-6 space-y-3">
          <a
            href="#features"
            className="block py-2 text-sm font-medium text-slate-300 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Características
          </a>
          <a
            href="#modules"
            className="block py-2 text-sm font-medium text-slate-300 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Módulos
          </a>
          <a
            href="#pricing"
            className="block py-2 text-sm font-medium text-slate-300 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Planes y Precios
          </a>
          <a
            href="#faq"
            className="block py-2 text-sm font-medium text-slate-300 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            Preguntas Frecuentes
          </a>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full border-slate-700 text-slate-200 hover:bg-slate-800"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLogin();
              }}
            >
              Iniciar Sesión
            </Button>
            <Link href="/register" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Registrar Ferretería
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
