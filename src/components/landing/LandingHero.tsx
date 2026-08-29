import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { HeroPreviewCard } from './HeroPreviewCard';
import { ArrowRight, CheckCircle2, Sparkles, Star } from 'lucide-react';

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[600px] rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 h-[350px] w-[350px] rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-semibold text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>SaaS de Gestión Integral para Ferreterías & Materiales</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Controla tu inventario, ventas y facturación en una <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">sola plataforma</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0">
              Ferretería PRO es el sistema de gestión todo en uno creado especialmente para ferreterías, depósitos y almacenes de construcción. Dile adiós a las pérdidas de stock y vende hasta 3x más rápido.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base px-8 h-12 shadow-xl shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Registrar Mi Ferretería Gratis</span>
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="#features" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white h-12 px-6"
                >
                  Conocer Funcionalidades
                </Button>
              </a>
            </div>

            {/* Micro guarantees */}
            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Activación instantánea en 2 minutos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Sin tarjeta de crédito requerida</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Migración de Excel asistida</span>
              </div>
            </div>

            {/* Social proof rating */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-center lg:justify-start gap-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs text-slate-300">
                <strong className="text-white font-semibold">4.9 / 5.0</strong> por más de 1.250 administradores de ferretería
              </span>
            </div>
          </div>

          {/* Right Column: Interactive Card */}
          <div className="lg:col-span-5">
            <HeroPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}
