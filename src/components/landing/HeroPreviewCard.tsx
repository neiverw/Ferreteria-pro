"use client";

import React, { useState } from 'react';
import { Package, TrendingUp, AlertTriangle, CheckCircle2, ShoppingCart, BarChart2 } from 'lucide-react';

export function HeroPreviewCard() {
  const [activeTab, setActiveTab] = useState<'pos' | 'stock'>('pos');

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-900/90 p-4 sm:p-6 shadow-2xl shadow-blue-500/10 backdrop-blur-xl">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80" />
          <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <div className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs font-mono text-slate-400">demo.ferreteriapro.cloud</span>
        </div>
        <div className="flex rounded-lg bg-slate-800/80 p-1 border border-slate-700/50 text-xs">
          <button
            onClick={() => setActiveTab('pos')}
            className={`rounded px-3 py-1 font-medium transition-all ${
              activeTab === 'pos' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Punto de Venta POS
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`rounded px-3 py-1 font-medium transition-all ${
              activeTab === 'stock' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Control de Stock
          </button>
        </div>
      </div>

      {activeTab === 'pos' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-lg bg-slate-800/60 p-2.5 border border-slate-700/40">
              <span className="text-slate-400">Venta del Día</span>
              <p className="text-base font-bold text-emerald-400">$3.840.500</p>
            </div>
            <div className="rounded-lg bg-slate-800/60 p-2.5 border border-slate-700/40">
              <span className="text-slate-400">Facturas Hoy</span>
              <p className="text-base font-bold text-white">48 ventas</p>
            </div>
            <div className="rounded-lg bg-slate-800/60 p-2.5 border border-slate-700/40">
              <span className="text-slate-400">Margen Promedio</span>
              <p className="text-base font-bold text-amber-400">38.5%</p>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-3 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span>Última Factura #FAC-10482</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Pagado - Efectivo
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Taladro Percutor Bosch 650W (x1)</span>
                <span className="font-semibold text-white">$245.000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Disco Corte Metal 4 1/2 Dewalt (x5)</span>
                <span className="font-semibold text-white">$32.500</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Cemento Gris Argos 50kg (x2)</span>
                <span className="font-semibold text-white">$64.000</span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
              <span className="text-slate-200">Total Venta:</span>
              <span className="text-blue-400">$341.500 COP</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3 text-xs">
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-medium">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>3 productos alcanzaron stock mínimo</span>
            </div>
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px] font-bold">Auto-Reorden</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded bg-slate-800/50 p-2 border border-slate-700/40">
              <div>
                <p className="font-medium text-slate-200">Varilla Corrugada 1/2 pulgada</p>
                <p className="text-[11px] text-slate-400">Proveedor: Aceros del Valle</p>
              </div>
              <div className="text-right">
                <span className="text-red-400 font-bold">4 unids</span>
                <p className="text-[10px] text-slate-400">Mín: 15 unids</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded bg-slate-800/50 p-2 border border-slate-700/40">
              <div>
                <p className="font-medium text-slate-200">Tubo PVC Sanitario 3 pulg x 6m</p>
                <p className="text-[11px] text-slate-400">Proveedor: Pavco Wavin</p>
              </div>
              <div className="text-right">
                <span className="text-amber-400 font-bold">8 unids</span>
                <p className="text-[10px] text-slate-400">Mín: 10 unids</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
