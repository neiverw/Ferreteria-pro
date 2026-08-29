"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Package, BarChart3, Check, ArrowRight, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingModulesShowcase() {
  const [activeModule, setActiveModule] = useState<'pos' | 'inventory' | 'reports'>('pos');

  const modulesData = {
    pos: {
      title: 'Módulo de Facturación POS y Caja',
      subtitle: 'Emite facturas de mostrador en menos de 5 segundos con cálculo automático de impuestos y descuentos.',
      bullets: [
        'Búsqueda por código de barras, nombre o categoría.',
        'Múltiples métodos de pago (Efectivo, Tarjeta, Transferencia, Crédito).',
        'Cierre de caja diario ciego para evitar descuadres.',
        'Impresión térmica en tirillas 80mm o formato PDF.',
      ],
      tag: 'Velocidad de Mostrador',
      statLabel: 'Tiempo promedio por factura',
      statValue: '4.2 seg',
    },
    inventory: {
      title: 'Módulo de Inventario y Almacén',
      subtitle: 'Control en tiempo real de miles de referencias, ubicaciones en estanterías y alertas de reposición.',
      bullets: [
        'Alertas inteligentes antes de que se agote el stock crítico.',
        'Manejo de unidades por bulto, kilo, metro o unidad.',
        'Historial completo de entradas, salidas y ajustes de inventario.',
        'Importación masiva desde Excel con 1 solo clic.',
      ],
      tag: 'Control Absoluto',
      statLabel: 'Reducción de pérdidas por merma',
      statValue: '-45%',
    },
    reports: {
      title: 'Módulo de Analítica y Finanzas',
      subtitle: 'Gráficas en tiempo real de ventas, márgenes brutos y productos estrella para tomar decisiones informadas.',
      bullets: [
        'Dashboard ejecutivo con ventas comparativas día vs mes anterior.',
        'Ranking de productos más vendidos y de mayor margen.',
        'Reportes de cartera vencida y estado de cuentas de clientes.',
        'Exportación inmediata para contabilidad en Excel y PDF.',
      ],
      tag: 'Decisiones Estratégicas',
      statLabel: 'Ahorro de horas en cierres contables',
      statValue: '12 hrs/mes',
    },
  };

  const current = modulesData[activeModule];

  return (
    <section id="modules" className="py-20 bg-slate-900/60 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-3.5 py-1 rounded-full">
            Explora la Plataforma
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Módulos integrados sin necesidad de software extra
          </h2>
          <p className="mt-2 text-slate-400">
            Todo funciona de manera unificada y en la nube. Cambia entre módulos con un solo clic.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-xl bg-slate-950 p-1.5 border border-slate-800">
            <button
              onClick={() => setActiveModule('pos')}
              className={`flex items-center gap-2 rounded-lg px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                activeModule === 'pos'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Punto de Venta POS</span>
            </button>
            <button
              onClick={() => setActiveModule('inventory')}
              className={`flex items-center gap-2 rounded-lg px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                activeModule === 'inventory'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="h-4 w-4" />
              <span>Inventario y Stock</span>
            </button>
            <button
              onClick={() => setActiveModule('reports')}
              className={`flex items-center gap-2 rounded-lg px-4 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold transition-all ${
                activeModule === 'reports'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Reportes y Analítica</span>
            </button>
          </div>
        </div>

        {/* Active Module Panel */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block rounded-md bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400 border border-blue-500/20">
                {current.tag}
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                {current.title}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {current.subtitle}
              </p>
              <ul className="space-y-3">
                {current.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <Link href="/register">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20">
                    <span>Configurar mi ferretería ahora</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 text-center space-y-4 shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {current.statLabel}
                </p>
                <div className="text-5xl font-black text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text">
                  {current.statValue}
                </div>
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 text-left space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Layers className="h-4 w-4" />
                    <span>Compatibilidad de Mostrador</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Optimizado para lectores de códigos de barra, impresoras térmicas POS y computadores de caja.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
